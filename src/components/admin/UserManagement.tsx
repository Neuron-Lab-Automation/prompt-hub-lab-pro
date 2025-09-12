import React, { useState } from 'react';
import { Users, Search, Filter, Edit, Trash2, Crown, Shield, Eye, Ban, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { formatDate, formatNumber } from '../../lib/utils';
import { User, Role } from '../../types';

interface UserManagementProps {
  users: User[];
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onChangeRole: (userId: string, role: Role) => void;
  onBanUser: (userId: string) => void;
}

export function UserManagement({ users, onEditUser, onDeleteUser, onChangeRole, onBanUser }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const ITEMS_PER_PAGE = 10;

  const roleOptions = [
    { value: 'all', label: 'Todos los roles' },
    { value: 'superadmin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'editor', label: 'Editor' },
    { value: 'viewer', label: 'Viewer' },
    { value: 'user', label: 'Usuario' },
  ];

  const planOptions = [
    { value: 'all', label: 'Todos los planes' },
    { value: 'starter', label: 'Starter' },
    { value: 'pro', label: 'Pro' },
    { value: 'enterprise', label: 'Enterprise' },
  ];

  const sortOptions = [
    { value: 'created_at', label: 'Fecha de registro' },
    { value: 'updated_at', label: 'Última actividad' },
    { value: 'tokens_used', label: 'Tokens usados' },
    { value: 'name', label: 'Nombre' },
    { value: 'email', label: 'Email' },
  ];

  // Filter and sort users
  const filteredUsers = React.useMemo(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Plan filter
    if (planFilter !== 'all') {
      filtered = filtered.filter(user => user.plan_id === planFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'updated_at':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'tokens_used':
          return b.tokens_used - a.tokens_used;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'email':
          return a.email.localeCompare(b.email);
        default:
          return 0;
      }
    });

    return filtered;
  }, [users, searchTerm, roleFilter, planFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getRoleBadge = (role: Role) => {
    const roleConfig = {
      superadmin: { variant: 'destructive' as const, icon: Crown, label: 'Super Admin' },
      admin: { variant: 'destructive' as const, icon: Shield, label: 'Admin' },
      editor: { variant: 'default' as const, icon: Edit, label: 'Editor' },
      viewer: { variant: 'secondary' as const, icon: Eye, label: 'Viewer' },
      user: { variant: 'outline' as const, icon: Users, label: 'Usuario' },
    };

    const config = roleConfig[role];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPlanBadge = (planId: string) => {
    const planConfig = {
      starter: { variant: 'outline' as const, label: 'Starter' },
      pro: { variant: 'default' as const, label: 'Pro' },
      enterprise: { variant: 'success' as const, label: 'Enterprise' },
    };

    const config = planConfig[planId as keyof typeof planConfig] || { variant: 'outline' as const, label: planId };

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const getTokenUsageColor = (used: number, limit: number) => {
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return 'text-red-400';
    if (percentage >= 70) return 'text-yellow-400';
    return 'text-green-400';
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedUsers.map(user => user.id));
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} for users:`, selectedUsers);
    // Implement bulk actions
    setSelectedUsers([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Gestión de Usuarios</h1>
            <p className="text-gray-400">{filteredUsers.length} usuarios encontrados</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-4 flex-wrap lg:flex-nowrap">
              <div className="min-w-48">
                <Select
                  options={roleOptions}
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                />
              </div>
              
              <div className="min-w-48">
                <Select
                  options={planOptions}
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                />
              </div>
              
              <div className="min-w-48">
                <Select
                  options={sortOptions}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                />
              </div>
            </div>
          </div>

          {selectedUsers.length > 0 && (
            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-300">
                  {selectedUsers.length} usuarios seleccionados
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('change_role')}>
                    Cambiar Rol
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('change_plan')}>
                    Cambiar Plan
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleBulkAction('ban')}>
                    Suspender
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Lista de Usuarios</span>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                onChange={handleSelectAll}
                className="rounded"
              />
              <span className="text-sm text-gray-400">Seleccionar todos</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900 border-b border-gray-700">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Seleccionar</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Usuario</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Rol</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Plan</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Tokens</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Registro</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Última Actividad</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-gray-100">{user.name}</div>
                        <div className="text-sm text-gray-400">{user.email}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="p-4">
                      {getPlanBadge(user.plan_id)}
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div className={`font-medium ${getTokenUsageColor(user.tokens_used, user.tokens_limit)}`}>
                          {formatNumber(user.tokens_used)} / {formatNumber(user.tokens_limit)}
                        </div>
                        <div className="text-gray-400">
                          {((user.tokens_used / user.tokens_limit) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-400">
                        {formatDate(user.created_at)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-400">
                        {formatDate(user.updated_at)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEditUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onBanUser(user.id)}
                          className="text-yellow-400 hover:text-yellow-300"
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDeleteUser(user.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
                  Mostrando {startIndex + 1} a {Math.min(startIndex + ITEMS_PER_PAGE, filteredUsers.length)} de {filteredUsers.length} usuarios
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
        </CardContent>
      </Card>
    </div>
  );
}