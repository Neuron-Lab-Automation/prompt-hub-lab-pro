import React, { useState } from 'react';
import { Copy, Eye, Heart, Languages, Sparkles, ExternalLink, MoreVertical, Clock } from 'lucide-react';
import { Prompt } from '../types';
import { categories } from '../data/mockData';
import { formatNumber, formatDate } from '../lib/utils';
import { useToast } from '../hooks/useToast';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

interface PromptCardProps {
  prompt: Prompt;
  onView: (prompt: Prompt) => void;
  onCopy: (prompt: Prompt) => void;
  onImprove: (prompt: Prompt) => void;
  onTranslate: (prompt: Prompt, language: 'es' | 'en') => void;
  onToggleFavorite: (prompt: Prompt) => void;
  onViewHistory: (prompt: Prompt) => void;
}

export function PromptCard({
  prompt,
  onView,
  onCopy,
  onImprove,
  onTranslate,
  onToggleFavorite,
  onViewHistory,
}: PromptCardProps) {
  const [showActions, setShowActions] = useState(false);
  const category = categories.find(c => c.id === prompt.category);
  const { toast } = useToast();

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(prompt.content_es);
    toast.success('Copiado', 'Prompt copiado al portapapeles');
    onCopy(prompt);
  };

  const handleOpenWith = (provider: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const urls = {
      chatgpt: 'https://chat.openai.com/',
      claude: 'https://claude.ai/',
      gemini: 'https://gemini.google.com/',
      deepseek: 'https://chat.deepseek.com/',
    };
    
    // Copy to clipboard and open
    navigator.clipboard.writeText(prompt.content_es);
    toast.info('Abriendo en ' + provider, 'Prompt copiado al portapapeles');
    window.open(urls[provider as keyof typeof urls], '_blank');
  };

  return (
    <Card 
      className="group cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
      onClick={() => onView(prompt)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-gray-100 truncate pr-2">
              {prompt.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              {category && (
                <Badge variant="secondary" className={`${category.color} text-white border-0`}>
                  {category.name}
                </Badge>
              )}
              {prompt.type === 'system' && (
                <Badge variant="outline" className="border-orange-500 text-orange-300 bg-orange-900/30">
                  Sistema
                </Badge>
              )}
              {prompt.is_favorite && (
                <Heart className="h-4 w-4 text-red-400 fill-current" />
              )}
            </div>
          </div>
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
            {showActions && (
              <div className="absolute right-0 top-10 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10 min-w-48">
                <div className="py-1">
                  <button
                    onClick={handleCopy}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 flex items-center gap-2 text-gray-300"
                  >
                    <Copy className="h-4 w-4" />
                    Copiar
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onImprove(prompt);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 flex items-center gap-2 text-gray-300"
                  >
                    <Sparkles className="h-4 w-4" />
                    Mejorar
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTranslate(prompt, 'en');
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 flex items-center gap-2 text-gray-300"
                  >
                    <Languages className="h-4 w-4" />
                    Traducir EN
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTranslate(prompt, 'es');
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 flex items-center gap-2 text-gray-300"
                  >
                    <Languages className="h-4 w-4" />
                    Traducir ES
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewHistory(prompt);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 flex items-center gap-2 text-gray-300"
                  >
                    <Clock className="h-4 w-4" />
                    Historial ({prompt.stats.improvements + 1})
                  </button>
                  <hr className="my-1" />
                  <div className="px-4 py-2 text-xs text-gray-400 font-medium">Abrir con:</div>
                  <button
                    onClick={(e) => handleOpenWith('chatgpt', e)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 flex items-center gap-2 text-gray-300"
                  >
                    <ExternalLink className="h-4 w-4" />
                    ChatGPT
                  </button>
                  <button
                    onClick={(e) => handleOpenWith('claude', e)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 flex items-center gap-2 text-gray-300"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Claude
                  </button>
                  <button
                    onClick={(e) => handleOpenWith('gemini', e)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 flex items-center gap-2 text-gray-300"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Gemini
                  </button>
                  <button
                    onClick={(e) => handleOpenWith('deepseek', e)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 flex items-center gap-2 text-gray-300"
                  >
                    <ExternalLink className="h-4 w-4" />
                    DeepSeek
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-sm text-gray-400 line-clamp-3 mb-4">
          {prompt.content_es.substring(0, 150)}...
        </p>

        <div className="flex flex-wrap gap-1 mb-4">
          {prompt.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {prompt.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{prompt.tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Caracteres ES/EN</span>
              <span className="font-medium">{formatNumber(prompt.stats.characters_es)}/{formatNumber(prompt.stats.characters_en)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Tokens ES/EN</span>
              <span className="font-medium">{formatNumber(prompt.stats.tokens_es)}/{formatNumber(prompt.stats.tokens_en)}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 flex items-center gap-1">
                <Eye className="h-3 w-3" />
                Visitas
              </span>
              <span className="font-medium">{formatNumber(prompt.stats.visits)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 flex items-center gap-1">
                <Copy className="h-3 w-3" />
                Copias
              </span>
              <span className="font-medium">{formatNumber(prompt.stats.copies)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-xs text-gray-400">
          <div className="flex items-center justify-between">
            <span>CTR</span>
            <span className="font-medium">{prompt.stats.ctr.toFixed(1)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Mejoras</span>
            <span className="font-medium">{prompt.stats.improvements}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Traducciones</span>
            <span className="font-medium">{prompt.stats.translations}</span>
          </div>
        </div>

        {prompt.stats.last_execution && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="text-xs text-gray-400">
              Última ejecución: {formatDate(prompt.stats.last_execution)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}