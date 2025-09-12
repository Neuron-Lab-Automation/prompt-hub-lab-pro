import React, { useState } from 'react';
import { X, Building, Users, DollarSign, CreditCard, Plus, Minus } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { formatCurrency } from '../lib/utils';
import { useToast } from '../hooks/useToast';
import { OrganizationPlan } from '../types';

interface CreateOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationPlans: OrganizationPlan[];
  onCreateOrganization: (organization: {
    name: string;
    team_size: number;
    plan_id: string;
  }) => void;
}

export function CreateOrganizationModal({ isOpen, onClose, organizationPlans, onCreateOrganization }: CreateOrganizationModalProps) {
  const { toast } = useToast();
  const [organizationName, setOrganizationName] = useState('');
  const [teamSize, setTeamSize] = useState(5);
  const [selectedPlan, setSelectedPlan] = useState('team');

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Convert organization plans to the format expected by the component
  const plansMap = organizationPlans.reduce((acc, plan) => {
    acc[plan.id] = {
      name: plan.name,
      pricePerUser: plan.price_per_user,
      features: plan.features,
      tokensIncluded: plan.tokens_per_user,
      minTeamSize: plan.min_team_size,
      active: plan.active,
    };
    return acc;
  }, {} as Record<string, any>);

  const currentPlan = plansMap[selectedPlan];
  const monthlyTotal = currentPlan ? currentPlan.pricePerUser * teamSize : 0;
  const totalTokens = currentPlan ? currentPlan.tokensIncluded * teamSize : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!organizationName.trim()) {
      toast.warning('Nombre requerido', 'Por favor ingresa el nombre de la organización');
      return;
    }

    if (teamSize < 2) {
      toast.warning('Tamaño mínimo', 'El equipo debe tener al menos 2 miembros');
      return;
    }

    onCreateOrganization({
      name: organizationName.trim(),
      team_size: teamSize,
      plan_id: selectedPlan,
    });

    toast.success('Organización creada', `"${organizationName}" creada exitosamente`);
    
    // Reset form
    setOrganizationName('');
    setTeamSize(15);
    setSelectedPlan('team');
    onClose();
  };

  const adjustTeamSize = (delta: number) => {
    const newSize = Math.max(2, Math.min(1000, teamSize + delta));
    setTeamSize(newSize);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <Building className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-100">Crea tu organización</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Form */}
            <div className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Organization Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre de la organización
                  </label>
                  <Input
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="Ingrese el nombre de su organización"
                    className="w-full"
                    required
                  />
                </div>

                {/* Team Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tamaño del equipo
                  </label>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => adjustTeamSize(-1)}
                      disabled={teamSize <= 2}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex-1 text-center">
                      <div className="text-2xl font-bold text-gray-100">{teamSize}</div>
                      <div className="text-sm text-gray-400">asientos</div>
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => adjustTeamSize(1)}
                      disabled={teamSize >= 1000}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-2 text-center">
                    <input
                      type="range"
                      min="2"
                      max="100"
                      value={teamSize}
                      onChange={(e) => setTeamSize(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Plan Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Seleccionar plan
                  </label>
                  <div className="space-y-3">
                    {organizationPlans.filter(p => p.active).map((plan) => (
                      <div
                        key={plan.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedPlan === plan.id
                            ? 'border-blue-500 bg-blue-900/20'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                        onClick={() => setSelectedPlan(plan.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-100">{plan.name}</h3>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-100">
                              {formatCurrency(plan.price_per_user)}
                            </div>
                            <div className="text-xs text-gray-400">por usuario/mes</div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {plan.features.slice(0, 3).map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                              <div className="w-1 h-1 bg-green-400 rounded-full" />
                              {feature}
                            </div>
                          ))}
                          {plan.features.length > 3 && (
                            <div className="text-xs text-gray-400">
                              +{plan.features.length - 3} características más
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cost Summary */}
                <Card className="border-blue-500/30 bg-blue-900/10">
                  <CardContent className="p-4">
                    <div className="text-sm text-blue-300 mb-2">Costo mensual total:</div>
                    <div className="text-3xl font-bold text-blue-400 mb-1">
                      {formatCurrency(monthlyTotal)}
                    </div>
                    <div className="text-sm text-blue-300">
                      Incluye {formatNumber(totalTokens)} tokens mensuales*
                    </div>
                    <div className="text-xs text-blue-400 mt-2">
                      * {formatNumber(currentPlan?.tokensIncluded || 0)} tokens por usuario
                    </div>
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  disabled={!organizationName.trim()}
                >
                  <Building className="h-4 w-4" />
                  Crear organización
                </Button>
              </form>
            </div>

            {/* Right Column - Plan Details */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {currentPlan.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-100">
                      {formatCurrency(currentPlan.pricePerUser)}
                    </div>
                    <div className="text-sm text-gray-400">por usuario/mes</div>
                  </div>

                  <div className="space-y-3">
                    {currentPlan?.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                        <span className="text-sm text-gray-300">{feature}</span>
                      </div>
                    )) || []}
                  </div>
                </CardContent>
              </Card>

              {/* Cost Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Desglose de Costos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Plan base ({teamSize} usuarios)</span>
                    <span className="font-medium text-gray-100">{formatCurrency(monthlyTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Créditos incluidos</span>
                    <span className="font-medium text-green-400">{formatNumber(totalTokens)} tokens</span>
                  </div>
                  <div className="border-t border-gray-700 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-100">Total mensual</span>
                      <span className="text-xl font-bold text-blue-400">{formatCurrency(monthlyTotal)}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    Precio por usuario: {formatCurrency(currentPlan?.pricePerUser || 0)}/mes
                  </div>
                </CardContent>
              </Card>

              {/* Benefits */}
              <Card className="border-green-500/30 bg-green-900/10">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-sm text-green-300 mb-1">Ahorro estimado vs planes individuales</div>
                    <div className="text-2xl font-bold text-green-400">
                      {formatCurrency(Math.max(0, (29 * teamSize) - monthlyTotal))}
                    </div>
                    <div className="text-xs text-green-300">por mes</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-700 text-center">
            <p className="text-sm text-gray-400">
              ¿Tienes preguntas sobre los equipos?{' '}
              <button className="text-blue-400 hover:text-blue-300 underline">
                Contacta con nuestro equipo de soporte.
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}