import React, { useState } from 'react';
import { X, Sparkles, Check, RotateCcw, Loader2, ArrowRight } from 'lucide-react';
import { Prompt } from '../types';
import { formatDate, estimateTokens } from '../lib/utils';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

interface ImprovementPreviewModalProps {
  prompt: Prompt | null;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (prompt: Prompt, improvedContent: string, language: 'es' | 'en') => void;
  onRegenerate: (prompt: Prompt, language: 'es' | 'en') => void;
}

export function ImprovementPreviewModal({
  prompt,
  isOpen,
  onClose,
  onAccept,
  onRegenerate,
}: ImprovementPreviewModalProps) {
  const [activeTab, setActiveTab] = useState<'es' | 'en'>('es');
  const [isGenerating, setIsGenerating] = useState(false);
  const [improvedContent, setImprovedContent] = useState('');
  const [improvementReason, setImprovementReason] = useState('');

  React.useEffect(() => {
    if (isOpen && prompt) {
      document.body.style.overflow = 'hidden';
      generateImprovement();
    } else {
      document.body.style.overflow = 'unset';
      setImprovedContent('');
      setImprovementReason('');
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, prompt, activeTab]);

  if (!isOpen || !prompt) return null;

  const originalContent = activeTab === 'es' ? prompt.content_es : prompt.content_en;
  const originalTokens = estimateTokens(originalContent);
  const improvedTokens = estimateTokens(improvedContent);

  const generateImprovement = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate AI improvement generation
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const improvements = {
        es: `${originalContent}

MEJORAS APLICADAS:
• Añadido contexto de expertise profesional
• Incluidas instrucciones más específicas y detalladas
• Agregado formato de salida estructurado
• Mejorada la claridad y eliminación de ambigüedades
• Incluidos ejemplos y casos de uso específicos

INSTRUCCIONES ADICIONALES:
1. Proporciona respuestas bien estructuradas y organizadas
2. Incluye ejemplos prácticos cuando sea relevante
3. Mantén un tono profesional pero accesible
4. Verifica la precisión y relevancia de la información
5. Adapta el nivel de detalle según el contexto`,
        
        en: `${prompt.content_en}

APPLIED IMPROVEMENTS:
• Added professional expertise context
• Included more specific and detailed instructions
• Added structured output format
• Improved clarity and eliminated ambiguities
• Included specific examples and use cases

ADDITIONAL INSTRUCTIONS:
1. Provide well-structured and organized responses
2. Include practical examples when relevant
3. Maintain a professional but accessible tone
4. Verify accuracy and relevance of information
5. Adapt level of detail according to context`
      };

      const reasons = {
        es: 'Mejora automática vía IA: Se ha añadido contexto de expertise, instrucciones más específicas, formato estructurado y eliminación de ambigüedades para obtener resultados más consistentes y profesionales.',
        en: 'Automatic AI improvement: Added expertise context, more specific instructions, structured format and eliminated ambiguities to obtain more consistent and professional results.'
      };

      setImprovedContent(improvements[activeTab]);
      setImprovementReason(reasons[activeTab]);
    } catch (error) {
      console.error('Error generating improvement:', error);
      setImprovedContent('Error al generar la mejora. Por favor, inténtalo de nuevo.');
      setImprovementReason('Error en la generación');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAccept = () => {
    onAccept(prompt, improvedContent, activeTab);
    onClose();
  };

  const handleRegenerate = () => {
    onRegenerate(prompt, activeTab);
    generateImprovement();
  };

  const handleClose = () => {
    setImprovedContent('');
    setImprovementReason('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-gray-800 rounded-xl shadow-2xl max-w-6xl max-h-[90vh] w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-100">Vista Previa de Mejora</h2>
              <p className="text-sm text-gray-400">{prompt.title}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Language Tabs */}
        <div className="flex border-b border-gray-700 bg-gray-800">
          <button
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'es'
                ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-900'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('es')}
          >
            Español ({originalTokens} → {improvedTokens} tokens)
          </button>
          <button
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'en'
                ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-900'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('en')}
          >
            English ({estimateTokens(prompt.content_en)} → {improvedTokens} tokens)
          </button>
        </div>

        <div className="p-6 max-h-[calc(90vh-280px)] overflow-y-auto custom-scrollbar">
          {isGenerating ? (
            /* Loading State */
            <div className="flex flex-col items-center justify-center py-12">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-full mb-4">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
              <h3 className="text-lg font-medium text-gray-100 mb-2">
                Generando mejora con IA...
              </h3>
              <p className="text-gray-400 text-center max-w-md">
                Analizando tu prompt y aplicando mejores prácticas para optimizar claridad, 
                especificidad y efectividad.
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                <span>Esto puede tomar unos segundos...</span>
              </div>
            </div>
          ) : (
            /* Comparison View */
            <div className="space-y-6">
              {/* Improvement Summary */}
              <Card className="border-purple-500/20 bg-purple-900/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    Resumen de Mejoras
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {improvementReason}
                  </p>
                  <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-700">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-400">
                        +{improvedTokens - originalTokens}
                      </div>
                      <div className="text-xs text-gray-400">Tokens añadidos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-400">
                        {((improvedTokens / originalTokens - 1) * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-400">Incremento</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-purple-400">
                        v{(prompt.stats.improvements || 0) + 2}
                      </div>
                      <div className="text-xs text-gray-400">Nueva versión</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Side by Side Comparison */}
              <div className="grid grid-cols-2 gap-6">
                {/* Original */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Badge variant="outline">Original</Badge>
                      <span className="text-gray-400">v{(prompt.stats.improvements || 0) + 1}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap text-gray-100 max-h-96 overflow-y-auto custom-scrollbar">
                      {originalContent}
                    </div>
                    <div className="mt-3 text-xs text-gray-400">
                      {originalTokens} tokens • {originalContent.length} caracteres
                    </div>
                  </CardContent>
                </Card>

                {/* Improved */}
                <Card className="border-green-500/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Badge variant="default" className="bg-green-600">Mejorada</Badge>
                      <Sparkles className="h-4 w-4 text-green-400" />
                      <span className="text-gray-400">v{(prompt.stats.improvements || 0) + 2}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap text-gray-100 max-h-96 overflow-y-auto custom-scrollbar border border-green-500/20">
                      {improvedContent}
                    </div>
                    <div className="mt-3 text-xs text-gray-400">
                      {improvedTokens} tokens • {improvedContent.length} caracteres
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Comparison Arrow */}
              <div className="flex justify-center -my-3 relative z-10">
                <div className="bg-gray-800 p-2 rounded-full border border-gray-600">
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {!isGenerating && (
          <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-900 flex-shrink-0">
            <div className="text-sm text-gray-400">
              ¿Te gusta la mejora? Puedes aceptarla, regenerarla o cancelar.
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                onClick={handleRegenerate}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Regenerar
              </Button>
              <Button
                onClick={handleAccept}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4" />
                Aceptar Mejora
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}