/*
  # Seed Initial Data for PromptHub v2

  1. Initial Data
    - Default plans (Starter, Pro, Enterprise)
    - Categories for prompts
    - AI providers and models
    - Organization plans
    - Default email templates
    - System configuration

  2. Sample Data
    - System prompts
    - Token pricing
    - Default SMTP config
*/

-- Insert default plans
INSERT INTO plans (id, name, price, tokens_included, overage_price, stripe_price_id) VALUES
  ('starter', 'Starter', 9.00, 500000, 15.00, 'price_starter_monthly'),
  ('pro', 'Pro', 29.00, 2000000, 12.00, 'price_pro_monthly'),
  ('enterprise', 'Enterprise', 99.00, 10000000, 8.00, 'price_enterprise_monthly')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  tokens_included = EXCLUDED.tokens_included,
  overage_price = EXCLUDED.overage_price,
  updated_at = now();

-- Insert categories
INSERT INTO categories (id, name, description, icon, color) VALUES
  ('writing', 'Escritura', 'Prompts para escritura creativa y técnica', 'PenTool', 'bg-blue-500'),
  ('analysis', 'Análisis', 'Prompts para análisis de datos y texto', 'BarChart3', 'bg-green-500'),
  ('code', 'Código', 'Prompts para programación y desarrollo', 'Code2', 'bg-purple-500'),
  ('marketing', 'Marketing', 'Prompts para marketing y ventas', 'TrendingUp', 'bg-orange-500'),
  ('education', 'Educación', 'Prompts educativos y formativos', 'GraduationCap', 'bg-indigo-500'),
  ('creativity', 'Creatividad', 'Prompts para proyectos creativos', 'Palette', 'bg-pink-500')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color;

-- Insert AI providers
INSERT INTO providers (id, name, enabled, base_url) VALUES
  ('openai', 'OpenAI', true, 'https://api.openai.com/v1'),
  ('anthropic', 'Anthropic', true, 'https://api.anthropic.com'),
  ('replicate', 'Replicate', true, 'https://api.replicate.com/v1')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  enabled = EXCLUDED.enabled,
  base_url = EXCLUDED.base_url,
  updated_at = now();

-- Insert AI models
INSERT INTO models (id, name, provider_id, input_cost, output_cost, max_tokens, supports_temperature, supports_top_p) VALUES
  ('gpt-5', 'GPT-5', 'openai', 1.25, 10.0, 128000, true, true),
  ('gpt-5-mini-2025-08-07', 'GPT-5 Mini', 'openai', 0.15, 0.60, 128000, false, false),
  ('gpt-4o', 'GPT-4o', 'openai', 5.0, 15.0, 128000, true, true),
  ('claude-3-5-sonnet', 'Claude 3.5 Sonnet', 'anthropic', 3.0, 15.0, 200000, true, true),
  ('meta/llama-2-70b-chat', 'Llama 2 70B Chat', 'replicate', 0.65, 2.75, 4096, true, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  provider_id = EXCLUDED.provider_id,
  input_cost = EXCLUDED.input_cost,
  output_cost = EXCLUDED.output_cost,
  max_tokens = EXCLUDED.max_tokens,
  supports_temperature = EXCLUDED.supports_temperature,
  supports_top_p = EXCLUDED.supports_top_p,
  updated_at = now();

-- Insert organization plans
INSERT INTO organization_plans (id, name, price_per_user, tokens_per_user, features, min_team_size, stripe_price_id) VALUES
  ('team', 'PromptHub para Equipos', 29.00, 2000000, ARRAY[
    'Facturación y facturación centralizadas',
    'Límites y controles de uso del equipo',
    'Informes y análisis de uso detallados',
    'Soporte prioritario'
  ], 2, 'price_team_per_user'),
  ('enterprise', 'Enterprise', 49.00, 5000000, ARRAY[
    'Todo lo de PromptHub para equipos',
    'SSO y gestión avanzada de usuarios',
    'API dedicada y límites personalizados',
    'Soporte 24/7 y account manager',
    'Integración personalizada'
  ], 5, 'price_enterprise_per_user')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price_per_user = EXCLUDED.price_per_user,
  tokens_per_user = EXCLUDED.tokens_per_user,
  features = EXCLUDED.features,
  min_team_size = EXCLUDED.min_team_size,
  updated_at = now();

-- Insert token pricing
INSERT INTO token_prices (model, input_cost_base, output_cost_base, input_margin_percent, output_margin_percent) VALUES
  ('gpt-5', 1.25, 10.0, 50.0, 50.0),
  ('gpt-5-mini-2025-08-07', 0.15, 0.60, 60.0, 60.0),
  ('gpt-4o', 5.0, 15.0, 50.0, 50.0),
  ('claude-3-5-sonnet', 3.0, 15.0, 45.0, 45.0),
  ('meta/llama-2-70b-chat', 0.65, 2.75, 40.0, 40.0)
ON CONFLICT (model) DO UPDATE SET
  input_cost_base = EXCLUDED.input_cost_base,
  output_cost_base = EXCLUDED.output_cost_base,
  input_margin_percent = EXCLUDED.input_margin_percent,
  output_margin_percent = EXCLUDED.output_margin_percent,
  updated_at = now();

-- Insert default email templates
INSERT INTO email_templates (name, subject, html_content, text_content, variables, type) VALUES
  (
    'Bienvenida Nuevos Usuarios',
    'Bienvenido a PromptHub - {{user_name}}',
    '<h1>¡Bienvenido a PromptHub, {{user_name}}!</h1>
<p>Tu cuenta ha sido creada exitosamente. Ya puedes empezar a optimizar tus prompts de IA.</p>
<p><strong>Detalles de tu cuenta:</strong></p>
<ul>
  <li>Email: {{user_email}}</li>
  <li>Plan: {{plan_name}}</li>
  <li>Tokens incluidos: {{tokens_limit}}</li>
</ul>
<p><a href="{{login_url}}" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Acceder a PromptHub</a></p>',
    '¡Bienvenido a PromptHub, {{user_name}}!

Tu cuenta ha sido creada exitosamente. Ya puedes empezar a optimizar tus prompts de IA.

Detalles de tu cuenta:
- Email: {{user_email}}
- Plan: {{plan_name}}
- Tokens incluidos: {{tokens_limit}}

Accede aquí: {{login_url}}',
    ARRAY['user_name', 'user_email', 'plan_name', 'tokens_limit', 'login_url'],
    'welcome'
  ),
  (
    'Confirmación de Pago',
    'Pago confirmado - {{amount}} procesado exitosamente',
    '<h1>¡Pago confirmado!</h1>
<p>Hola {{user_name}}, tu pago ha sido procesado exitosamente.</p>
<p><strong>Detalles del pago:</strong></p>
<ul>
  <li>Monto: {{amount}}</li>
  <li>Tokens añadidos: {{tokens_purchased}}</li>
  <li>Método de pago: {{payment_method}}</li>
  <li>ID de transacción: {{transaction_id}}</li>
</ul>
<p>Tus tokens ya están disponibles en tu cuenta.</p>',
    '¡Pago confirmado!

Hola {{user_name}}, tu pago ha sido procesado exitosamente.

Detalles del pago:
- Monto: {{amount}}
- Tokens añadidos: {{tokens_purchased}}
- Método de pago: {{payment_method}}
- ID de transacción: {{transaction_id}}

Tus tokens ya están disponibles en tu cuenta.',
    ARRAY['user_name', 'amount', 'tokens_purchased', 'payment_method', 'transaction_id'],
    'payment_confirmation'
  )
ON CONFLICT (name) DO UPDATE SET
  subject = EXCLUDED.subject,
  html_content = EXCLUDED.html_content,
  text_content = EXCLUDED.text_content,
  variables = EXCLUDED.variables,
  type = EXCLUDED.type,
  updated_at = now();

-- Insert default SMTP config (placeholder)
INSERT INTO smtp_config (host, port, username, password, from_email, from_name, use_tls, active) VALUES
  ('smtp.gmail.com', 587, 'noreply@prompthub.com', 'your-app-password', 'noreply@prompthub.com', 'PromptHub', true, false)
ON CONFLICT DO NOTHING;

-- Insert sample system prompts
INSERT INTO prompts (title, content_es, content_en, category, tags, type, user_id) VALUES
  (
    'Sistema de Moderación de Contenido',
    'Actúa como un moderador de contenido experto. Analiza el siguiente texto y determina si contiene: 1) Contenido tóxico o ofensivo, 2) Desinformación, 3) Spam, 4) Contenido inapropiado. Proporciona una puntuación de 0-10 para cada categoría y justifica tu evaluación. Texto: {texto}',
    'Act as an expert content moderator. Analyze the following text and determine if it contains: 1) Toxic or offensive content, 2) Misinformation, 3) Spam, 4) Inappropriate content. Provide a score from 0-10 for each category and justify your evaluation. Text: {text}',
    'analysis',
    ARRAY['moderation', 'safety', 'analysis', 'content-filtering'],
    'system',
    NULL
  ),
  (
    'Generador de Artículos SEO',
    'Actúa como un experto en SEO y redacción. Crea un artículo optimizado sobre {tema} que incluya palabras clave relevantes, estructura H1-H6, meta descripción y que tenga al menos 1500 palabras. El tono debe ser profesional pero accesible.',
    'Act as an SEO and writing expert. Create an optimized article about {topic} that includes relevant keywords, H1-H6 structure, meta description and has at least 1500 words. The tone should be professional but accessible.',
    'marketing',
    ARRAY['SEO', 'marketing', 'content', 'article'],
    'system',
    NULL
  )
ON CONFLICT DO NOTHING;

-- Create RPC functions for statistics
CREATE OR REPLACE FUNCTION increment_prompt_stats(p_prompt_id uuid, p_field text)
RETURNS void AS $$
BEGIN
  IF p_field = 'visits' THEN
    INSERT INTO prompt_stats (prompt_id, visits) VALUES (p_prompt_id, 1)
    ON CONFLICT (prompt_id) DO UPDATE SET visits = prompt_stats.visits + 1, updated_at = now();
  ELSIF p_field = 'copies' THEN
    INSERT INTO prompt_stats (prompt_id, copies) VALUES (p_prompt_id, 1)
    ON CONFLICT (prompt_id) DO UPDATE SET copies = prompt_stats.copies + 1, updated_at = now();
  ELSIF p_field = 'improvements' THEN
    INSERT INTO prompt_stats (prompt_id, improvements) VALUES (p_prompt_id, 1)
    ON CONFLICT (prompt_id) DO UPDATE SET improvements = prompt_stats.improvements + 1, updated_at = now();
  ELSIF p_field = 'translations' THEN
    INSERT INTO prompt_stats (prompt_id, translations) VALUES (p_prompt_id, 1)
    ON CONFLICT (prompt_id) DO UPDATE SET translations = prompt_stats.translations + 1, updated_at = now();
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;