import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { mockPrompts, categories as mockCategories, providers as mockProviders } from '../data/mockData';
import { Prompt, Category, Provider } from '../types';

// Configuración para deshabilitar Supabase temporalmente
const DISABLE_SUPABASE = true;

export function useSupabase() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (DISABLE_SUPABASE) {
      // Simular usuario autenticado para desarrollo
      setUser({
        id: 'mock-user-id',
        email: 'demo@prompthub.com',
        user_metadata: { name: 'Usuario Demo' }
      } as User);
      setLoading(false);
      return;
    }

    // Código de Supabase comentado hasta que esté configurado
    /*
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
    */
  }, []);

  return { user, loading };
}

export function usePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Usar solo datos mock
    console.log('Using mock prompts data (Supabase disabled)');
    setPrompts(mockPrompts);
    setLoading(false);
  }, []);

  const executePrompt = async (promptId: string, provider: string, model: string, parameters: any, content: string) => {
    // Simular ejecución de prompt
    console.log('Mock prompt execution:', { promptId, provider, model });
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          result: `Esta es una respuesta simulada para el prompt con ID: ${promptId}. En la implementación real, aquí aparecería la respuesta del modelo ${model} del proveedor ${provider}.`,
          usage: {
            inputTokens: Math.ceil(content.length / 4),
            outputTokens: 150,
            totalTokens: Math.ceil(content.length / 4) + 150,
            cost: 0.001,
            latency: 1500
          }
        });
      }, 1500);
    });
  };

  const improvePrompt = async (promptId: string, language: 'es' | 'en') => {
    console.log('Mock prompt improvement:', { promptId, language });
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          version: { version: 2 },
          improvedContent: 'Versión mejorada del prompt (simulada)'
        });
      }, 2000);
    });
  };

  const translatePrompt = async (promptId: string, targetLanguage: 'es' | 'en') => {
    console.log('Mock prompt translation:', { promptId, targetLanguage });
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          translatedContent: `Contenido traducido a ${targetLanguage} (simulado)`
        });
      }, 1500);
    });
  };

  const incrementStat = async (promptId: string, statType: string) => {
    console.log('Mock stat increment:', { promptId, statType });
    // No hacer nada, solo log
  };

  return {
    prompts,
    loading,
    error,
    executePrompt,
    improvePrompt,
    translatePrompt,
    incrementStat,
    refetch: () => {
      console.log('Mock refetch prompts');
      setPrompts(mockPrompts);
    },
  };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Using mock categories data (Supabase disabled)');
    setCategories(mockCategories);
    setLoading(false);
  }, []);

  return { categories, loading };
}

export function useProviders() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Using mock providers data (Supabase disabled)');
    setProviders(mockProviders);
    setLoading(false);
  }, []);

  return { providers, loading };
}