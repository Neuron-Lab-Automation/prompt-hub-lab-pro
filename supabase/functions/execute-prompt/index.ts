import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ExecuteRequest {
  promptId: string;
  provider: string;
  model: string;
  parameters: Record<string, any>;
  content: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from JWT
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { promptId, provider, model, parameters, content }: ExecuteRequest = await req.json();

    // Get user data and check token limits
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('tokens_used, tokens_limit, plan_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Estimate tokens (simple estimation)
    const estimatedTokens = Math.ceil(content.length / 4);
    
    if (userData.tokens_used + estimatedTokens > userData.tokens_limit) {
      return new Response(JSON.stringify({ error: 'Token limit exceeded' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get model pricing
    const { data: pricing } = await supabaseClient
      .from('token_prices')
      .select('*')
      .eq('model', model)
      .single();

    const startTime = Date.now();
    let result = '';
    let inputTokens = estimatedTokens;
    let outputTokens = 0;
    let cost = 0;

    try {
      if (provider === 'openai') {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content }],
            ...parameters,
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error?.message || 'OpenAI API error');
        }

        result = data.choices[0].message.content;
        inputTokens = data.usage?.prompt_tokens || estimatedTokens;
        outputTokens = data.usage?.completion_tokens || Math.ceil(result.length / 4);
        
      } else if (provider === 'openrouter') {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('OPENROUTER_API_KEY')}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': Deno.env.get('VITE_SUPABASE_URL'),
            'X-Title': 'PromptHub v2',
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content }],
            ...parameters,
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error?.message || 'OpenRouter API error');
        }

        result = data.choices[0].message.content;
        inputTokens = data.usage?.prompt_tokens || estimatedTokens;
        outputTokens = data.usage?.completion_tokens || Math.ceil(result.length / 4);
      }

      // Calculate cost
      if (pricing) {
        const inputCost = (inputTokens / 1000000) * pricing.input_cost_base * (1 + pricing.input_margin_percent / 100);
        const outputCost = (outputTokens / 1000000) * pricing.output_cost_base * (1 + pricing.output_margin_percent / 100);
        cost = (inputCost + outputCost) * pricing.fx_rate;
      }

      const latency = Date.now() - startTime;
      const totalTokens = inputTokens + outputTokens;

      // Save execution record
      await supabaseClient.from('executions').insert({
        prompt_id: promptId,
        user_id: user.id,
        provider,
        model,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        total_tokens: totalTokens,
        cost,
        latency,
        result,
        parameters,
      });

      // Update user token usage
      await supabaseClient
        .from('users')
        .update({ tokens_used: userData.tokens_used + totalTokens })
        .eq('id', user.id);

      // Update prompt stats
      await supabaseClient.rpc('increment_prompt_stats', {
        p_prompt_id: promptId,
        p_field: 'visits'
      });

      return new Response(JSON.stringify({
        result,
        usage: {
          inputTokens,
          outputTokens,
          totalTokens,
          cost,
          latency,
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (apiError) {
      console.error('API Error:', apiError);
      return new Response(JSON.stringify({ error: apiError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Function Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});