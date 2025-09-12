import React, { useState } from 'react';
import { Gift, Plus, Edit, Trash2, ToggleLeft, ToggleRight, Zap, Clock, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { formatDate, formatNumber } from '../../lib/utils';
import { TokenPromotion } from '../../types';
import { useToast } from '../../hooks/useToast';

interface TokenPromotionsProps {
  promotions: TokenPromotion[];
  onCreatePromotion: (promotion: Omit<TokenPromotion, 'id' | 'created_at' | 'updated_at'>) => void;
  onUpdatePromotion: (promotionId: string, updates: Partial<TokenPromotion>) => void;
  onDeletePromotion: (promotionId: string) => void;
  onTogglePromotion: (promotionId: string) => void;
}

export function TokenPromotions({
  promotions,
  onCreatePromotion,
  onUpdatePromotion,
  onDeletePromotion,
  onTogglePromotion,
}: TokenPromotionsProps) {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<TokenPromotion | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    bonus_percentage: 50,
    min_purchase: 1000000,
    active: true,
    show_popup: true,
    popup_trigger: 'usage_threshold' as 'always' | 'usage_threshold' | 'time_based',
    usage_threshold: 75,
    popup_frequency_hours: 24,
  });

  const triggerOptions = [
    { value: 'always', label: 'Siempre mostrar' },
    { value: 'usage_threshold', label: 'Por umbral de uso' },
    { value: 'time_based', label: 'Basado en tiempo' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPromotion) {
      onUpdatePromotion(editingPromotion.id, formData);
      toast.success('Promoción actualizada', `"${formData.name}" actualizada exitosamente`);
      setEditingPromotion(null);
    } else {
      onCreatePromotion(formData);
      toast.success('Promoción creada', `"${formData.name}" creada exitosamente`);
      setIsCreating(false);
    }
    
    resetForm();
  };

  const handleEdit = (promotion: TokenPromotion) => {
    setEditingPromotion(promotion);
    setFormData({
      name: promotion.name,
      description: promotion.description,
      bonus_percentage: promotion.bonus_percentage,
      min_purchase: promotion.min_purchase,
      active: promotion.active,
      show_popup: promotion.show_popup,
      popup_trigger: promotion.popup_trigger,
      usage_threshold: promotion.usage_threshold || 75,
      popup_frequency_hours: promotion.popup_frequency_hours || 24,
    });
    setIsCreating(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      bonus_percentage: 50,
      min_purchase: 1000000,
      active: true,
      show_popup: true,
      popup_trigger: 'usage_threshold',
      usage_threshold: 75,
      popup_frequency_hours: 24,
    });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingPromotion(null);
    resetForm();
  };

  const getPromotionStatus = (promotion: TokenPromotion) => {
    if (!promotion.active) {
      return { variant: 'outline' as const, label: 'Inactiva', color: 'text-gray-400' };
    }
    
    if (promotion.show_popup) {
      return { variant: 'success' as const, label: 'Activa + Popup', color: 'text-green-400' };
    }
    
    return { variant: 'default' as const, label: 'Activa', color: 'text-blue-400' };
  };

  const getTriggerDescription = (promotion: TokenPromotion) => {
    switch (promotion.popup_trigger) {
      case 'always':
        return `Cada ${promotion.popup_frequency_hours}h`;
      case 'usage_threshold':
        return `Al ${promotion.usage_threshold}% de uso`;
      case 'time_based':
        return `Cada ${promotion.popup_frequency_hours}h`;
      default:
        return 'No configurado';
    }
  };

  const calculateBonusTokens = (purchaseAmount: number, bonusPercentage: number) => {
    return Math.floor(purchaseAmount * (bonusPercentage / 100));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 p-3 rounded-lg">
            <Gift className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Promociones de Tokens</h1>
            <p className="text-gray-400">Configurar ofertas y popups promocionales</p>
          </div>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nueva Promoción
        </Button>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingPromotion ? 'Editar Promoción' : 'Crear Nueva Promoción'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre de la Promoción
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Oferta de Lanzamiento"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Porcentaje de Bonus (%)
                  </label>
                  <Input
                    type="number"
                    min="10"
                    max="200"
                    value={formData.bonus_percentage}
                    onChange={(e) => setFormData({ ...formData, bonus_percentage: parseInt(e.target.value) })}
                    placeholder="50"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descripción del Popup
                  </label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Compra tokens ahora y recibe 50% extra gratis"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Compra Mínima (tokens)
                  </label>
                  <Input
                    type="number"
                    min="100000"
                    step="100000"
                    value={formData.min_purchase}
                    onChange={(e) => setFormData({ ...formData, min_purchase: parseInt(e.target.value) })}
                    placeholder="1000000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Trigger del Popup
                  </label>
                  <Select
                    options={triggerOptions}
                    value={formData.popup_trigger}
                    onChange={(e) => setFormData({ ...formData, popup_trigger: e.target.value as any })}
                  />
                </div>
                
                {formData.popup_trigger === 'usage_threshold' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Umbral de Uso (%)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={formData.usage_threshold}
                      onChange={(e) => setFormData({ ...formData, usage_threshold: parseInt(e.target.value) })}
                      placeholder="75"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Frecuencia del Popup (horas)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="168"
                    value={formData.popup_frequency_hours}
                    onChange={(e) => setFormData({ ...formData, popup_frequency_hours: parseInt(e.target.value) })}
                    placeholder="24"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="active" className="text-sm text-gray-300">
                    Promoción activa
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="show_popup"
                    checked={formData.show_popup}
                    onChange={(e) => setFormData({ ...formData, show_popup: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="show_popup" className="text-sm text-gray-300">
                    Mostrar popup automático
                  </label>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-900 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-300 mb-3">Vista Previa del Popup</h3>
                <div className="bg-gradient-to-r from-green-600 to-blue-600 p-4 rounded-lg text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="h-5 w-5" />
                    <span className="font-semibold">{formData.name || 'Nombre de la Promoción'}</span>
                  </div>
                  <p className="text-sm mb-3">{formData.description || 'Descripción de la promoción'}</p>
                  <div className="text-xs opacity-90">
                    Ejemplo: Compra {formatNumber(formData.min_purchase)} tokens → 
                    Recibe {formatNumber(calculateBonusTokens(formData.min_purchase, formData.bonus_percentage))} tokens extra
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button type="submit">
                  {editingPromotion ? 'Actualizar Promoción' : 'Crear Promoción'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Promotions List */}
      <Card>
        <CardHeader>
          <CardTitle>Promociones Configuradas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900 border-b border-gray-700">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Promoción</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Bonus</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Compra Mín.</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Trigger</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Estado</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Popup</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {promotions.map((promotion) => {
                  const status = getPromotionStatus(promotion);
                  
                  return (
                    <tr key={promotion.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-gray-100">{promotion.name}</div>
                          <div className="text-sm text-gray-400 max-w-xs truncate">
                            {promotion.description}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Zap className="h-4 w-4 text-yellow-400" />
                          <span className="font-medium text-yellow-400">+{promotion.bonus_percentage}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-gray-100">
                          {formatNumber(promotion.min_purchase)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-100 capitalize">
                            {promotion.popup_trigger.replace('_', ' ')}
                          </div>
                          <div className="text-gray-400">
                            {getTriggerDescription(promotion)}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={status.variant}>
                          {status.label}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onUpdatePromotion(promotion.id, { show_popup: !promotion.show_popup })}
                          className="flex items-center gap-2"
                        >
                          {promotion.show_popup ? (
                            <>
                              <ToggleRight className="h-4 w-4 text-green-400" />
                              <span className="text-green-400">ON</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-400">OFF</span>
                            </>
                          )}
                        </Button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onTogglePromotion(promotion.id)}
                            className={promotion.active ? "text-yellow-400 hover:text-yellow-300" : "text-green-400 hover:text-green-300"}
                          >
                            {promotion.active ? (
                              <ToggleRight className="h-4 w-4" />
                            ) : (
                              <ToggleLeft className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(promotion)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDeletePromotion(promotion.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {promotions.length === 0 && (
            <div className="text-center py-12">
              <Gift className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                No hay promociones configuradas
              </h3>
              <p className="text-gray-400 mb-4">
                Crea tu primera promoción para aumentar las ventas de tokens
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Promoción
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Promotions Summary */}
      {promotions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Resumen de Promociones Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-900 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Total Promociones</div>
                <div className="text-lg font-semibold text-gray-100">{promotions.length}</div>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Activas</div>
                <div className="text-lg font-semibold text-green-400">
                  {promotions.filter(p => p.active).length}
                </div>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Con Popup</div>
                <div className="text-lg font-semibold text-blue-400">
                  {promotions.filter(p => p.show_popup && p.active).length}
                </div>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Bonus Promedio</div>
                <div className="text-lg font-semibold text-purple-400">
                  {promotions.length > 0 
                    ? `${Math.round(promotions.reduce((sum, p) => sum + p.bonus_percentage, 0) / promotions.length)}%`
                    : '0%'
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Promotion Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Ejemplos de Configuración
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900 p-4 rounded-lg">
              <h4 className="font-medium text-gray-100 mb-2">🎯 Agresiva</h4>
              <div className="text-sm text-gray-400 space-y-1">
                <div>• Trigger: Siempre (cada 6h)</div>
                <div>• Bonus: 100% extra</div>
                <div>• Mínimo: 5M tokens</div>
                <div>• Ideal para: Maximizar ingresos</div>
              </div>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <h4 className="font-medium text-gray-100 mb-2">⚖️ Balanceada</h4>
              <div className="text-sm text-gray-400 space-y-1">
                <div>• Trigger: 75% de uso</div>
                <div>• Bonus: 50% extra</div>
                <div>• Mínimo: 1M tokens</div>
                <div>• Ideal para: Retención</div>
              </div>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <h4 className="font-medium text-gray-100 mb-2">🎨 Sutil</h4>
              <div className="text-sm text-gray-400 space-y-1">
                <div>• Trigger: 90% de uso</div>
                <div>• Bonus: 25% extra</div>
                <div>• Mínimo: 500K tokens</div>
                <div>• Ideal para: UX no intrusiva</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}