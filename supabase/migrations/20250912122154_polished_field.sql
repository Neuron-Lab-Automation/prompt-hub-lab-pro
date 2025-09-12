-- RPC Functions for PromptHub v2

-- Function to add tokens to user account
CREATE OR REPLACE FUNCTION add_user_tokens(p_user_id uuid, p_tokens bigint)
RETURNS void AS $$
BEGIN
  UPDATE users 
  SET tokens_limit = tokens_limit + p_tokens,
      updated_at = now()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create user profile after signup
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS trigger AS $$
BEGIN
  INSERT INTO users (id, email, name, role, plan_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'user',
    'starter'
  );
  
  -- Create referral program for new user
  INSERT INTO referral_programs (user_id, referral_code, referral_url)
  VALUES (
    NEW.id,
    substring(NEW.id::text from 1 for 8) || '-' || substring(NEW.id::text from 25 for 8),
    'https://prompthub.com/signup?ref=' || substring(NEW.id::text from 1 for 8) || '-' || substring(NEW.id::text from 25 for 8)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
CREATE TRIGGER create_user_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- Function to calculate CTR and update stats
CREATE OR REPLACE FUNCTION update_prompt_ctr()
RETURNS trigger AS $$
BEGIN
  IF NEW.visits > 0 THEN
    NEW.ctr = (NEW.copies::numeric / NEW.visits::numeric) * 100;
  ELSE
    NEW.ctr = 0;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update CTR automatically
DROP TRIGGER IF EXISTS update_prompt_ctr_trigger ON prompt_stats;
CREATE TRIGGER update_prompt_ctr_trigger
  BEFORE UPDATE ON prompt_stats
  FOR EACH ROW EXECUTE FUNCTION update_prompt_ctr();

-- Function to handle referral tracking
CREATE OR REPLACE FUNCTION process_referral(p_referral_code text, p_referred_user_id uuid, p_purchase_amount numeric)
RETURNS void AS $$
DECLARE
  v_referrer_id uuid;
  v_commission_rate numeric;
  v_commission_amount numeric;
  v_max_earnings numeric;
  v_current_earnings numeric;
BEGIN
  -- Get referrer info
  SELECT user_id, commission_rate INTO v_referrer_id, v_commission_rate
  FROM referral_programs
  WHERE referral_code = p_referral_code AND active = true;
  
  IF v_referrer_id IS NULL THEN
    RETURN; -- Invalid referral code
  END IF;
  
  -- Get referral settings (you'd store these in a settings table)
  v_commission_rate := 10; -- 10% commission
  v_max_earnings := 100; -- Max €100 per referrer
  
  -- Check current earnings
  SELECT COALESCE(total_earnings, 0) INTO v_current_earnings
  FROM referral_programs
  WHERE user_id = v_referrer_id;
  
  -- Calculate commission
  v_commission_amount := (p_purchase_amount * v_commission_rate) / 100;
  
  -- Cap at max earnings
  IF v_current_earnings + v_commission_amount > v_max_earnings THEN
    v_commission_amount := v_max_earnings - v_current_earnings;
  END IF;
  
  -- Only process if there's commission to earn
  IF v_commission_amount > 0 THEN
    -- Create referral record
    INSERT INTO referrals (referrer_id, referred_user_id, referral_code, commission_earned, status)
    VALUES (v_referrer_id, p_referred_user_id, p_referral_code, v_commission_amount, 'confirmed');
    
    -- Update referrer stats
    UPDATE referral_programs
    SET total_referrals = total_referrals + 1,
        total_earnings = total_earnings + v_commission_amount,
        updated_at = now()
    WHERE user_id = v_referrer_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;