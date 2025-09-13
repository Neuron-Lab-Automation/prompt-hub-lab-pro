import React, { useState, useEffect } from 'react';
import { X, Copy, Languages, Sparkles, ExternalLink, Eye, Heart } from 'lucide-react';
import { Prompt } from '../types';
import { categories } from '../data/mockData';
import { formatNumber, formatDate, estimateTokens } from '../lib/utils';
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
}

export function PromptModal({
  prompt,
  isOpen,
  onClose,
  onCopy,
  onImprove,
  onTranslate,
  onToggleFavorite,
}: PromptModalProps) {
  const [activeTab, setActiveTab] = useState<'es' | 'en'>('es');

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

  if (!isOpen || !prompt) return null;

  const category = categories.find(c => c.id === prompt.category);
  const currentContent = activeTab === 'es' ? prompt.content_es : prompt.content_en;
  const currentTokens = activeTab === 'es' ? prompt.stats.tokens_es : prompt.stats.tokens_en;
  const currentCharacters = activeTab === 'es' ? prompt.stats.characters_es : prompt.stats.characters_en;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentContent);
    onCopy(prompt);
  };

  const handleOpenWith = (provider: string) => {
    const urls = {
      chatgpt: 'https://chat.openai.com/',
      claude: 'https://claude.ai/',
      gemini: 'https://gemini.google.com/',
      deepseek: 'https://chat.deepseek.com/',
    };
    
    navigator.clipboard.writeText(currentContent);
    window.open(urls[provider as keyof typeof urls], '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl max-h-[90vh] w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900">{prompt.title}</h2>
            {category && (
              <Badge variant="secondary" className={`${category.color} text-white border-0`}>
                {category.name}
              </Badge>
            )}
            {prompt.type === 'system' && (
              <Badge variant="outline" className="border-orange-300 text-orange-700 bg-orange-50">
                Sistema
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleFavorite(prompt)}
              className={prompt.is_favorite ? 'text-red-500' : 'text-gray-400'}
            >
              <Heart className={`h-5 w-5 ${prompt.is_favorite ? 'fill-current' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'es'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('es')}
          >
            Español ({formatNumber(prompt.stats.tokens_es)} tokens)
          </button>
          <button
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'en'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('en')}
          >
            English ({formatNumber(prompt.stats.tokens_en)} tokens)
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap">
            {currentContent}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {prompt.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{formatNumber(currentCharacters)}</div>
              <div className="text-xs text-gray-500">Caracteres</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{formatNumber(currentTokens)}</div>
              <div className="text-xs text-gray-500">Tokens</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{formatNumber(prompt.stats.visits)}</div>
              <div className="text-xs text-gray-500">Visitas</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{formatNumber(prompt.stats.copies)}</div>
              <div className="text-xs text-gray-500">Copias</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
            <div className="text-center">
              <span className="font-medium">{prompt.stats.ctr.toFixed(1)}%</span>
              <span className="block text-xs text-gray-500">CTR</span>
            </div>
            <div className="text-center">
              <span className="font-medium">{prompt.stats.improvements}</span>
              <span className="block text-xs text-gray-500">Mejoras</span>
            </div>
            <div className="text-center">
              <span className="font-medium">{prompt.stats.translations}</span>
              <span className="block text-xs text-gray-500">Traducciones</span>
            </div>
          </div>

          {prompt.stats.last_execution && (
            <div className="text-xs text-gray-500 text-center mb-4">
              Última ejecución: {formatDate(prompt.stats.last_execution)}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleCopy} className="flex items-center gap-2">
              <Copy className="h-4 w-4" />
              Copiar
            </Button>
            <Button onClick={() => onImprove(prompt)} variant="outline" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Mejorar
            </Button>
            <Button 
              onClick={() => onTranslate(prompt, activeTab === 'es' ? 'en' : 'es')} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <Languages className="h-4 w-4" />
              Traducir {activeTab === 'es' ? 'EN' : 'ES'}
            </Button>
          </div>

          <div className="mt-4">
            <div className="text-xs text-gray-500 mb-2">Abrir con:</div>
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