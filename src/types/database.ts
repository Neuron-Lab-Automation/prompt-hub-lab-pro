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
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role?: 'superadmin' | 'admin' | 'editor' | 'viewer' | 'user'
          plan_id?: string
          tokens_used?: number
          tokens_limit?: number
          stripe_customer_id?: string | null
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
          stripe_customer_id?: string | null
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
          stripe_price_id: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          price: number
          tokens_included: number
          overage_price: number
          stripe_price_id?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          price?: number
          tokens_included?: number
          overage_price?: number
          stripe_price_id?: string | null
          active?: boolean
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
          is_favorite: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content_es: string
          content_en: string
          category: string
          tags?: string[]
          type?: 'system' | 'user'
          user_id?: string | null
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
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
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
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
      organizations: {
        Row: {
          id: string
          name: string
          owner_id: string
          plan_id: string
          team_size: number
          monthly_cost: number
          tokens_included: number
          stripe_subscription_id: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          owner_id: string
          plan_id: string
          team_size: number
          monthly_cost: number
          tokens_included: number
          stripe_subscription_id?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          owner_id?: string
          plan_id?: string
          team_size?: number
          monthly_cost?: number
          tokens_included?: number
          stripe_subscription_id?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      organization_plans: {
        Row: {
          id: string
          name: string
          price_per_user: number
          tokens_per_user: number
          features: string[]
          min_team_size: number
          stripe_price_id: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          price_per_user: number
          tokens_per_user: number
          features?: string[]
          min_team_size?: number
          stripe_price_id?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          price_per_user?: number
          tokens_per_user?: number
          features?: string[]
          min_team_size?: number
          stripe_price_id?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      referral_programs: {
        Row: {
          id: string
          user_id: string
          referral_code: string
          referral_url: string
          total_referrals: number
          total_earnings: number
          commission_rate: number
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          referral_code: string
          referral_url: string
          total_referrals?: number
          total_earnings?: number
          commission_rate?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          referral_code?: string
          referral_url?: string
          total_referrals?: number
          total_earnings?: number
          commission_rate?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      support_tickets: {
        Row: {
          id: string
          user_id: string
          subject: string
          message: string
          category: 'billing' | 'technical' | 'feature_request' | 'bug_report' | 'general'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          status: 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed'
          assigned_to: string | null
          created_at: string
          updated_at: string
          last_response_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          subject: string
          message: string
          category?: 'billing' | 'technical' | 'feature_request' | 'bug_report' | 'general'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed'
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
          last_response_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          subject?: string
          message?: string
          category?: 'billing' | 'technical' | 'feature_request' | 'bug_report' | 'general'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed'
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
          last_response_at?: string | null
        }
      }
      email_templates: {
        Row: {
          id: string
          name: string
          subject: string
          html_content: string
          text_content: string
          variables: string[]
          type: 'welcome' | 'payment_confirmation' | 'access_granted' | 'support_response' | 'custom'
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          subject: string
          html_content: string
          text_content: string
          variables?: string[]
          type?: 'welcome' | 'payment_confirmation' | 'access_granted' | 'support_response' | 'custom'
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          subject?: string
          html_content?: string
          text_content?: string
          variables?: string[]
          type?: 'welcome' | 'payment_confirmation' | 'access_granted' | 'support_response' | 'custom'
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      smtp_config: {
        Row: {
          id: string
          host: string
          port: number
          username: string
          password: string
          from_email: string
          from_name: string
          use_tls: boolean
          active: boolean
          updated_at: string
        }
        Insert: {
          id?: string
          host: string
          port: number
          username: string
          password: string
          from_email: string
          from_name: string
          use_tls?: boolean
          active?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          host?: string
          port?: number
          username?: string
          password?: string
          from_email?: string
          from_name?: string
          use_tls?: boolean
          active?: boolean
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_prompt_stats: {
        Args: {
          p_prompt_id: string
          p_field: string
        }
        Returns: void
      }
      add_user_tokens: {
        Args: {
          p_user_id: string
          p_tokens: number
        }
        Returns: void
      }
      process_referral: {
        Args: {
          p_referral_code: string
          p_referred_user_id: string
          p_purchase_amount: number
        }
        Returns: void
      }
    }
    Enums: {
      user_role: 'superadmin' | 'admin' | 'editor' | 'viewer' | 'user'
      prompt_type: 'system' | 'user'
      coupon_type: 'percentage' | 'fixed'
      coupon_scope: 'plan' | 'addon' | 'global'
      organization_member_role: 'owner' | 'admin' | 'member'
      referral_status: 'pending' | 'confirmed' | 'paid'
      popup_trigger: 'always' | 'usage_threshold' | 'time_based'
      email_template_type: 'welcome' | 'payment_confirmation' | 'access_granted' | 'support_response' | 'custom'
      support_category: 'billing' | 'technical' | 'feature_request' | 'bug_report' | 'general'
      support_priority: 'low' | 'medium' | 'high' | 'urgent'
      support_status: 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}