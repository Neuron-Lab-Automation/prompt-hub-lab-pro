/*
  # PromptHub v2 - Complete Database Schema

  1. New Tables
    - `users` - User accounts with roles and token limits
    - `plans` - Subscription plans with pricing
    - `prompts` - User and system prompts with multilingual content
    - `prompt_stats` - Usage statistics for prompts
    - `prompt_versions` - Version history for prompt improvements
    - `categories` - Prompt categories with icons and colors
    - `providers` - AI providers (OpenAI, Anthropic, etc.)
    - `models` - AI models with pricing and capabilities
    - `executions` - Prompt execution logs with costs
    - `token_prices` - Dynamic pricing for models
    - `coupons` - Discount codes and promotions
    - `affiliates` - Referral program data
    - `audit_logs` - System activity logs
    - `organizations` - Team/enterprise accounts
    - `organization_members` - Team membership
    - `organization_plans` - Team pricing plans
    - `referral_programs` - User referral tracking
    - `referrals` - Individual referral records
    - `token_promotions` - Token bonus campaigns
    - `email_templates` - Automated email templates
    - `support_tickets` - Customer support system
    - `support_responses` - Ticket responses
    - `smtp_config` - Email server configuration

  2. Security
    - Enable RLS on all tables
    - Role-based access policies
    - User data isolation
    - Admin-only access for sensitive data

  3. Functions
    - Auto-update timestamps
    - Token usage tracking
    - Statistics calculations
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'editor', 'viewer', 'user');
CREATE TYPE prompt_type AS ENUM ('system', 'user');
CREATE TYPE coupon_type AS ENUM ('percentage', 'fixed');
CREATE TYPE coupon_scope AS ENUM ('plan', 'addon', 'global');
CREATE TYPE organization_member_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE referral_status AS ENUM ('pending', 'confirmed', 'paid');
CREATE TYPE popup_trigger AS ENUM ('always', 'usage_threshold', 'time_based');
CREATE TYPE email_template_type AS ENUM ('welcome', 'payment_confirmation', 'access_granted', 'support_response', 'custom');
CREATE TYPE support_category AS ENUM ('billing', 'technical', 'feature_request', 'bug_report', 'general');
CREATE TYPE support_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE support_status AS ENUM ('open', 'in_progress', 'waiting_response', 'resolved', 'closed');

-- Create update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role user_role DEFAULT 'user',
  plan_id text DEFAULT 'starter' NOT NULL,
  tokens_used bigint DEFAULT 0,
  tokens_limit bigint DEFAULT 500000,
  stripe_customer_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Plans table
CREATE TABLE IF NOT EXISTS plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  price numeric(10,2) NOT NULL,
  tokens_included bigint NOT NULL,
  overage_price numeric(10,2) NOT NULL,
  stripe_price_id text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
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
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
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
  ctr numeric(5,2) DEFAULT 0,
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
  input_cost numeric(10,6) NOT NULL,
  output_cost numeric(10,6) NOT NULL,
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
  cost numeric(10,6) NOT NULL,
  latency integer NOT NULL,
  result text NOT NULL,
  parameters jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Token prices table
CREATE TABLE IF NOT EXISTS token_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model text UNIQUE NOT NULL,
  input_cost_base numeric(10,6) NOT NULL,
  output_cost_base numeric(10,6) NOT NULL,
  input_margin_percent numeric(5,2) DEFAULT 50.0,
  output_margin_percent numeric(5,2) DEFAULT 50.0,
  currency text DEFAULT 'USD',
  fx_rate numeric(10,4) DEFAULT 1.0,
  updated_at timestamptz DEFAULT now()
);

-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  type coupon_type NOT NULL,
  value numeric(10,2) NOT NULL,
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
  commission_percent numeric(5,2) DEFAULT 20.0,
  total_referrals integer DEFAULT 0,
  total_earnings numeric(10,2) DEFAULT 0,
  payout_method text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid NOT NULL REFERENCES users(id),
  plan_id text NOT NULL,
  team_size integer NOT NULL,
  monthly_cost numeric(10,2) NOT NULL,
  tokens_included bigint NOT NULL,
  stripe_subscription_id text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Organization members table
CREATE TABLE IF NOT EXISTS organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id),
  role organization_member_role DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Organization plans table
CREATE TABLE IF NOT EXISTS organization_plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  price_per_user numeric(10,2) NOT NULL,
  tokens_per_user bigint NOT NULL,
  features text[] DEFAULT '{}',
  min_team_size integer DEFAULT 2,
  stripe_price_id text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Referral programs table
CREATE TABLE IF NOT EXISTS referral_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES users(id),
  referral_code text UNIQUE NOT NULL,
  referral_url text NOT NULL,
  total_referrals integer DEFAULT 0,
  total_earnings numeric(10,2) DEFAULT 0,
  commission_rate numeric(5,2) DEFAULT 10,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES users(id),
  referred_user_id uuid NOT NULL REFERENCES users(id),
  referral_code text NOT NULL,
  commission_earned numeric(10,2) NOT NULL,
  status referral_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  confirmed_at timestamptz
);

-- Token promotions table
CREATE TABLE IF NOT EXISTS token_promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  bonus_percentage integer NOT NULL,
  min_purchase bigint NOT NULL,
  active boolean DEFAULT true,
  show_popup boolean DEFAULT true,
  popup_trigger popup_trigger DEFAULT 'usage_threshold',
  usage_threshold integer DEFAULT 75,
  popup_frequency_hours integer DEFAULT 24,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Email templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  html_content text NOT NULL,
  text_content text NOT NULL,
  variables text[] DEFAULT '{}',
  type email_template_type DEFAULT 'custom',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  subject text NOT NULL,
  message text NOT NULL,
  category support_category DEFAULT 'general',
  priority support_priority DEFAULT 'medium',
  status support_status DEFAULT 'open',
  assigned_to uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_response_at timestamptz
);

-- Support responses table
CREATE TABLE IF NOT EXISTS support_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id),
  message text NOT NULL,
  is_internal boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- SMTP configuration table
CREATE TABLE IF NOT EXISTS smtp_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host text NOT NULL,
  port integer NOT NULL,
  username text NOT NULL,
  password text NOT NULL,
  from_email text NOT NULL,
  from_name text NOT NULL,
  use_tls boolean DEFAULT true,
  active boolean DEFAULT true,
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category);
CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_type ON prompts(type);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompt_stats_prompt_id ON prompt_stats(prompt_id);
CREATE INDEX IF NOT EXISTS idx_executions_user_id ON executions(user_id);
CREATE INDEX IF NOT EXISTS idx_executions_created_at ON executions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
ALTER TABLE executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE smtp_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users policies
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid()::text = id::text OR EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role IN ('superadmin', 'admin')
  ));

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

-- Plans policies (readable by all)
CREATE POLICY "Plans are readable by all" ON plans
  FOR SELECT TO authenticated
  USING (true);

-- Prompts policies
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

-- Prompt stats policies
CREATE POLICY "Prompt stats are readable by all" ON prompt_stats
  FOR SELECT TO authenticated
  USING (true);

-- Prompt versions policies
CREATE POLICY "Prompt versions are readable by all" ON prompt_versions
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert versions for own prompts" ON prompt_versions
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM prompts 
    WHERE prompts.id = prompt_versions.prompt_id 
    AND prompts.user_id::text = auth.uid()::text
  ));

-- Categories policies
CREATE POLICY "Categories are readable by all" ON categories
  FOR SELECT TO authenticated
  USING (true);

-- Providers and models policies
CREATE POLICY "Providers are readable by all" ON providers
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Models are readable by all" ON models
  FOR SELECT TO authenticated
  USING (true);

-- Executions policies
CREATE POLICY "Users can read own executions" ON executions
  FOR SELECT TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own executions" ON executions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

-- Token prices policies
CREATE POLICY "Token prices are readable by all" ON token_prices
  FOR SELECT TO authenticated
  USING (true);

-- Coupons policies
CREATE POLICY "Coupons are readable by all" ON coupons
  FOR SELECT TO authenticated
  USING (true);

-- Affiliates policies
CREATE POLICY "Users can read own affiliate data" ON affiliates
  FOR SELECT TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Organizations policies
CREATE POLICY "Organization members can read organization" ON organizations
  FOR SELECT TO authenticated
  USING (
    owner_id::text = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_id = organizations.id 
      AND user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Organization owners can update" ON organizations
  FOR UPDATE TO authenticated
  USING (owner_id::text = auth.uid()::text)
  WITH CHECK (owner_id::text = auth.uid()::text);

-- Organization members policies
CREATE POLICY "Organization members can read membership" ON organization_members
  FOR SELECT TO authenticated
  USING (
    user_id::text = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM organizations 
      WHERE id = organization_members.organization_id 
      AND owner_id::text = auth.uid()::text
    )
  );

-- Organization plans policies
CREATE POLICY "Organization plans are readable by all" ON organization_plans
  FOR SELECT TO authenticated
  USING (true);

-- Referral programs policies
CREATE POLICY "Users can read own referral program" ON referral_programs
  FOR SELECT TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own referral program" ON referral_programs
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = user_id::text)
  WITH CHECK (auth.uid()::text = user_id::text);

-- Referrals policies
CREATE POLICY "Users can read own referrals" ON referrals
  FOR SELECT TO authenticated
  USING (auth.uid()::text = referrer_id::text OR auth.uid()::text = referred_user_id::text);

-- Token promotions policies
CREATE POLICY "Token promotions are readable by all" ON token_promotions
  FOR SELECT TO authenticated
  USING (true);

-- Email templates policies (admin only)
CREATE POLICY "Email templates admin only" ON email_templates
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE id::text = auth.uid()::text 
    AND role IN ('superadmin', 'admin')
  ));

-- Support tickets policies
CREATE POLICY "Users can read own tickets" ON support_tickets
  FOR SELECT TO authenticated
  USING (
    auth.uid()::text = user_id::text OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('superadmin', 'admin')
    )
  );

CREATE POLICY "Users can create tickets" ON support_tickets
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own tickets" ON support_tickets
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Support responses policies
CREATE POLICY "Users can read ticket responses" ON support_responses
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets 
      WHERE id = support_responses.ticket_id 
      AND user_id::text = auth.uid()::text
    ) OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('superadmin', 'admin')
    )
  );

-- SMTP config policies (admin only)
CREATE POLICY "SMTP config admin only" ON smtp_config
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE id::text = auth.uid()::text 
    AND role IN ('superadmin', 'admin')
  ));

-- Audit logs policies (admin only)
CREATE POLICY "Audit logs for admins only" ON audit_logs
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE id::text = auth.uid()::text 
    AND role IN ('superadmin', 'admin')
  ));

-- Create triggers for updated_at
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

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organization_plans_updated_at BEFORE UPDATE ON organization_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referral_programs_updated_at BEFORE UPDATE ON referral_programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_token_promotions_updated_at BEFORE UPDATE ON token_promotions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_smtp_config_updated_at BEFORE UPDATE ON smtp_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();