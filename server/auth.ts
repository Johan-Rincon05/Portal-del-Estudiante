import { Request, Response, NextFunction, Express } from "express";
import { supabase } from "./supabase";
import { 
  LoginData, 
  RegisterData, 
  CreateUserData, 
  UpdateUserRoleData, 
  insertProfileSchema 
} from "../shared/schema";

export function setupAuth(app: Express) {
  // Registration endpoint
  app.post("/api/register", async (req: Request, res: Response) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      const { password, passwordConfirm, ...profileData } = validatedData;

      // Create the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: profileData.email,
        password: password,
        options: {
          data: {
            role: "estudiante", // Default role for new registrations
          },
        },
      });

      if (authError) {
        return res.status(400).json({ message: authError.message });
      }

      if (!authData.user) {
        return res.status(400).json({ message: "Error creating user" });
      }

      // Create the profile in the profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: authData.user.id,
          ...profileData,
        });

      if (profileError) {
        // Attempt to clean up the created auth user if profile creation fails
        await supabase.auth.admin.deleteUser(authData.user.id);
        return res.status(400).json({ message: profileError.message });
      }

      res.status(201).json({ 
        message: "Registration successful. Please verify your email." 
      });
    } catch (error) {
      if (error.errors) {
        return res.status(400).json({ message: error.errors[0] });
      }
      res.status(500).json({ message: "An error occurred during registration" });
    }
  });

  // Login endpoint
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return res.status(401).json({ message: error.message });
      }

      // Get the user's profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      res.status(200).json({
        user: {
          id: data.user.id,
          email: data.user.email,
          role: data.user.user_metadata.role,
          ...profile,
        },
        session: data.session,
      });
    } catch (error) {
      if (error.errors) {
        return res.status(400).json({ message: error.errors[0] });
      }
      res.status(500).json({ message: "An error occurred during login" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", async (req: Request, res: Response) => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return res.status(400).json({ message: error.message });
      }

      res.status(200).json({ message: "Logout successful" });
    } catch (error) {
      res.status(500).json({ message: "An error occurred during logout" });
    }
  });

  // Get current user
  app.get("/api/user", async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "No authorization header" });
      }

      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userError } = await supabase.auth.getUser(token);

      if (userError || !userData.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get the user's profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single();

      res.status(200).json({
        id: userData.user.id,
        email: userData.user.email,
        role: userData.user.user_metadata.role,
        ...profile,
      });
    } catch (error) {
      res.status(500).json({ message: "An error occurred while getting user" });
    }
  });

  // Superuser endpoints
  app.post("/api/admin/users", async (req: Request, res: Response) => {
    try {
      // Validate the request
      const { email, password, role } = createUserSchema.parse(req.body);

      // Check that the requester is a superuser
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "No authorization header" });
      }

      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userError } = await supabase.auth.getUser(token);

      if (userError || !userData.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (userData.user.user_metadata.role !== "superuser") {
        return res.status(403).json({ message: "Only superusers can create users" });
      }

      // Create the user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role },
      });

      if (createError) {
        return res.status(400).json({ message: createError.message });
      }

      res.status(201).json({
        id: newUser.user.id,
        email: newUser.user.email,
        role: newUser.user.user_metadata.role,
      });
    } catch (error) {
      if (error.errors) {
        return res.status(400).json({ message: error.errors[0] });
      }
      res.status(500).json({ message: "An error occurred while creating user" });
    }
  });

  app.patch("/api/admin/users/:id/role", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { role } = updateUserRoleSchema.parse({...req.body, id});

      // Check that the requester is a superuser
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "No authorization header" });
      }

      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userError } = await supabase.auth.getUser(token);

      if (userError || !userData.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (userData.user.user_metadata.role !== "superuser") {
        return res.status(403).json({ message: "Only superusers can update user roles" });
      }

      // Update the user's role
      const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
        id,
        { user_metadata: { role } }
      );

      if (updateError) {
        return res.status(400).json({ message: updateError.message });
      }

      res.status(200).json({
        id: updatedUser.user.id,
        email: updatedUser.user.email,
        role: updatedUser.user.user_metadata.role,
      });
    } catch (error) {
      if (error.errors) {
        return res.status(400).json({ message: error.errors[0] });
      }
      res.status(500).json({ message: "An error occurred while updating user role" });
    }
  });

  app.delete("/api/admin/users/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Check that the requester is a superuser
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "No authorization header" });
      }

      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userError } = await supabase.auth.getUser(token);

      if (userError || !userData.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (userData.user.user_metadata.role !== "superuser") {
        return res.status(403).json({ message: "Only superusers can delete users" });
      }

      // Delete the user
      const { error: deleteError } = await supabase.auth.admin.deleteUser(id);

      if (deleteError) {
        return res.status(400).json({ message: deleteError.message });
      }

      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "An error occurred while deleting user" });
    }
  });

  app.get("/api/admin/users", async (req: Request, res: Response) => {
    try {
      // Check that the requester is a superuser
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "No authorization header" });
      }

      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userError } = await supabase.auth.getUser(token);

      if (userError || !userData.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (userData.user.user_metadata.role !== "superuser") {
        return res.status(403).json({ message: "Only superusers can list all users" });
      }

      // List all users
      const { data: users, error: listError } = await supabase.auth.admin.listUsers();

      if (listError) {
        return res.status(400).json({ message: listError.message });
      }

      const formattedUsers = users.users.map(user => ({
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role || 'estudiante',
        created_at: user.created_at,
      }));

      res.status(200).json(formattedUsers);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while listing users" });
    }
  });

  // Password reset
  app.post("/api/reset-password", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${req.protocol}://${req.get('host')}/reset-password/confirm`,
      });

      if (error) {
        return res.status(400).json({ message: error.message });
      }

      res.status(200).json({ message: "Password reset email sent" });
    } catch (error) {
      res.status(500).json({ message: "An error occurred during password reset" });
    }
  });

  app.post("/api/reset-password/confirm", async (req: Request, res: Response) => {
    try {
      const { password } = req.body;
      
      if (!password) {
        return res.status(400).json({ message: "Password is required" });
      }

      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "No authorization header" });
      }

      const token = authHeader.replace("Bearer ", "");
      const { error } = await supabase.auth.updateUser({
        password,
      }, {
        accessToken: token,
      });

      if (error) {
        return res.status(400).json({ message: error.message });
      }

      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "An error occurred while updating password" });
    }
  });
}
