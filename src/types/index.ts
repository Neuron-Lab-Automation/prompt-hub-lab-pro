import { Database } from './database';

type Tables = Database['public']['Tables'];

export interface Prompt {
  id: string;
  title: string;
  content_es: string;
  content_en: string;
  category: string;
  tags: string[];
  type: 'system' | 'user';
  user_id?: string;
  created_at: string;
  updated_at: string;
  is_favorite: boolean;
  stats: PromptStats;
  versions?: PromptVersion[];
}

export interface PromptStats {
  characters_es: number;
  characters_en: number;
  tokens_es: number;
  tokens_en: number;
  visits: number;
  copies: number;
  improvements: number;
  translations: number;
  last_execution?: string;
  ctr: number; // copy to visit ratio
}

export interface PromptVersion {
  id: string;
  prompt_id: string;
  version: number;
  content_es: string;
  content_en: string;
  created_at: string;
  improvement_reason?: string;
}

export type User = Tables['users']['Row'];
export type Plan = Tables['plans']['Row'];
export type Category = Tables['categories']['Row'];
export type Provider = Tables['providers']['Row'] & {
  models: Tables['models']['Row'][];
};
export type Model = Tables['models']['Row'];
export type Execution = Tables['executions']['Row'];
export type TokenPrice = Tables['token_prices']['Row'];
export type Coupon = Tables['coupons']['Row'];
export type Affiliate = Tables['affiliates']['Row'];

export type Role = 'superadmin' | 'admin' | 'editor' | 'viewer' | 'user';

export interface Organization {
  id: string;
  name: string;
  owner_id: string;
  team_size: number;
  plan_id: string;
  monthly_cost: number;
  credits_included: number;
  created_at: string;
  updated_at: string;
}

export interface OrganizationPlan {
  id: string;
  name: string;
  price_per_user: number;
  tokens_per_user: number;
  features: string[];
  min_team_size: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}
export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
}

export interface ReferralProgram {
  id: string;
  user_id: string;
  referral_code: string;
  referral_url: string;
  total_referrals: number;
  total_earnings: number;
  commission_rate: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  referral_code: string;
  commission_earned: number;
  status: 'pending' | 'confirmed' | 'paid';
  created_at: string;
  confirmed_at?: string;
}

export interface TokenPromotion {
  id: string;
  name: string;
  description: string;
  bonus_percentage: number;
  min_purchase: number;
  active: boolean;
  show_popup: boolean;
  popup_trigger: 'always' | 'usage_threshold' | 'time_based';
  usage_threshold?: number;
  popup_frequency_hours?: number;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  text_content: string;
  variables: string[];
  type: 'welcome' | 'payment_confirmation' | 'access_granted' | 'support_response' | 'custom';
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  category: 'billing' | 'technical' | 'feature_request' | 'bug_report' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed';
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  last_response_at?: string;
}

export interface SupportResponse {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_internal: boolean;
  created_at: string;
}

export interface SMTPConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  from_email: string;
  from_name: string;
  use_tls: boolean;
  active: boolean;
}

export interface TestSuite {
  id: string;
  name: string;
  description: string;
  prompt_id: string;
  test_cases: TestCase[];
  created_at: string;
}

export interface TestCase {
  id: string;
  name: string;
  type: 'robustness' | 'security' | 'accuracy' | 'creativity';
  input: string;
  expected_output?: string;
  criteria: string[];
}
