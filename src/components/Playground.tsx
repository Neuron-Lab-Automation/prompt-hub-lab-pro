import React, { useState } from 'react';
import { Play, Settings, Zap, Clock, DollarSign, X } from 'lucide-react';
import { useProviders } from '../hooks/useSupabase';
import { formatCurrency, calculateTokenCost, estimateTokens } from '../lib/utils';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

interface PlaygroundProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

export function Playground({ isOpen, onClose, initialPrompt = '' }: PlaygroundProps) {
  const { providers, loading: providersLoading } = useProviders();
  const [prompt, setPrompt] = useState(initialPrompt);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState('');
  const [lastExecution, setLastExecution] = useState<{
    inputTokens: number;
    outputTokens: number;
    cost: number;
    latency: number;
  } | null>(null);

  if (!isOpen) return null;

  // Set default provider and model when providers load
  React.useEffect(() => {
    if (providers.length > 0 && !selectedProvider) {
      const defaultProvider = providers[0];
      setSelectedProvider(defaultProvider.id);
      if (defaultProvider.models.length > 0) {
        setSelectedModel(defaultProvider.models[0].id);
      }
    }
  }, [providers, selectedProvider]);

  const provider = providers.find(p => p.id === selectedProvider);
  const model = provider?.models.find(m => m.id === selectedModel);
  
  const modelOptions = provider?.models.map(m => ({
    value: m.id,
    label: m.name,
  })) || [];

  const providerOptions = providers
    .map(p => ({ value: p.id, label: p.name }));

  const estimatedInputTokens = estimateTokens(prompt);
  const estimatedCost = model ? calculateTokenCost(estimatedInputTokens, maxTokens, model) : 0;

  const handleRun = async () => {
    if (!prompt.trim() || !model) return;

    setIsRunning(true);
    setResult('');

    try {
      // Simulate API call
      const startTime = Date.now();
      
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const inputTokens = estimatedInputTokens;
      const outputTokens = Math.floor(Math.random() * 500) + 100;
      const latency = Date.now() - startTime;
      const cost = calculateTokenCost(inputTokens, outputTokens, model);

      setResult(`Esta es una respuesta simulada para el prompt:\n\n"${prompt}"\n\nEsta respuesta simula lo que devolvería el modelo ${model.name}. En la implementación real, aquí aparecería la respuesta completa del modelo de IA seleccionado.`);
      
      setLastExecution({
        inputTokens,
        outputTokens,
        cost,
        latency,
      });
    } catch (error) {
      setResult('Error: No se pudo ejecutar el prompt. Por favor, inténtalo de nuevo.');
    } finally {
      setIsRunning(false);
    }
  };

  const showTemperatureControls = model?.supports_temperature && selectedModel !== 'gpt-5-mini-2025-08-07';

  return (
    <div className="fixed inset-0 z-50 bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg">
            <Play className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-lg font-semibold text-gray-100">Playground</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Panel - Prompt Editor */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Model Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings className="h-4 w-4" />
                Configuración del Modelo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proveedor
                  </label>
                  <Select
                    options={providerOptions}
                    value={selectedProvider}
                    onChange={(e) => {
                      setSelectedProvider(e.target.value);
                      const newProvider = providers.find(p => p.id === e.target.value);
                      if (newProvider?.models[0]) {
                        setSelectedModel(newProvider.models[0].id);
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modelo
                  </label>
                  <Select
                    options={modelOptions}
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                  />
                </div>
              </div>

              {showTemperatureControls && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Temperatura: {temperature}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Tokens
                    </label>
                    <Input
                      type="number"
                      value={maxTokens}
                      onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                      min="1"
                      max={model?.max_tokens || 4000}
                    />
                  </div>
                </div>
              )}

              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Tokens estimados (input):</span>
                    <span className="ml-2 font-medium">{estimatedInputTokens}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Costo estimado:</span>
                    <span className="ml-2 font-medium">{formatCurrency(estimatedCost)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prompt Editor */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Prompt</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Escribe tu prompt aquí..."
                className="w-full h-64 p-3 border border-gray-600 bg-gray-800 text-gray-100 rounded-lg resize-none focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono text-sm"
              />
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-400">
                  {prompt.length} caracteres · {estimatedInputTokens} tokens
                </div>
                <Button
                  onClick={handleRun}
                  disabled={!prompt.trim() || isRunning}
                  className="flex items-center gap-2"
                >
                  {isRunning ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Ejecutando...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Ejecutar
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Results */}
        <div className="w-96 border-l border-gray-700 p-6 space-y-6 overflow-y-auto bg-gray-800">
          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resultado</CardTitle>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="prose prose-sm max-w-none">
                  <div className="bg-gray-900 p-3 rounded-lg whitespace-pre-wrap font-mono text-sm text-gray-100">
                    {result}
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-center py-8">
                  Ejecuta un prompt para ver los resultados
                </div>
              )}
            </CardContent>
          </Card>

          {/* Execution Stats */}
          {lastExecution && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Zap className="h-4 w-4" />
                  Estadísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Tokens Input
                  </span>
                  <span className="font-medium">{lastExecution.inputTokens}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Tokens Output
                  </span>
                  <span className="font-medium">{lastExecution.outputTokens}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Latencia
                  </span>
                  <span className="font-medium">{lastExecution.latency}ms</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Costo
                  </span>
                  <span className="font-medium">{formatCurrency(lastExecution.cost)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Model Info */}
          {model && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Info del Modelo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <span className="text-gray-400">Proveedor:</span>
                  <span className="ml-2 font-medium capitalize">{model.provider}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-400">Input:</span>
                  <span className="ml-2 font-medium">${model.input_cost}/M tokens</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-400">Output:</span>
                  <span className="ml-2 font-medium">${model.output_cost}/M tokens</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-400">Max tokens:</span>
                  <span className="ml-2 font-medium">{model.max_tokens.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}