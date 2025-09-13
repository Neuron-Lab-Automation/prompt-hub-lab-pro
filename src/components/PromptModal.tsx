import React, { useState, useEffect } from 'react';
import { X, Copy, Languages, Sparkles, ExternalLink, Eye, Heart, Clock } from 'lucide-react';
import { Prompt } from '../types';
import { categories } from '../data/mockData';
import { formatNumber, formatDate, estimateTokens } from '../lib/utils';
import { useToast } from '../hooks/useToast';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

interface PromptModalProps {
  prompt: Prompt | null;
  isOpen: boolean;
  onClose: () => void;
  onCopy: (prompt: Prompt) => void;
  onImprove: (prompt: Prompt) => void;
  onTranslate: (prompt: Prompt, language: 'es' | 'en') => void;
  onToggleFavorite: (prompt: Prompt) => void;
  onViewHistory: (prompt: Prompt) => void;
}

export function PromptModal({
  prompt,
  isOpen,
  onClose,
  onCopy,
  onImprove,
  onTranslate,
  onToggleFavorite,
  onViewHistory,
}: PromptModalProps) {
  const [activeTab, setActiveTab] = useState<'es' | 'en'>('es');
  const [localPrompt, setLocalPrompt] = useState<Prompt | null>(null);
  const { toast } = useToast();

  // Update local prompt when prop changes
  useEffect(() => {
    setLocalPrompt(prompt);
  }, [prompt]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !localPrompt) return null;

  const category = categories.find(c => c.id === localPrompt.category);
  const currentContent = activeTab === 'es' ? localPrompt.content_es : localPrompt.content_en;
  const currentTokens = activeTab === 'es' ? localPrompt.stats.tokens_es : localPrompt.stats.tokens_en;
  const currentCharacters = activeTab === 'es' ? localPrompt.stats.characters_es : localPrompt.stats.characters_en;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentContent);
    toast.success('Copiado', 'Prompt copiado al portapapeles');
    onCopy(localPrompt);
  };

  const handleToggleFavorite = async () => {
    await onToggleFavorite(localPrompt);
    setLocalPrompt(prev => prev ? { ...prev, is_favorite: !prev.is_favorite } : null);
  };

  const handleOpenWith = (provider: string) => {
    const urls = {
      chatgpt: 'https://chat.openai.com/',
      claude: 'https://claude.ai/',
      gemini: 'https://gemini.google.com/',
      deepseek: 'https://chat.deepseek.com/',
    };
    
    navigator.clipboard.writeText(currentContent);
    toast.info(`Abriendo en ${provider}`, 'Prompt copiado al portapapeles');
    window.open(urls[provider as keyof typeof urls], '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-800 rounded-xl shadow-2xl max-w-4xl max-h-[90vh] w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-100">{localPrompt.title}</h2>
            {category && (
              <Badge variant="secondary" className={`${category.color} text-white border-0`}>
                {category.name}
              </Badge>
            )}
            {localPrompt.type === 'system' && (
              <Badge variant="outline" className="border-orange-500 text-orange-300 bg-orange-900/30">
                Sistema
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFavorite}
              className={`transition-colors duration-200 ${
                localPrompt.is_favorite 
                  ? 'text-red-400 hover:text-red-300' 
                  : 'text-gray-400 hover:text-red-400'
              }`}
            >
              <Heart className={`h-5 w-5 ${localPrompt.is_favorite ? 'fill-current' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'es'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('es')}
          >
            Español ({formatNumber(localPrompt.stats.tokens_es)} tokens)
          </button>
          <button
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'en'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('en')}
          >
            English ({formatNumber(localPrompt.stats.tokens_en)} tokens)
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap text-gray-100">
            {currentContent}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {localPrompt.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="px-6 py-4 bg-gray-900 border-t border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-100">{formatNumber(currentCharacters)}</div>
              <div className="text-xs text-gray-400">Caracteres</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-100">{formatNumber(currentTokens)}</div>
              <div className="text-xs text-gray-400">Tokens</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-100">{formatNumber(localPrompt.stats.visits)}</div>
              <div className="text-xs text-gray-400">Visitas</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-100">{formatNumber(localPrompt.stats.copies)}</div>
              <div className="text-xs text-gray-400">Copias</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm text-gray-300 mb-4">
            <div className="text-center">
              <span className="font-medium">{localPrompt.stats.ctr.toFixed(1)}%</span>
              <span className="block text-xs text-gray-400">CTR</span>
            </div>
            <div className="text-center">
              <span className="font-medium">{localPrompt.stats.improvements}</span>
              <span className="block text-xs text-gray-400">Mejoras</span>
            </div>
            <div className="text-center">
              <span className="font-medium">{localPrompt.stats.translations}</span>
              <span className="block text-xs text-gray-400">Traducciones</span>
            </div>
          </div>

          {localPrompt.stats.last_execution && (
            <div className="text-xs text-gray-400 text-center mb-4">
              Última ejecución: {formatDate(localPrompt.stats.last_execution)}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-700">
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleCopy} className="flex items-center gap-2">
              <Copy className="h-4 w-4" />
              Copiar
            </Button>
            <Button onClick={() => onImprove(localPrompt)} variant="outline" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Mejorar
            </Button>
            <Button 
              onClick={() => onTranslate(localPrompt, activeTab === 'es' ? 'en' : 'es')} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <Languages className="h-4 w-4" />
              Traducir {activeTab === 'es' ? 'EN' : 'ES'}
            </Button>
            <Button 
              onClick={() => onViewHistory(localPrompt)} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              Historial ({localPrompt.stats.improvements + 1})
            </Button>
          </div>

          <div className="mt-4">
            <div className="text-xs text-gray-400 mb-2">Abrir con:</div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => handleOpenWith('chatgpt')}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-3 w-3" />
                ChatGPT
              </Button>
              <Button
                onClick={() => handleOpenWith('claude')}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-3 w-3" />
                Claude
              </Button>
              <Button
                onClick={() => handleOpenWith('gemini')}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-3 w-3" />
                Gemini
              </Button>
              <Button
                onClick={() => handleOpenWith('deepseek')}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-3 w-3" />
                DeepSeek
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}