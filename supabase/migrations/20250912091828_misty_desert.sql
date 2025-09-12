/*
  # Initial Schema for PromptHub v2

  1. Core Tables
    - `users` - User profiles and roles
    - `plans` - Subscription plans
    - `prompts` - Prompt content and metadata
    - `prompt_stats` - Usage statistics per prompt
    - `prompt_versions` - Version history for improvements
    - `categories` - Prompt categories
    - `providers` - AI providers (OpenAI, OpenRouter, etc.)
    - `models` - Available models per provider
    - `executions` - Execution history and token usage
    - `token_prices` - Dynamic pricing with margins
    - `coupons` - Discount codes
    - `affiliates` - Referral program
    - `audit_logs` - Security and compliance logging

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each role
    - Secure sensitive data access
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'editor', 'viewer', 'user');
CREATE TYPE prompt_type AS ENUM ('system', 'user');
CREATE TYPE coupon_type AS ENUM ('percentage', 'fixed');
CREATE TYPE coupon_scope AS ENUM ('plan', 'addon', 'global');

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role user_role DEFAULT 'user',
  plan_id text NOT NULL DEFAULT 'starter',
  tokens_used bigint DEFAULT 0,
  tokens_limit bigint DEFAULT 500000,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Plans table
CREATE TABLE IF NOT EXISTS plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  price decimal(10,2) NOT NULL,
  tokens_included bigint NOT NULL,
  overage_price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  color text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Prompts table
CREATE TABLE IF NOT EXISTS prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content_es text NOT NULL,
  content_en text NOT NULL,
  category text NOT NULL REFERENCES categories(id),
  tags text[] DEFAULT '{}',
  type prompt_type DEFAULT 'user',
  user_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_favorite boolean DEFAULT false
);

-- Prompt stats table
CREATE TABLE IF NOT EXISTS prompt_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid UNIQUE NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  characters_es integer DEFAULT 0,
  characters_en integer DEFAULT 0,
  tokens_es integer DEFAULT 0,
  tokens_en integer DEFAULT 0,
  visits integer DEFAULT 0,
  copies integer DEFAULT 0,
  improvements integer DEFAULT 0,
  translations integer DEFAULT 0,
  last_execution timestamptz,
  ctr decimal(5,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Prompt versions table
CREATE TABLE IF NOT EXISTS prompt_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  version integer NOT NULL,
  content_es text NOT NULL,
  content_en text NOT NULL,
  improvement_reason text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(prompt_id, version)
);

-- Providers table
CREATE TABLE IF NOT EXISTS providers (
  id text PRIMARY KEY,
  name text NOT NULL,
  enabled boolean DEFAULT true,
  base_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Models table
CREATE TABLE IF NOT EXISTS models (
  id text PRIMARY KEY,
  name text NOT NULL,
  provider_id text NOT NULL REFERENCES providers(id),
  input_cost decimal(10,6) NOT NULL,
  output_cost decimal(10,6) NOT NULL,
  max_tokens integer NOT NULL,
  supports_temperature boolean DEFAULT true,
  supports_top_p boolean DEFAULT true,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Executions table
CREATE TABLE IF NOT EXISTS executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid NOT NULL REFERENCES prompts(id),
  user_id uuid NOT NULL REFERENCES users(id),
  provider text NOT NULL,
  model text NOT NULL,
  input_tokens integer NOT NULL,
  output_tokens integer NOT NULL,
  total_tokens integer NOT NULL,
  cost decimal(10,6) NOT NULL,
  latency integer NOT NULL,
  result text NOT NULL,
  parameters jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Token prices table
CREATE TABLE IF NOT EXISTS token_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model text UNIQUE NOT NULL,
  input_cost_base decimal(10,6) NOT NULL,
  output_cost_base decimal(10,6) NOT NULL,
  input_margin_percent decimal(5,2) DEFAULT 50.0,
  output_margin_percent decimal(5,2) DEFAULT 50.0,
  currency text DEFAULT 'USD',
  fx_rate decimal(10,4) DEFAULT 1.0,
  updated_at timestamptz DEFAULT now()
);

-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  type coupon_type NOT NULL,
  value decimal(10,2) NOT NULL,
  max_uses integer,
  used_count integer DEFAULT 0,
  expires_at timestamptz,
  scope coupon_scope DEFAULT 'global',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Affiliates table
CREATE TABLE IF NOT EXISTS affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES users(id),
  ref_code text UNIQUE NOT NULL,
  commission_percent decimal(5,2) DEFAULT 20.0,
  total_referrals integer DEFAULT 0,
  total_earnings decimal(10,2) DEFAULT 0,
  payout_method text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
ALTER TABLE executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users: Users can read their own data, admins can read all
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid()::text = id::text OR EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role IN ('superadmin', 'admin')
  ));

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

-- Plans: Read-only for all authenticated users
CREATE POLICY "Plans are readable by all" ON plans
  FOR SELECT TO authenticated
  USING (true);

-- Categories: Read-only for all authenticated users
CREATE POLICY "Categories are readable by all" ON categories
  FOR SELECT TO authenticated
  USING (true);

-- Prompts: Users can read all, but only edit their own (except system prompts)
CREATE POLICY "Prompts are readable by all" ON prompts
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert own prompts" ON prompts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text AND type = 'user');

CREATE POLICY "Users can update own prompts" ON prompts
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = user_id::text AND type = 'user')
  WITH CHECK (auth.uid()::text = user_id::text AND type = 'user');

CREATE POLICY "Users can delete own prompts" ON prompts
  FOR DELETE TO authenticated
  USING (auth.uid()::text = user_id::text AND type = 'user');

-- Prompt stats: Readable by all, updatable by system
CREATE POLICY "Prompt stats are readable by all" ON prompt_stats
  FOR SELECT TO authenticated
  USING (true);

-- Prompt versions: Readable by all, insertable by owners
CREATE POLICY "Prompt versions are readable by all" ON prompt_versions
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert versions for own prompts" ON prompt_versions
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM prompts 
    WHERE id = prompt_id AND user_id::text = auth.uid()::text
  ));

-- Providers and Models: Read-only for all
CREATE POLICY "Providers are readable by all" ON providers
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Models are readable by all" ON models
  FOR SELECT TO authenticated
  USING (true);

-- Executions: Users can read their own
CREATE POLICY "Users can read own executions" ON executions
  FOR SELECT TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own executions" ON executions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

-- Token prices: Read-only for all
CREATE POLICY "Token prices are readable by all" ON token_prices
  FOR SELECT TO authenticated
  USING (true);

-- Coupons: Read-only for all
CREATE POLICY "Coupons are readable by all" ON coupons
  FOR SELECT TO authenticated
  USING (true);

-- Affiliates: Users can read their own
CREATE POLICY "Users can read own affiliate data" ON affiliates
  FOR SELECT TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Audit logs: Admins only
CREATE POLICY "Audit logs for admins only" ON audit_logs
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE id::text = auth.uid()::text AND role IN ('superadmin', 'admin')
  ));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category);
CREATE INDEX IF NOT EXISTS idx_prompts_type ON prompts(type);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompt_stats_prompt_id ON prompt_stats(prompt_id);
CREATE INDEX IF NOT EXISTS idx_executions_user_id ON executions(user_id);
CREATE INDEX IF NOT EXISTS idx_executions_created_at ON executions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompts_updated_at BEFORE UPDATE ON prompts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompt_stats_updated_at BEFORE UPDATE ON prompt_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_models_updated_at BEFORE UPDATE ON models
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_token_prices_updated_at BEFORE UPDATE ON token_prices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_affiliates_updated_at BEFORE UPDATE ON affiliates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();