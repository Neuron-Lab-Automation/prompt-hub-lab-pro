import React, { useState } from 'react';
import { MessageSquare, Plus, Eye, MessageCircle, Clock, AlertTriangle, CheckCircle, User, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { formatDate } from '../../lib/utils';
import { SupportTicket, SupportResponse } from '../../types';
import { useToast } from '../../hooks/useToast';

interface SupportTicketsProps {
  tickets: SupportTicket[];
  users: any[];
  onUpdateTicket: (ticketId: string, updates: Partial<SupportTicket>) => void;
  onAddResponse: (ticketId: string, response: Omit<SupportResponse, 'id' | 'created_at'>) => void;
}

// Mock tickets data
const mockTickets: SupportTicket[] = [
  {
    id: 'ticket1',
    user_id: 'user1',
    subject: 'No puedo acceder a mi cuenta después del pago',
    message: 'Hola, realicé el pago hace 2 horas pero aún no puedo acceder a las funciones premium. ¿Podrían ayudarme?',
    category: 'billing',
    priority: 'high',
    status: 'open',
    created_at: '2025-01-20T10:30:00Z',
    updated_at: '2025-01-20T10:30:00Z',
  },
  {
    id: 'ticket2',
    user_id: 'user2',
    subject: 'Error al ejecutar prompts con GPT-4',
    message: 'Cuando intento ejecutar prompts con GPT-4 me sale un error 500. Funciona bien con otros modelos.',
    category: 'technical',
    priority: 'medium',
    status: 'in_progress',
    assigned_to: 'admin1',
    created_at: '2025-01-19T14:20:00Z',
    updated_at: '2025-01-20T09:15:00Z',
    last_response_at: '2025-01-20T09:15:00Z',
  },
  {
    id: 'ticket3',
    user_id: 'user3',
    subject: 'Solicitud de nueva funcionalidad: Exportar prompts',
    message: 'Sería genial poder exportar mis prompts a un archivo JSON o CSV para hacer backup.',
    category: 'feature_request',
    priority: 'low',
    status: 'waiting_response',
    assigned_to: 'admin1',
    created_at: '2025-01-18T16:45:00Z',
    updated_at: '2025-01-19T11:30:00Z',
    last_response_at: '2025-01-19T11:30:00Z',
  },
];

export function SupportTickets({ tickets = mockTickets, users, onUpdateTicket, onAddResponse }: SupportTicketsProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showTicketDetails, setShowTicketDetails] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  const categoryOptions = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'billing', label: 'Facturación' },
    { value: 'technical', label: 'Técnico' },
    { value: 'feature_request', label: 'Solicitud de Función' },
    { value: 'bug_report', label: 'Reporte de Bug' },
    { value: 'general', label: 'General' },
  ];

  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'open', label: 'Abierto' },
    { value: 'in_progress', label: 'En Progreso' },
    { value: 'waiting_response', label: 'Esperando Respuesta' },
    { value: 'resolved', label: 'Resuelto' },
    { value: 'closed', label: 'Cerrado' },
  ];

  const priorityOptions = [
    { value: 'all', label: 'Todas las prioridades' },
    { value: 'urgent', label: 'Urgente' },
    { value: 'high', label: 'Alta' },
    { value: 'medium', label: 'Media' },
    { value: 'low', label: 'Baja' },
  ];

  // Filter tickets
  const filteredTickets = React.useMemo(() => {
    let filtered = tickets;

    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.priority === priorityFilter);
    }

    return filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }, [tickets, searchTerm, categoryFilter, statusFilter, priorityFilter]);

  const getStatusBadge = (status: SupportTicket['status']) => {
    const statusConfig = {
      open: { variant: 'destructive' as const, label: 'Abierto' },
      in_progress: { variant: 'default' as const, label: 'En Progreso' },
      waiting_response: { variant: 'warning' as const, label: 'Esperando' },
      resolved: { variant: 'success' as const, label: 'Resuelto' },
      closed: { variant: 'outline' as const, label: 'Cerrado' },
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: SupportTicket['priority']) => {
    const priorityConfig = {
      urgent: { variant: 'destructive' as const, label: 'Urgente', color: 'text-red-400' },
      high: { variant: 'warning' as const, label: 'Alta', color: 'text-orange-400' },
      medium: { variant: 'default' as const, label: 'Media', color: 'text-blue-400' },
      low: { variant: 'outline' as const, label: 'Baja', color: 'text-gray-400' },
    };

    const config = priorityConfig[priority];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getCategoryIcon = (category: SupportTicket['category']) => {
    const icons = {
      billing: '💳',
      technical: '🔧',
      feature_request: '💡',
      bug_report: '🐛',
      general: '💬',
    };
    return icons[category] || '📄';
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Usuario desconocido';
  };

  const getUserEmail = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.email : 'email@desconocido.com';
  };

  const handleViewTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setShowTicketDetails(true);
  };

  const handleAddResponse = () => {
    if (!selectedTicket || !responseMessage.trim()) return;

    onAddResponse(selectedTicket.id, {
      ticket_id: selectedTicket.id,
      user_id: 'admin1', // Current admin user
      message: responseMessage.trim(),
      is_internal: isInternal,
    });

    // Update ticket status
    onUpdateTicket(selectedTicket.id, {
      status: 'waiting_response',
      last_response_at: new Date().toISOString(),
    });

    setResponseMessage('');
    setIsInternal(false);
    toast.success('Respuesta enviada', 'La respuesta ha sido enviada al usuario');
  };

  const handleStatusChange = (ticketId: string, newStatus: SupportTicket['status']) => {
    onUpdateTicket(ticketId, { status: newStatus });
    toast.success('Estado actualizado', `Ticket marcado como ${newStatus}`);
  };

  // Calculate stats
  const stats = React.useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'open').length;
    const inProgress = tickets.filter(t => t.status === 'in_progress').length;
    const urgent = tickets.filter(t => t.priority === 'urgent').length;
    const avgResponseTime = 2.5; // Mock - in real app calculate from response times

    return { total, open, inProgress, urgent, avgResponseTime };
  }, [tickets]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-lg">
          <MessageSquare className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Tickets de Soporte</h1>
          <p className="text-gray-400">Gestionar consultas y problemas de usuarios</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-100">{stats.total}</div>
                <div className="text-sm text-gray-400">Total Tickets</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-red-600 p-2 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-100">{stats.open}</div>
                <div className="text-sm text-gray-400">Abiertos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-600 p-2 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-100">{stats.inProgress}</div>
                <div className="text-sm text-gray-400">En Progreso</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-600 p-2 rounded-lg">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-100">{stats.avgResponseTime}h</div>
                <div className="text-sm text-gray-400">Tiempo Respuesta</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-4 flex-wrap lg:flex-nowrap">
              <div className="min-w-48">
                <Select
                  options={categoryOptions}
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                />
              </div>
              
              <div className="min-w-48">
                <Select
                  options={statusOptions}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                />
              </div>
              
              <div className="min-w-48">
                <Select
                  options={priorityOptions}
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Tickets</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900 border-b border-gray-700">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Ticket</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Usuario</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Categoría</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Prioridad</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Estado</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Creado</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                    <td className="p-4">
                      <div className="max-w-xs">
                        <div className="font-medium text-gray-100 truncate">{ticket.subject}</div>
                        <div className="text-sm text-gray-400 truncate">
                          {ticket.message.substring(0, 60)}...
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-100">{getUserName(ticket.user_id)}</div>
                          <div className="text-xs text-gray-400">{getUserEmail(ticket.user_id)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getCategoryIcon(ticket.category)}</span>
                        <span className="text-sm text-gray-300 capitalize">
                          {ticket.category.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      {getPriorityBadge(ticket.priority)}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(ticket.status)}
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-400">
                        {formatDate(ticket.created_at)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewTicket(ticket)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatusChange(ticket.id, 'resolved')}
                          disabled={ticket.status === 'resolved' || ticket.status === 'closed'}
                          className="text-green-400 hover:text-green-300"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTickets.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                No se encontraron tickets
              </h3>
              <p className="text-gray-400">
                {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Intenta cambiar los filtros de búsqueda'
                  : 'Aún no hay tickets de soporte'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ticket Details Modal */}
      {showTicketDetails && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowTicketDetails(false)} />
          <div className="relative bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-100">Ticket #{selectedTicket.id.slice(-6)}</h2>
                <Button variant="ghost" onClick={() => setShowTicketDetails(false)}>
                  ×
                </Button>
              </div>
              
              <div className="space-y-6">
                {/* Ticket Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-100 mb-3">Información del Ticket</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-400">Asunto</label>
                        <div className="font-medium text-gray-100">{selectedTicket.subject}</div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Usuario</label>
                        <div className="font-medium text-gray-100">
                          {getUserName(selectedTicket.user_id)} ({getUserEmail(selectedTicket.user_id)})
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-400">Categoría</label>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-lg">{getCategoryIcon(selectedTicket.category)}</span>
                            <span className="capitalize">{selectedTicket.category.replace('_', ' ')}</span>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm text-gray-400">Prioridad</label>
                          <div className="mt-1">{getPriorityBadge(selectedTicket.priority)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-100 mb-3">Estado y Asignación</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-400">Estado Actual</label>
                        <div className="mt-1">{getStatusBadge(selectedTicket.status)}</div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Asignado a</label>
                        <div className="font-medium text-gray-100">
                          {selectedTicket.assigned_to ? getUserName(selectedTicket.assigned_to) : 'Sin asignar'}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Creado</label>
                        <div className="font-medium text-gray-100">{formatDate(selectedTicket.created_at)}</div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Última respuesta</label>
                        <div className="font-medium text-gray-100">
                          {selectedTicket.last_response_at ? formatDate(selectedTicket.last_response_at) : 'Sin respuestas'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Original Message */}
                <div>
                  <h3 className="text-lg font-medium text-gray-100 mb-3">Mensaje Original</h3>
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <div className="text-gray-100 whitespace-pre-wrap">{selectedTicket.message}</div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(selectedTicket.id, 'in_progress')}
                    disabled={selectedTicket.status === 'in_progress'}
                  >
                    Marcar En Progreso
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(selectedTicket.id, 'waiting_response')}
                    disabled={selectedTicket.status === 'waiting_response'}
                  >
                    Esperando Respuesta
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(selectedTicket.id, 'resolved')}
                    disabled={selectedTicket.status === 'resolved'}
                    className="text-green-400 hover:text-green-300"
                  >
                    Resolver
                  </Button>
                </div>

                {/* Add Response */}
                <div>
                  <h3 className="text-lg font-medium text-gray-100 mb-3">Añadir Respuesta</h3>
                  <div className="space-y-4">
                    <textarea
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      placeholder="Escribe tu respuesta al usuario..."
                      className="w-full h-32 p-3 border border-gray-600 bg-gray-900 text-gray-100 rounded-lg resize-none focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="is_internal"
                          checked={isInternal}
                          onChange={(e) => setIsInternal(e.target.checked)}
                          className="rounded"
                        />
                        <label htmlFor="is_internal" className="text-sm text-gray-300">
                          Nota interna (no se envía al usuario)
                        </label>
                      </div>
                      
                      <Button
                        onClick={handleAddResponse}
                        disabled={!responseMessage.trim()}
                        className="flex items-center gap-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Enviar Respuesta
                      </Button>
                    </div>
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