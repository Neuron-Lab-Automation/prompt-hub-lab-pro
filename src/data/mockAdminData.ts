import { User, Plan, Provider, Coupon, Affiliate } from '../types';
import { TokenPromotion, OrganizationPlan, EmailTemplate, SupportTicket, SMTPConfig } from '../types';

// Mock users data
export const mockUsers: User[] = [
  {
    id: 'user1',
    email: 'juan.perez@email.com',
    name: 'Juan Pérez',
    role: 'user',
    plan_id: 'pro',
    tokens_used: 750000,
    tokens_limit: 2000000,
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2025-01-20T08:45:00Z',
  },
  {
    id: 'user2',
    email: 'maria.garcia@email.com',
    name: 'María García',
    role: 'editor',
    plan_id: 'enterprise',
    tokens_used: 2500000,
    tokens_limit: 10000000,
    created_at: '2024-02-20T14:15:00Z',
    updated_at: '2025-01-19T16:20:00Z',
  },
  {
    id: 'admin1',
    email: 'admin@prompthub.com',
    name: 'Admin Principal',
    role: 'superadmin',
    plan_id: 'enterprise',
    tokens_used: 500000,
    tokens_limit: 10000000,
    created_at: '2023-12-01T09:00:00Z',
    updated_at: '2025-01-20T12:00:00Z',
  },
  {
    id: 'user3',
    email: 'carlos.lopez@email.com',
    name: 'Carlos López',
    role: 'user',
    plan_id: 'starter',
    tokens_used: 450000,
    tokens_limit: 500000,
    created_at: '2024-03-10T11:45:00Z',
    updated_at: '2025-01-18T14:30:00Z',
  },
  {
    id: 'user4',
    email: 'ana.martinez@email.com',
    name: 'Ana Martínez',
    role: 'viewer',
    plan_id: 'pro',
    tokens_used: 1200000,
    tokens_limit: 2000000,
    created_at: '2024-04-05T16:20:00Z',
    updated_at: '2025-01-17T10:15:00Z',
  },
];

// Mock plans data (already exists in mockData.ts, but adding here for completeness)
export const mockPlans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 9,
    tokens_included: 500000,
    overage_price: 15,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    tokens_included: 2000000,
    overage_price: 12,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 49,
    tokens_included: 10000000,
    overage_price: 8,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
];

// Mock coupons data
export const mockCoupons: Coupon[] = [
  {
    id: 'coupon1',
    code: 'WELCOME20',
    type: 'percentage',
    value: 20,
    max_uses: 100,
    used_count: 45,
    expires_at: '2025-03-31T23:59:59Z',
    scope: 'plan',
    active: true,
    created_at: '2024-12-01T00:00:00Z',
    updated_at: '2025-01-15T10:30:00Z',
  },
  {
    id: 'coupon2',
    code: 'SAVE10EUR',
    type: 'fixed',
    value: 10,
    max_uses: 50,
    used_count: 12,
    expires_at: '2025-02-28T23:59:59Z',
    scope: 'global',
    active: true,
    created_at: '2024-12-15T00:00:00Z',
    updated_at: '2025-01-10T14:20:00Z',
  },
  {
    id: 'coupon3',
    code: 'EXPIRED50',
    type: 'percentage',
    value: 50,
    max_uses: 20,
    used_count: 20,
    expires_at: '2024-12-31T23:59:59Z',
    scope: 'plan',
    active: false,
    created_at: '2024-11-01T00:00:00Z',
    updated_at: '2024-12-31T23:59:59Z',
  },
];

// Mock affiliates data
export const mockAffiliates: Affiliate[] = [
  {
    id: 'affiliate1',
    user_id: 'user2',
    ref_code: 'MARIA2024',
    commission_percent: 25,
    total_referrals: 15,
    total_earnings: 187.50,
    payout_method: 'PayPal',
    active: true,
    created_at: '2024-02-20T14:15:00Z',
    updated_at: '2025-01-19T16:20:00Z',
  },
  {
    id: 'affiliate2',
    user_id: 'user1',
    ref_code: 'JUAN2024',
    commission_percent: 20,
    total_referrals: 8,
    total_earnings: 96.00,
    payout_method: 'Stripe',
    active: true,
    created_at: '2024-03-01T10:00:00Z',
    updated_at: '2025-01-18T12:30:00Z',
  },
  {
    id: 'affiliate3',
    user_id: 'user4',
    ref_code: 'ANA2024',
    commission_percent: 30,
    total_referrals: 25,
    total_earnings: 375.00,
    payout_method: 'Bank Transfer',
    active: true,
    created_at: '2024-04-05T16:20:00Z',
    updated_at: '2025-01-17T10:15:00Z',
  },
];

// Mock executions data for admin analytics
export const mockExecutions = [
  {
    id: 'exec1',
    prompt_id: '1',
    user_id: 'user1',
    provider: 'openai',
    model: 'gpt-4o',
    input_tokens: 150,
    output_tokens: 300,
    total_tokens: 450,
    cost: 0.0225,
    latency: 1200,
    result: 'Respuesta generada exitosamente',
    parameters: { temperature: 0.7, max_tokens: 500 },
    created_at: '2025-01-20T10:30:00Z',
  },
  {
    id: 'exec2',
    prompt_id: '2',
    user_id: 'user2',
    provider: 'anthropic',
    model: 'claude-3-5-sonnet',
    input_tokens: 200,
    output_tokens: 400,
    total_tokens: 600,
    cost: 0.045,
    latency: 1800,
    result: 'Análisis completado',
    parameters: { temperature: 0.3, max_tokens: 1000 },
    created_at: '2025-01-20T09:15:00Z',
  },
  {
    id: 'exec3',
    prompt_id: '3',
    user_id: 'user3',
    provider: 'openai',
    model: 'gpt-5-mini-2025-08-07',
    input_tokens: 100,
    output_tokens: 200,
    total_tokens: 300,
    cost: 0.0135,
    latency: 800,
    result: 'Historia creada',
    parameters: {},
    created_at: '2025-01-19T16:45:00Z',
  },
];

// Mock token promotions data
export const mockTokenPromotions: TokenPromotion[] = [
  {
    id: 'promo1',
    name: 'Oferta de Lanzamiento',
    description: 'Compra tokens ahora y recibe 50% extra gratis',
    bonus_percentage: 50,
    min_purchase: 1000000, // 1M tokens minimum
    active: true,
    show_popup: true,
    popup_trigger: 'usage_threshold',
    usage_threshold: 60, // Show when 60% used
    popup_frequency_hours: 24,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-20T10:00:00Z',
  },
  {
    id: 'promo2',
    name: 'Promoción Fin de Mes',
    description: 'Últimos días: 30% de tokens extra en todas las compras',
    bonus_percentage: 30,
    min_purchase: 500000, // 500K tokens minimum
    active: false,
    show_popup: false,
    popup_trigger: 'always',
    popup_frequency_hours: 12,
    created_at: '2025-01-15T00:00:00Z',
    updated_at: '2025-01-18T15:30:00Z',
  },
  {
    id: 'promo3',
    name: 'Mega Oferta VIP',
    description: '¡Increíble! Compra 5M+ tokens y recibe 100% extra',
    bonus_percentage: 100,
    min_purchase: 5000000, // 5M tokens minimum
    active: true,
    show_popup: true,
    popup_trigger: 'always',
    popup_frequency_hours: 6,
    created_at: '2025-01-10T00:00:00Z',
    updated_at: '2025-01-20T08:00:00Z',
  },
];

// Mock organization plans
export const mockOrganizationPlans: OrganizationPlan[] = [
  {
    id: 'team',
    name: 'PromptHub para equipos',
    price_per_user: 29,
    tokens_per_user: 2000000, // 2M tokens por usuario
    features: [
      'Facturación y facturación centralizadas',
      'Límites y controles de uso del equipo',
      'Informes y análisis de uso detallados',
      'Soporte prioritario'
    ],
    min_team_size: 2,
    active: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2025-01-20T00:00:00Z',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price_per_user: 49,
    tokens_per_user: 5000000, // 5M tokens por usuario
    features: [
      'Todo lo de PromptHub para equipos',
      'SSO y gestión avanzada de usuarios',
      'API dedicada y límites personalizados',
      'Soporte 24/7 y account manager',
      'Integración personalizada'
    ],
    min_team_size: 5,
    active: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2025-01-20T00:00:00Z',
  },
];

// Mock email templates
export const mockEmailTemplates: EmailTemplate[] = [
  {
    id: 'template1',
    name: 'Bienvenida Nuevos Usuarios',
    subject: 'Bienvenido a PromptHub - {{user_name}}',
    html_content: '<h1>¡Bienvenido a PromptHub, {{user_name}}!</h1><p>Tu cuenta está lista. Plan: {{plan_name}}</p>',
    text_content: '¡Bienvenido a PromptHub, {{user_name}}! Tu cuenta está lista. Plan: {{plan_name}}',
    variables: ['user_name', 'plan_name', 'tokens_limit'],
    type: 'welcome',
    active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-20T00:00:00Z',
  },
  {
    id: 'template2',
    name: 'Confirmación de Pago',
    subject: 'Pago confirmado - {{amount}}',
    html_content: '<h1>¡Pago confirmado!</h1><p>Monto: {{amount}}<br>Tokens: {{tokens_purchased}}</p>',
    text_content: '¡Pago confirmado! Monto: {{amount}} Tokens: {{tokens_purchased}}',
    variables: ['amount', 'tokens_purchased', 'transaction_id'],
    type: 'payment_confirmation',
    active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-20T00:00:00Z',
  },
];

// Mock support tickets
export const mockSupportTickets: SupportTicket[] = [
  {
    id: 'ticket1',
    user_id: 'user1',
    subject: 'No puedo acceder después del pago',
    message: 'Realicé el pago hace 2 horas pero no puedo acceder a las funciones premium.',
    category: 'billing',
    priority: 'high',
    status: 'open',
    created_at: '2025-01-20T10:30:00Z',
    updated_at: '2025-01-20T10:30:00Z',
  },
  {
    id: 'ticket2',
    user_id: 'user2',
    subject: 'Error 500 con GPT-4',
    message: 'Al ejecutar prompts con GPT-4 obtengo error 500. Otros modelos funcionan bien.',
    category: 'technical',
    priority: 'medium',
    status: 'in_progress',
    assigned_to: 'admin1',
    created_at: '2025-01-19T14:20:00Z',
    updated_at: '2025-01-20T09:15:00Z',
    last_response_at: '2025-01-20T09:15:00Z',
  },
];

// Mock SMTP configuration
export const mockSMTPConfig: SMTPConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  username: 'noreply@prompthub.com',
  password: '••••••••••••••••',
  from_email: 'noreply@prompthub.com',
  from_name: 'PromptHub',
  use_tls: true,
  active: true,
};