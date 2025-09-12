-- RPC Functions for PromptHub v2

-- Function to increment prompt stats
CREATE OR REPLACE FUNCTION increment_prompt_stats(p_prompt_id uuid, p_field text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the specified field
  CASE p_field
    WHEN 'visits' THEN
      UPDATE prompt_stats 
      SET visits = visits + 1, updated_at = now()
      WHERE prompt_id = p_prompt_id;
    WHEN 'copies' THEN
      UPDATE prompt_stats 
      SET copies = copies + 1, updated_at = now()
      WHERE prompt_id = p_prompt_id;
      -- Also update CTR
      UPDATE prompt_stats 
      SET ctr = CASE WHEN visits > 0 THEN (copies::decimal / visits::decimal) * 100 ELSE 0 END
      WHERE prompt_id = p_prompt_id;
    WHEN 'improvements' THEN
      UPDATE prompt_stats 
      SET improvements = improvements + 1, updated_at = now()
      WHERE prompt_id = p_prompt_id;
    WHEN 'translations' THEN
      UPDATE prompt_stats 
      SET translations = translations + 1, updated_at = now()
      WHERE prompt_id = p_prompt_id;
  END CASE;
  
  -- Update last_execution for visits
  IF p_field = 'visits' THEN
    UPDATE prompt_stats 
    SET last_execution = now()
    WHERE prompt_id = p_prompt_id;
  END IF;
END;
$$;

-- Function to get user context (for Edge Functions)
CREATE OR REPLACE FUNCTION get_user_context(p_user_id uuid)
RETURNS TABLE(
  user_id uuid,
  email text,
  name text,
  role user_role,
  plan_id text,
  tokens_used bigint,
  tokens_limit bigint,
  plan_name text,
  plan_price decimal,
  overage_price decimal
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    u.plan_id,
    u.tokens_used,
    u.tokens_limit,
    p.name,
    p.price,
    p.overage_price
  FROM users u
  JOIN plans p ON u.plan_id = p.id
  WHERE u.id = p_user_id;
END;
$$;

-- Function to check token limits
CREATE OR REPLACE FUNCTION check_token_limit(p_user_id uuid, p_estimated_tokens integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_tokens_used bigint;
  user_tokens_limit bigint;
BEGIN
  SELECT tokens_used, tokens_limit 
  INTO user_tokens_used, user_tokens_limit
  FROM users 
  WHERE id = p_user_id;
  
  RETURN (user_tokens_used + p_estimated_tokens) <= user_tokens_limit;
END;
$$;

-- Function to update user token usage
CREATE OR REPLACE FUNCTION update_user_tokens(p_user_id uuid, p_tokens_consumed integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE users 
  SET tokens_used = tokens_used + p_tokens_consumed,
      updated_at = now()
  WHERE id = p_user_id;
END;
$$;

-- Function to get prompt with stats (optimized query)
CREATE OR REPLACE FUNCTION get_prompt_with_stats(p_prompt_id uuid)
RETURNS TABLE(
  id uuid,
  title text,
  content_es text,
  content_en text,
  category text,
  tags text[],
  type prompt_type,
  user_id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  is_favorite boolean,
  characters_es integer,
  characters_en integer,
  tokens_es integer,
  tokens_en integer,
  visits integer,
  copies integer,
  improvements integer,
  translations integer,
  last_execution timestamptz,
  ctr decimal
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.content_es,
    p.content_en,
    p.category,
    p.tags,
    p.type,
    p.user_id,
    p.created_at,
    p.updated_at,
    p.is_favorite,
    COALESCE(ps.characters_es, 0),
    COALESCE(ps.characters_en, 0),
    COALESCE(ps.tokens_es, 0),
    COALESCE(ps.tokens_en, 0),
    COALESCE(ps.visits, 0),
    COALESCE(ps.copies, 0),
    COALESCE(ps.improvements, 0),
    COALESCE(ps.translations, 0),
    ps.last_execution,
    COALESCE(ps.ctr, 0)
  FROM prompts p
  LEFT JOIN prompt_stats ps ON p.id = ps.prompt_id
  WHERE p.id = p_prompt_id;
END;
$$;