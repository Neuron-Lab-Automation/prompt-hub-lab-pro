import React, { useState } from 'react';
import { Mail, Plus, Edit, Trash2, Send, Eye, Settings, Code, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { formatDate } from '../../lib/utils';
import { EmailTemplate } from '../../types';
import { useToast } from '../../hooks/useToast';

interface EmailTemplatesProps {
  templates: EmailTemplate[];
  onCreateTemplate: (template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>) => void;
  onUpdateTemplate: (templateId: string, updates: Partial<EmailTemplate>) => void;
  onDeleteTemplate: (templateId: string) => void;
  onTestTemplate: (templateId: string) => void;
}

export function EmailTemplates({
  templates,
  onCreateTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onTestTemplate,
}: EmailTemplatesProps) {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    html_content: '',
    text_content: '',
    variables: [] as string[],
    type: 'custom' as EmailTemplate['type'],
    active: true,
  });

  const [variableInput, setVariableInput] = useState('');

  const typeOptions = [
    { value: 'welcome', label: 'Bienvenida' },
    { value: 'payment_confirmation', label: 'Confirmación de Pago' },
    { value: 'access_granted', label: 'Acceso Concedido' },
    { value: 'support_response', label: 'Respuesta de Soporte' },
    { value: 'custom', label: 'Personalizada' },
  ];

  const defaultTemplates = {
    welcome: {
      subject: 'Bienvenido a PromptHub - Tu cuenta está lista',
      html_content: `<h1>¡Bienvenido a PromptHub, {{user_name}}!</h1>
<p>Tu cuenta ha sido creada exitosamente. Ya puedes empezar a optimizar tus prompts de IA.</p>
<p><strong>Detalles de tu cuenta:</strong></p>
<ul>
  <li>Email: {{user_email}}</li>
  <li>Plan: {{plan_name}}</li>
  <li>Tokens incluidos: {{tokens_limit}}</li>
</ul>
<p><a href="{{login_url}}" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Acceder a PromptHub</a></p>`,
      text_content: `¡Bienvenido a PromptHub, {{user_name}}!

Tu cuenta ha sido creada exitosamente. Ya puedes empezar a optimizar tus prompts de IA.

Detalles de tu cuenta:
- Email: {{user_email}}
- Plan: {{plan_name}}
- Tokens incluidos: {{tokens_limit}}

Accede aquí: {{login_url}}`,
      variables: ['user_name', 'user_email', 'plan_name', 'tokens_limit', 'login_url'],
    },
    payment_confirmation: {
      subject: 'Pago confirmado - {{amount}} procesado exitosamente',
      html_content: `<h1>¡Pago confirmado!</h1>
<p>Hola {{user_name}}, tu pago ha sido procesado exitosamente.</p>
<p><strong>Detalles del pago:</strong></p>
<ul>
  <li>Monto: {{amount}}</li>
  <li>Tokens añadidos: {{tokens_purchased}}</li>
  <li>Método de pago: {{payment_method}}</li>
  <li>ID de transacción: {{transaction_id}}</li>
</ul>
<p>Tus tokens ya están disponibles en tu cuenta.</p>`,
      text_content: `¡Pago confirmado!

Hola {{user_name}}, tu pago ha sido procesado exitosamente.

Detalles del pago:
- Monto: {{amount}}
- Tokens añadidos: {{tokens_purchased}}
- Método de pago: {{payment_method}}
- ID de transacción: {{transaction_id}}

Tus tokens ya están disponibles en tu cuenta.`,
      variables: ['user_name', 'amount', 'tokens_purchased', 'payment_method', 'transaction_id'],
    },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTemplate) {
      onUpdateTemplate(editingTemplate.id, formData);
      toast.success('Plantilla actualizada', `"${formData.name}" actualizada exitosamente`);
      setEditingTemplate(null);
    } else {
      onCreateTemplate(formData);
      toast.success('Plantilla creada', `"${formData.name}" creada exitosamente`);
      setIsCreating(false);
    }
    
    resetForm();
  };

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      html_content: template.html_content,
      text_content: template.text_content,
      variables: [...template.variables],
      type: template.type,
      active: template.active,
    });
    setIsCreating(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      html_content: '',
      text_content: '',
      variables: [],
      type: 'custom',
      active: true,
    });
    setVariableInput('');
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingTemplate(null);
    resetForm();
  };

  const addVariable = () => {
    if (variableInput.trim() && !formData.variables.includes(variableInput.trim())) {
      setFormData({
        ...formData,
        variables: [...formData.variables, variableInput.trim()]
      });
      setVariableInput('');
    }
  };

  const removeVariable = (variable: string) => {
    setFormData({
      ...formData,
      variables: formData.variables.filter(v => v !== variable)
    });
  };

  const loadDefaultTemplate = (type: EmailTemplate['type']) => {
    const template = defaultTemplates[type as keyof typeof defaultTemplates];
    if (template) {
      setFormData({
        ...formData,
        subject: template.subject,
        html_content: template.html_content,
        text_content: template.text_content,
        variables: [...template.variables],
        type,
      });
    }
  };

  const getTypeBadge = (type: EmailTemplate['type']) => {
    const typeConfig = {
      welcome: { variant: 'success' as const, label: 'Bienvenida' },
      payment_confirmation: { variant: 'default' as const, label: 'Pago' },
      access_granted: { variant: 'default' as const, label: 'Acceso' },
      support_response: { variant: 'warning' as const, label: 'Soporte' },
      custom: { variant: 'outline' as const, label: 'Personalizada' },
    };

    const config = typeConfig[type];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-lg">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Plantillas de Email</h1>
            <p className="text-gray-400">Gestionar plantillas de correo automático</p>
          </div>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nueva Plantilla
        </Button>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingTemplate ? 'Editar Plantilla' : 'Crear Nueva Plantilla'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre de la Plantilla
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Bienvenida nuevos usuarios"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo de Plantilla
                  </label>
                  <div className="flex gap-2">
                    <Select
                      options={typeOptions}
                      value={formData.type}
                      onChange={(e) => {
                        const newType = e.target.value as EmailTemplate['type'];
                        setFormData({ ...formData, type: newType });
                        if (newType !== 'custom') {
                          loadDefaultTemplate(newType);
                        }
                      }}
                    />
                    {formData.type !== 'custom' && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => loadDefaultTemplate(formData.type)}
                      >
                        Cargar Plantilla
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Asunto del Email
                </label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Ej: Bienvenido a PromptHub - {{user_name}}"
                  required
                />
              </div>

              {/* Variables */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Variables Disponibles
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={variableInput}
                    onChange={(e) => setVariableInput(e.target.value)}
                    placeholder="Ej: user_name"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={addVariable}
                    disabled={!variableInput.trim()}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.variables.map((variable) => (
                    <Badge
                      key={variable}
                      variant="secondary"
                      className="cursor-pointer hover:bg-red-600"
                      onClick={() => removeVariable(variable)}
                    >
                      {`{{${variable}}}`} ×
                    </Badge>
                  ))}
                </div>
              </div>

              {/* HTML Content */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contenido HTML
                </label>
                <textarea
                  value={formData.html_content}
                  onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
                  placeholder="Contenido HTML del email..."
                  className="w-full h-32 p-3 border border-gray-600 bg-gray-900 text-gray-100 rounded-lg resize-none focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono text-sm"
                  required
                />
              </div>

              {/* Text Content */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contenido de Texto (fallback)
                </label>
                <textarea
                  value={formData.text_content}
                  onChange={(e) => setFormData({ ...formData, text_content: e.target.value })}
                  placeholder="Versión en texto plano del email..."
                  className="w-full h-24 p-3 border border-gray-600 bg-gray-900 text-gray-100 rounded-lg resize-none focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono text-sm"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="active" className="text-sm text-gray-300">
                  Plantilla activa
                </label>
              </div>
              
              <div className="flex gap-3">
                <Button type="submit">
                  {editingTemplate ? 'Actualizar Plantilla' : 'Crear Plantilla'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
                {formData.html_content && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setPreviewTemplate({
                        id: 'preview',
                        ...formData,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                      });
                      setShowPreview(true);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Vista Previa
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Templates List */}
      <Card>
        <CardHeader>
          <CardTitle>Plantillas Configuradas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900 border-b border-gray-700">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Plantilla</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Tipo</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Asunto</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Variables</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Estado</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Actualizada</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((template) => (
                  <tr key={template.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                    <td className="p-4">
                      <div className="font-medium text-gray-100">{template.name}</div>
                    </td>
                    <td className="p-4">
                      {getTypeBadge(template.type)}
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-300 max-w-xs truncate">
                        {template.subject}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {template.variables.slice(0, 3).map((variable) => (
                          <Badge key={variable} variant="outline" className="text-xs">
                            {`{{${variable}}}`}
                          </Badge>
                        ))}
                        {template.variables.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.variables.length - 3}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {template.active ? (
                        <Badge variant="success">Activa</Badge>
                      ) : (
                        <Badge variant="outline">Inactiva</Badge>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-400">
                        {formatDate(template.updated_at)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setPreviewTemplate(template);
                            setShowPreview(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onTestTemplate(template.id)}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(template)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDeleteTemplate(template.id)}
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

          {templates.length === 0 && (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                No hay plantillas configuradas
              </h3>
              <p className="text-gray-400 mb-4">
                Crea tu primera plantilla de email para automatizar comunicaciones
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Plantilla
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {showPreview && previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPreview(false)} />
          <div className="relative bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-100">Vista Previa: {previewTemplate.name}</h2>
                <Button variant="ghost" onClick={() => setShowPreview(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="text-sm text-gray-400">Asunto:</label>
                  <div className="font-medium text-gray-100 mt-1">{previewTemplate.subject}</div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400">Contenido HTML:</label>
                  <div className="mt-2 border border-gray-600 rounded-lg overflow-hidden">
                    <div 
                      className="p-4 bg-white text-black"
                      dangerouslySetInnerHTML={{ __html: previewTemplate.html_content }}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400">Contenido de Texto:</label>
                  <div className="mt-2 p-4 bg-gray-900 rounded-lg font-mono text-sm text-gray-100 whitespace-pre-wrap">
                    {previewTemplate.text_content}
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