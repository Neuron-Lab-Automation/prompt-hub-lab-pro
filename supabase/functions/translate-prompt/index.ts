import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface TranslateRequest {
  promptId: string;
  targetLanguage: 'es' | 'en';
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

    const { promptId, targetLanguage }: TranslateRequest = await req.json();

    // Get original prompt
    const { data: prompt, error: promptError } = await supabaseClient
      .from('prompts')
      .select('*')
      .eq('id', promptId)
      .single();

    if (promptError || !prompt) {
      return new Response(JSON.stringify({ error: 'Prompt not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sourceLanguage = targetLanguage === 'es' ? 'en' : 'es';
    const sourceContent = sourceLanguage === 'es' ? prompt.content_es : prompt.content_en;
    
    const systemPrompt = targetLanguage === 'es' 
      ? 'Eres un traductor profesional especializado en prompts de IA. Traduce el siguiente prompt del inglés al español manteniendo el significado exacto, el tono profesional y preservando todas las variables entre llaves {como_esta}. Devuelve SOLO la traducción, sin explicaciones adicionales.'
      : 'You are a professional translator specialized in AI prompts. Translate the following prompt from Spanish to English maintaining the exact meaning, professional tone and preserving all variables in braces {like_this}. Return ONLY the translation, without additional explanations.';

    // Call OpenAI for translation
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: sourceContent }
        ],
        temperature: 0.1, // Low temperature for consistent translations
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'OpenAI API error');
    }

    const translatedContent = data.choices[0].message.content;

    // Update the prompt with the translation
    const updateData = targetLanguage === 'es' 
      ? { content_es: translatedContent }
      : { content_en: translatedContent };

    const { error: updateError } = await supabaseClient
      .from('prompts')
      .update(updateData)
      .eq('id', promptId);

    if (updateError) {
      throw new Error('Failed to update prompt');
    }

    // Update prompt stats
    await supabaseClient.rpc('increment_prompt_stats', {
      p_prompt_id: promptId,
      p_field: 'translations'
    });

    // Update character and token counts
    const characters = translatedContent.length;
    const tokens = Math.ceil(characters / 4); // Simple estimation

    const statsUpdate = targetLanguage === 'es'
      ? { characters_es: characters, tokens_es: tokens }
      : { characters_en: characters, tokens_en: tokens };

    await supabaseClient
      .from('prompt_stats')
      .update(statsUpdate)
      .eq('prompt_id', promptId);

    return new Response(JSON.stringify({
      success: true,
      translatedContent,
      targetLanguage,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Function Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});