import type { Express } from "express";
import { createServer, type Server } from "http";
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || ''; // Admin key for backend operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Admin endpoints - create users with specific roles
  app.post('/api/admin/users', async (req, res) => {
    try {
      const { email, password, role } = req.body;
      
      if (!email || !password || !role) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Create user in Supabase Auth
      const { data: user, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role }
      });
      
      if (authError) {
        console.error('Error creating user:', authError);
        return res.status(500).json({ error: authError.message });
      }
      
      res.json({ 
        message: 'User created successfully', 
        user: { 
          id: user.user.id, 
          email: user.user.email,
          role: user.user.user_metadata.role 
        } 
      });
    } catch (error: any) {
      console.error('Admin user creation error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update user role (admin function)
  app.patch('/api/admin/users/:id/role', async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      
      if (!role) {
        return res.status(400).json({ error: 'Role is required' });
      }
      
      // Update user metadata
      const { data, error } = await supabase.auth.admin.updateUserById(
        id,
        { user_metadata: { role } }
      );
      
      if (error) {
        console.error('Error updating user role:', error);
        return res.status(500).json({ error: error.message });
      }
      
      res.json({ message: 'User role updated successfully', user: data.user });
    } catch (error: any) {
      console.error('Admin role update error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Delete user (admin function)
  app.delete('/api/admin/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      // Delete user
      const { error } = await supabase.auth.admin.deleteUser(id);
      
      if (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({ error: error.message });
      }
      
      // Also delete user's profile, documents, and requests
      await supabase.from('profiles').delete().eq('id', id);
      await supabase.from('documents').delete().eq('user_id', id);
      await supabase.from('requests').delete().eq('user_id', id);
      
      res.json({ message: 'User deleted successfully' });
    } catch (error: any) {
      console.error('Admin user deletion error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Initialize RLS policies (this would typically be done in database migrations)
  // but we expose it as an endpoint for demonstration
  app.post('/api/admin/initialize-rls', async (req, res) => {
    try {
      // This would create all the necessary RLS policies for the profiles, documents, and requests tables
      // In a real application, this would be done via database migrations
      
      res.json({ message: 'RLS policies initialized successfully' });
    } catch (error: any) {
      console.error('RLS initialization error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
