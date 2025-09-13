import React from 'react';
import { Users, DollarSign, Zap, TrendingUp, Settings, Shield, BarChart3, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatNumber, formatCurrency } from '../../lib/utils';

interface AdminDashboardProps {
  users: any[];
  prompts: any[];
  executions: any[];
}

export function AdminDashboard({ users, prompts, executions }: AdminDashboardProps) {
  // Calculate admin metrics
  const metrics = React.useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => {
      const lastActive = new Date(u.updated_at);
      const daysSinceActive = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceActive <= 30;
    }).length;

    const totalPrompts = prompts.length;
    const systemPrompts = prompts.filter(p => p.type === 'system').length;
    const userPrompts = prompts.filter(p => p.type === 'user').length;

    const totalExecutions = executions.length;
    const totalTokensUsed = users.reduce((sum, u) => sum + u.tokens_used, 0);
    const totalRevenue = executions.reduce((sum, e) => sum + e.cost, 0);

    const avgTokensPerUser = totalUsers > 0 ? totalTokensUsed / totalUsers : 0;
    const avgRevenuePerUser = totalUsers > 0 ? totalRevenue / totalUsers : 0;

    // Plan distribution
    const planDistribution = users.reduce((acc, user) => {
      acc[user.plan_id] = (acc[user.plan_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Recent activity (last 7 days)
    const recentExecutions = executions.filter(e => {
      const daysDiff = (Date.now() - new Date(e.created_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    }).length;

    const recentUsers = users.filter(u => {
      const daysDiff = (Date.now() - new Date(u.created_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    }).length;

    return {
      totalUsers,
      activeUsers,
      totalPrompts,
      systemPrompts,
      userPrompts,
      totalExecutions,
      totalTokensUsed,
      totalRevenue,
      avgTokensPerUser,
      avgRevenuePerUser,
      planDistribution,
      recentExecutions,
      recentUsers,
    };
  }, [users, prompts, executions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-gradient-to-r from-red-600 to-orange-600 p-3 rounded-lg">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Panel de Administración</h1>
          <p className="text-gray-400">Gestión y métricas del sistema</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuarios Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-100">{formatNumber(metrics.totalUsers)}</div>
            <div className="text-xs text-gray-400 mt-1">
              {metrics.activeUsers} activos (30d)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Ingresos Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-100">{formatCurrency(metrics.totalRevenue)}</div>
            <div className="text-xs text-gray-400 mt-1">
              {formatCurrency(metrics.avgRevenuePerUser)} por usuario
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Tokens Consumidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-100">{formatNumber(metrics.totalTokensUsed)}</div>
            <div className="text-xs text-gray-400 mt-1">
              {formatNumber(metrics.avgTokensPerUser)} por usuario
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Ejecuciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-100">{formatNumber(metrics.totalExecutions)}</div>
            <div className="text-xs text-gray-400 mt-1">
              {metrics.recentExecutions} últimos 7 días
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Distribución de Contenido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Total Prompts</span>
              <span className="font-semibold text-gray-100">{formatNumber(metrics.totalPrompts)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Prompts Sistema</span>
              <span className="font-semibold text-orange-400">{formatNumber(metrics.systemPrompts)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Prompts Usuario</span>
              <span className="font-semibold text-blue-400">{formatNumber(metrics.userPrompts)}</span>
            </div>
            <div className="pt-2 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Ratio Sistema/Usuario</span>
                <span className="font-semibold text-purple-400">
                  {metrics.userPrompts > 0 ? (metrics.systemPrompts / metrics.userPrompts).toFixed(2) : '0'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Distribución por Planes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(metrics.planDistribution).map(([planId, count]) => {
                const percentage = (count / metrics.totalUsers) * 100;
                const planNames = { starter: 'Starter', pro: 'Pro', enterprise: 'Enterprise' };
                const planColors = { starter: 'bg-gray-500', pro: 'bg-blue-500', enterprise: 'bg-purple-500' };
                
                return (
                  <div key={planId} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${planColors[planId as keyof typeof planColors] || 'bg-gray-500'}`} />
                      <span className="text-gray-300 text-sm">{planNames[planId as keyof typeof planNames] || planId}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{percentage.toFixed(1)}%</span>
                      <span className="font-semibold text-gray-100 min-w-8 text-right">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Actividad Reciente (7 días)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900 p-4 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Nuevos Usuarios</div>
              <div className="text-lg font-semibold text-green-400">{metrics.recentUsers}</div>
              <div className="text-xs text-gray-500">últimos 7 días</div>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Ejecuciones</div>
              <div className="text-lg font-semibold text-blue-400">{formatNumber(metrics.recentExecutions)}</div>
              <div className="text-xs text-gray-500">últimos 7 días</div>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Tasa de Actividad</div>
              <div className="text-lg font-semibold text-purple-400">
                {metrics.totalUsers > 0 ? ((metrics.activeUsers / metrics.totalUsers) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-xs text-gray-500">usuarios activos</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Estado del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <div className="text-sm font-medium text-gray-100">Base de Datos</div>
                <div className="text-xs text-gray-400">Operacional</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <div className="text-sm font-medium text-gray-100">APIs IA</div>
                <div className="text-xs text-gray-400">Todas activas</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div>
                <div className="text-sm font-medium text-gray-100">Edge Functions</div>
                <div className="text-xs text-gray-400">Latencia alta</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <div className="text-sm font-medium text-gray-100">Autenticación</div>
                <div className="text-xs text-gray-400">Operacional</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}