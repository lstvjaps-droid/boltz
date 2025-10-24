/*
  # Admin & User Management System

  ## Overview
  Complete database schema for an admin dashboard with user management, menu system, and role-based access control.

  ## 1. New Tables
  
  ### `profiles`
  - `id` (uuid, primary key) - Links to auth.users
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `role` (text) - User role: 'admin', 'user', or 'employee'
  - `is_active` (boolean) - Account active status
  - `avatar_url` (text, optional) - Profile picture URL
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### `menus`
  - `id` (uuid, primary key) - Unique menu identifier
  - `name` (text) - Menu name/title
  - `description` (text, optional) - Menu description
  - `icon` (text) - Icon name for menu item
  - `route` (text) - Navigation route/path
  - `order_index` (integer) - Display order
  - `is_active` (boolean) - Menu active status
  - `created_by` (uuid) - Admin who created the menu
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### `user_menus`
  - `id` (uuid, primary key) - Unique assignment identifier
  - `user_id` (uuid) - User receiving menu access
  - `menu_id` (uuid) - Menu being assigned
  - `granted_by` (uuid) - Admin who granted access
  - `granted_at` (timestamptz) - Grant timestamp
  
  ### `activity_logs`
  - `id` (uuid, primary key) - Unique log identifier
  - `user_id` (uuid) - User performing action
  - `action` (text) - Action performed
  - `entity_type` (text) - Type of entity (user, menu, etc.)
  - `entity_id` (uuid, optional) - ID of affected entity
  - `details` (jsonb, optional) - Additional action details
  - `ip_address` (text, optional) - User's IP address
  - `created_at` (timestamptz) - Action timestamp

  ## 2. Security Implementation
  
  ### Row Level Security (RLS)
  All tables have RLS enabled with restrictive policies.
  
  ### Profile Policies
  - Authenticated users can view their own profile
  - Authenticated users can update their own profile (except role and is_active)
  - Admins can view all profiles
  - Admins can insert and update any profile
  - Admins can control user activation status
  
  ### Menu Policies
  - Admins can perform all operations on menus
  - Users can view active menus assigned to them
  
  ### User Menu Policies
  - Admins can manage menu assignments
  - Users can view their own menu assignments
  
  ### Activity Log Policies
  - System can insert logs (authenticated users)
  - Admins can view all logs
  - Users can view their own activity logs

  ## 3. Important Notes
  - Initial admin user must be created manually after first signup
  - Passwords are managed by Supabase Auth (not stored in profiles)
  - All timestamps use UTC timezone
  - Soft delete approach using `is_active` flag instead of hard deletes
  - Activity logs provide full audit trail
  - Foreign keys ensure referential integrity
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'employee')),
  is_active boolean DEFAULT true,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create menus table
CREATE TABLE IF NOT EXISTS menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text NOT NULL DEFAULT 'Layout',
  route text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_menus junction table
CREATE TABLE IF NOT EXISTS user_menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  menu_id uuid NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  granted_by uuid REFERENCES auth.users(id),
  granted_at timestamptz DEFAULT now(),
  UNIQUE(user_id, menu_id)
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_menus_is_active ON menus(is_active);
CREATE INDEX IF NOT EXISTS idx_menus_order ON menus(order_index);
CREATE INDEX IF NOT EXISTS idx_user_menus_user ON user_menus(user_id);
CREATE INDEX IF NOT EXISTS idx_user_menus_menu ON user_menus(menu_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.is_active = true
    )
  );

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND role = (SELECT role FROM profiles WHERE id = auth.uid())
    AND is_active = (SELECT is_active FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.is_active = true
    )
  );

CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.is_active = true
    )
  );

-- Menus policies
CREATE POLICY "Admins can view all menus"
  ON menus FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.is_active = true
    )
  );

CREATE POLICY "Users can view assigned active menus"
  ON menus FOR SELECT
  TO authenticated
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM user_menus
      WHERE user_menus.user_id = auth.uid()
      AND user_menus.menu_id = menus.id
    )
  );

CREATE POLICY "Admins can insert menus"
  ON menus FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.is_active = true
    )
  );

CREATE POLICY "Admins can update menus"
  ON menus FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.is_active = true
    )
  );

CREATE POLICY "Admins can delete menus"
  ON menus FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.is_active = true
    )
  );

-- User menus policies
CREATE POLICY "Admins can view all user menu assignments"
  ON user_menus FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.is_active = true
    )
  );

CREATE POLICY "Users can view own menu assignments"
  ON user_menus FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can insert user menu assignments"
  ON user_menus FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.is_active = true
    )
  );

CREATE POLICY "Admins can delete user menu assignments"
  ON user_menus FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.is_active = true
    )
  );

-- Activity logs policies
CREATE POLICY "Authenticated users can insert logs"
  ON activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.is_active = true
    )
  );

CREATE POLICY "Users can view own logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Function to handle profile creation on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_menus_updated_at ON menus;
CREATE TRIGGER update_menus_updated_at
  BEFORE UPDATE ON menus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();