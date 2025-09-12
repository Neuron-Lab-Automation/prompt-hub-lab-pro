/*
  # Seed Initial Data for PromptHub v2

  1. Plans
  2. Categories  
  3. Providers and Models
  4. Token Prices
  5. Sample System Prompts
  6. Sample Coupons
  7. Sample Affiliates
*/

-- Insert plans
INSERT INTO plans (id, name, price, tokens_included, overage_price) VALUES
  ('starter', 'Starter', 9.00, 500000, 15.00),
  ('pro', 'Pro', 29.00, 2000000, 12.00),
  ('enterprise', 'Enterprise', 49.00, 10000000, 8.00)
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

-- Insert providers
INSERT INTO providers (id, name, enabled, base_url) VALUES
  ('openai', 'OpenAI', true, 'https://api.openai.com/v1'),
  ('openrouter', 'OpenRouter', true, 'https://openrouter.ai/api/v1')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  enabled = EXCLUDED.enabled,
  base_url = EXCLUDED.base_url,
  updated_at = now();

-- Insert models
INSERT INTO models (id, name, provider_id, input_cost, output_cost, max_tokens, supports_temperature, supports_top_p, enabled) VALUES
  ('gpt-5', 'GPT-5', 'openai', 1.25, 10.0, 128000, true, true, true),
  ('gpt-5-mini-2025-08-07', 'GPT-5 Mini', 'openai', 0.15, 0.60, 128000, false, false, true),
  ('gpt-4o', 'GPT-4o', 'openai', 5.0, 15.0, 128000, true, true, true),
  ('claude-3-5-sonnet', 'Claude 3.5 Sonnet', 'openrouter', 3.0, 15.0, 200000, true, true, true),
  ('meta-llama/llama-2-70b-chat', 'Llama 2 70B Chat', 'openrouter', 0.65, 2.75, 4096, true, true, true),
  ('google/gemini-pro', 'Gemini Pro', 'openrouter', 0.5, 1.5, 32000, true, true, true),
  ('deepseek/deepseek-chat', 'DeepSeek Chat', 'openrouter', 0.14, 0.28, 32000, true, true, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  provider_id = EXCLUDED.provider_id,
  input_cost = EXCLUDED.input_cost,
  output_cost = EXCLUDED.output_cost,
  max_tokens = EXCLUDED.max_tokens,
  supports_temperature = EXCLUDED.supports_temperature,
  supports_top_p = EXCLUDED.supports_top_p,
  enabled = EXCLUDED.enabled,
  updated_at = now();

-- Insert token prices with margins
INSERT INTO token_prices (model, input_cost_base, output_cost_base, input_margin_percent, output_margin_percent, currency, fx_rate) VALUES
  ('gpt-5', 1.25, 10.0, 50.0, 50.0, 'USD', 1.0),
  ('gpt-5-mini-2025-08-07', 0.15, 0.60, 50.0, 50.0, 'USD', 1.0),
  ('gpt-4o', 5.0, 15.0, 50.0, 50.0, 'USD', 1.0),
  ('claude-3-5-sonnet', 3.0, 15.0, 50.0, 50.0, 'USD', 1.0),
  ('meta-llama/llama-2-70b-chat', 0.65, 2.75, 50.0, 50.0, 'USD', 1.0),
  ('google/gemini-pro', 0.5, 1.5, 50.0, 50.0, 'USD', 1.0),
  ('deepseek/deepseek-chat', 0.14, 0.28, 50.0, 50.0, 'USD', 1.0)
ON CONFLICT (model) DO UPDATE SET
  input_cost_base = EXCLUDED.input_cost_base,
  output_cost_base = EXCLUDED.output_cost_base,
  input_margin_percent = EXCLUDED.input_margin_percent,
  output_margin_percent = EXCLUDED.output_margin_percent,
  currency = EXCLUDED.currency,
  fx_rate = EXCLUDED.fx_rate,
  updated_at = now();

-- Insert sample system prompts
DO $$
DECLARE
  prompt_id uuid;
BEGIN
  -- SEO Article Generator
  INSERT INTO prompts (title, content_es, content_en, category, tags, type, user_id)
  VALUES (
    'Generador de Artículos SEO',
    'Actúa como un experto en SEO y redacción. Crea un artículo optimizado sobre {tema} que incluya palabras clave relevantes, estructura H1-H6, meta descripción y que tenga al menos 1500 palabras. El tono debe ser profesional pero accesible.',
    'Act as an SEO and writing expert. Create an optimized article about {topic} that includes relevant keywords, H1-H6 structure, meta description and has at least 1500 words. The tone should be professional but accessible.',
    'marketing',
    ARRAY['SEO', 'marketing', 'content', 'article'],
    'system',
    null
  ) RETURNING id INTO prompt_id;

  INSERT INTO prompt_stats (prompt_id, characters_es, characters_en, tokens_es, tokens_en, visits, copies, improvements, translations, ctr)
  VALUES (prompt_id, 287, 248, 72, 62, 2847, 156, 8, 12, 5.48);

  -- Python Code Analyzer
  INSERT INTO prompts (title, content_es, content_en, category, tags, type, user_id)
  VALUES (
    'Analista de Código Python',
    'Eres un senior developer de Python con 10+ años de experiencia. Analiza el siguiente código y proporciona: 1) Identificación de bugs potenciales, 2) Sugerencias de optimización, 3) Mejores prácticas aplicables, 4) Refactoring recomendado. Código: {codigo}',
    'You are a senior Python developer with 10+ years of experience. Analyze the following code and provide: 1) Identification of potential bugs, 2) Optimization suggestions, 3) Applicable best practices, 4) Recommended refactoring. Code: {code}',
    'code',
    ARRAY['python', 'code-review', 'debugging', 'optimization'],
    'system',
    null
  ) RETURNING id INTO prompt_id;

  INSERT INTO prompt_stats (prompt_id, characters_es, characters_en, tokens_es, tokens_en, visits, copies, improvements, translations, ctr)
  VALUES (prompt_id, 345, 312, 86, 78, 1923, 89, 3, 5, 4.63);

  -- Children's Story Creator
  INSERT INTO prompts (title, content_es, content_en, category, tags, type, user_id)
  VALUES (
    'Creador de Historias Infantiles',
    'Eres un escritor especializado en literatura infantil. Crea una historia corta (300-500 palabras) para niños de 5-8 años sobre {tema}. La historia debe tener: personajes entrañables, una lección moral sutil, lenguaje simple y descriptivo, y un final feliz. Incluye momentos de suspense apropiados para la edad.',
    'You are a writer specialized in children''s literature. Create a short story (300-500 words) for children aged 5-8 about {topic}. The story should have: endearing characters, a subtle moral lesson, simple and descriptive language, and a happy ending. Include age-appropriate moments of suspense.',
    'creativity',
    ARRAY['creative-writing', 'children', 'storytelling', 'education'],
    'system',
    null
  ) RETURNING id INTO prompt_id;

  INSERT INTO prompt_stats (prompt_id, characters_es, characters_en, tokens_es, tokens_en, visits, copies, improvements, translations, ctr)
  VALUES (prompt_id, 412, 398, 103, 99, 1456, 73, 2, 8, 5.01);

  -- Content Moderator
  INSERT INTO prompts (title, content_es, content_en, category, tags, type, user_id)
  VALUES (
    'Sistema de Moderación',
    'Actúa como un moderador de contenido experto. Analiza el siguiente texto y determina si contiene: 1) Contenido tóxico o ofensivo, 2) Desinformación, 3) Spam, 4) Contenido inapropiado. Proporciona una puntuación de 0-10 para cada categoría y justifica tu evaluación. Texto: {texto}',
    'Act as an expert content moderator. Analyze the following text and determine if it contains: 1) Toxic or offensive content, 2) Misinformation, 3) Spam, 4) Inappropriate content. Provide a score from 0-10 for each category and justify your evaluation. Text: {text}',
    'analysis',
    ARRAY['moderation', 'safety', 'analysis', 'content-filtering'],
    'system',
    null
  ) RETURNING id INTO prompt_id;

  INSERT INTO prompt_stats (prompt_id, characters_es, characters_en, tokens_es, tokens_en, visits, copies, improvements, translations, ctr)
  VALUES (prompt_id, 378, 356, 95, 89, 892, 34, 0, 3, 3.81);

  -- Sales Email Generator
  INSERT INTO prompts (title, content_es, content_en, category, tags, type, user_id)
  VALUES (
    'Generador de Emails de Ventas',
    'Eres un experto en copywriting y ventas B2B. Crea un email de seguimiento comercial para {empresa} sobre {producto_servicio}. El email debe: 1) Tener un asunto irresistible, 2) Personalización basada en investigación, 3) Propuesta de valor clara, 4) Call-to-action específico, 5) Tono profesional pero cercano. Máximo 200 palabras.',
    'You are an expert in copywriting and B2B sales. Create a commercial follow-up email for {company} about {product_service}. The email should: 1) Have an irresistible subject line, 2) Research-based personalization, 3) Clear value proposition, 4) Specific call-to-action, 5) Professional but approachable tone. Maximum 200 words.',
    'marketing',
    ARRAY['sales', 'email-marketing', 'copywriting', 'b2b'],
    'system',
    null
  ) RETURNING id INTO prompt_id;

  INSERT INTO prompt_stats (prompt_id, characters_es, characters_en, tokens_es, tokens_en, visits, copies, improvements, translations, ctr)
  VALUES (prompt_id, 456, 423, 114, 106, 2156, 124, 6, 9, 5.75);

  -- Math Tutor
  INSERT INTO prompts (title, content_es, content_en, category, tags, type, user_id)
  VALUES (
    'Tutor de Matemáticas Adaptativo',
    'Actúas como un tutor de matemáticas paciente y didáctico para estudiantes de {nivel}. Explica el concepto de {tema_matematico} usando: 1) Analogías de la vida real, 2) Ejemplos paso a paso, 3) Ejercicios progresivos, 4) Retroalimentación constructiva. Adapta el lenguaje al nivel del estudiante y fomenta la confianza.',
    'You act as a patient and didactic mathematics tutor for {level} students. Explain the concept of {math_topic} using: 1) Real-life analogies, 2) Step-by-step examples, 3) Progressive exercises, 4) Constructive feedback. Adapt the language to the student''s level and foster confidence.',
    'education',
    ARRAY['education', 'mathematics', 'tutoring', 'pedagogy'],
    'system',
    null
  ) RETURNING id INTO prompt_id;

  INSERT INTO prompt_stats (prompt_id, characters_es, characters_en, tokens_es, tokens_en, visits, copies, improvements, translations, ctr)
  VALUES (prompt_id, 398, 376, 100, 94, 1678, 67, 4, 11, 3.99);

  -- Data Analyst
  INSERT INTO prompts (title, content_es, content_en, category, tags, type, user_id)
  VALUES (
    'Analista de Datos Experto',
    'Actúa como un analista de datos senior con experiencia en estadística y visualización. Analiza el siguiente dataset: {datos}. Proporciona: 1) Resumen estadístico descriptivo, 2) Identificación de patrones y tendencias, 3) Anomalías o valores atípicos, 4) Recomendaciones de visualizaciones, 5) Insights accionables para el negocio.',
    'Act as a senior data analyst with experience in statistics and visualization. Analyze the following dataset: {data}. Provide: 1) Descriptive statistical summary, 2) Pattern and trend identification, 3) Anomalies or outliers, 4) Visualization recommendations, 5) Actionable business insights.',
    'analysis',
    ARRAY['data-analysis', 'statistics', 'business-intelligence', 'insights'],
    'system',
    null
  ) RETURNING id INTO prompt_id;

  INSERT INTO prompt_stats (prompt_id, characters_es, characters_en, tokens_es, tokens_en, visits, copies, improvements, translations, ctr)
  VALUES (prompt_id, 423, 401, 106, 100, 1234, 78, 5, 7, 6.32);

  -- Creative Writing Assistant
  INSERT INTO prompts (title, content_es, content_en, category, tags, type, user_id)
  VALUES (
    'Asistente de Escritura Creativa',
    'Eres un escritor profesional y mentor literario. Ayuda a desarrollar una historia sobre {tema} en el género {genero}. Proporciona: 1) Estructura narrativa sugerida, 2) Desarrollo de personajes principales, 3) Conflictos y tensiones dramáticas, 4) Ambientación detallada, 5) Diálogos naturales y convincentes. Mantén coherencia y originalidad.',
    'You are a professional writer and literary mentor. Help develop a story about {topic} in the {genre} genre. Provide: 1) Suggested narrative structure, 2) Main character development, 3) Dramatic conflicts and tensions, 4) Detailed setting, 5) Natural and convincing dialogue. Maintain coherence and originality.',
    'creativity',
    ARRAY['creative-writing', 'storytelling', 'narrative', 'fiction'],
    'system',
    null
  ) RETURNING id INTO prompt_id;

  INSERT INTO prompt_stats (prompt_id, characters_es, characters_en, tokens_es, tokens_en, visits, copies, improvements, translations, ctr)
  VALUES (prompt_id, 467, 445, 117, 111, 987, 56, 3, 6, 5.67);

  -- Technical Documentation
  INSERT INTO prompts (title, content_es, content_en, category, tags, type, user_id)
  VALUES (
    'Generador de Documentación Técnica',
    'Actúa como un technical writer experto. Crea documentación completa para {proyecto_tecnologia}. Incluye: 1) Introducción y propósito, 2) Requisitos del sistema, 3) Guía de instalación paso a paso, 4) Ejemplos de uso con código, 5) Troubleshooting común, 6) API reference si aplica. Usa formato Markdown y lenguaje claro.',
    'Act as an expert technical writer. Create comprehensive documentation for {project_technology}. Include: 1) Introduction and purpose, 2) System requirements, 3) Step-by-step installation guide, 4) Usage examples with code, 5) Common troubleshooting, 6) API reference if applicable. Use Markdown format and clear language.',
    'code',
    ARRAY['documentation', 'technical-writing', 'api', 'tutorials'],
    'system',
    null
  ) RETURNING id INTO prompt_id;

  INSERT INTO prompt_stats (prompt_id, characters_es, characters_en, tokens_es, tokens_en, visits, copies, improvements, translations, ctr)
  VALUES (prompt_id, 512, 489, 128, 122, 1567, 89, 7, 4, 5.68);

  -- Language Learning Tutor
  INSERT INTO prompts (title, content_es, content_en, category, tags, type, user_id)
  VALUES (
    'Tutor de Idiomas Personalizado',
    'Eres un profesor de idiomas experimentado especializado en {idioma_objetivo}. Crea una lección para nivel {nivel} sobre {tema_gramatical}. Incluye: 1) Explicación clara de la regla gramatical, 2) Ejemplos contextualizados, 3) Ejercicios interactivos, 4) Errores comunes a evitar, 5) Práctica conversacional. Adapta el contenido al nivel del estudiante.',
    'You are an experienced language teacher specialized in {target_language}. Create a lesson for {level} level about {grammar_topic}. Include: 1) Clear explanation of the grammar rule, 2) Contextualized examples, 3) Interactive exercises, 4) Common mistakes to avoid, 5) Conversational practice. Adapt content to student level.',
    'education',
    ARRAY['language-learning', 'grammar', 'education', 'tutoring'],
    'system',
    null
  ) RETURNING id INTO prompt_id;

  INSERT INTO prompt_stats (prompt_id, characters_es, characters_en, tokens_es, tokens_en, visits, copies, improvements, translations, ctr)
  VALUES (prompt_id, 445, 421, 111, 105, 1345, 71, 2, 9, 5.28);
END $$;

-- Insert sample coupons
INSERT INTO coupons (code, type, value, max_uses, expires_at, scope, active) VALUES
  ('WELCOME50', 'percentage', 50.00, 100, now() + interval '30 days', 'plan', true),
  ('TOKENS1000', 'fixed', 10.00, 50, now() + interval '60 days', 'addon', true),
  ('EARLYBIRD', 'percentage', 25.00, null, now() + interval '90 days', 'global', true)
ON CONFLICT (code) DO UPDATE SET
  type = EXCLUDED.type,
  value = EXCLUDED.value,
  max_uses = EXCLUDED.max_uses,
  expires_at = EXCLUDED.expires_at,
  scope = EXCLUDED.scope,
  active = EXCLUDED.active,
  updated_at = now();