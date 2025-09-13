import React, { useState } from 'react';
import { DollarSign, Plus, Edit, Trash2, Users, Zap, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { formatCurrency, formatNumber } from '../../lib/utils';
import { Plan } from '../../types';

interface PlanManagementProps {
  plans: Plan[];
  users: any[];
  onCreatePlan: (plan: Omit<Plan, 'id' | 'created_at' | 'updated_at'>) => void;
  onUpdatePlan: (planId: string, updates: Partial<Plan>) => void;
  onDeletePlan: (planId: string) => void;
}

export function PlanManagement({ plans, users, onCreatePlan, onUpdatePlan, onDeletePlan }: PlanManagementProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    tokens_included: 0,
    overage_price: 0,
  });

  // Calculate plan statistics
  const planStats = React.useMemo(() => {
    return plans.map(plan => {
      const planUsers = users.filter(user => user.plan_id === plan.id);
      const totalRevenue = planUsers.length * plan.price;
      const totalTokensUsed = planUsers.reduce((sum, user) => sum + user.tokens_used, 0);
      const avgTokensPerUser = planUsers.length > 0 ? totalTokensUsed / planUsers.length : 0;
      
      return {
        ...plan,
        userCount: planUsers.length,
        totalRevenue,
        totalTokensUsed,
        avgTokensPerUser,
      };
    });
  }, [plans, users]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPlan) {
      onUpdatePlan(editingPlan.id, formData);
      setEditingPlan(null);
    } else {
      onCreatePlan(formData);
      setIsCreating(false);
    }
    
    setFormData({
      name: '',
      price: 0,
      tokens_included: 0,
      overage_price: 0,
    });
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price,
      tokens_included: plan.tokens_included,
      overage_price: plan.overage_price,
    });
    setIsCreating(true);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingPlan(null);
    setFormData({
      name: '',
      price: 0,
      tokens_included: 0,
      overage_price: 0,
    });
  };

  const getPlanColor = (planId: string) => {
    const colors = {
      starter: 'border-gray-500',
      pro: 'border-blue-500',
      enterprise: 'border-purple-500',
    };
    return colors[planId as keyof typeof colors] || 'border-gray-500';
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
            <h1 className="text-2xl font-bold text-gray-100">Gestión de Planes</h1>
            <p className="text-gray-400">Configurar precios y límites de tokens</p>
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
              {editingPlan ? 'Editar Plan' : 'Crear Nuevo Plan'}
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
                    placeholder="Ej: Pro"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Precio Mensual (€)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    placeholder="29.99"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tokens Incluidos
                  </label>
                  <Input
                    type="number"
                    value={formData.tokens_included}
                    onChange={(e) => setFormData({ ...formData, tokens_included: parseInt(e.target.value) })}
                    placeholder="2000000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Precio Exceso (€/M tokens)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.overage_price}
                    onChange={(e) => setFormData({ ...formData, overage_price: parseFloat(e.target.value) })}
                    placeholder="12.00"
                    required
                  />
                </div>
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

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {planStats.map((plan) => (
          <Card key={plan.id} className={`border-2 ${getPlanColor(plan.id)}`}>
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
                    disabled={plan.userCount > 0}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-100">
                {formatCurrency(plan.price)}
                <span className="text-sm font-normal text-gray-400">/mes</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Plan Features */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Tokens incluidos</span>
                  <span className="font-medium">{formatNumber(plan.tokens_included)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Precio exceso</span>
                  <span className="font-medium">{formatCurrency(plan.overage_price)}/M</span>
                </div>
              </div>

              {/* Usage Statistics */}
              <div className="pt-4 border-t border-gray-700">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-blue-400 flex items-center justify-center gap-1">
                      <Users className="h-4 w-4" />
                      {plan.userCount}
                    </div>
                    <div className="text-xs text-gray-400">Usuarios</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-green-400 flex items-center justify-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      {formatCurrency(plan.totalRevenue)}
                    </div>
                    <div className="text-xs text-gray-400">Ingresos</div>
                  </div>
                </div>
              </div>

              {/* Token Usage */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-400">Uso promedio de tokens</span>
                  <span className="font-medium">{formatNumber(plan.avgTokensPerUser)}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min((plan.avgTokensPerUser / plan.tokens_included) * 100, 100)}%`
                    }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {((plan.avgTokensPerUser / plan.tokens_included) * 100).toFixed(1)}% del límite
                </div>
              </div>

              {/* Plan Status */}
              <div className="pt-2">
                {plan.userCount === 0 ? (
                  <Badge variant="outline" className="w-full justify-center">
                    Sin usuarios
                  </Badge>
                ) : (
                  <Badge variant="default" className="w-full justify-center">
                    Activo
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Resumen de Ingresos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-900 p-4 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Ingresos Totales</div>
              <div className="text-lg font-semibold text-green-400">
                {formatCurrency(planStats.reduce((sum, plan) => sum + plan.totalRevenue, 0))}
              </div>
              <div className="text-xs text-gray-500">mensual</div>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Usuarios Totales</div>
              <div className="text-lg font-semibold text-blue-400">
                {planStats.reduce((sum, plan) => sum + plan.userCount, 0)}
              </div>
              <div className="text-xs text-gray-500">activos</div>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">ARPU</div>
              <div className="text-lg font-semibold text-purple-400">
                {formatCurrency(
                  planStats.reduce((sum, plan) => sum + plan.totalRevenue, 0) /
                  Math.max(planStats.reduce((sum, plan) => sum + plan.userCount, 0), 1)
                )}
              </div>
              <div className="text-xs text-gray-500">por usuario</div>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Tokens Consumidos</div>
              <div className="text-lg font-semibold text-yellow-400">
                {formatNumber(planStats.reduce((sum, plan) => sum + plan.totalTokensUsed, 0))}
              </div>
              <div className="text-xs text-gray-500">total</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}