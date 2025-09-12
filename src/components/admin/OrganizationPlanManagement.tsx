import React, { useState } from 'react';
import { Building, Plus, Edit, Trash2, Users, Zap, DollarSign, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { formatCurrency, formatNumber } from '../../lib/utils';
import { OrganizationPlan } from '../../types';
import { useToast } from '../../hooks/useToast';

interface OrganizationPlanManagementProps {
  plans: OrganizationPlan[];
  onCreatePlan: (plan: Omit<OrganizationPlan, 'id' | 'created_at' | 'updated_at'>) => void;
  onUpdatePlan: (planId: string, updates: Partial<OrganizationPlan>) => void;
  onDeletePlan: (planId: string) => void;
}

export function OrganizationPlanManagement({
  plans,
  onCreatePlan,
  onUpdatePlan,
  onDeletePlan,
}: OrganizationPlanManagementProps) {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [editingPlan, setEditingPlan] = useState<OrganizationPlan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price_per_user: 29,
    tokens_per_user: 2000000,
    features: [] as string[],
    min_team_size: 2,
    active: true,
  });
  const [featureInput, setFeatureInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPlan) {
      onUpdatePlan(editingPlan.id, formData);
      toast.success('Plan actualizado', `"${formData.name}" actualizado exitosamente`);
      setEditingPlan(null);
    } else {
      onCreatePlan(formData);
      toast.success('Plan creado', `"${formData.name}" creado exitosamente`);
      setIsCreating(false);
    }
    
    resetForm();
  };

  const handleEdit = (plan: OrganizationPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price_per_user: plan.price_per_user,
      tokens_per_user: plan.tokens_per_user,
      features: [...plan.features],
      min_team_size: plan.min_team_size,
      active: plan.active,
    });
    setIsCreating(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price_per_user: 29,
      tokens_per_user: 2000000,
      features: [],
      min_team_size: 2,
      active: true,
    });
    setFeatureInput('');
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingPlan(null);
    resetForm();
  };

  const addFeature = () => {
    if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput.trim()]
      });
      setFeatureInput('');
    }
  };

  const removeFeature = (featureToRemove: string) => {
    setFormData({
      ...formData,
      features: formData.features.filter(f => f !== featureToRemove)
    });
  };

  const handleFeatureKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFeature();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-lg">
            <Building className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Planes de Organización</h1>
            <p className="text-gray-400">Configurar precios y características para equipos</p>
          </div>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo Plan
        </Button>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingPlan ? 'Editar Plan de Organización' : 'Crear Nuevo Plan de Organización'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre del Plan
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="PromptHub para equipos"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Precio por Usuario/Mes (€)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price_per_user}
                    onChange={(e) => setFormData({ ...formData, price_per_user: parseFloat(e.target.value) })}
                    placeholder="29.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tokens por Usuario
                  </label>
                  <Input
                    type="number"
                    value={formData.tokens_per_user}
                    onChange={(e) => setFormData({ ...formData, tokens_per_user: parseInt(e.target.value) })}
                    placeholder="2000000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tamaño Mínimo de Equipo
                  </label>
                  <Input
                    type="number"
                    min="2"
                    value={formData.min_team_size}
                    onChange={(e) => setFormData({ ...formData, min_team_size: parseInt(e.target.value) })}
                    placeholder="2"
                    required
                  />
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Características del Plan
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={handleFeatureKeyDown}
                    placeholder="Añadir característica..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={addFeature}
                    disabled={!featureInput.trim()}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-900 rounded">
                      <span className="text-sm text-gray-100">{feature}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFeature(feature)}
                        className="text-red-400 hover:text-red-300"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="active" className="text-sm text-gray-300">
                  Plan activo
                </label>
              </div>
              
              <div className="flex gap-3">
                <Button type="submit">
                  {editingPlan ? 'Actualizar Plan' : 'Crear Plan'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Plans List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(plan)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeletePlan(plan.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-100">
                {formatCurrency(plan.price_per_user)}
                <span className="text-sm font-normal text-gray-400">/usuario/mes</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Plan Details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Tokens por usuario</span>
                  <span className="font-medium">{formatNumber(plan.tokens_per_user)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Equipo mínimo</span>
                  <span className="font-medium">{plan.min_team_size} usuarios</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Costo por token</span>
                  <span className="font-medium">{formatCurrency((plan.price_per_user / plan.tokens_per_user) * 1000000)}/M</span>
                </div>
              </div>

              {/* Features */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Características:</h4>
                <div className="space-y-1">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                      <div className="w-1 h-1 bg-green-400 rounded-full" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="pt-2">
                {plan.active ? (
                  <Badge variant="success" className="w-full justify-center">
                    Activo
                  </Badge>
                ) : (
                  <Badge variant="outline" className="w-full justify-center">
                    Inactivo
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      {plans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Resumen de Planes de Organización
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-900 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Planes Totales</div>
                <div className="text-lg font-semibold text-gray-100">{plans.length}</div>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Planes Activos</div>
                <div className="text-lg font-semibold text-green-400">
                  {plans.filter(p => p.active).length}
                </div>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Precio Promedio</div>
                <div className="text-lg font-semibold text-blue-400">
                  {formatCurrency(plans.reduce((sum, p) => sum + p.price_per_user, 0) / plans.length)}
                </div>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Tokens Promedio</div>
                <div className="text-lg font-semibold text-purple-400">
                  {formatNumber(plans.reduce((sum, p) => sum + p.tokens_per_user, 0) / plans.length)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}