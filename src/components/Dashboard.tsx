import React from 'react';
import { BarChart3, TrendingUp, Eye, Copy, Heart, Zap, Users, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { formatNumber, formatDate } from '../lib/utils';
import { Prompt } from '../types';

interface DashboardProps {
  prompts: Prompt[];
}

export function Dashboard({ prompts }: DashboardProps) {
  // Calculate analytics data
  const analytics = React.useMemo(() => {
    const totalPrompts = prompts.length;
    const favoritePrompts = prompts.filter(p => p.is_favorite).length;
    const systemPrompts = prompts.filter(p => p.type === 'system').length;
    const userPrompts = prompts.filter(p => p.type === 'user').length;
    
    const totalVisits = prompts.reduce((sum, p) => sum + p.stats.visits, 0);
    const totalCopies = prompts.reduce((sum, p) => sum + p.stats.copies, 0);
    const totalTokensEs = prompts.reduce((sum, p) => sum + p.stats.tokens_es, 0);
    const totalTokensEn = prompts.reduce((sum, p) => sum + p.stats.tokens_en, 0);
    const totalImprovements = prompts.reduce((sum, p) => sum + p.stats.improvements, 0);
    const totalTranslations = prompts.reduce((sum, p) => sum + p.stats.translations, 0);
    
    const avgCTR = prompts.length > 0 
      ? prompts.reduce((sum, p) => sum + p.stats.ctr, 0) / prompts.length 
      : 0;

    // Top prompts by different metrics
    const topByVisits = [...prompts].sort((a, b) => b.stats.visits - a.stats.visits).slice(0, 5);
    const topByCopies = [...prompts].sort((a, b) => b.stats.copies - a.stats.copies).slice(0, 5);
    const topByCTR = [...prompts].sort((a, b) => b.stats.ctr - a.stats.ctr).slice(0, 5);
    
    // Category distribution
    const categoryStats = prompts.reduce((acc, prompt) => {
      acc[prompt.category] = (acc[prompt.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Recent activity (last 7 days simulation)
    const recentPrompts = prompts.filter(p => {
      const daysDiff = Math.floor((Date.now() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 7;
    });

    return {
      totalPrompts,
      favoritePrompts,
      systemPrompts,
      userPrompts,
      totalVisits,
      totalCopies,
      totalTokensEs,
      totalTokensEn,
      totalImprovements,
      totalTranslations,
      avgCTR,
      topByVisits,
      topByCopies,
      topByCTR,
      categoryStats,
      recentPrompts: recentPrompts.length,
    };
  }, [prompts]);

  const categories = [
    { id: '1', name: 'Escritura', color: 'bg-blue-500' },
    { id: '2', name: 'Análisis', color: 'bg-green-500' },
    { id: '3', name: 'Código', color: 'bg-purple-500' },
    { id: '4', name: 'Marketing', color: 'bg-orange-500' },
    { id: '5', name: 'Educación', color: 'bg-indigo-500' },
    { id: '6', name: 'Creatividad', color: 'bg-pink-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-lg">
          <BarChart3 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Dashboard Analytics</h1>
          <p className="text-gray-400">Estadísticas y métricas de tus prompts</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Total Prompts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-100">{analytics.totalPrompts}</div>
            <div className="text-xs text-gray-400 mt-1">
              {analytics.userPrompts} propios • {analytics.systemPrompts} sistema
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Total Visitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-100">{formatNumber(analytics.totalVisits)}</div>
            <div className="text-xs text-gray-400 mt-1">
              {formatNumber(analytics.totalCopies)} copias • {analytics.avgCTR.toFixed(1)}% CTR
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Favoritos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-100">{analytics.favoritePrompts}</div>
            <div className="text-xs text-gray-400 mt-1">
              {((analytics.favoritePrompts / analytics.totalPrompts) * 100).toFixed(1)}% del total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-100">{analytics.recentPrompts}</div>
            <div className="text-xs text-gray-400 mt-1">
              Últimos 7 días
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Token Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Estadísticas de Tokens
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Tokens Español</span>
              <span className="font-semibold text-gray-100">{formatNumber(analytics.totalTokensEs)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Tokens English</span>
              <span className="font-semibold text-gray-100">{formatNumber(analytics.totalTokensEn)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Total Tokens</span>
              <span className="font-semibold text-blue-400">{formatNumber(analytics.totalTokensEs + analytics.totalTokensEn)}</span>
            </div>
            <div className="pt-2 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Mejoras Realizadas</span>
                <span className="font-semibold text-green-400">{analytics.totalImprovements}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Traducciones</span>
                <span className="font-semibold text-purple-400">{analytics.totalTranslations}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Distribución por Categorías
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categories.map(category => {
                const count = analytics.categoryStats[category.id] || 0;
                const percentage = analytics.totalPrompts > 0 ? (count / analytics.totalPrompts) * 100 : 0;
                
                return (
                  <div key={category.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${category.color}`} />
                      <span className="text-gray-300 text-sm">{category.name}</span>
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

      {/* Top Prompts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top by Visits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Eye className="h-4 w-4" />
              Más Visitados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topByVisits.map((prompt, index) => (
                <div key={prompt.id} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-100 truncate">
                      {prompt.title}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatNumber(prompt.stats.visits)} visitas
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top by Copies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Copy className="h-4 w-4" />
              Más Copiados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topByCopies.map((prompt, index) => (
                <div key={prompt.id} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-100 truncate">
                      {prompt.title}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatNumber(prompt.stats.copies)} copias
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top by CTR */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              Mejor CTR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topByCTR.map((prompt, index) => (
                <div key={prompt.id} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-100 truncate">
                      {prompt.title}
                    </div>
                    <div className="text-xs text-gray-400">
                      {prompt.stats.ctr.toFixed(1)}% CTR
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Insights de Rendimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-900 p-4 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Promedio de Visitas</div>
              <div className="text-lg font-semibold text-gray-100">
                {formatNumber(Math.round(analytics.totalVisits / analytics.totalPrompts))}
              </div>
              <div className="text-xs text-gray-500">por prompt</div>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Promedio de Copias</div>
              <div className="text-lg font-semibold text-gray-100">
                {formatNumber(Math.round(analytics.totalCopies / analytics.totalPrompts))}
              </div>
              <div className="text-xs text-gray-500">por prompt</div>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">CTR Promedio</div>
              <div className="text-lg font-semibold text-gray-100">
                {analytics.avgCTR.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">conversión</div>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Tokens Promedio</div>
              <div className="text-lg font-semibold text-gray-100">
                {formatNumber(Math.round((analytics.totalTokensEs + analytics.totalTokensEn) / analytics.totalPrompts / 2))}
              </div>
              <div className="text-xs text-gray-500">por idioma</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}