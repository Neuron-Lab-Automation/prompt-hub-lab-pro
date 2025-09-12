import React, { useState } from 'react';
import { Zap, User, Settings, LogOut, Plus, PlayCircle, BarChart3, Shield, Building, Users, MessageSquare } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { TokenUsageModal } from './TokenUsageModal';
import { CreateOrganizationModal } from './CreateOrganizationModal';
import { ReferralProgramModal } from './ReferralProgramModal';
import { SupportModal } from './SupportModal';

interface HeaderProps {
  onNewPrompt: () => void;
  onOpenPlayground: () => void;
  onOpenDashboard: () => void;
  currentView: 'prompts' | 'dashboard';
  onToggleAdmin?: () => void;
  isAdmin?: boolean;
}

export function Header({ onNewPrompt, onOpenPlayground, onOpenDashboard, currentView, onToggleAdmin, isAdmin }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showOrganizationModal, setShowOrganizationModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  // Mock user data - esto se reemplazará con datos reales de Clerk
  const user = {
    name: 'Usuario Demo',
    email: 'demo@prompthub.com',
    plan: 'Pro',
    tokensUsed: 750000,
    tokensLimit: 2000000,
  };

  const tokenUsagePercent = (user.tokensUsed / user.tokensLimit) * 100;

  // Close user menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showUserMenu]);

  return (
    <>
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">PromptHub</h1>
                <p className="text-xs text-gray-400">v2.0</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-4">
              <Button
                onClick={onOpenDashboard}
                variant={currentView === 'dashboard' ? 'default' : 'outline'}
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </Button>
              
              <Button
                onClick={onNewPrompt}
                variant={currentView === 'prompts' ? 'default' : 'outline'}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {currentView === 'prompts' ? 'Prompts' : 'Nuevo Prompt'}
              </Button>
              
              <Button
                onClick={onOpenPlayground}
                variant="outline"
                className="flex items-center gap-2"
              >
                <PlayCircle className="h-4 w-4" />
                Playground
              </Button>

              {/* Admin Button */}
              {isAdmin && onToggleAdmin && (
                <Button
                  onClick={onToggleAdmin}
                  variant="outline"
                  className="flex items-center gap-2 border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </Button>
              )}

              {/* Token Usage */}
              <div 
                className="hidden sm:flex items-center gap-2 px-3 py-1 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                onClick={() => setShowTokenModal(true)}
              >
                <div className="text-sm">
                  <span className="font-medium text-white">{Math.round(user.tokensUsed / 1000)}K</span>
                  <span className="text-gray-400">/{Math.round(user.tokensLimit / 1000)}K</span>
                </div>
                <div className="w-16 h-2 bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      tokenUsagePercent > 80 ? 'bg-red-500' : tokenUsagePercent > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(tokenUsagePercent, 100)}%` }}
                  />
                </div>
              </div>

              {/* User Menu */}
              <div className="relative user-menu-container">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="rounded-full"
                >
                  <User className="h-5 w-5" />
                </Button>

                {showUserMenu && (
                  <div className="absolute right-0 top-12 bg-gray-800 border border-gray-600 rounded-lg shadow-lg min-w-64 z-50" onClick={(e) => e.stopPropagation()}>
                    <div className="p-4 border-b border-gray-700">
                      <div className="font-medium text-white">{user.name}</div>
                      <div className="text-sm text-gray-400">{user.email}</div>
                      <div className="mt-2">
                        <Badge variant="secondary" className="bg-blue-900 text-blue-200">
                          Plan {user.plan}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-4 border-b border-gray-700">
                      <div className="text-sm text-gray-300 mb-2">Uso de tokens</div>
                      <div 
                        className="w-full h-2 bg-gray-600 rounded-full overflow-hidden mb-1 cursor-pointer"
                        onClick={() => {
                          setShowTokenModal(true);
                          setShowUserMenu(false);
                        }}
                      >
                        <div
                          className={`h-full transition-all duration-300 ${
                            tokenUsagePercent > 80 ? 'bg-red-500' : tokenUsagePercent > 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(tokenUsagePercent, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-400">
                        {Math.round(user.tokensUsed / 1000)}K de {Math.round(user.tokensLimit / 1000)}K tokens
                        <button 
                          className="ml-2 text-blue-400 hover:text-blue-300"
                          onClick={() => {
                            setShowTokenModal(true);
                            setShowUserMenu(false);
                          }}
                        >
                          Ver detalles
                        </button>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 flex items-center gap-2 text-gray-300"
                        onClick={() => {
                          setShowOrganizationModal(true);
                          setShowUserMenu(false);
                        }}
                      >
                        <Building className="h-4 w-4" />
                        Crear Organización
                      </button>
                      <button
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 flex items-center gap-2 text-gray-300"
                        onClick={() => {
                          setShowReferralModal(true);
                          setShowUserMenu(false);
                        }}
                      >
                        <Users className="h-4 w-4" />
                        Programa de Referencias
                      </button>
                      <button
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 flex items-center gap-2 text-gray-300"
                        onClick={() => {
                          setShowUserMenu(false);
                        }}
                      >
                        <Settings className="h-4 w-4" />
                        Configuración
                      </button>
                      <button
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 flex items-center gap-2 text-gray-300"
                        onClick={() => {
                          setShowUserMenu(false);
                          setShowSupportModal(true);
                        }}
                      >
                        <MessageSquare className="h-4 w-4" />
                        Soporte
                      </button>
                      <button
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 flex items-center gap-2 text-gray-300"
                        onClick={() => {
                          localStorage.removeItem('mockUserLoggedIn');
                          window.location.reload();
                        }}
                      >
                        <LogOut className="h-4 w-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <TokenUsageModal
        isOpen={showTokenModal}
        onClose={() => setShowTokenModal(false)}
        user={user}
      />

      <CreateOrganizationModal
        isOpen={showOrganizationModal}
        onClose={() => setShowOrganizationModal(false)}
        onCreateOrganization={(org) => {
          console.log('Creating organization:', org);
          // In real app, this would call Supabase
        }}
      />

      <ReferralProgramModal
        isOpen={showReferralModal}
        onClose={() => setShowReferralModal(false)}
      />

      <SupportModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        onCreateTicket={(ticket) => {
          console.log('Creating support ticket:', ticket);
          // In real app, this would save to Supabase
        }}
      />
    </>
  );
}