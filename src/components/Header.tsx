import React, { useState } from 'react';
import { Zap, User, Settings, LogOut, Plus, PlayCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

interface HeaderProps {
  onNewPrompt: () => void;
  onOpenPlayground: () => void;
}

export function Header({ onNewPrompt, onOpenPlayground }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Mock user data - esto se reemplazará con datos reales de Clerk
  const user = {
    name: 'Usuario Demo',
    email: 'demo@prompthub.com',
    plan: 'Pro',
    tokensUsed: 750000,
    tokensLimit: 2000000,
  };

  const tokenUsagePercent = (user.tokensUsed / user.tokensLimit) * 100;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">PromptHub</h1>
              <p className="text-xs text-gray-500">v2.0</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            <Button
              onClick={onNewPrompt}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nuevo Prompt
            </Button>
            
            <Button
              onClick={onOpenPlayground}
              variant="outline"
              className="flex items-center gap-2"
            >
              <PlayCircle className="h-4 w-4" />
              Playground
            </Button>

            {/* Token Usage */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg">
              <div className="text-sm">
                <span className="font-medium">{Math.round(user.tokensUsed / 1000)}K</span>
                <span className="text-gray-500">/{Math.round(user.tokensLimit / 1000)}K</span>
              </div>
              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    tokenUsagePercent > 80 ? 'bg-red-500' : tokenUsagePercent > 60 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(tokenUsagePercent, 100)}%` }}
                />
              </div>
            </div>

            {/* User Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="rounded-full"
              >
                <User className="h-5 w-5" />
              </Button>

              {showUserMenu && (
                <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg min-w-64 z-50">
                  <div className="p-4 border-b border-gray-100">
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    <div className="mt-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Plan {user.plan}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-4 border-b border-gray-100">
                    <div className="text-sm text-gray-700 mb-2">Uso de tokens</div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
                      <div
                        className={`h-full transition-all duration-300 ${
                          tokenUsagePercent > 80 ? 'bg-red-500' : tokenUsagePercent > 60 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(tokenUsagePercent, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round(user.tokensUsed / 1000)}K de {Math.round(user.tokensLimit / 1000)}K tokens
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Configuración
                    </button>
                    <button
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      onClick={() => setShowUserMenu(false)}
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
  );
}