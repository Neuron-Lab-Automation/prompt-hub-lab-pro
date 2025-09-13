import React, { useState } from 'react';
import { X, Clock, Sparkles, ArrowRight, Check, Eye, RotateCcw } from 'lucide-react';
import { Prompt, PromptVersion } from '../types';
import { formatDate, estimateTokens } from '../lib/utils';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

interface VersionHistoryModalProps {
  prompt: Prompt | null;
  isOpen: boolean;
  onClose: () => void;
  onRestoreVersion: (prompt: Prompt, version: PromptVersion) => void;
}

export function VersionHistoryModal({
  prompt,
  isOpen,
  onClose,
  onRestoreVersion,
}: VersionHistoryModalProps) {
  const [selectedVersion, setSelectedVersion] = useState<PromptVersion | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'es' | 'en'>('es');

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setSelectedVersion(null);
      setCompareMode(false);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !prompt) return null;

  // Mock versions data - in real app this would come from Supabase
  const mockVersions: PromptVersion[] = [
    {
      id: '1',
      prompt_id: prompt.id,
      version: 1,
      content_es: prompt.content_es,
      content_en: prompt.content_en,
      created_at: prompt.created_at,
      improvement_reason: 'Versión original',
    },
    {
      id: '2',
      prompt_id: prompt.id,
      version: 2,
      content_es: `${prompt.content_es}\n\nMEJORA: Añadido contexto adicional para mayor claridad y especificidad en las instrucciones. Se han incluido ejemplos y se ha mejorado la estructura para obtener resultados más consistentes.`,
      content_en: `${prompt.content_en}\n\nIMPROVEMENT: Added additional context for greater clarity and specificity in instructions. Examples have been included and structure improved for more consistent results.`,
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      improvement_reason: 'Mejora automática vía IA - Mayor claridad y especificidad',
    },
    {
      id: '3',
      prompt_id: prompt.id,
      version: 3,
      content_es: `Actúa como un experto en ${prompt.category} con más de 10 años de experiencia. ${prompt.content_es}\n\nAsegúrate de:\n1. Proporcionar respuestas detalladas y bien estructuradas\n2. Incluir ejemplos prácticos cuando sea relevante\n3. Mantener un tono profesional pero accesible\n4. Verificar la precisión de la información proporcionada`,
      content_en: `Act as an expert in ${prompt.category} with over 10 years of experience. ${prompt.content_en}\n\nMake sure to:\n1. Provide detailed and well-structured responses\n2. Include practical examples when relevant\n3. Maintain a professional but accessible tone\n4. Verify the accuracy of the information provided`,
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      improvement_reason: 'Mejora automática vía IA - Añadido contexto de expertise y checklist',
    },
  ];

  const versions = mockVersions.sort((a, b) => b.version - a.version);
  const currentVersion = versions[0];
  const originalVersion = versions[versions.length - 1];

  const handleRestoreVersion = (version: PromptVersion) => {
    onRestoreVersion(prompt, version);
    onClose();
  };

  const getVersionContent = (version: PromptVersion) => {
    return activeTab === 'es' ? version.content_es : version.content_en;
  };

  const getVersionTokens = (version: PromptVersion) => {
    return estimateTokens(getVersionContent(version));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-800 rounded-xl shadow-2xl max-w-6xl max-h-[90vh] w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-100">Historial de Versiones</h2>
              <p className="text-sm text-gray-400">{prompt.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setCompareMode(!compareMode)}
              variant={compareMode ? 'default' : 'outline'}
              size="sm"
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {compareMode ? 'Vista Simple' : 'Comparar'}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-73px)]">
          {/* Sidebar - Version List */}
          <div className="w-80 border-r border-gray-700 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-300 mb-4">
                {versions.length} versiones disponibles
              </h3>
              <div className="space-y-3">
                {versions.map((version) => (
                  <Card
                    key={version.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedVersion?.id === version.id
                        ? 'ring-2 ring-blue-500 bg-blue-900/20'
                        : 'hover:bg-gray-700'
                    }`}
                    onClick={() => setSelectedVersion(version)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={version.version === currentVersion.version ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            v{version.version}
                          </Badge>
                          {version.version === currentVersion.version && (
                            <Badge variant="success" className="text-xs">
                              Actual
                            </Badge>
                          )}
                          {version.version === originalVersion.version && (
                            <Badge variant="outline" className="text-xs">
                              Original
                            </Badge>
                          )}
                        </div>
                        {version.improvement_reason?.includes('IA') && (
                          <Sparkles className="h-4 w-4 text-purple-400" />
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-400 mb-2">
                        {formatDate(version.created_at)}
                      </p>
                      
                      <p className="text-sm text-gray-300 line-clamp-2 mb-2">
                        {version.improvement_reason}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{getVersionTokens(version)} tokens</span>
                        {version.version !== currentVersion.version && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRestoreVersion(version);
                            }}
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-xs"
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Restaurar
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Language Tabs */}
            <div className="flex border-b border-gray-700 bg-gray-800 sticky top-0 z-10">
              <button
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'es'
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-900'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('es')}
              >
                Español
              </button>
              <button
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'en'
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-900'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('en')}
              >
                English
              </button>
            </div>

            <div className="p-6">
              {compareMode && selectedVersion ? (
                /* Compare Mode */
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">v{originalVersion.version}</Badge>
                      <span className="text-sm text-gray-400">Original</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-500" />
                    <div className="flex items-center gap-2">
                      <Badge variant="default">v{selectedVersion.version}</Badge>
                      <span className="text-sm text-gray-400">Seleccionada</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Original Version */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Badge variant="outline">v{originalVersion.version}</Badge>
                          Original
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap text-gray-100 max-h-96 overflow-y-auto">
                          {getVersionContent(originalVersion)}
                        </div>
                        <div className="mt-3 text-xs text-gray-400">
                          {getVersionTokens(originalVersion)} tokens
                        </div>
                      </CardContent>
                    </Card>

                    {/* Selected Version */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Badge variant="default">v{selectedVersion.version}</Badge>
                          {selectedVersion.improvement_reason?.includes('IA') && (
                            <Sparkles className="h-4 w-4 text-purple-400" />
                          )}
                          Mejorada
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap text-gray-100 max-h-96 overflow-y-auto">
                          {getVersionContent(selectedVersion)}
                        </div>
                        <div className="mt-3 text-xs text-gray-400">
                          {getVersionTokens(selectedVersion)} tokens
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Improvement Reason */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Razón de la Mejora</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300">{selectedVersion.improvement_reason}</p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                /* Single Version View */
                <div className="space-y-6">
                  {selectedVersion ? (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={selectedVersion.version === currentVersion.version ? 'default' : 'secondary'}
                          >
                            Versión {selectedVersion.version}
                          </Badge>
                          {selectedVersion.improvement_reason?.includes('IA') && (
                            <div className="flex items-center gap-1 text-purple-400">
                              <Sparkles className="h-4 w-4" />
                              <span className="text-sm">Mejorada por IA</span>
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-400">
                          {formatDate(selectedVersion.created_at)}
                        </div>
                      </div>

                      <Card>
                        <CardContent className="p-6">
                          <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap text-gray-100">
                            {getVersionContent(selectedVersion)}
                          </div>
                          <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
                            <span>{getVersionTokens(selectedVersion)} tokens</span>
                            <span>{getVersionContent(selectedVersion).length} caracteres</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Detalles de la Versión</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-300 mb-4">{selectedVersion.improvement_reason}</p>
                          {selectedVersion.version !== currentVersion.version && (
                            <Button
                              onClick={() => handleRestoreVersion(selectedVersion)}
                              className="flex items-center gap-2"
                            >
                              <RotateCcw className="h-4 w-4" />
                              Restaurar esta versión
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <Clock className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-300 mb-2">
                        Selecciona una versión
                      </h3>
                      <p className="text-gray-400">
                        Elige una versión de la lista para ver su contenido y detalles
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}