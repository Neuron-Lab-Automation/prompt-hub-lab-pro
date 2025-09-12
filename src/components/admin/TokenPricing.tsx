import React, { useState } from 'react';
import { DollarSign, Plus, Edit, Trash2, TrendingUp, Calculator, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '../../lib/utils';
import { useToast } from '../../hooks/useToast';

interface TokenPrice {
  id: string;
  model: string;
  provider: string;
  input_cost_base: number;
  output_cost_base: number;
  input_margin_percent: number;
  output_margin_percent: number;
  currency: string;
  fx_rate: number;
  updated_at: string;
}

interface TokenPricingProps {
  onUpdatePricing: (pricing: TokenPrice[]) => void;
}

const mockTokenPrices: TokenPrice[] = [
  {
    id: '1',
    model: 'gpt-4o',
    provider: 'openai',
    input_cost_base: 5.0,
    output_cost_base: 15.0,
    input_margin_percent: 50,
    output_margin_percent: 50,
    currency: 'USD',
    fx_rate: 0.85,
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    model: 'gpt-5-mini-2025-08-07',
    provider: 'openai',
    input_cost_base: 0.15,
    output_cost_base: 0.60,
    input_margin_percent: 60,
    output_margin_percent: 60,
    currency: 'USD',
    fx_rate: 0.85,
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    model: 'claude-3-5-sonnet',
    provider: 'anthropic',
    input_cost_base: 3.0,
    output_cost_base: 15.0,
    input_margin_percent: 45,
    output_margin_percent: 45,
    currency: 'USD',
    fx_rate: 0.85,
    updated_at: new Date().toISOString(),
  },
];

export function TokenPricing({ onUpdatePricing }: TokenPricingProps) {
  const { toast } = useToast();
  const [prices, setPrices] = useState<TokenPrice[]>(mockTokenPrices);
  const [isCreating, setIsCreating] = useState(false);
  const [editingPrice, setEditingPrice] = useState<TokenPrice | null>(null);
  const [formData, setFormData] = useState({
    model: '',
    provider: 'openai',
    input_cost_base: 0,
    output_cost_base: 0,
    input_margin_percent: 50,
    output_margin_percent: 50,
    currency: 'USD',
    fx_rate: 0.85,
  });

  const providerOptions = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic' },
    { value: 'replicate', label: 'Replicate' },
    { value: 'google', label: 'Google' },
  ];

  const currencyOptions = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
  ];

  const calculateFinalPrice = (basePrice: number, margin: number, fxRate: number) => {
    return basePrice * (1 + margin / 100) * fxRate;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newPrice: TokenPrice = {
      id: editingPrice ? editingPrice.id : `price_${Date.now()}`,
      ...formData,
      updated_at: new Date().toISOString(),
    };
    
    if (editingPrice) {
      setPrices(prev => prev.map(p => p.id === editingPrice.id ? newPrice : p));
      toast.success('Precio actualizado', `Precios de ${formData.model} actualizados`);
      setEditingPrice(null);
    } else {
      setPrices(prev => [...prev, newPrice]);
      toast.success('Precio añadido', `Precios de ${formData.model} configurados`);
      setIsCreating(false);
    }
    
    setFormData({
      model: '',
      provider: 'openai',
      input_cost_base: 0,
      output_cost_base: 0,
      input_margin_percent: 50,
      output_margin_percent: 50,
      currency: 'USD',
      fx_rate: 0.85,
    });
  };

  const handleEdit = (price: TokenPrice) => {
    setEditingPrice(price);
    setFormData({
      model: price.model,
      provider: price.provider,
      input_cost_base: price.input_cost_base,
      output_cost_base: price.output_cost_base,
      input_margin_percent: price.input_margin_percent,
      output_margin_percent: price.output_margin_percent,
      currency: price.currency,
      fx_rate: price.fx_rate,
    });
    setIsCreating(true);
  };

  const handleDelete = (priceId: string) => {
    setPrices(prev => prev.filter(p => p.id !== priceId));
    toast.success('Precio eliminado', 'Configuración de precios eliminada');
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingPrice(null);
    setFormData({
      model: '',
      provider: 'openai',
      input_cost_base: 0,
      output_cost_base: 0,
      input_margin_percent: 50,
      output_margin_percent: 50,
      currency: 'USD',
      fx_rate: 0.85,
    });
  };

  const handleBulkUpdate = () => {
    toast.info('Actualizando precios...', 'Sincronizando con APIs de proveedores');
    setTimeout(() => {
      toast.success('Precios actualizados', 'Todos los precios han sido sincronizados');
    }, 2000);
  };

  const getProviderColor = (provider: string) => {
    const colors = {
      openai: 'bg-green-600',
      anthropic: 'bg-orange-600',
      replicate: 'bg-purple-600',
      google: 'bg-blue-600',
    };
    return colors[provider as keyof typeof colors] || 'bg-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 p-3 rounded-lg">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Gestión de Precios de Tokens</h1>
            <p className="text-gray-400">Configurar márgenes y precios por modelo</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleBulkUpdate}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar Precios
          </Button>
          <Button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nuevo Modelo
          </Button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingPrice ? 'Editar Precios' : 'Configurar Nuevo Modelo'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre del Modelo
                  </label>
                  <Input
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="gpt-4o"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Proveedor
                  </label>
                  <Select
                    options={providerOptions}
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Costo Base Input ($/M tokens)
                  </label>
                  <Input
                    type="number"
                    step="0.001"
                    value={formData.input_cost_base}
                    onChange={(e) => setFormData({ ...formData, input_cost_base: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Costo Base Output ($/M tokens)
                  </label>
                  <Input
                    type="number"
                    step="0.001"
                    value={formData.output_cost_base}
                    onChange={(e) => setFormData({ ...formData, output_cost_base: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Margen Input (%)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="200"
                    value={formData.input_margin_percent}
                    onChange={(e) => setFormData({ ...formData, input_margin_percent: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Margen Output (%)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="200"
                    value={formData.output_margin_percent}
                    onChange={(e) => setFormData({ ...formData, output_margin_percent: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Moneda
                  </label>
                  <Select
                    options={currencyOptions}
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo de Cambio
                  </label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={formData.fx_rate}
                    onChange={(e) => setFormData({ ...formData, fx_rate: parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>
              
              {/* Price Preview */}
              <div className="bg-gray-900 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-300 mb-3">Vista Previa de Precios</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Precio Final Input:</span>
                    <span className="ml-2 font-medium text-green-400">
                      {formatCurrency(calculateFinalPrice(formData.input_cost_base, formData.input_margin_percent, formData.fx_rate))}/M
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Precio Final Output:</span>
                    <span className="ml-2 font-medium text-green-400">
                      {formatCurrency(calculateFinalPrice(formData.output_cost_base, formData.output_margin_percent, formData.fx_rate))}/M
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button type="submit">
                  {editingPrice ? 'Actualizar Precios' : 'Configurar Modelo'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Pricing Table */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Precios por Modelo</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900 border-b border-gray-700">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Modelo</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Proveedor</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Costo Base</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Margen</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Precio Final</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Moneda</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {prices.map((price) => (
                  <tr key={price.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                    <td className="p-4">
                      <div className="font-medium text-gray-100">{price.model}</div>
                    </td>
                    <td className="p-4">
                      <Badge className={`${getProviderColor(price.provider)} text-white border-0 capitalize`}>
                        {price.provider}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div>In: ${price.input_cost_base}/M</div>
                        <div>Out: ${price.output_cost_base}/M</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div>In: {price.input_margin_percent}%</div>
                        <div>Out: {price.output_margin_percent}%</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium">
                        <div className="text-green-400">
                          In: {formatCurrency(calculateFinalPrice(price.input_cost_base, price.input_margin_percent, price.fx_rate))}/M
                        </div>
                        <div className="text-blue-400">
                          Out: {formatCurrency(calculateFinalPrice(price.output_cost_base, price.output_margin_percent, price.fx_rate))}/M
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div>{price.currency}</div>
                        <div className="text-gray-400">FX: {price.fx_rate}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(price)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(price.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {prices.length === 0 && (
            <div className="text-center py-12">
              <Calculator className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                No hay precios configurados
              </h3>
              <p className="text-gray-400 mb-4">
                Añade tu primer modelo para configurar precios
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Configurar Primer Modelo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing Summary */}
      {prices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Resumen de Márgenes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-900 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Margen Promedio Input</div>
                <div className="text-lg font-semibold text-green-400">
                  {(prices.reduce((sum, p) => sum + p.input_margin_percent, 0) / prices.length).toFixed(1)}%
                </div>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Margen Promedio Output</div>
                <div className="text-lg font-semibold text-blue-400">
                  {(prices.reduce((sum, p) => sum + p.output_margin_percent, 0) / prices.length).toFixed(1)}%
                </div>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Modelos Configurados</div>
                <div className="text-lg font-semibold text-purple-400">
                  {prices.length}
                </div>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Proveedores</div>
                <div className="text-lg font-semibold text-yellow-400">
                  {new Set(prices.map(p => p.provider)).size}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}