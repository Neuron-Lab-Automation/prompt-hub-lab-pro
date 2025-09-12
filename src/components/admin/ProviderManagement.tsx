import React, { useState } from 'react';
import { Bot, Plus, Edit, Trash2, Settings, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '../../lib/utils';
import { Provider, Model } from '../../types';

interface ProviderManagementProps {
  providers: Provider[];
  onCreateProvider: (provider: Omit<Provider, 'id' | 'created_at' | 'updated_at'>) => void;
  onUpdateProvider: (providerId: string, updates: Partial<Provider>) => void;
  onDeleteProvider: (providerId: string) => void;
  onCreateModel: (providerId: string, model: Omit<Model, 'id' | 'created_at' | 'updated_at'>) => void;
  onUpdateModel: (modelId: string, updates: Partial<Model>) => void;
  onDeleteModel: (modelId: string) => void;
}

export function ProviderManagement({
  providers,
  onCreateProvider,
  onUpdateProvider,
  onDeleteProvider,
  onCreateModel,
  onUpdateModel,
  onDeleteModel,
}: ProviderManagementProps) {
  const [isCreatingProvider, setIsCreatingProvider] = useState(false);
  const [isCreatingModel, setIsCreatingModel] = useState<string | null>(null);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  
  const [providerForm, setProviderForm] = useState({
    name: '',
    enabled: true,
    base_url: '',
  });

  const [modelForm, setModelForm] = useState({
    name: '',
    provider_id: '',
    input_cost: 0,
    output_cost: 0,
    max_tokens: 4000,
    supports_temperature: true,
    supports_top_p: true,
    enabled: true,
  });

  const handleProviderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingProvider) {
      onUpdateProvider(editingProvider.id, providerForm);
      setEditingProvider(null);
    } else {
      onCreateProvider(providerForm);
      setIsCreatingProvider(false);
    }
    
    setProviderForm({
      name: '',
      enabled: true,
      base_url: '',
    });
  };

  const handleModelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingModel) {
      onUpdateModel(editingModel.id, modelForm);
      setEditingModel(null);
    } else {
      onCreateModel(modelForm.provider_id, modelForm);
      setIsCreatingModel(null);
    }
    
    setModelForm({
      name: '',
      provider_id: '',
      input_cost: 0,
      output_cost: 0,
      max_tokens: 4000,
      supports_temperature: true,
      supports_top_p: true,
      enabled: true,
    });
  };

  const handleEditProvider = (provider: Provider) => {
    setEditingProvider(provider);
    setProviderForm({
      name: provider.name,
      enabled: provider.enabled,
      base_url: provider.base_url,
    });
    setIsCreatingProvider(true);
  };

  const handleEditModel = (model: Model) => {
    setEditingModel(model);
    setModelForm({
      name: model.name,
      provider_id: model.provider_id,
      input_cost: model.input_cost,
      output_cost: model.output_cost,
      max_tokens: model.max_tokens,
      supports_temperature: model.supports_temperature,
      supports_top_p: model.supports_top_p,
      enabled: model.enabled,
    });
    setIsCreatingModel(model.provider_id);
  };

  const handleCancelProvider = () => {
    setIsCreatingProvider(false);
    setEditingProvider(null);
    setProviderForm({
      name: '',
      enabled: true,
      base_url: '',
    });
  };

  const handleCancelModel = () => {
    setIsCreatingModel(null);
    setEditingModel(null);
    setModelForm({
      name: '',
      provider_id: '',
      input_cost: 0,
      output_cost: 0,
      max_tokens: 4000,
      supports_temperature: true,
      supports_top_p: true,
      enabled: true,
    });
  };

  const getProviderStatus = (provider: Provider) => {
    if (!provider.enabled) {
      return { icon: XCircle, color: 'text-red-400', label: 'Deshabilitado' };
    }
    
    // Mock health check - in real app this would be actual API status
    const isHealthy = Math.random() > 0.2; // 80% chance of being healthy
    
    if (isHealthy) {
      return { icon: CheckCircle, color: 'text-green-400', label: 'Operacional' };
    } else {
      return { icon: AlertCircle, color: 'text-yellow-400', label: 'Problemas' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-lg">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Gestión de Proveedores IA</h1>
            <p className="text-gray-400">Configurar APIs y modelos de inteligencia artificial</p>
          </div>
        </div>
        <Button
          onClick={() => setIsCreatingProvider(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo Proveedor
        </Button>
      </div>

      {/* Create/Edit Provider Form */}
      {isCreatingProvider && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingProvider ? 'Editar Proveedor' : 'Crear Nuevo Proveedor'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProviderSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre del Proveedor
                  </label>
                  <Input
                    value={providerForm.name}
                    onChange={(e) => setProviderForm({ ...providerForm, name: e.target.value })}
                    placeholder="Ej: OpenAI"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    URL Base de la API
                  </label>
                  <Input
                    value={providerForm.base_url}
                    onChange={(e) => setProviderForm({ ...providerForm, base_url: e.target.value })}
                    placeholder="https://api.openai.com/v1"
                    required
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={providerForm.enabled}
                  onChange={(e) => setProviderForm({ ...providerForm, enabled: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="enabled" className="text-sm text-gray-300">
                  Proveedor habilitado
                </label>
              </div>
              
              <div className="flex gap-3">
                <Button type="submit">
                  {editingProvider ? 'Actualizar Proveedor' : 'Crear Proveedor'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancelProvider}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Providers List */}
      <div className="space-y-6">
        {providers.map((provider) => {
          const status = getProviderStatus(provider);
          const StatusIcon = status.icon;
          
          return (
            <Card key={provider.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-xl">{provider.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`h-4 w-4 ${status.color}`} />
                      <span className={`text-sm ${status.color}`}>{status.label}</span>
                    </div>
                    {!provider.enabled && (
                      <Badge variant="outline" className="text-red-400 border-red-400">
                        Deshabilitado
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsCreatingModel(provider.id)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Añadir Modelo
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditProvider(provider)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeleteProvider(provider.id)}
                      className="text-red-400 hover:text-red-300"
                      disabled={provider.models.length > 0}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  {provider.base_url} • {provider.models.length} modelos
                </div>
              </CardHeader>

              {/* Create/Edit Model Form */}
              {isCreatingModel === provider.id && (
                <CardContent className="border-t border-gray-700">
                  <form onSubmit={handleModelSubmit} className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-100 mb-4">
                      {editingModel ? 'Editar Modelo' : 'Añadir Nuevo Modelo'}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Nombre del Modelo
                        </label>
                        <Input
                          value={modelForm.name}
                          onChange={(e) => setModelForm({ ...modelForm, name: e.target.value, provider_id: provider.id })}
                          placeholder="gpt-4o"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Costo Input ($/M tokens)
                        </label>
                        <Input
                          type="number"
                          step="0.001"
                          value={modelForm.input_cost}
                          onChange={(e) => setModelForm({ ...modelForm, input_cost: parseFloat(e.target.value) })}
                          placeholder="5.00"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Costo Output ($/M tokens)
                        </label>
                        <Input
                          type="number"
                          step="0.001"
                          value={modelForm.output_cost}
                          onChange={(e) => setModelForm({ ...modelForm, output_cost: parseFloat(e.target.value) })}
                          placeholder="15.00"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Tokens Máximos
                        </label>
                        <Input
                          type="number"
                          value={modelForm.max_tokens}
                          onChange={(e) => setModelForm({ ...modelForm, max_tokens: parseInt(e.target.value) })}
                          placeholder="128000"
                          required
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="supports_temperature"
                            checked={modelForm.supports_temperature}
                            onChange={(e) => setModelForm({ ...modelForm, supports_temperature: e.target.checked })}
                            className="rounded"
                          />
                          <label htmlFor="supports_temperature" className="text-sm text-gray-300">
                            Temperatura
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="supports_top_p"
                            checked={modelForm.supports_top_p}
                            onChange={(e) => setModelForm({ ...modelForm, supports_top_p: e.target.checked })}
                            className="rounded"
                          />
                          <label htmlFor="supports_top_p" className="text-sm text-gray-300">
                            Top-p
                          </label>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="model_enabled"
                          checked={modelForm.enabled}
                          onChange={(e) => setModelForm({ ...modelForm, enabled: e.target.checked })}
                          className="rounded"
                        />
                        <label htmlFor="model_enabled" className="text-sm text-gray-300">
                          Modelo habilitado
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button type="submit">
                        {editingModel ? 'Actualizar Modelo' : 'Añadir Modelo'}
                      </Button>
                      <Button type="button" variant="outline" onClick={handleCancelModel}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              )}

              {/* Models List */}
              {provider.models.length > 0 && (
                <CardContent>
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-gray-100">Modelos Disponibles</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {provider.models.map((model) => (
                        <div key={model.id} className="bg-gray-900 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-100">{model.name}</h4>
                              {!model.enabled && (
                                <Badge variant="outline" className="text-red-400 border-red-400 text-xs">
                                  Deshabilitado
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditModel(model)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onDeleteModel(model.id)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Input:</span>
                              <span className="ml-2 font-medium">{formatCurrency(model.input_cost)}/M</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Output:</span>
                              <span className="ml-2 font-medium">{formatCurrency(model.output_cost)}/M</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Max tokens:</span>
                              <span className="ml-2 font-medium">{model.max_tokens.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Controles:</span>
                              <div className="ml-2 flex gap-2">
                                {model.supports_temperature && (
                                  <Badge variant="outline" className="text-xs">T</Badge>
                                )}
                                {model.supports_top_p && (
                                  <Badge variant="outline" className="text-xs">P</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {providers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Bot className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              No hay proveedores configurados
            </h3>
            <p className="text-gray-400 mb-4">
              Añade tu primer proveedor de IA para comenzar a usar el sistema
            </p>
            <Button onClick={() => setIsCreatingProvider(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Proveedor
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}