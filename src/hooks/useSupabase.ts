import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Prompt, Category, Provider } from '../types';

export function useSupabase() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}

export function usePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select(`
          *,
          stats:prompt_stats(*)
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Transform data to match our Prompt interface
      const transformedPrompts: Prompt[] = (data || []).map(prompt => ({
        ...prompt,
        stats: prompt.stats?.[0] || {
          characters_es: prompt.content_es.length,
          characters_en: prompt.content_en.length,
          tokens_es: Math.ceil(prompt.content_es.length / 4),
          tokens_en: Math.ceil(prompt.content_en.length / 4),
          visits: 0,
          copies: 0,
          improvements: 0,
          translations: 0,
          ctr: 0,
        },
        versions: []
      }));

      setPrompts(transformedPrompts);
    } catch (error) {
      console.error('Error fetching prompts:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };
  const executePrompt = async (promptId: string, provider: string, model: string, parameters: any, content: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('execute-prompt', {
        body: { promptId, provider, model, parameters, content }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error executing prompt:', error);
      throw error;
    }
  };

  const improvePrompt = async (promptId: string, language: 'es' | 'en') => {
    try {
      const { data, error } = await supabase.functions.invoke('improve-prompt', {
        body: { promptId, language }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error improving prompt:', error);
      throw error;
    }
  };

  const translatePrompt = async (promptId: string, targetLanguage: 'es' | 'en') => {
    try {
      const { data, error } = await supabase.functions.invoke('translate-prompt', {
        body: { promptId, targetLanguage }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error translating prompt:', error);
      throw error;
    }
  };

  const incrementStat = async (promptId: string, statType: string) => {
    try {
      const { error } = await supabase.rpc('increment_prompt_stats', {
        p_prompt_id: promptId,
        p_field: statType
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error incrementing stat:', error);
      throw error;
    }
  };

  const toggleFavorite = async (promptId: string) => {
    try {
      const prompt = prompts.find(p => p.id === promptId);
      if (!prompt) throw new Error('Prompt not found');

      const { error } = await supabase
        .from('prompts')
        .update({ is_favorite: !prompt.is_favorite })
        .eq('id', promptId);

      if (error) throw error;

      // Update local state
      setPrompts(prevPrompts =>
        prevPrompts.map(p =>
          p.id === promptId ? { ...p, is_favorite: !p.is_favorite } : p
        )
      );

      return { success: true };
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  };

  return {
    prompts,
    loading,
    error,
    executePrompt,
    improvePrompt,
    translatePrompt,
    incrementStat,
    toggleFavorite,
    refetch: fetchPrompts,
  };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  return { categories, loading };
}

export function useProviders() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select(`
          *,
          models(*)
        `)
        .eq('enabled', true)
        .order('name');

      if (error) throw error;
      setProviders(data || []);
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  return { providers, loading };
}