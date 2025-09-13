import React, { useState } from 'react';
import { Users, DollarSign, Settings, Save, Percent, Euro } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '../../lib/utils';
import { useToast } from '../../hooks/useToast';

interface ReferralSettingsProps {
  onUpdateSettings: (settings: any) => void;
}

interface ReferralConfig {
  commission_rate: number; // Porcentaje de comisión
  min_purchase_amount: number; // Mínimo en euros para activar referido
  max_earnings_per_referrer: number; // Máximo que puede ganar un referidor
  cookie_duration_days: number; // Duración del cookie de referido
  payout_threshold: number; // Mínimo para pagar comisiones
  auto_approve_referrals: boolean; // Aprobar referidos automáticamente
  active: boolean; // Programa activo
}

export function ReferralSettings({ onUpdateSettings }: ReferralSettingsProps) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<ReferralConfig>({
    commission_rate: 10, // 10% de comisión
    min_purchase_amount: 5, // Mínimo 5€
    max_earnings_per_referrer: 100, // Máximo 100€ por referidor
    cookie_duration_days: 30, // Cookie válido 30 días
    payout_threshold: 20, // Pagar cuando acumule 20€
    auto_approve_referrals: true,
    active: true,
  });

  const handleSave = () => {
    onUpdateSettings({ referral: settings });
    toast.success('Configuración guardada', 'Configuración del programa de referidos actualizada');
  };

  const calculateExampleEarnings = () => {
    const purchaseAmount = 50; // Ejemplo: compra de 50€
    const commission = (purchaseAmount * settings.commission_rate) / 100;
    return Math.min(commission, settings.max_earnings_per_referrer);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-3 rounded-lg">
          <Users className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Configuración de Referidos</h1>
          <p className="text-gray-400">Configurar comisiones y reglas del programa</p>
        </div>
      </div>

      {/* Configuration Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración del Programa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tasa de Comisión (%)
              </label>
              <div className="relative">
                <Input
                  type="number"
                  min="1"
                  max="50"
                  step="0.1"
                  value={settings.commission_rate}
                  onChange={(e) => setSettings({ ...settings, commission_rate: parseFloat(e.target.value) })}
                  className="pr-8"
                />
                <Percent className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Porcentaje de la compra que recibe el referidor
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Compra Mínima para Activar (€)
              </label>
              <div className="relative">
                <Input
                  type="number"
                  min="1"
                  step="0.01"
                  value={settings.min_purchase_amount}
                  onChange={(e) => setSettings({ ...settings, min_purchase_amount: parseFloat(e.target.value) })}
                  className="pr-8"
                />
                <Euro className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Mínimo que debe gastar el referido
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Máximo por Referidor (€)
              </label>
              <Input
                type="number"
                min="10"
                step="1"
                value={settings.max_earnings_per_referrer}
                onChange={(e) => setSettings({ ...settings, max_earnings_per_referrer: parseFloat(e.target.value) })}
              />
              <div className="text-xs text-gray-400 mt-1">
                Límite total de ganancias por usuario
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duración del Cookie (días)
              </label>
              <Input
                type="number"
                min="1"
                max="365"
                value={settings.cookie_duration_days}
                onChange={(e) => setSettings({ ...settings, cookie_duration_days: parseInt(e.target.value) })}
              />
              <div className="text-xs text-gray-400 mt-1">
                Tiempo válido del enlace de referido
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Umbral de Pago (€)
              </label>
              <Input
                type="number"
                min="5"
                step="1"
                value={settings.payout_threshold}
                onChange={(e) => setSettings({ ...settings, payout_threshold: parseFloat(e.target.value) })}
              />
              <div className="text-xs text-gray-400 mt-1">
                Mínimo acumulado para procesar pago
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="auto_approve"
                checked={settings.auto_approve_referrals}
                onChange={(e) => setSettings({ ...settings, auto_approve_referrals: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="auto_approve" className="text-sm text-gray-300">
                Aprobar referidos automáticamente
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="program_active"
                checked={settings.active}
                onChange={(e) => setSettings({ ...settings, active: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="program_active" className="text-sm text-gray-300">
                Programa de referidos activo
              </label>
            </div>
          </div>

          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Guardar Configuración
          </Button>
        </CardContent>
      </Card>

      {/* Example Calculation */}
      <Card className="border-green-500/30 bg-green-900/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-300">
            <DollarSign className="h-5 w-5" />
            Ejemplo de Cálculo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-sm text-green-200">
              <strong>Escenario:</strong> Un amigo se registra con tu enlace y compra 50€ en tokens
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-green-300">Compra del referido:</span>
                <span className="ml-2 font-medium text-white">{formatCurrency(50)}</span>
              </div>
              <div>
                <span className="text-green-300">Tu comisión ({settings.commission_rate}%):</span>
                <span className="ml-2 font-medium text-green-400">{formatCurrency(calculateExampleEarnings())}</span>
              </div>
            </div>
            <div className="text-xs text-green-300">
              * Comisión se activa solo si la compra es ≥ {formatCurrency(settings.min_purchase_amount)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle>Estado Actual del Programa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${settings.active ? 'text-green-400' : 'text-red-400'}`}>
                {settings.active ? 'ACTIVO' : 'INACTIVO'}
              </div>
              <div className="text-sm text-gray-400">Estado del programa</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{settings.commission_rate}%</div>
              <div className="text-sm text-gray-400">Comisión actual</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{formatCurrency(settings.min_purchase_amount)}</div>
              <div className="text-sm text-gray-400">Compra mínima</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{formatCurrency(settings.max_earnings_per_referrer)}</div>
              <div className="text-sm text-gray-400">Máximo por usuario</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}