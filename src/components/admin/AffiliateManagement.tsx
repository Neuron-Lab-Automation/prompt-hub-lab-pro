import React, { useState } from 'react';
import { Users, TrendingUp, DollarSign, Link, Copy, Eye, Ban, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Affiliate } from '../../types';

interface AffiliateManagementProps {
  affiliates: Affiliate[];
  users: any[];
  onUpdateAffiliate: (affiliateId: string, updates: Partial<Affiliate>) => void;
  onBanAffiliate: (affiliateId: string) => void;
}

export function AffiliateManagement({ affiliates, users, onUpdateAffiliate, onBanAffiliate }: AffiliateManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Filter affiliates
  const filteredAffiliates = affiliates.filter(affiliate => {
    const user = users.find(u => u.id === affiliate.user_id);
    if (!user) return false;
    
    return (
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      affiliate.ref_code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Calculate total stats
  const totalStats = React.useMemo(() => {
    const totalReferrals = affiliates.reduce((sum, a) => sum + a.total_referrals, 0);
    const totalEarnings = affiliates.reduce((sum, a) => sum + a.total_earnings, 0);
    const activeAffiliates = affiliates.filter(a => a.active).length;
    const avgCommission = affiliates.length > 0 
      ? affiliates.reduce((sum, a) => sum + a.commission_percent, 0) / affiliates.length 
      : 0;

    return {
      totalReferrals,
      totalEarnings,
      activeAffiliates,
      avgCommission,
    };
  }, [affiliates]);

  const copyReferralLink = async (refCode: string) => {
    const link = `https://prompthub.com/?ref=${refCode}`;
    await navigator.clipboard.writeText(link);
    // Add toast notification here
  };

  const handleViewDetails = (affiliate: Affiliate) => {
    setSelectedAffiliate(affiliate);
    setShowDetails(true);
  };

  const getAffiliateUser = (userId: string) => {
    return users.find(u => u.id === userId);
  };

  const getPerformanceLevel = (referrals: number) => {
    if (referrals >= 50) return { level: 'Elite', color: 'text-purple-400', variant: 'default' as const };
    if (referrals >= 20) return { level: 'Pro', color: 'text-blue-400', variant: 'default' as const };
    if (referrals >= 5) return { level: 'Active', color: 'text-green-400', variant: 'success' as const };
    return { level: 'Starter', color: 'text-gray-400', variant: 'outline' as const };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-3 rounded-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Programa de Afiliados</h1>
            <p className="text-gray-400">Gestionar afiliados y comisiones</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Afiliados Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-100">{totalStats.activeAffiliates}</div>
            <div className="text-xs text-gray-400 mt-1">
              de {affiliates.length} totales
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Referidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-100">{totalStats.totalReferrals}</div>
            <div className="text-xs text-gray-400 mt-1">
              usuarios referidos
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Comisiones Pagadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-100">{formatCurrency(totalStats.totalEarnings)}</div>
            <div className="text-xs text-gray-400 mt-1">
              total acumulado
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Comisión Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-100">{totalStats.avgCommission.toFixed(1)}%</div>
            <div className="text-xs text-gray-400 mt-1">
              por referido
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Input
              placeholder="Buscar por nombre, email o código de referido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4"
            />
          </div>
        </CardContent>
      </Card>

      {/* Affiliates List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Afiliados</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900 border-b border-gray-700">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Afiliado</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Código</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Nivel</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Referidos</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Comisión</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Ganancias</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Estado</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredAffiliates.map((affiliate) => {
                  const user = getAffiliateUser(affiliate.user_id);
                  const performance = getPerformanceLevel(affiliate.total_referrals);
                  
                  if (!user) return null;
                  
                  return (
                    <tr key={affiliate.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-gray-100">{user.name}</div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-900 px-2 py-1 rounded text-sm font-mono">
                            {affiliate.ref_code}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyReferralLink(affiliate.ref_code)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={performance.variant} className={performance.color}>
                          {performance.level}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-100">
                          {affiliate.total_referrals}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-100">
                          {affiliate.commission_percent}%
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-green-400">
                          {formatCurrency(affiliate.total_earnings)}
                        </div>
                      </td>
                      <td className="p-4">
                        {affiliate.active ? (
                          <Badge variant="success">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Activo
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <Ban className="h-3 w-3 mr-1" />
                            Suspendido
                          </Badge>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewDetails(affiliate)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onBanAffiliate(affiliate.id)}
                            className={affiliate.active ? "text-yellow-400 hover:text-yellow-300" : "text-green-400 hover:text-green-300"}
                          >
                            {affiliate.active ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredAffiliates.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                No se encontraron afiliados
              </h3>
              <p className="text-gray-400">
                {searchTerm ? 'Intenta cambiar los términos de búsqueda' : 'Aún no hay afiliados registrados'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {affiliates
              .sort((a, b) => b.total_referrals - a.total_referrals)
              .slice(0, 3)
              .map((affiliate, index) => {
                const user = getAffiliateUser(affiliate.user_id);
                if (!user) return null;
                
                const medals = ['🥇', '🥈', '🥉'];
                
                return (
                  <div key={affiliate.id} className="bg-gray-900 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{medals[index]}</span>
                      <div>
                        <div className="font-medium text-gray-100">{user.name}</div>
                        <div className="text-sm text-gray-400">{affiliate.ref_code}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Referidos:</span>
                        <span className="ml-2 font-medium text-blue-400">{affiliate.total_referrals}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Ganancias:</span>
                        <span className="ml-2 font-medium text-green-400">{formatCurrency(affiliate.total_earnings)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Affiliate Details Modal */}
      {showDetails && selectedAffiliate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDetails(false)} />
          <div className="relative bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-100">Detalles del Afiliado</h2>
                <Button variant="ghost" onClick={() => setShowDetails(false)}>
                  ×
                </Button>
              </div>
              
              {(() => {
                const user = getAffiliateUser(selectedAffiliate.user_id);
                if (!user) return null;
                
                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400">Nombre</label>
                        <div className="font-medium text-gray-100">{user.name}</div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Email</label>
                        <div className="font-medium text-gray-100">{user.email}</div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Código de Referido</label>
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-900 px-2 py-1 rounded text-sm font-mono">
                            {selectedAffiliate.ref_code}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyReferralLink(selectedAffiliate.ref_code)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Fecha de Registro</label>
                        <div className="font-medium text-gray-100">{formatDate(selectedAffiliate.created_at)}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gray-900 p-4 rounded-lg text-center">
                        <div className="text-lg font-semibold text-blue-400">{selectedAffiliate.total_referrals}</div>
                        <div className="text-sm text-gray-400">Referidos</div>
                      </div>
                      <div className="bg-gray-900 p-4 rounded-lg text-center">
                        <div className="text-lg font-semibold text-green-400">{formatCurrency(selectedAffiliate.total_earnings)}</div>
                        <div className="text-sm text-gray-400">Ganancias</div>
                      </div>
                      <div className="bg-gray-900 p-4 rounded-lg text-center">
                        <div className="text-lg font-semibold text-purple-400">{selectedAffiliate.commission_percent}%</div>
                        <div className="text-sm text-gray-400">Comisión</div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-400">Enlace de Referido</label>
                      <div className="mt-1 p-3 bg-gray-900 rounded-lg font-mono text-sm text-gray-100">
                        https://prompthub.com/?ref={selectedAffiliate.ref_code}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-400">Método de Pago</label>
                      <div className="font-medium text-gray-100">
                        {selectedAffiliate.payout_method || 'No configurado'}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}