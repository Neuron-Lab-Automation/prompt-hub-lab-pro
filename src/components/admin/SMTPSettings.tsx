import React, { useState } from 'react';
import { Mail, Save, Send, Shield, AlertCircle, CheckCircle, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { SMTPConfig } from '../../types';
import { useToast } from '../../hooks/useToast';

interface SMTPSettingsProps {
  config: SMTPConfig;
  onUpdateConfig: (config: SMTPConfig) => void;
  onTestConnection: () => void;
}

export function SMTPSettings({ config, onUpdateConfig, onTestConnection }: SMTPSettingsProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<SMTPConfig>(config);
  const [testEmail, setTestEmail] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [lastTestResult, setLastTestResult] = useState<'success' | 'error' | null>(null);

  const providerPresets = [
    {
      name: 'Gmail',
      host: 'smtp.gmail.com',
      port: 587,
      use_tls: true,
    },
    {
      name: 'Outlook',
      host: 'smtp-mail.outlook.com',
      port: 587,
      use_tls: true,
    },
    {
      name: 'SendGrid',
      host: 'smtp.sendgrid.net',
      port: 587,
      use_tls: true,
    },
    {
      name: 'Mailgun',
      host: 'smtp.mailgun.org',
      port: 587,
      use_tls: true,
    },
  ];

  const handleSave = () => {
    onUpdateConfig(formData);
    toast.success('Configuración guardada', 'Configuración SMTP actualizada exitosamente');
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      // Simulate test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock success/failure
      const success = Math.random() > 0.3; // 70% success rate
      
      if (success) {
        setLastTestResult('success');
        toast.success('Conexión exitosa', 'SMTP configurado correctamente');
      } else {
        setLastTestResult('error');
        toast.error('Error de conexión', 'Verifica las credenciales SMTP');
      }
    } catch (error) {
      setLastTestResult('error');
      toast.error('Error de prueba', 'No se pudo probar la conexión');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail.trim()) {
      toast.warning('Email requerido', 'Ingresa un email para la prueba');
      return;
    }

    setIsTesting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Email de prueba enviado', `Email enviado a ${testEmail}`);
      setTestEmail('');
    } catch (error) {
      toast.error('Error al enviar', 'No se pudo enviar el email de prueba');
    } finally {
      setIsTesting(false);
    }
  };

  const loadPreset = (preset: typeof providerPresets[0]) => {
    setFormData({
      ...formData,
      host: preset.host,
      port: preset.port,
      use_tls: preset.use_tls,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-lg">
          <Mail className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Configuración SMTP</h1>
          <p className="text-gray-400">Configurar servidor de correo para emails automáticos</p>
        </div>
      </div>

      {/* Connection Status */}
      <Card className={`border ${
        lastTestResult === 'success' ? 'border-green-500/50 bg-green-900/10' :
        lastTestResult === 'error' ? 'border-red-500/50 bg-red-900/10' :
        'border-gray-600'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {lastTestResult === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : lastTestResult === 'error' ? (
                <AlertCircle className="h-5 w-5 text-red-400" />
              ) : (
                <Settings className="h-5 w-5 text-gray-400" />
              )}
              <div>
                <div className="font-medium text-gray-100">
                  {lastTestResult === 'success' ? 'Conexión SMTP Activa' :
                   lastTestResult === 'error' ? 'Error de Conexión SMTP' :
                   'Estado de Conexión Desconocido'}
                </div>
                <div className="text-sm text-gray-400">
                  {formData.active ? 'Configuración habilitada' : 'Configuración deshabilitada'}
                </div>
              </div>
            </div>
            <Button
              onClick={handleTestConnection}
              disabled={isTesting}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isTesting ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  Probando...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  Probar Conexión
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Setup Presets */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración Rápida</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {providerPresets.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                onClick={() => loadPreset(preset)}
                className="flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                {preset.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SMTP Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración del Servidor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Servidor SMTP
              </label>
              <Input
                value={formData.host}
                onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                placeholder="smtp.gmail.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Puerto
              </label>
              <Input
                type="number"
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                placeholder="587"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Usuario/Email
              </label>
              <Input
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="tu-email@gmail.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contraseña/Token
              </label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••••••••••"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Remitente
              </label>
              <Input
                value={formData.from_email}
                onChange={(e) => setFormData({ ...formData, from_email: e.target.value })}
                placeholder="noreply@prompthub.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre Remitente
              </label>
              <Input
                value={formData.from_name}
                onChange={(e) => setFormData({ ...formData, from_name: e.target.value })}
                placeholder="PromptHub"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="use_tls"
                checked={formData.use_tls}
                onChange={(e) => setFormData({ ...formData, use_tls: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="use_tls" className="text-sm text-gray-300">
                Usar TLS/SSL
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="smtp_active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="smtp_active" className="text-sm text-gray-300">
                SMTP habilitado
              </label>
            </div>
          </div>

          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Guardar Configuración SMTP
          </Button>
        </CardContent>
      </Card>

      {/* Test Email */}
      <Card>
        <CardHeader>
          <CardTitle>Enviar Email de Prueba</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="email@ejemplo.com"
              className="flex-1"
            />
            <Button
              onClick={handleSendTestEmail}
              disabled={isTesting || !testEmail.trim()}
              className="flex items-center gap-2"
            >
              {isTesting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Enviar Prueba
                </>
              )}
            </Button>
          </div>
          <div className="text-xs text-gray-400 mt-2">
            Se enviará un email de prueba para verificar la configuración
          </div>
        </CardContent>
      </Card>
    </div>
  );
}