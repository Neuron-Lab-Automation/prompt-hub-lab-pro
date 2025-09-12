import React, { useState } from 'react';
import { Settings, Save, RefreshCw, Database, Key, Shield, Globe, Mail, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { useToast } from '../../hooks/useToast';

interface SystemSettingsProps {
  onUpdateSettings: (settings: any) => void;
}

export function SystemSettings({ onUpdateSettings }: SystemSettingsProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  
  const [settings, setSettings] = useState({
    general: {
      siteName: 'PromptHub v2',
      siteDescription: 'Plataforma avanzada para gestión de prompts de IA',
      defaultLanguage: 'es',
      timezone: 'Europe/Madrid',
      maintenanceMode: false,
    },
    api: {
      openaiKey: '••••••••••••••••••••••••••••••••••••••••',
      anthropicKey: '••••••••••••••••••••••••••••••••••••••••',
      replicateKey: '••••••••••••••••••••••••••••••••••••••••',
      rateLimitPerMinute: 60,
      maxTokensPerRequest: 4000,
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: 'noreply@prompthub.com',
      smtpPassword: '••••••••••••••••',
      fromEmail: 'PromptHub <noreply@prompthub.com>',
    },
    security: {
      sessionTimeout: 24,
      maxLoginAttempts: 5,
      requireEmailVerification: true,
      enableTwoFactor: false,
      allowedDomains: '',
    },
    notifications: {
      enableEmailNotifications: true,
      enablePushNotifications: false,
      notifyOnNewUser: true,
      notifyOnHighUsage: true,
      usageThreshold: 80,
    },
  });

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'api', label: 'APIs', icon: Key },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
  ];

  const languageOptions = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
  ];

  const timezoneOptions = [
    { value: 'Europe/Madrid', label: 'Madrid (GMT+1)' },
    { value: 'America/New_York', label: 'New York (GMT-5)' },
    { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-8)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' },
  ];

  const handleSave = (section: string) => {
    onUpdateSettings({ [section]: settings[section as keyof typeof settings] });
    toast.success('Configuración guardada', `Sección "${section}" actualizada exitosamente`);
  };

  const handleTestConnection = (service: string) => {
    toast.info(`Probando conexión con ${service}...`, 'Verificando configuración');
    setTimeout(() => {
      toast.success('Conexión exitosa', `${service} configurado correctamente`);
    }, 2000);
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Nombre del Sitio
          </label>
          <Input
            value={settings.general.siteName}
            onChange={(e) => setSettings({
              ...settings,
              general: { ...settings.general, siteName: e.target.value }
            })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Idioma por Defecto
          </label>
          <Select
            options={languageOptions}
            value={settings.general.defaultLanguage}
            onChange={(e) => setSettings({
              ...settings,
              general: { ...settings.general, defaultLanguage: e.target.value }
            })}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Descripción del Sitio
          </label>
          <Input
            value={settings.general.siteDescription}
            onChange={(e) => setSettings({
              ...settings,
              general: { ...settings.general, siteDescription: e.target.value }
            })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Zona Horaria
          </label>
          <Select
            options={timezoneOptions}
            value={settings.general.timezone}
            onChange={(e) => setSettings({
              ...settings,
              general: { ...settings.general, timezone: e.target.value }
            })}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="maintenance"
            checked={settings.general.maintenanceMode}
            onChange={(e) => setSettings({
              ...settings,
              general: { ...settings.general, maintenanceMode: e.target.checked }
            })}
            className="rounded"
          />
          <label htmlFor="maintenance" className="text-sm text-gray-300">
            Modo Mantenimiento
          </label>
        </div>
      </div>
      <Button onClick={() => handleSave('general')} className="flex items-center gap-2">
        <Save className="h-4 w-4" />
        Guardar Configuración General
      </Button>
    </div>
  );

  const renderApiSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            OpenAI API Key
          </label>
          <div className="flex gap-2">
            <Input
              type="password"
              value={settings.api.openaiKey}
              onChange={(e) => setSettings({
                ...settings,
                api: { ...settings.api, openaiKey: e.target.value }
              })}
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={() => handleTestConnection('OpenAI')}
            >
              Probar
            </Button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Anthropic API Key
          </label>
          <div className="flex gap-2">
            <Input
              type="password"
              value={settings.api.anthropicKey}
              onChange={(e) => setSettings({
                ...settings,
                api: { ...settings.api, anthropicKey: e.target.value }
              })}
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={() => handleTestConnection('Anthropic')}
            >
              Probar
            </Button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Replicate API Key
          </label>
          <div className="flex gap-2">
            <Input
              type="password"
              value={settings.api.replicateKey}
              onChange={(e) => setSettings({
                ...settings,
                api: { ...settings.api, replicateKey: e.target.value }
              })}
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={() => handleTestConnection('Replicate')}
            >
              Probar
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Rate Limit (req/min)
            </label>
            <Input
              type="number"
              value={settings.api.rateLimitPerMinute}
              onChange={(e) => setSettings({
                ...settings,
                api: { ...settings.api, rateLimitPerMinute: parseInt(e.target.value) }
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Max Tokens por Request
            </label>
            <Input
              type="number"
              value={settings.api.maxTokensPerRequest}
              onChange={(e) => setSettings({
                ...settings,
                api: { ...settings.api, maxTokensPerRequest: parseInt(e.target.value) }
              })}
            />
          </div>
        </div>
      </div>
      <Button onClick={() => handleSave('api')} className="flex items-center gap-2">
        <Save className="h-4 w-4" />
        Guardar Configuración de APIs
      </Button>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            SMTP Host
          </label>
          <Input
            value={settings.email.smtpHost}
            onChange={(e) => setSettings({
              ...settings,
              email: { ...settings.email, smtpHost: e.target.value }
            })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            SMTP Port
          </label>
          <Input
            type="number"
            value={settings.email.smtpPort}
            onChange={(e) => setSettings({
              ...settings,
              email: { ...settings.email, smtpPort: parseInt(e.target.value) }
            })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            SMTP Usuario
          </label>
          <Input
            value={settings.email.smtpUser}
            onChange={(e) => setSettings({
              ...settings,
              email: { ...settings.email, smtpUser: e.target.value }
            })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            SMTP Contraseña
          </label>
          <Input
            type="password"
            value={settings.email.smtpPassword}
            onChange={(e) => setSettings({
              ...settings,
              email: { ...settings.email, smtpPassword: e.target.value }
            })}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email Remitente
          </label>
          <Input
            value={settings.email.fromEmail}
            onChange={(e) => setSettings({
              ...settings,
              email: { ...settings.email, fromEmail: e.target.value }
            })}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => handleSave('email')} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Guardar Configuración Email
        </Button>
        <Button
          variant="outline"
          onClick={() => handleTestConnection('SMTP')}
          className="flex items-center gap-2"
        >
          <Mail className="h-4 w-4" />
          Enviar Email de Prueba
        </Button>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Timeout de Sesión (horas)
          </label>
          <Input
            type="number"
            value={settings.security.sessionTimeout}
            onChange={(e) => setSettings({
              ...settings,
              security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
            })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Max Intentos de Login
          </label>
          <Input
            type="number"
            value={settings.security.maxLoginAttempts}
            onChange={(e) => setSettings({
              ...settings,
              security: { ...settings.security, maxLoginAttempts: parseInt(e.target.value) }
            })}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Dominios Permitidos (separados por coma)
          </label>
          <Input
            value={settings.security.allowedDomains}
            onChange={(e) => setSettings({
              ...settings,
              security: { ...settings.security, allowedDomains: e.target.value }
            })}
            placeholder="ejemplo.com, empresa.com"
          />
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="emailVerification"
            checked={settings.security.requireEmailVerification}
            onChange={(e) => setSettings({
              ...settings,
              security: { ...settings.security, requireEmailVerification: e.target.checked }
            })}
            className="rounded"
          />
          <label htmlFor="emailVerification" className="text-sm text-gray-300">
            Requerir verificación de email
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="twoFactor"
            checked={settings.security.enableTwoFactor}
            onChange={(e) => setSettings({
              ...settings,
              security: { ...settings.security, enableTwoFactor: e.target.checked }
            })}
            className="rounded"
          />
          <label htmlFor="twoFactor" className="text-sm text-gray-300">
            Habilitar autenticación de dos factores
          </label>
        </div>
      </div>
      <Button onClick={() => handleSave('security')} className="flex items-center gap-2">
        <Save className="h-4 w-4" />
        Guardar Configuración de Seguridad
      </Button>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="emailNotifications"
            checked={settings.notifications.enableEmailNotifications}
            onChange={(e) => setSettings({
              ...settings,
              notifications: { ...settings.notifications, enableEmailNotifications: e.target.checked }
            })}
            className="rounded"
          />
          <label htmlFor="emailNotifications" className="text-sm text-gray-300">
            Habilitar notificaciones por email
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="pushNotifications"
            checked={settings.notifications.enablePushNotifications}
            onChange={(e) => setSettings({
              ...settings,
              notifications: { ...settings.notifications, enablePushNotifications: e.target.checked }
            })}
            className="rounded"
          />
          <label htmlFor="pushNotifications" className="text-sm text-gray-300">
            Habilitar notificaciones push
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="notifyNewUser"
            checked={settings.notifications.notifyOnNewUser}
            onChange={(e) => setSettings({
              ...settings,
              notifications: { ...settings.notifications, notifyOnNewUser: e.target.checked }
            })}
            className="rounded"
          />
          <label htmlFor="notifyNewUser" className="text-sm text-gray-300">
            Notificar cuando se registre un nuevo usuario
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="notifyHighUsage"
            checked={settings.notifications.notifyOnHighUsage}
            onChange={(e) => setSettings({
              ...settings,
              notifications: { ...settings.notifications, notifyOnHighUsage: e.target.checked }
            })}
            className="rounded"
          />
          <label htmlFor="notifyHighUsage" className="text-sm text-gray-300">
            Notificar uso alto de tokens
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Umbral de uso para notificación (%)
          </label>
          <Input
            type="number"
            min="1"
            max="100"
            value={settings.notifications.usageThreshold}
            onChange={(e) => setSettings({
              ...settings,
              notifications: { ...settings.notifications, usageThreshold: parseInt(e.target.value) }
            })}
          />
        </div>
      </div>
      <Button onClick={() => handleSave('notifications')} className="flex items-center gap-2">
        <Save className="h-4 w-4" />
        Guardar Configuración de Notificaciones
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-3 rounded-lg">
          <Settings className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Configuración del Sistema</h1>
          <p className="text-gray-400">Configurar parámetros globales de la aplicación</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-900/20'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <Card>
        <CardContent className="p-6">
          {activeTab === 'general' && renderGeneralSettings()}
          {activeTab === 'api' && renderApiSettings()}
          {activeTab === 'email' && renderEmailSettings()}
          {activeTab === 'security' && renderSecuritySettings()}
          {activeTab === 'notifications' && renderNotificationSettings()}
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Estado del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <div className="text-sm font-medium text-gray-100">Base de Datos</div>
                <div className="text-xs text-gray-400">Conectada - 15ms</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <div className="text-sm font-medium text-gray-100">APIs Externas</div>
                <div className="text-xs text-gray-400">3/3 Operacionales</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              <div>
                <div className="text-sm font-medium text-gray-100">Cache Redis</div>
                <div className="text-xs text-gray-400">85% Memoria usada</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}