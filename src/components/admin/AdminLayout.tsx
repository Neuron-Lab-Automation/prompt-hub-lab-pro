import React, { useState } from 'react';
import { Shield, BarChart3, Users, DollarSign, Bot, Ticket, TrendingUp, FileText, Settings, LogOut, Calculator, PieChart, Tag, Gift, Building } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
}

export function AdminLayout({ children, currentView, onViewChange, onLogout }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, badge: null },
    { id: 'users', label: 'Usuarios', icon: Users, badge: '156' },
    { id: 'prompts', label: 'Prompts', icon: FileText, badge: '2.1K' },
    { id: 'categories', label: 'Categorías', icon: Tag, badge: '6' },
    { id: 'plans', label: 'Planes', icon: DollarSign, badge: null },
    { id: 'providers', label: 'Proveedores IA', icon: Bot, badge: '3' },
    { id: 'coupons', label: 'Cupones', icon: Ticket, badge: '12' },
    { id: 'affiliates', label: 'Afiliados', icon: TrendingUp, badge: '8' },
    { id: 'pricing', label: 'Precios de Tokens', icon: Calculator, badge: null },
    { id: 'promotions', label: 'Promociones', icon: Gift, badge: '3' },
    { id: 'organizations', label: 'Planes de Organización', icon: Building, badge: '2' },
    { id: 'referral-settings', label: 'Config. Referidos', icon: Users, badge: null },
    { id: 'emails', label: 'Plantillas Email', icon: Mail, badge: '5' },
    { id: 'support', label: 'Tickets Soporte', icon: MessageSquare, badge: '12' },
    { id: 'smtp', label: 'Config. SMTP', icon: Settings, badge: null },
    { id: 'reports', label: 'Reportes', icon: PieChart, badge: null },
    { id: 'audit', label: 'Logs de Auditoría', icon: FileText, badge: null },
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <div className={`bg-gray-800 border-r border-gray-700 transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        <div className="p-4">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-gradient-to-r from-red-600 to-orange-600 p-2 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-lg font-bold text-white">Admin Panel</h1>
                <p className="text-xs text-gray-400">PromptHub v2</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="absolute bottom-4 left-4 right-4">
          <Button
            onClick={onLogout}
            variant="ghost"
            className="w-full flex items-center gap-3 text-gray-300 hover:text-white"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!sidebarCollapsed && <span>Cerrar Sesión</span>}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Top Bar */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <Settings className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-4">
              <Badge variant="success" className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Sistema Operacional
              </Badge>
              
              <div className="text-sm text-gray-400">
                Última actualización: hace 2 min
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto h-[calc(100vh-73px)]">
          {children}
        </div>
      </div>
    </div>
  );
}