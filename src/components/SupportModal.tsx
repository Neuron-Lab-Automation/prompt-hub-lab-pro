import React, { useState } from 'react';
import { X, MessageSquare, Send, AlertTriangle, Bug, Lightbulb, CreditCard, HelpCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { useToast } from '../hooks/useToast';
import { SupportTicket } from '../types';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTicket: (ticket: Omit<SupportTicket, 'id' | 'created_at' | 'updated_at' | 'status' | 'last_response_at'>) => void;
}

export function SupportModal({ isOpen, onClose, onCreateTicket }: SupportModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    category: 'general' as SupportTicket['category'],
    priority: 'medium' as SupportTicket['priority'],
  });

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

  const categoryOptions = [
    { value: 'billing', label: 'Facturación y Pagos', icon: CreditCard, description: 'Problemas con pagos, facturas o suscripciones' },
    { value: 'technical', label: 'Problema Técnico', icon: AlertTriangle, description: 'Errores, fallos o problemas de funcionamiento' },
    { value: 'feature_request', label: 'Solicitud de Función', icon: Lightbulb, description: 'Sugerencias de nuevas características' },
    { value: 'bug_report', label: 'Reporte de Bug', icon: Bug, description: 'Errores o comportamientos inesperados' },
    { value: 'general', label: 'Consulta General', icon: HelpCircle, description: 'Preguntas generales o ayuda' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Baja', description: 'No es urgente, puede esperar' },
    { value: 'medium', label: 'Media', description: 'Importante pero no crítico' },
    { value: 'high', label: 'Alta', description: 'Necesita atención pronto' },
    { value: 'urgent', label: 'Urgente', description: 'Crítico, necesita atención inmediata' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.warning('Campos requeridos', 'Por favor completa el asunto y mensaje');
      return;
    }

    onCreateTicket({
      user_id: 'current-user-id', // This would be the actual user ID
      subject: formData.subject.trim(),
      message: formData.message.trim(),
      category: formData.category,
      priority: formData.priority,
    });

    toast.success('Ticket creado', 'Tu consulta ha sido enviada. Te responderemos pronto.');
    
    // Reset form
    setFormData({
      subject: '',
      message: '',
      category: 'general',
      priority: 'medium',
    });
    
    onClose();
  };

  const selectedCategory = categoryOptions.find(c => c.value === formData.category);
  const selectedPriority = priorityOptions.find(p => p.value === formData.priority);

  const getPriorityColor = (priority: string) => {
    const colors = {
      urgent: 'text-red-400',
      high: 'text-orange-400',
      medium: 'text-blue-400',
      low: 'text-gray-400',
    };
    return colors[priority as keyof typeof colors] || 'text-gray-400';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-100">Contactar Soporte</h2>
              <p className="text-sm text-gray-400">Envíanos tu consulta y te ayudaremos</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Tipo de Consulta
              </label>
              <div className="grid grid-cols-1 gap-3">
                {categoryOptions.map((category) => {
                  const Icon = category.icon;
                  return (
                    <div
                      key={category.value}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        formData.category === category.value
                          ? 'border-blue-500 bg-blue-900/20'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      onClick={() => setFormData({ ...formData, category: category.value })}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-blue-400" />
                        <div>
                          <div className="font-medium text-gray-100">{category.label}</div>
                          <div className="text-sm text-gray-400">{category.description}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Prioridad
              </label>
              <Select
                options={priorityOptions.map(p => ({ value: p.value, label: p.label }))}
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as SupportTicket['priority'] })}
              />
              {selectedPriority && (
                <div className="text-xs text-gray-400 mt-1">
                  {selectedPriority.description}
                </div>
              )}
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Asunto *
              </label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Describe brevemente tu problema o consulta"
                required
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mensaje *
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Describe detalladamente tu problema, incluye pasos para reproducirlo si es un error técnico..."
                className="w-full h-32 p-3 border border-gray-600 bg-gray-900 text-gray-100 rounded-lg resize-none focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
              <div className="text-xs text-gray-400 mt-1">
                {formData.message.length}/1000 caracteres
              </div>
            </div>

            {/* Summary */}
            <Card className="border-blue-500/30 bg-blue-900/10">
              <CardContent className="p-4">
                <div className="text-sm text-blue-200 mb-2">Resumen de tu consulta:</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-300">Categoría:</span>
                    <Badge variant="outline">{selectedCategory?.label}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-300">Prioridad:</span>
                    <Badge variant="outline" className={getPriorityColor(formData.priority)}>
                      {selectedPriority?.label}
                    </Badge>
                  </div>
                  <div className="text-xs text-blue-300 mt-2">
                    Tiempo de respuesta estimado: {
                      formData.priority === 'urgent' ? '< 2 horas' :
                      formData.priority === 'high' ? '< 8 horas' :
                      formData.priority === 'medium' ? '< 24 horas' :
                      '< 48 horas'
                    }
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="submit"
                className="flex-1 flex items-center gap-2"
                disabled={!formData.subject.trim() || !formData.message.trim()}
              >
                <Send className="h-4 w-4" />
                Enviar Consulta
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}