import { createClient } from '@supabase/supabase-js';
import { userRoles } from '../shared/schema';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('Missing Supabase credentials');
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Create initial RLS policies
export async function setupInitialRLS() {
  // Profiles table RLS
  await supabase.rpc('create_profiles_rls_policies');
  
  // Documents table RLS
  await supabase.rpc('create_documents_rls_policies');
  
  // Requests table RLS
  await supabase.rpc('create_requests_rls_policies');
  
  console.log('RLS policies initialized');
}

// Create initial admin users
export async function setupInitialUsers() {
  try {
    // Create two admin users
    const adminUsers = [
      { email: 'admin1@portal.edu', password: 'admin123', role: 'admin' },
      { email: 'admin2@portal.edu', password: 'admin123', role: 'admin' },
    ];
    
    for (const admin of adminUsers) {
      const { data: user, error } = await supabase.auth.admin.createUser({
        email: admin.email,
        password: admin.password,
        email_confirm: true,
        user_metadata: { role: admin.role },
      });
      
      if (error) {
        console.error(`Error creating admin user ${admin.email}:`, error);
      } else {
        console.log(`Admin user created: ${admin.email}`);
      }
    }
    
    // Create one superuser
    const { data: superuser, error: superuserError } = await supabase.auth.admin.createUser({
      email: 'superuser@portal.edu',
      password: 'super123',
      email_confirm: true,
      user_metadata: { role: 'superuser' },
    });
    
    if (superuserError) {
      console.error('Error creating superuser:', superuserError);
    } else {
      console.log('Superuser created');
    }
  } catch (error) {
    console.error('Error setting up initial users:', error);
  }
}

// Run migrations - these would be SQL functions to create RLS policies
export async function runMigrations() {
  const createProfilesRLSPolicies = `
  CREATE OR REPLACE FUNCTION create_profiles_rls_policies()
  RETURNS void AS $$
  BEGIN
    -- Enable RLS on profiles
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Profiles are viewable by themselves" ON profiles;
    DROP POLICY IF EXISTS "Profiles are editable by themselves" ON profiles;
    DROP POLICY IF EXISTS "Profiles are viewable by admins and superusers" ON profiles;
    DROP POLICY IF EXISTS "Profiles are editable by admins and superusers" ON profiles;
    
    -- Create policies
    CREATE POLICY "Profiles are viewable by themselves"
      ON profiles FOR SELECT
      USING (auth.uid() = id);
      
    CREATE POLICY "Profiles are editable by themselves"
      ON profiles FOR UPDATE
      USING (auth.uid() = id);
      
    CREATE POLICY "Profiles are viewable by admins and superusers"
      ON profiles FOR SELECT
      USING (auth.jwt() ->> 'role' IN ('admin', 'superuser'));
      
    CREATE POLICY "Profiles are editable by admins and superusers"
      ON profiles FOR UPDATE
      USING (auth.jwt() ->> 'role' IN ('admin', 'superuser'));
  END;
  $$ LANGUAGE plpgsql;
  `;

  const createDocumentsRLSPolicies = `
  CREATE OR REPLACE FUNCTION create_documents_rls_policies()
  RETURNS void AS $$
  BEGIN
    -- Enable RLS on documents
    ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Documents are viewable by document owners" ON documents;
    DROP POLICY IF EXISTS "Documents are insertable by document owners" ON documents;
    DROP POLICY IF EXISTS "Documents are deletable by document owners" ON documents;
    DROP POLICY IF EXISTS "Documents are viewable by admins and superusers" ON documents;
    DROP POLICY IF EXISTS "Documents are deletable by admins and superusers" ON documents;
    
    -- Create policies
    CREATE POLICY "Documents are viewable by document owners"
      ON documents FOR SELECT
      USING (auth.uid() = user_id);
      
    CREATE POLICY "Documents are insertable by document owners"
      ON documents FOR INSERT
      WITH CHECK (auth.uid() = user_id);
      
    CREATE POLICY "Documents are deletable by document owners"
      ON documents FOR DELETE
      USING (auth.uid() = user_id);
      
    CREATE POLICY "Documents are viewable by admins and superusers"
      ON documents FOR SELECT
      USING (auth.jwt() ->> 'role' IN ('admin', 'superuser'));
      
    CREATE POLICY "Documents are deletable by admins and superusers"
      ON documents FOR DELETE
      USING (auth.jwt() ->> 'role' IN ('admin', 'superuser'));
  END;
  $$ LANGUAGE plpgsql;
  `;

  const createRequestsRLSPolicies = `
  CREATE OR REPLACE FUNCTION create_requests_rls_policies()
  RETURNS void AS $$
  BEGIN
    -- Enable RLS on requests
    ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Requests are viewable by the requester" ON requests;
    DROP POLICY IF EXISTS "Requests are insertable by authenticated users" ON requests;
    DROP POLICY IF EXISTS "Requests are viewable by admins and superusers" ON requests;
    DROP POLICY IF EXISTS "Requests are editable by admins and superusers" ON requests;
    
    -- Create policies
    CREATE POLICY "Requests are viewable by the requester"
      ON requests FOR SELECT
      USING (auth.uid() = user_id);
      
    CREATE POLICY "Requests are insertable by authenticated users"
      ON requests FOR INSERT
      WITH CHECK (auth.uid() = user_id);
      
    CREATE POLICY "Requests are viewable by admins and superusers"
      ON requests FOR SELECT
      USING (auth.jwt() ->> 'role' IN ('admin', 'superuser'));
      
    CREATE POLICY "Requests are editable by admins and superusers"
      ON requests FOR UPDATE
      USING (auth.jwt() ->> 'role' IN ('admin', 'superuser'));
  END;
  $$ LANGUAGE plpgsql;
  `;

  try {
    await supabase.rpc('create_profiles_rls_policies', createProfilesRLSPolicies);
    await supabase.rpc('create_documents_rls_policies', createDocumentsRLSPolicies);
    await supabase.rpc('create_requests_rls_policies', createRequestsRLSPolicies);
    console.log('Migrations run successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
  }
}
