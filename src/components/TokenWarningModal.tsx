import React, { useEffect } from 'react';
import { AlertTriangle, CreditCard, ArrowUp, X, Zap, Gift, Sparkles } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { formatNumber, formatCurrency } from '../lib/utils';
import { TokenPromotion } from '../types';

interface TokenWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseTokens: () => void;
  onUpgradePlan: () => void;
  activePromotion?: TokenPromotion | null;
  user: {
    name: string;
    plan: string;
    tokensUsed: number;
    tokensLimit: number;
  };
}

export function TokenWarningModal({ 
  isOpen, 
  onClose, 
  onPurchaseTokens, 
  onUpgradePlan, 
  activePromotion,
  user 
}: TokenWarningModalProps) {
  const tokenUsagePercent = (user.tokensUsed / user.tokensLimit) * 100;
  const remainingTokens = user.tokensLimit - user.tokensUsed;

  useEffect(() => {
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

  const isNearlyEmpty = tokenUsagePercent >= 90;
  const isHigh = tokenUsagePercent >= 75;
  const hasPromotion = activePromotion && activePromotion.active;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div className={`relative bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 border ${
        hasPromotion ? 'border-green-500/50' : 'border-yellow-500/30'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              hasPromotion ? 'bg-gradient-to-r from-green-600 to-blue-600' :
              isNearlyEmpty ? 'bg-red-600' : 'bg-yellow-600'
            }`}>
              {hasPromotion ? (
                <Gift className="h-5 w-5 text-white" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-100">
                {hasPromotion ? activePromotion.name : 
                 isNearlyEmpty ? '¡Tokens Agotándose!' : 'Uso Alto de Tokens'}
              </h2>
              <p className="text-sm text-gray-400">Plan {user.plan}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6">
          {/* Usage Status */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Uso actual</span>
              <Badge variant={isNearlyEmpty ? 'destructive' : 'warning'}>
                {tokenUsagePercent.toFixed(1)}%
              </Badge>
            </div>
            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  isNearlyEmpty ? 'bg-red-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${Math.min(tokenUsagePercent, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-sm">
              <span className="text-gray-400">
                {formatNumber(user.tokensUsed)} / {formatNumber(user.tokensLimit)}
              </span>
              <span className={`font-medium ${isNearlyEmpty ? 'text-red-400' : 'text-yellow-400'}`}>
                {formatNumber(remainingTokens)} restantes
              </span>
            </div>
          </div>

          {/* Promotion Banner */}
          {hasPromotion && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-green-300">
                  ¡Oferta Especial Activa!
                </span>
              </div>
              <p className="text-sm text-green-200 mb-3">
                {activePromotion.description}
              </p>
              <div className="bg-green-900/40 p-3 rounded-lg">
                <div className="text-xs text-green-300">
                  Ejemplo: Compra {formatNumber(activePromotion.min_purchase)} tokens → 
                  Recibe <strong>{formatNumber(Math.floor(activePromotion.min_purchase * (activePromotion.bonus_percentage / 100)))} tokens GRATIS</strong>
                </div>
              </div>
            </div>
          )}

          {/* Warning Message */}
          <div className={`p-4 rounded-lg mb-6 ${
            hasPromotion 
              ? 'bg-blue-900/20 border border-blue-500/30'
            : isNearlyEmpty 
              ? 'bg-red-900/20 border border-red-500/30' 
              : 'bg-yellow-900/20 border border-yellow-500/30'
          }`}>
            <p className={`text-sm ${
              hasPromotion ? 'text-blue-200' :
              isNearlyEmpty ? 'text-red-200' : 'text-yellow-200'
            }`}>
              {hasPromotion 
                ? `¡Aprovecha esta oferta limitada! Compra tokens ahora y recibe ${activePromotion.bonus_percentage}% extra completamente gratis. Esta promoción puede terminar en cualquier momento.`
              : isNearlyEmpty 
                ? '¡Te quedan muy pocos tokens! Para continuar usando PromptHub sin interrupciones, necesitas comprar más tokens o actualizar tu plan.'
                : 'Has usado más del 75% de tus tokens incluidos. Te recomendamos comprar tokens adicionales o considerar actualizar tu plan para obtener más tokens y mejor precio.'
              }
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-900 p-3 rounded-lg text-center">
              <div className="text-lg font-semibold text-blue-400">{formatNumber(remainingTokens)}</div>
              <div className="text-xs text-gray-400">Tokens restantes</div>
            </div>
            <div className="bg-gray-900 p-3 rounded-lg text-center">
              <div className="text-lg font-semibold text-purple-400">
                {Math.ceil(remainingTokens / 45000)}
              </div>
              <div className="text-xs text-gray-400">Días estimados</div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={() => {
                onPurchaseTokens();
                onClose();
              }}
              className={`w-full flex items-center gap-2 ${
                hasPromotion ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700' : ''
              }`}
            >
              {hasPromotion ? (
                <>
                  <Gift className="h-4 w-4" />
                  ¡Comprar con {activePromotion.bonus_percentage}% Extra!
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Comprar Tokens Adicionales
                </>
              )}
            </Button>
            
            {user.plan !== 'enterprise' && (
              <Button
                onClick={() => {
                  onUpgradePlan();
                  onClose();
                }}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <ArrowUp className="h-4 w-4" />
                Actualizar Plan (Mejor Precio)
              </Button>
            )}
            
            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full"
            >
              Recordar más tarde
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}