import React, { useState } from 'react';
import { X, Users, Link, Copy, DollarSign, TrendingUp, Gift, Share2, Eye } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { formatCurrency, formatDate } from '../lib/utils';
import { useToast } from '../hooks/useToast';
import { ReferralProgram, Referral } from '../types';

interface ReferralProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  userReferralProgram?: ReferralProgram | null;
  referrals?: Referral[];
}

export function ReferralProgramModal({ 
  isOpen, 
  onClose, 
  userReferralProgram,
  referrals = []
}: ReferralProgramModalProps) {
  const { toast } = useToast();
  const [showReferralTracker, setShowReferralTracker] = useState(false);

  // Mock data if no real program exists
  const mockProgram: ReferralProgram = userReferralProgram || {
    id: 'ref1',
    user_id: 'user1',
    referral_code: 'b111e20d-c0aa-4782-9930-4271428e3061',
    referral_url: 'https://app.kilocode.ai/users/sign_up?referral-code=b111e20d-c0aa-4782-9930-4271428e3061',
    total_referrals: 0,
    total_earnings: 0.00,
    commission_rate: 10,
    active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-20T00:00:00Z',
  };

  const mockReferrals: Referral[] = referrals.length > 0 ? referrals : [
    {
      id: 'ref_user1',
      referrer_id: mockProgram.user_id,
      referred_user_id: 'user_ref1',
      referral_code: mockProgram.referral_code,
      commission_earned: 10.00,
      status: 'confirmed',
      created_at: '2025-01-15T10:30:00Z',
      confirmed_at: '2025-01-16T08:20:00Z',
    },
    {
      id: 'ref_user2',
      referrer_id: mockProgram.user_id,
      referred_user_id: 'user_ref2',
      referral_code: mockProgram.referral_code,
      commission_earned: 10.00,
      status: 'pending',
      created_at: '2025-01-18T14:45:00Z',
    },
  ];

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

  const copyReferralCode = async () => {
    await navigator.clipboard.writeText(mockProgram.referral_code);
    toast.success('Código copiado', 'Código de referencia copiado al portapapeles');
  };

  const copyReferralUrl = async () => {
    await navigator.clipboard.writeText(mockProgram.referral_url);
    toast.success('Enlace copiado', 'Enlace de referencia copiado al portapapeles');
  };

  const shareReferralLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Únete a PromptHub',
        text: '¡Únete a PromptHub y optimiza tus prompts de IA!',
        url: mockProgram.referral_url,
      });
    } else {
      copyReferralUrl();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="success">Confirmado</Badge>;
      case 'pending':
        return <Badge variant="warning">Pendiente</Badge>;
      case 'paid':
        return <Badge variant="default">Pagado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-2 rounded-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-100">Programa de referencias</h2>
              <p className="text-sm text-gray-400">Comparte tu enlace de referencia y realiza un seguimiento de tus ganancias</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6">
          {!showReferralTracker ? (
            /* Main Referral View */
            <div className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">
                      {formatCurrency(mockProgram.total_earnings)}
                    </div>
                    <div className="text-sm text-gray-400">Total ganado</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">
                      {mockProgram.total_referrals}
                    </div>
                    <div className="text-sm text-gray-400">Referidos totales</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-2">
                      {mockReferrals.length}
                    </div>
                    <div className="text-sm text-gray-400">Referidos activos</div>
                  </CardContent>
                </Card>
              </div>

              {/* Referral Tools */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Share Code */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Link className="h-5 w-5" />
                      Código para compartir
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gray-900 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <code className="text-sm font-mono text-gray-100 break-all">
                          {mockProgram.referral_code}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={copyReferralCode}
                          className="ml-2"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      onClick={shareReferralLink}
                      className="w-full flex items-center gap-2"
                    >
                      <Share2 className="h-4 w-4" />
                      Compartir enlace
                    </Button>
                  </CardContent>
                </Card>

                {/* Earnings Tracker */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Rastreador de canjes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      onClick={() => setShowReferralTracker(true)}
                      variant="outline"
                      className="w-full flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Ver detalles de referidos
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Referral URL */}
              <Card>
                <CardHeader>
                  <CardTitle>Su enlace de referencia</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <code className="text-sm font-mono text-gray-100 break-all flex-1 mr-4">
                        {mockProgram.referral_url}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={copyReferralUrl}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* How it Works */}
              <Card className="border-green-500/30 bg-green-900/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-300">
                    <Gift className="h-5 w-5" />
                    Gana ${mockProgram.commission_rate} por la recarga de cada amigo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-green-200 mb-4">
                    Gane hasta {formatCurrency(100)} en total
                  </div>
                  <p className="text-sm text-green-100">
                    ¡Comparte este enlace para recomendar PromptHub a tus amigos y gana recompensas cuando recarguen al menos 5€!
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Referral Tracker View */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-100">Redenciones</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="success" className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {formatCurrency(mockProgram.total_earnings)}
                  </Badge>
                  <span className="text-sm text-gray-400">/ 10</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowReferralTracker(false)}
                  >
                    Volver
                  </Button>
                </div>
              </div>

              {/* Progress Bar */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Progreso hacia $100</span>
                    <span className="text-sm font-medium text-gray-100">
                      {((mockProgram.total_earnings / 100) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500"
                      style={{ width: `${Math.min((mockProgram.total_earnings / 100) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {formatCurrency(100 - mockProgram.total_earnings)} restantes para alcanzar el máximo
                  </div>
                </CardContent>
              </Card>

              {/* Referrals List */}
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Referidos</CardTitle>
                </CardHeader>
                <CardContent>
                  {mockReferrals.length > 0 ? (
                    <div className="space-y-3">
                      {mockReferrals.map((referral) => (
                        <div key={referral.id} className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                              <Users className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-100">
                                Usuario referido #{referral.referred_user_id.slice(-4)}
                              </div>
                              <div className="text-sm text-gray-400">
                                {formatDate(referral.created_at)}
                                {referral.confirmed_at && (
                                  <span className="ml-2">• Confirmado {formatDate(referral.confirmed_at)}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-green-400">
                              {formatCurrency(referral.commission_earned)}
                            </div>
                            <div className="text-sm">
                              {getStatusBadge(referral.status)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-300 mb-2">
                        Aún no tienes referidos
                      </h3>
                      <p className="text-gray-400 mb-4">
                        Comparte tu enlace de referencia para empezar a ganar comisiones
                      </p>
                      <Button
                        onClick={() => setShowReferralTracker(false)}
                        className="flex items-center gap-2"
                      >
                        <Share2 className="h-4 w-4" />
                        Compartir Enlace
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Earnings Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Ganancias por Estado</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Confirmadas</span>
                      <span className="font-medium text-green-400">
                        {formatCurrency(mockReferrals.filter(r => r.status === 'confirmed').reduce((sum, r) => sum + r.commission_earned, 0))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Pendientes</span>
                      <span className="font-medium text-yellow-400">
                        {formatCurrency(mockReferrals.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.commission_earned, 0))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Pagadas</span>
                      <span className="font-medium text-blue-400">
                        {formatCurrency(mockReferrals.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.commission_earned, 0))}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Estadísticas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Tasa de conversión</span>
                      <span className="font-medium text-purple-400">
                        {mockReferrals.length > 0 ? ((mockReferrals.filter(r => r.status === 'confirmed').length / mockReferrals.length) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Ganancia promedio</span>
                      <span className="font-medium text-blue-400">
                        {formatCurrency(mockReferrals.length > 0 ? mockProgram.total_earnings / mockReferrals.length : 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Comisión actual</span>
                      <span className="font-medium text-green-400">{mockProgram.commission_rate}%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}