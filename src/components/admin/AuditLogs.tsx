import React, { useState } from 'react';
import { Shield, Search, Filter, Eye, User, Calendar, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatDate } from '../../lib/utils';

interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface AuditLogsProps {
  logs: AuditLog[];
  users: any[];
}

// Mock audit logs data
const mockLogs: AuditLog[] = [
  {
    id: '1',
    user_id: 'user1',
    action: 'CREATE',
    resource_type: 'prompt',
    resource_id: 'prompt123',
    details: { title: 'Nuevo prompt de marketing', category: 'marketing' },
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    user_id: 'admin1',
    action: 'UPDATE',
    resource_type: 'user',
    resource_id: 'user456',
    details: { field: 'role', old_value: 'user', new_value: 'editor' },
    ip_address: '10.0.0.50',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    user_id: null,
    action: 'LOGIN_FAILED',
    resource_type: 'auth',
    resource_id: null,
    details: { email: 'hacker@example.com', reason: 'invalid_credentials' },
    ip_address: '203.0.113.42',
    user_agent: 'curl/7.68.0',
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    user_id: 'admin1',
    action: 'DELETE',
    resource_type: 'prompt',
    resource_id: 'prompt789',
    details: { title: 'Prompt eliminado por violación de políticas' },
    ip_address: '10.0.0.50',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    user_id: 'user2',
    action: 'EXECUTE',
    resource_type: 'prompt',
    resource_id: 'prompt123',
    details: { model: 'gpt-4o', tokens_used: 1500, cost: 0.045 },
    ip_address: '172.16.0.25',
    user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
];

export function AuditLogs({ logs = mockLogs, users }: AuditLogsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [resourceFilter, setResourceFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const ITEMS_PER_PAGE = 20;

  const actionOptions = [
    { value: 'all', label: 'Todas las acciones' },
    { value: 'CREATE', label: 'Crear' },
    { value: 'UPDATE', label: 'Actualizar' },
    { value: 'DELETE', label: 'Eliminar' },
    { value: 'EXECUTE', label: 'Ejecutar' },
    { value: 'LOGIN', label: 'Iniciar sesión' },
    { value: 'LOGIN_FAILED', label: 'Fallo de login' },
    { value: 'LOGOUT', label: 'Cerrar sesión' },
  ];

  const resourceOptions = [
    { value: 'all', label: 'Todos los recursos' },
    { value: 'prompt', label: 'Prompts' },
    { value: 'user', label: 'Usuarios' },
    { value: 'auth', label: 'Autenticación' },
    { value: 'plan', label: 'Planes' },
    { value: 'coupon', label: 'Cupones' },
    { value: 'provider', label: 'Proveedores' },
  ];

  const userOptions = [
    { value: 'all', label: 'Todos los usuarios' },
    { value: 'system', label: 'Sistema' },
    ...users.map(user => ({ value: user.id, label: `${user.name} (${user.email})` })),
  ];

  // Filter logs
  const filteredLogs = React.useMemo(() => {
    let filtered = logs;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.ip_address && log.ip_address.includes(searchTerm)) ||
        JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Action filter
    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    // Resource filter
    if (resourceFilter !== 'all') {
      filtered = filtered.filter(log => log.resource_type === resourceFilter);
    }

    // User filter
    if (userFilter !== 'all') {
      if (userFilter === 'system') {
        filtered = filtered.filter(log => !log.user_id);
      } else {
        filtered = filtered.filter(log => log.user_id === userFilter);
      }
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return filtered;
  }, [logs, searchTerm, actionFilter, resourceFilter, userFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getActionBadge = (action: string) => {
    const actionConfig = {
      CREATE: { variant: 'success' as const, label: 'Crear' },
      UPDATE: { variant: 'default' as const, label: 'Actualizar' },
      DELETE: { variant: 'destructive' as const, label: 'Eliminar' },
      EXECUTE: { variant: 'default' as const, label: 'Ejecutar' },
      LOGIN: { variant: 'success' as const, label: 'Login' },
      LOGIN_FAILED: { variant: 'destructive' as const, label: 'Login Fallido' },
      LOGOUT: { variant: 'outline' as const, label: 'Logout' },
    };

    const config = actionConfig[action as keyof typeof actionConfig] || { variant: 'outline' as const, label: action };

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const getResourceIcon = (resourceType: string) => {
    const icons = {
      prompt: '📝',
      user: '👤',
      auth: '🔐',
      plan: '💰',
      coupon: '🎫',
      provider: '🤖',
    };
    return icons[resourceType as keyof typeof icons] || '📄';
  };

  const getUserName = (userId: string | null) => {
    if (!userId) return 'Sistema';
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Usuario desconocido';
  };

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setShowDetails(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setActionFilter('all');
    setResourceFilter('all');
    setUserFilter('all');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-lg">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Logs de Auditoría</h1>
          <p className="text-gray-400">Registro de todas las actividades del sistema</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar en logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-4 flex-wrap lg:flex-nowrap">
              <div className="min-w-48">
                <Select
                  options={actionOptions}
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                />
              </div>
              
              <div className="min-w-48">
                <Select
                  options={resourceOptions}
                  value={resourceFilter}
                  onChange={(e) => setResourceFilter(e.target.value)}
                />
              </div>
              
              <div className="min-w-48">
                <Select
                  options={userOptions}
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                />
              </div>
              
              <Button
                onClick={clearFilters}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Registro de Actividades</span>
            <span className="text-sm font-normal text-gray-400">
              {filteredLogs.length} entradas encontradas
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900 border-b border-gray-700">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Fecha/Hora</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Usuario</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Acción</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Recurso</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">IP</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Detalles</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                    <td className="p-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-100">
                          {formatDate(log.created_at)}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-100">
                          {getUserName(log.user_id)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getResourceIcon(log.resource_type)}</span>
                        <span className="text-sm text-gray-100 capitalize">
                          {log.resource_type}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm text-gray-400">
                        <Globe className="h-3 w-3" />
                        {log.ip_address || 'N/A'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-400 max-w-xs truncate">
                        {JSON.stringify(log.details)}
                      </div>
                    </td>
                    <td className="p-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewDetails(log)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Mostrando {startIndex + 1} a {Math.min(startIndex + ITEMS_PER_PAGE, filteredLogs.length)} de {filteredLogs.length} entradas
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <span className="px-3 py-1 text-sm text-gray-400">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </div>
          )}

          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                No se encontraron logs
              </h3>
              <p className="text-gray-400">
                {searchTerm || actionFilter !== 'all' || resourceFilter !== 'all' || userFilter !== 'all'
                  ? 'Intenta cambiar los filtros de búsqueda'
                  : 'Aún no hay actividad registrada'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Details Modal */}
      {showDetails && selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDetails(false)} />
          <div className="relative bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-100">Detalles del Log</h2>
                <Button variant="ghost" onClick={() => setShowDetails(false)}>
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">ID del Log</label>
                    <div className="font-mono text-sm text-gray-100">{selectedLog.id}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Fecha y Hora</label>
                    <div className="font-medium text-gray-100">{formatDate(selectedLog.created_at)}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Usuario</label>
                    <div className="font-medium text-gray-100">{getUserName(selectedLog.user_id)}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Acción</label>
                    <div>{getActionBadge(selectedLog.action)}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Tipo de Recurso</label>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getResourceIcon(selectedLog.resource_type)}</span>
                      <span className="font-medium text-gray-100 capitalize">{selectedLog.resource_type}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">ID del Recurso</label>
                    <div className="font-mono text-sm text-gray-100">{selectedLog.resource_id || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Dirección IP</label>
                    <div className="font-mono text-sm text-gray-100">{selectedLog.ip_address || 'N/A'}</div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400">User Agent</label>
                  <div className="mt-1 p-3 bg-gray-900 rounded-lg font-mono text-xs text-gray-100 break-all">
                    {selectedLog.user_agent || 'N/A'}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400">Detalles</label>
                  <div className="mt-1 p-3 bg-gray-900 rounded-lg">
                    <pre className="text-xs text-gray-100 whitespace-pre-wrap">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}