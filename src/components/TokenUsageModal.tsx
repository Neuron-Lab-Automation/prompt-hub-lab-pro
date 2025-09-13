import React, { useState, useEffect } from 'react';
import { X, Zap, TrendingUp, Calendar, DollarSign, AlertTriangle, CreditCard, ArrowUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { formatCurrency, formatNumber, formatDate } from '../lib/utils';
import { useToast } from '../hooks/useToast';
import { TokenPromotion } from '../types';

interface TokenUsageModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePromotion?: TokenPromotion | null;
  user: {
    name: string;
    email: string;
    plan: string;
    tokensUsed: number;
    tokensLimit: number;
  };
}

interface TokenPurchaseOption {
  tokens: number;
  price: number;
  popular?: boolean;
}

interface PlanUpgrade {
  id: string;
  name: string;
  price: number;
  tokens: number;
  savings: number;
}

export function TokenUsageModal({ isOpen, onClose, activePromotion, user }: TokenUsageModalProps) {
  const { toast } = useToast();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedTokens, setSelectedTokens] = useState(1000000); // 1M tokens default
  const [showUpgradeOptions, setShowUpgradeOptions] = useState(false);

  const tokenUsagePercent = (user.tokensUsed / user.tokensLimit) * 100;
  const remainingTokens = user.tokensLimit - user.tokensUsed;

  // Mock usage history
  const usageHistory = [
    { date: '2025-01-20', tokens: 45000, cost: 0.68, executions: 12 },
    { date: '2025-01-19', tokens: 38000, cost: 0.57, executions: 8 },
    { date: '2025-01-18', tokens: 52000, cost: 0.78, executions: 15 },
    { date: '2025-01-17', tokens: 29000, cost: 0.44, executions: 6 },
    { date: '2025-01-16', tokens: 41000, cost: 0.62, executions: 11 },
    { date: '2025-01-15', tokens: 35000, cost: 0.53, executions: 9 },
    { date: '2025-01-14', tokens: 48000, cost: 0.72, executions: 13 },
  ];

  // Token purchase options based on current plan
  const getTokenOptions = (): TokenPurchaseOption[] => {
    const basePrice = user.plan === 'starter' ? 15 : user.plan === 'pro' ? 12 : 8;
    
    return [
      { tokens: 500000, price: basePrice * 0.5 },
      { tokens: 1000000, price: basePrice * 1, popular: true },
      { tokens: 2000000, price: basePrice * 1.8 },
      { tokens: 5000000, price: basePrice * 4.2 },
      { tokens: 10000000, price: basePrice * 8 },
    ];
  };

  // Plan upgrade options
  const getUpgradeOptions = (): PlanUpgrade[] => {
    if (user.plan === 'starter') {
      return [
        { id: 'pro', name: 'Pro', price: 29, tokens: 2000000, savings: 8 },
        { id: 'enterprise', name: 'Enterprise', price: 49, tokens: 10000000, savings: 25 },
      ];
    } else if (user.plan === 'pro') {
      return [
        { id: 'enterprise', name: 'Enterprise', price: 49, tokens: 10000000, savings: 15 },
      ];
    }
    return [];
  };

  const tokenOptions = getTokenOptions();
  const upgradeOptions = getUpgradeOptions();

  // Calculate custom token price
  const calculateCustomPrice = (tokens: number) => {
    const basePrice = user.plan === 'starter' ? 15 : user.plan === 'pro' ? 12 : 8;
    const millions = tokens / 1000000;
    return millions * basePrice;
  };

  const handlePurchaseTokens = (tokens: number) => {
    let finalTokens = tokens;
    let price = calculateCustomPrice(tokens);
    
    // Apply promotion bonus if active and meets minimum
    if (activePromotion && activePromotion.active && tokens >= activePromotion.min_purchase) {
      const bonusTokens = Math.floor(tokens * (activePromotion.bonus_percentage / 100));
      finalTokens = tokens + bonusTokens;
      toast.success(
        'Compra procesada con bonus', 
        `${formatNumber(tokens)} tokens + ${formatNumber(bonusTokens)} bonus = ${formatNumber(finalTokens)} tokens por ${formatCurrency(price)}`
      );
    } else {
      toast.success('Compra procesada', `${formatNumber(tokens)} tokens añadidos por ${formatCurrency(price)}`);
    }
    
    console.log('Purchase tokens:', { tokens, finalTokens, price, promotion: activePromotion });
    setShowPurchaseModal(false);
    onClose();
  };

  const handleUpgradePlan = (planId: string) => {
    console.log('Upgrade to plan:', planId);
    toast.success('Plan actualizado', `Actualizado a plan ${planId} exitosamente`);
    setShowUpgradeOptions(false);
    setShowPurchaseModal(false);
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setShowPurchaseModal(false);
      setShowUpgradeOptions(false);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-100">Uso de Tokens</h2>
              <p className="text-sm text-gray-400">Plan {user.plan} • {user.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Usage Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Tokens Usados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-100">{formatNumber(user.tokensUsed)}</div>
                <div className="text-xs text-gray-400 mt-1">
                  de {formatNumber(user.tokensLimit)} incluidos
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Tokens Restantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${remainingTokens < user.tokensLimit * 0.25 ? 'text-red-400' : 'text-green-400'}`}>
                  {formatNumber(remainingTokens)}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {(100 - tokenUsagePercent).toFixed(1)}% disponible
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Uso Diario Promedio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-100">
                  {formatNumber(Math.round(usageHistory.reduce((sum, day) => sum + day.tokens, 0) / usageHistory.length))}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  últimos 7 días
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Usage Progress */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Progreso de Uso</span>
                {tokenUsagePercent >= 75 && (
                  <Badge variant="warning" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Uso Alto
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      tokenUsagePercent >= 90 ? 'bg-red-500' : 
                      tokenUsagePercent >= 75 ? 'bg-yellow-500' : 
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(tokenUsagePercent, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    {formatNumber(user.tokensUsed)} / {formatNumber(user.tokensLimit)} tokens
                  </span>
                  <span className={`font-medium ${
                    tokenUsagePercent >= 90 ? 'text-red-400' : 
                    tokenUsagePercent >= 75 ? 'text-yellow-400' : 
                    'text-green-400'
                  }`}>
                    {tokenUsagePercent.toFixed(1)}%
                  </span>
                </div>
                
                {tokenUsagePercent >= 75 && (
                  <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm font-medium text-yellow-300">
                        {tokenUsagePercent >= 90 ? '¡Tokens casi agotados!' : 'Uso alto de tokens'}
                      </span>
                    </div>
                    <p className="text-sm text-yellow-200 mb-3">
                      {tokenUsagePercent >= 90 
                        ? 'Te quedan muy pocos tokens. Considera comprar más para continuar usando el servicio.'
                        : 'Has usado más del 75% de tus tokens. Te recomendamos comprar más tokens o actualizar tu plan.'
                      }
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => setShowPurchaseModal(true)}
                        className="flex items-center gap-2"
                      >
                        <CreditCard className="h-4 w-4" />
                        Comprar Tokens
                      </Button>
                      {upgradeOptions.length > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowUpgradeOptions(true)}
                          className="flex items-center gap-2"
                        >
                          <ArrowUp className="h-4 w-4" />
                          Actualizar Plan
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Usage History */}
          <Card>
            <CardHeader>
              <CardTitle>Historial de Uso (Últimos 7 días)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {usageHistory.map((day, index) => (
                  <div key={day.date} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-100">{formatDate(day.date)}</div>
                        <div className="text-sm text-gray-400">{day.executions} ejecuciones</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-100">{formatNumber(day.tokens)} tokens</div>
                      <div className="text-sm text-gray-400">{formatCurrency(day.cost)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Purchase Modal */}
        {showPurchaseModal && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-100">Comprar Tokens Adicionales</h3>
                  <Button variant="ghost" size="icon" onClick={() => setShowPurchaseModal(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Token Slider */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Cantidad de Tokens: {formatNumber(selectedTokens)}
                  </label>
                  <input
                    type="range"
                    min="100000"
                    max="20000000"
                    step="100000"
                    value={selectedTokens}
                    onChange={(e) => setSelectedTokens(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>100K</span>
                    <span>5M</span>
                    <span>10M</span>
                    <span>20M</span>
                  </div>
                  <div className="mt-4 p-4 bg-gray-900 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Precio total:</span>
                      <span className="text-2xl font-bold text-green-400">
                        {formatCurrency(calculateCustomPrice(selectedTokens))}
                      </span>
                    </div>
                    {activePromotion && activePromotion.active && selectedTokens >= activePromotion.min_purchase && (
                      <div className="mt-2 p-2 bg-green-900/30 border border-green-500/30 rounded">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-green-300">Bonus ({activePromotion.bonus_percentage}%):</span>
                          <span className="font-bold text-green-400">
                            +{formatNumber(Math.floor(selectedTokens * (activePromotion.bonus_percentage / 100)))} tokens GRATIS
                          </span>
                        </div>
                        <div className="text-xs text-green-400 mt-1">
                          Total final: {formatNumber(selectedTokens + Math.floor(selectedTokens * (activePromotion.bonus_percentage / 100)))} tokens
                        </div>
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                      {formatCurrency(calculateCustomPrice(selectedTokens) / (selectedTokens / 1000000))}/M tokens
                    </div>
                  </div>
                </div>

                {/* Quick Options */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Opciones Rápidas</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {tokenOptions.map((option) => (
                      <button
                        key={option.tokens}
                        onClick={() => setSelectedTokens(option.tokens)}
                        className={`p-3 rounded-lg border transition-all ${
                          selectedTokens === option.tokens
                            ? 'border-blue-500 bg-blue-900/20'
                            : 'border-gray-600 bg-gray-900 hover:bg-gray-800'
                        } ${option.popular || (activePromotion && option.tokens >= activePromotion.min_purchase) ? 'ring-2 ring-green-500/50' : ''}`}
                      >
                        <div className="text-sm font-medium text-gray-100">
                          {formatNumber(option.tokens)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatCurrency(option.price)}
                        </div>
                        {activePromotion && activePromotion.active && option.tokens >= activePromotion.min_purchase && (
                          <Badge variant="success" className="mt-1 text-xs bg-green-600">
                            +{activePromotion.bonus_percentage}% Extra
                          </Badge>
                        )}
                        {option.popular && !activePromotion && (
                          <Badge variant="default" className="mt-1 text-xs">
                            Popular
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Plan Upgrade Suggestion */}
                {upgradeOptions.length > 0 && (
                  <div className="mb-6 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowUp className="h-4 w-4 text-purple-400" />
                      <span className="text-sm font-medium text-purple-300">
                        ¿Mejor actualizar tu plan?
                      </span>
                    </div>
                    <p className="text-sm text-purple-200 mb-3">
                      Actualizar tu plan puede ser más económico que comprar tokens adicionales.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowUpgradeOptions(true)}
                      className="border-purple-500 text-purple-300 hover:bg-purple-600"
                    >
                      Ver Opciones de Actualización
                    </Button>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => handlePurchaseTokens(selectedTokens)}
                    className={`flex-1 flex items-center gap-2 ${
                      activePromotion && activePromotion.active && selectedTokens >= activePromotion.min_purchase
                        ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700'
                        : ''
                    }`}
                  >
                    {activePromotion && activePromotion.active && selectedTokens >= activePromotion.min_purchase ? (
                      <>
                        <Gift className="h-4 w-4" />
                        Comprar con {activePromotion.bonus_percentage}% Extra
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" />
                        Comprar {formatNumber(selectedTokens)} tokens
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowPurchaseModal(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade Options Modal */}
        {showUpgradeOptions && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-100">Actualizar Plan</h3>
                  <Button variant="ghost" size="icon" onClick={() => setShowUpgradeOptions(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {upgradeOptions.map((plan) => (
                    <div key={plan.id} className="border border-gray-600 rounded-lg p-4 hover:border-blue-500 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-100">Plan {plan.name}</h4>
                          <p className="text-sm text-gray-400">{formatNumber(plan.tokens)} tokens incluidos</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-100">{formatCurrency(plan.price)}</div>
                          <div className="text-xs text-gray-400">por mes</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-400">Ahorro estimado:</span>
                        <Badge variant="success" className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(plan.savings)}/mes
                        </Badge>
                      </div>

                      <Button
                        onClick={() => handleUpgradePlan(plan.id)}
                        className="w-full"
                      >
                        Actualizar a {plan.name}
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowUpgradeOptions(false);
                      setShowPurchaseModal(true);
                    }}
                  >
                    Mejor comprar tokens adicionales
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          border: 2px solid #1F2937;
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          border: 2px solid #1F2937;
        }
      `}</style>
    </div>
  );
}