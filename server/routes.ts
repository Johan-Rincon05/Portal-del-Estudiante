import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { supabase } from "./supabase";
import { 
  insertProfileSchema, 
  insertDocumentSchema, 
  insertRequestSchema, 
  updateRequestSchema 
} from "../shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Profile routes
  app.get("/api/profile", async (req, res) => {
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

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single();

      if (profileError) {
        return res.status(404).json({ message: "Profile not found" });
      }

      res.status(200).json(profile);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while fetching profile" });
    }
  });

  app.put("/api/profile", async (req, res) => {
    try {
      const profileData = insertProfileSchema.parse(req.body);
      
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "No authorization header" });
      }

      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userError } = await supabase.auth.getUser(token);

      if (userError || !userData.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Can only update your own profile unless you're an admin or superuser
      const { data: updatedProfile, error: updateError } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("id", userData.user.id)
        .select()
        .single();

      if (updateError) {
        return res.status(400).json({ message: updateError.message });
      }

      res.status(200).json(updatedProfile);
    } catch (error) {
      if (error.errors) {
        return res.status(400).json({ message: error.errors[0] });
      }
      res.status(500).json({ message: "An error occurred while updating profile" });
    }
  });

  // Admin profile routes
  app.get("/api/admin/profiles", async (req, res) => {
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

      // Only admin and superuser can access this endpoint
      if (!['admin', 'superuser'].includes(userData.user.user_metadata.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Parse query params for filtering
      const { city, search, startDate, endDate } = req.query;
      
      let query = supabase.from("profiles").select("*");
      
      if (city) {
        query = query.eq("city", city);
      }
      
      if (search) {
        query = query.or(`full_name.ilike.%${search}%,document_number.ilike.%${search}%`);
      }
      
      if (startDate) {
        query = query.gte("created_at", startDate);
      }
      
      if (endDate) {
        query = query.lte("created_at", endDate);
      }

      const { data: profiles, error: profilesError } = await query;

      if (profilesError) {
        return res.status(400).json({ message: profilesError.message });
      }

      res.status(200).json(profiles);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while fetching profiles" });
    }
  });

  app.get("/api/admin/profiles/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "No authorization header" });
      }

      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userError } = await supabase.auth.getUser(token);

      if (userError || !userData.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Only admin and superuser can access this endpoint
      if (!['admin', 'superuser'].includes(userData.user.user_metadata.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (profileError) {
        return res.status(404).json({ message: "Profile not found" });
      }

      res.status(200).json(profile);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while fetching profile" });
    }
  });

  app.put("/api/admin/profiles/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const profileData = insertProfileSchema.parse(req.body);
      
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "No authorization header" });
      }

      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userError } = await supabase.auth.getUser(token);

      if (userError || !userData.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Only admin and superuser can access this endpoint
      if (!['admin', 'superuser'].includes(userData.user.user_metadata.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { data: updatedProfile, error: updateError } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("id", id)
        .select()
        .single();

      if (updateError) {
        return res.status(400).json({ message: updateError.message });
      }

      res.status(200).json(updatedProfile);
    } catch (error) {
      if (error.errors) {
        return res.status(400).json({ message: error.errors[0] });
      }
      res.status(500).json({ message: "An error occurred while updating profile" });
    }
  });

  // Document routes
  app.get("/api/documents", async (req, res) => {
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

      const { data: documents, error: documentsError } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", userData.user.id);

      if (documentsError) {
        return res.status(400).json({ message: documentsError.message });
      }

      res.status(200).json(documents);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while fetching documents" });
    }
  });

  app.post("/api/documents", async (req, res) => {
    try {
      const documentData = insertDocumentSchema.parse(req.body);
      
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "No authorization header" });
      }

      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userError } = await supabase.auth.getUser(token);

      if (userError || !userData.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Ensure user_id matches the authenticated user
      if (documentData.user_id !== userData.user.id) {
        return res.status(403).json({ message: "Cannot upload document for another user" });
      }

      const { data: newDocument, error: insertError } = await supabase
        .from("documents")
        .insert(documentData)
        .select()
        .single();

      if (insertError) {
        return res.status(400).json({ message: insertError.message });
      }

      res.status(201).json(newDocument);
    } catch (error) {
      if (error.errors) {
        return res.status(400).json({ message: error.errors[0] });
      }
      res.status(500).json({ message: "An error occurred while uploading document" });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "No authorization header" });
      }

      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userError } = await supabase.auth.getUser(token);

      if (userError || !userData.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Check if the document belongs to the user or if user is admin/superuser
      if (userData.user.user_metadata.role === 'estudiante') {
        const { data: document, error: documentError } = await supabase
          .from("documents")
          .select("user_id")
          .eq("id", id)
          .single();

        if (documentError) {
          return res.status(404).json({ message: "Document not found" });
        }

        if (document.user_id !== userData.user.id) {
          return res.status(403).json({ message: "Cannot delete another user's document" });
        }
      }

      const { error: deleteError } = await supabase
        .from("documents")
        .delete()
        .eq("id", id);

      if (deleteError) {
        return res.status(400).json({ message: deleteError.message });
      }

      // Also delete the file from storage
      // This would depend on how you're implementing storage paths

      res.status(200).json({ message: "Document deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "An error occurred while deleting document" });
    }
  });

  // Admin document routes
  app.get("/api/admin/documents/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "No authorization header" });
      }

      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userError } = await supabase.auth.getUser(token);

      if (userError || !userData.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Only admin and superuser can access this endpoint
      if (!['admin', 'superuser'].includes(userData.user.user_metadata.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { data: documents, error: documentsError } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", userId);

      if (documentsError) {
        return res.status(400).json({ message: documentsError.message });
      }

      res.status(200).json(documents);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while fetching documents" });
    }
  });

  // Request routes
  app.get("/api/requests", async (req, res) => {
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

      const { data: requests, error: requestsError } = await supabase
        .from("requests")
        .select("*")
        .eq("user_id", userData.user.id);

      if (requestsError) {
        return res.status(400).json({ message: requestsError.message });
      }

      res.status(200).json(requests);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while fetching requests" });
    }
  });

  app.post("/api/requests", async (req, res) => {
    try {
      const requestData = insertRequestSchema.parse(req.body);
      
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "No authorization header" });
      }

      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userError } = await supabase.auth.getUser(token);

      if (userError || !userData.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Ensure user_id matches the authenticated user
      if (requestData.user_id !== userData.user.id) {
        return res.status(403).json({ message: "Cannot create request for another user" });
      }

      const { data: newRequest, error: insertError } = await supabase
        .from("requests")
        .insert({
          ...requestData,
          status: "pending", // Default status
        })
        .select()
        .single();

      if (insertError) {
        return res.status(400).json({ message: insertError.message });
      }

      res.status(201).json(newRequest);
    } catch (error) {
      if (error.errors) {
        return res.status(400).json({ message: error.errors[0] });
      }
      res.status(500).json({ message: "An error occurred while creating request" });
    }
  });

  // Admin request routes
  app.get("/api/admin/requests", async (req, res) => {
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

      // Only admin and superuser can access this endpoint
      if (!['admin', 'superuser'].includes(userData.user.user_metadata.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Parse query params for filtering
      const { status, search, startDate, endDate } = req.query;
      
      let query = supabase.from("requests").select("*, profiles!inner(full_name, email)");
      
      if (status) {
        query = query.eq("status", status);
      }
      
      if (search) {
        query = query.or(`subject.ilike.%${search}%,profiles.full_name.ilike.%${search}%`);
      }
      
      if (startDate) {
        query = query.gte("created_at", startDate);
      }
      
      if (endDate) {
        query = query.lte("created_at", endDate);
      }

      const { data: requests, error: requestsError } = await query;

      if (requestsError) {
        return res.status(400).json({ message: requestsError.message });
      }

      res.status(200).json(requests);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while fetching requests" });
    }
  });

  app.get("/api/admin/requests/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "No authorization header" });
      }

      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userError } = await supabase.auth.getUser(token);

      if (userError || !userData.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Only admin and superuser can access this endpoint
      if (!['admin', 'superuser'].includes(userData.user.user_metadata.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { data: requests, error: requestsError } = await supabase
        .from("requests")
        .select("*")
        .eq("user_id", userId);

      if (requestsError) {
        return res.status(400).json({ message: requestsError.message });
      }

      res.status(200).json(requests);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while fetching requests" });
    }
  });

  app.patch("/api/admin/requests/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = updateRequestSchema.parse(req.body);
      
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "No authorization header" });
      }

      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userError } = await supabase.auth.getUser(token);

      if (userError || !userData.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Only admin and superuser can access this endpoint
      if (!['admin', 'superuser'].includes(userData.user.user_metadata.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { data: updatedRequest, error: updateError } = await supabase
        .from("requests")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (updateError) {
        return res.status(400).json({ message: updateError.message });
      }

      res.status(200).json(updatedRequest);
    } catch (error) {
      if (error.errors) {
        return res.status(400).json({ message: error.errors[0] });
      }
      res.status(500).json({ message: "An error occurred while updating request" });
    }
  });

  // File upload endpoint
  app.post("/api/upload", async (req, res) => {
    try {
      // This would be implemented using busboy or multer
      // For Supabase Storage, we'd typically get a signed URL and then upload directly
      // from the client, but for simplicity, we can handle it on the server
      
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "No authorization header" });
      }

      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userError } = await supabase.auth.getUser(token);

      if (userError || !userData.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Process file upload here...
      
      res.status(200).json({ 
        path: `documents/${userData.user.id}/${req.file.originalname}` 
      });
    } catch (error) {
      res.status(500).json({ message: "An error occurred during file upload" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
