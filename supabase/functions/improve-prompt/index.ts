import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ImproveRequest {
  promptId: string;
  language: 'es' | 'en';
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

    const { promptId, language }: ImproveRequest = await req.json();

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

    // Check if user can improve this prompt (own prompts or system prompts)
    if (prompt.type === 'user' && prompt.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Load improvement configuration
    const improveConfig = {
      system_prompt: `Eres un experto en prompt engineering con más de 5 años optimizando prompts para modelos de IA. Tu objetivo es mejorar prompts existentes para hacerlos más efectivos, claros y robustos.

Objetivos de mejora:
- Claridad y especificidad en las instrucciones
- Estructura coherente y fácil de seguir
- Contexto adecuado para el modelo
- Manejo de edge cases y variaciones
- Optimización para mejores resultados
- Reducción de ambigüedades
- Mejora de la consistencia en outputs

Analiza el prompt original e identifica áreas de mejora. Mejora la claridad sin cambiar la intención original. Añade contexto relevante si falta. Estructura las instrucciones de forma lógica. Define claramente el formato de output esperado. Preserva variables y placeholders existentes.

Devuelve SOLO el prompt mejorado, sin explicaciones adicionales.`,
    };

    const originalContent = language === 'es' ? prompt.content_es : prompt.content_en;
    
    // Call OpenAI to improve the prompt
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: improveConfig.system_prompt },
          { role: 'user', content: `Mejora este prompt:\n\n${originalContent}` }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'OpenAI API error');
    }

    const improvedContent = data.choices[0].message.content;

    // Get next version number
    const { data: versions } = await supabaseClient
      .from('prompt_versions')
      .select('version')
      .eq('prompt_id', promptId)
      .order('version', { ascending: false })
      .limit(1);

    const nextVersion = versions && versions.length > 0 ? versions[0].version + 1 : 1;

    // Create new version
    const { data: newVersion, error: versionError } = await supabaseClient
      .from('prompt_versions')
      .insert({
        prompt_id: promptId,
        version: nextVersion,
        content_es: language === 'es' ? improvedContent : prompt.content_es,
        content_en: language === 'en' ? improvedContent : prompt.content_en,
        improvement_reason: 'Automated improvement via AI',
      })
      .select()
      .single();

    if (versionError) {
      throw new Error('Failed to create version');
    }

    // Update prompt stats
    await supabaseClient.rpc('increment_prompt_stats', {
      p_prompt_id: promptId,
      p_field: 'improvements'
    });

    return new Response(JSON.stringify({
      success: true,
      version: newVersion,
      improvedContent,
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