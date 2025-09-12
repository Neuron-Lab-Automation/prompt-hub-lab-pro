export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'superadmin' | 'admin' | 'editor' | 'viewer' | 'user'
          plan_id: string
          tokens_used: number
          tokens_limit: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role?: 'superadmin' | 'admin' | 'editor' | 'viewer' | 'user'
          plan_id: string
          tokens_used?: number
          tokens_limit?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'superadmin' | 'admin' | 'editor' | 'viewer' | 'user'
          plan_id?: string
          tokens_used?: number
          tokens_limit?: number
          created_at?: string
          updated_at?: string
        }
      }
      plans: {
        Row: {
          id: string
          name: string
          price: number
          tokens_included: number
          overage_price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          price: number
          tokens_included: number
          overage_price: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          price?: number
          tokens_included?: number
          overage_price?: number
          created_at?: string
          updated_at?: string
        }
      }
      prompts: {
        Row: {
          id: string
          title: string
          content_es: string
          content_en: string
          category: string
          tags: string[]
          type: 'system' | 'user'
          user_id: string | null
          created_at: string
          updated_at: string
          is_favorite: boolean
        }
        Insert: {
          id?: string
          title: string
          content_es: string
          content_en: string
          category: string
          tags: string[]
          type: 'system' | 'user'
          user_id?: string | null
          created_at?: string
          updated_at?: string
          is_favorite?: boolean
        }
        Update: {
          id?: string
          title?: string
          content_es?: string
          content_en?: string
          category?: string
          tags?: string[]
          type?: 'system' | 'user'
          user_id?: string | null
          created_at?: string
          updated_at?: string
          is_favorite?: boolean
        }
      }
      prompt_stats: {
        Row: {
          id: string
          prompt_id: string
          characters_es: number
          characters_en: number
          tokens_es: number
          tokens_en: number
          visits: number
          copies: number
          improvements: number
          translations: number
          last_execution: string | null
          ctr: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          prompt_id: string
          characters_es: number
          characters_en: number
          tokens_es: number
          tokens_en: number
          visits?: number
          copies?: number
          improvements?: number
          translations?: number
          last_execution?: string | null
          ctr?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          prompt_id?: string
          characters_es?: number
          characters_en?: number
          tokens_es?: number
          tokens_en?: number
          visits?: number
          copies?: number
          improvements?: number
          translations?: number
          last_execution?: string | null
          ctr?: number
          created_at?: string
          updated_at?: string
        }
      }
      prompt_versions: {
        Row: {
          id: string
          prompt_id: string
          version: number
          content_es: string
          content_en: string
          improvement_reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          prompt_id: string
          version: number
          content_es: string
          content_en: string
          improvement_reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          prompt_id?: string
          version?: number
          content_es?: string
          content_en?: string
          improvement_reason?: string | null
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          icon: string
          color: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon?: string
          color?: string
          created_at?: string
        }
      }
      providers: {
        Row: {
          id: string
          name: string
          enabled: boolean
          base_url: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          enabled?: boolean
          base_url: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          enabled?: boolean
          base_url?: string
          created_at?: string
          updated_at?: string
        }
      }
      models: {
        Row: {
          id: string
          name: string
          provider_id: string
          input_cost: number
          output_cost: number
          max_tokens: number
          supports_temperature: boolean
          supports_top_p: boolean
          enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          provider_id: string
          input_cost: number
          output_cost: number
          max_tokens: number
          supports_temperature?: boolean
          supports_top_p?: boolean
          enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          provider_id?: string
          input_cost?: number
          output_cost?: number
          max_tokens?: number
          supports_temperature?: boolean
          supports_top_p?: boolean
          enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      executions: {
        Row: {
          id: string
          prompt_id: string
          user_id: string
          provider: string
          model: string
          input_tokens: number
          output_tokens: number
          total_tokens: number
          cost: number
          latency: number
          result: string
          parameters: Json
          created_at: string
        }
        Insert: {
          id?: string
          prompt_id: string
          user_id: string
          provider: string
          model: string
          input_tokens: number
          output_tokens: number
          total_tokens: number
          cost: number
          latency: number
          result: string
          parameters: Json
          created_at?: string
        }
        Update: {
          id?: string
          prompt_id?: string
          user_id?: string
          provider?: string
          model?: string
          input_tokens?: number
          output_tokens?: number
          total_tokens?: number
          cost?: number
          latency?: number
          result?: string
          parameters?: Json
          created_at?: string
        }
      }
      token_prices: {
        Row: {
          id: string
          model: string
          input_cost_base: number
          output_cost_base: number
          input_margin_percent: number
          output_margin_percent: number
          currency: string
          fx_rate: number
          updated_at: string
        }
        Insert: {
          id?: string
          model: string
          input_cost_base: number
          output_cost_base: number
          input_margin_percent: number
          output_margin_percent: number
          currency?: string
          fx_rate?: number
          updated_at?: string
        }
        Update: {
          id?: string
          model?: string
          input_cost_base?: number
          output_cost_base?: number
          input_margin_percent?: number
          output_margin_percent?: number
          currency?: string
          fx_rate?: number
          updated_at?: string
        }
      }
      coupons: {
        Row: {
          id: string
          code: string
          type: 'percentage' | 'fixed'
          value: number
          max_uses: number | null
          used_count: number
          expires_at: string | null
          scope: 'plan' | 'addon' | 'global'
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          type: 'percentage' | 'fixed'
          value: number
          max_uses?: number | null
          used_count?: number
          expires_at?: string | null
          scope?: 'plan' | 'addon' | 'global'
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          type?: 'percentage' | 'fixed'
          value?: number
          max_uses?: number | null
          used_count?: number
          expires_at?: string | null
          scope?: 'plan' | 'addon' | 'global'
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      affiliates: {
        Row: {
          id: string
          user_id: string
          ref_code: string
          commission_percent: number
          total_referrals: number
          total_earnings: number
          payout_method: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          ref_code: string
          commission_percent?: number
          total_referrals?: number
          total_earnings?: number
          payout_method?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          ref_code?: string
          commission_percent?: number
          total_referrals?: number
          total_earnings?: number
          payout_method?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          resource_type: string
          resource_id: string | null
          details: Json
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          resource_type: string
          resource_id?: string | null
          details: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          resource_type?: string
          resource_id?: string | null
          details?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}