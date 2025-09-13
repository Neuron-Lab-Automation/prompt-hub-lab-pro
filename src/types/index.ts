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
