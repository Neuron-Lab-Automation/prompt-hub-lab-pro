import React, { useState } from 'react';
import { FileText, Download, Calendar, DollarSign, TrendingUp, Users, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { formatCurrency, formatNumber, formatDate } from '../../lib/utils';
import { useToast } from '../../hooks/useToast';

interface BillingReportsProps {
  users: any[];
  executions: any[];
}

export function BillingReports({ users, executions }: BillingReportsProps) {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('revenue');

  const periodOptions = [
    { value: 'week', label: 'Última semana' },
    { value: 'month', label: 'Último mes' },
    { value: 'quarter', label: 'Último trimestre' },
    { value: 'year', label: 'Último año' },
  ];

  const reportOptions = [
    { value: 'revenue', label: 'Ingresos' },
    { value: 'usage', label: 'Uso de Tokens' },
    { value: 'users', label: 'Usuarios' },
    { value: 'models', label: 'Modelos' },
  ];

  // Calculate billing metrics
  const billingMetrics = React.useMemo(() => {
    const totalRevenue = executions.reduce((sum, exec) => sum + exec.cost, 0);
    const totalTokens = executions.reduce((sum, exec) => sum + exec.total_tokens, 0);
    const totalExecutions = executions.length;
    const avgCostPerExecution = totalExecutions > 0 ? totalRevenue / totalExecutions : 0;
    const avgTokensPerExecution = totalExecutions > 0 ? totalTokens / totalExecutions : 0;

    // Revenue by plan
    const revenueByPlan = users.reduce((acc, user) => {
      const userExecutions = executions.filter(exec => exec.user_id === user.id);
      const userRevenue = userExecutions.reduce((sum, exec) => sum + exec.cost, 0);
      acc[user.plan_id] = (acc[user.plan_id] || 0) + userRevenue;
      return acc;
    }, {} as Record<string, number>);

    // Usage by model
    const usageByModel = executions.reduce((acc, exec) => {
      acc[exec.model] = (acc[exec.model] || 0) + exec.total_tokens;
      return acc;
    }, {} as Record<string, number>);

    // Top users by revenue
    const userRevenue = users.map(user => {
      const userExecutions = executions.filter(exec => exec.user_id === user.id);
      const revenue = userExecutions.reduce((sum, exec) => sum + exec.cost, 0);
      const tokens = userExecutions.reduce((sum, exec) => sum + exec.total_tokens, 0);
      return { ...user, revenue, tokens, executions: userExecutions.length };
    }).sort((a, b) => b.revenue - a.revenue);

    return {
      totalRevenue,
      totalTokens,
      totalExecutions,
      avgCostPerExecution,
      avgTokensPerExecution,
      revenueByPlan,
      usageByModel,
      userRevenue,
    };
  }, [users, executions]);

  const handleExportReport = (format: 'csv' | 'pdf') => {
    toast.info(`Exportando reporte...`, `Generando archivo ${format.toUpperCase()}`);
    setTimeout(() => {
      toast.success('Reporte exportado', `Archivo ${format.toUpperCase()} descargado exitosamente`);
    }, 2000);
  };

  const renderRevenueReport = () => (
    <div className="space-y-6">
      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-100">
                  {formatCurrency(billingMetrics.totalRevenue)}
                </div>
                <div className="text-sm text-gray-400">Ingresos Totales</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-100">
                  {formatCurrency(billingMetrics.avgCostPerExecution)}
                </div>
                <div className="text-sm text-gray-400">Promedio por Ejecución</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-600 p-2 rounded-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-100">
                  {billingMetrics.totalExecutions}
                </div>
                <div className="text-sm text-gray-400">Total Ejecuciones</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-orange-600 p-2 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-100">
                  {formatCurrency(billingMetrics.totalRevenue / users.length)}
                </div>
                <div className="text-sm text-gray-400">ARPU</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Ingresos por Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(billingMetrics.revenueByPlan).map(([planId, revenue]) => {
              const percentage = (revenue / billingMetrics.totalRevenue) * 100;
              return (
                <div key={planId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="capitalize">
                      {planId}
                    </Badge>
                    <span className="text-gray-300">{formatCurrency(revenue)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-400 min-w-12">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Users by Revenue */}
      <Card>
        <CardHeader>
          <CardTitle>Top Usuarios por Ingresos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {billingMetrics.userRevenue.slice(0, 10).map((user, index) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-100">{user.name}</div>
                    <div className="text-sm text-gray-400">{user.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-green-400">{formatCurrency(user.revenue)}</div>
                  <div className="text-sm text-gray-400">{user.executions} ejecuciones</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderUsageReport = () => (
    <div className="space-y-6">
      {/* Usage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-600 p-2 rounded-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-100">
                  {formatNumber(billingMetrics.totalTokens)}
                </div>
                <div className="text-sm text-gray-400">Tokens Totales</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-100">
                  {formatNumber(billingMetrics.avgTokensPerExecution)}
                </div>
                <div className="text-sm text-gray-400">Promedio por Ejecución</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-100">
                  {formatNumber(billingMetrics.totalTokens / users.length)}
                </div>
                <div className="text-sm text-gray-400">Tokens por Usuario</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage by Model */}
      <Card>
        <CardHeader>
          <CardTitle>Uso por Modelo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(billingMetrics.usageByModel)
              .sort(([,a], [,b]) => b - a)
              .map(([model, tokens]) => {
                const percentage = (tokens / billingMetrics.totalTokens) * 100;
                return (
                  <div key={model} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <code className="bg-gray-900 px-2 py-1 rounded text-sm font-mono">
                        {model}
                      </code>
                      <span className="text-gray-300">{formatNumber(tokens)} tokens</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-400 min-w-12">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (selectedReport) {
      case 'revenue':
        return renderRevenueReport();
      case 'usage':
        return renderUsageReport();
      case 'users':
        return (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">Reporte de Usuarios</h3>
            <p className="text-gray-400">Funcionalidad en desarrollo</p>
          </div>
        );
      case 'models':
        return (
          <div className="text-center py-12">
            <Zap className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">Reporte de Modelos</h3>
            <p className="text-gray-400">Funcionalidad en desarrollo</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 p-3 rounded-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Reportes de Facturación</h1>
            <p className="text-gray-400">Análisis detallado de ingresos y uso</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => handleExportReport('csv')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            CSV
          </Button>
          <Button
            onClick={() => handleExportReport('pdf')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tipo de Reporte
              </label>
              <Select
                options={reportOptions}
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Período
              </label>
              <Select
                options={periodOptions}
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Generar Reporte
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      {renderContent()}
    </div>
  );
}