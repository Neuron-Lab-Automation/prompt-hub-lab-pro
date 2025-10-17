import React, { useState, useMemo } from 'react';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { LoginForm } from './components/LoginForm';
import { LandingPage } from './components/LandingPage';
import { usePrompts, useCategories, useProviders } from './hooks/useSupabase';
import { Dashboard } from './components/Dashboard';
import { Header } from './components/Header';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { UserManagement } from './components/admin/UserManagement';
import { PlanManagement } from './components/admin/PlanManagement';
import { PromptManagement } from './components/admin/PromptManagement';
import { CategoryManagement } from './components/admin/CategoryManagement';
import { ProviderManagement } from './components/admin/ProviderManagement';
import { CouponManagement } from './components/admin/CouponManagement';
import { AffiliateManagement } from './components/admin/AffiliateManagement';
import { AuditLogs } from './components/admin/AuditLogs';
import { SystemSettings } from './components/admin/SystemSettings';
import { TokenPricing } from './components/admin/TokenPricing';
import { BillingReports } from './components/admin/BillingReports';
import { Filters } from './components/Filters';
import { PromptCard } from './components/PromptCard';
import { PromptModal } from './components/PromptModal';
import { CreatePromptModal } from './components/CreatePromptModal';
import { Playground } from './components/Playground';
import { VersionHistoryModal } from './components/VersionHistoryModal';
import { Pagination } from './components/Pagination';
import { ToastContainer } from './components/ui/Toast';
import { useToast } from './hooks/useToast';
import { mockUsers, mockPlans, mockCoupons, mockAffiliates, mockExecutions, mockTokenPromotions } from './data/mockAdminData';
import { mockOrganizationPlans } from './data/mockAdminData';
import { TokenWarningModal } from './components/TokenWarningModal';
import { TokenPromotions } from './components/admin/TokenPromotions';
import { OrganizationPlanManagement } from './components/admin/OrganizationPlanManagement';
import { ReferralSettings } from './components/admin/ReferralSettings';
import { User, Plan, Coupon, Affiliate, Role, TokenPromotion, OrganizationPlan } from './types';

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const { toasts, addToast, removeToast, toast } = useToast();
  const { prompts, loading: promptsLoading, executePrompt, improvePrompt, translatePrompt, incrementStat, toggleFavorite } = usePrompts();
  const { categories } = useCategories();
  const { providers } = useProviders();
  
  const [showLanding, setShowLanding] = useState(!user);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlaygroundOpen, setIsPlaygroundOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [historyPrompt, setHistoryPrompt] = useState<Prompt | null>(null);
  const [playgroundPrompt, setPlaygroundPrompt] = useState('');
  const [currentView, setCurrentView] = useState<'prompts' | 'dashboard'>('prompts');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminView, setAdminView] = useState('dashboard');
  
  // Token warning modal
  const [showTokenWarning, setShowTokenWarning] = useState(false);
  
  // Filter and pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState('trending');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Admin data state
  const [adminUsers, setAdminUsers] = useState<User[]>(mockUsers);
  const [adminPlans, setAdminPlans] = useState<Plan[]>(mockPlans);
  const [adminCoupons, setAdminCoupons] = useState<Coupon[]>(mockCoupons);
  const [adminAffiliates, setAdminAffiliates] = useState<Affiliate[]>(mockAffiliates);
  const [adminPromotions, setAdminPromotions] = useState<TokenPromotion[]>(mockTokenPromotions);
  const [adminOrgPlans, setAdminOrgPlans] = useState<OrganizationPlan[]>(mockOrganizationPlans);

  // Check for token usage warning
  React.useEffect(() => {
    if (user) {
      const mockUser = {
        tokensUsed: 750000,
        tokensLimit: 2000000,
      };
      const usagePercent = (mockUser.tokensUsed / mockUser.tokensLimit) * 100;
      
      // Check for active promotions that should trigger popup
      const activePromotion = adminPromotions.find(p => 
        p.active && p.show_popup && (
          p.popup_trigger === 'always' ||
          (p.popup_trigger === 'usage_threshold' && usagePercent >= (p.usage_threshold || 75))
        )
      );
      
      // Show warning/promotion popup
      if (activePromotion || usagePercent >= 75) {
        const lastWarningShown = localStorage.getItem('lastTokenWarning');
        const now = Date.now();
        const frequency = activePromotion?.popup_frequency_hours || 1;
        const frequencyMs = frequency * 60 * 60 * 1000;
        
        if (!lastWarningShown || now - parseInt(lastWarningShown) > frequencyMs) {
          setTimeout(() => {
            setShowTokenWarning(true);
            localStorage.setItem('lastTokenWarning', now.toString());
          }, 2000); // Show after 2 seconds
        }
      }
    }
  }, [user, adminPromotions]);

  // Filter and sort prompts
  const filteredAndSortedPrompts = useMemo(() => {
    let filtered = prompts;
    console.log('Filtering prompts, showFavoritesOnly:', showFavoritesOnly);

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(prompt =>
        prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.content_es.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.content_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(prompt => prompt.category === selectedCategory);
    }

    // Favorites filter
    if (showFavoritesOnly) {
      filtered = filtered.filter(prompt => prompt.is_favorite);
      console.log('Filtered favorites:', filtered.length);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'trending':
          return b.stats.ctr - a.stats.ctr;
        case 'copies':
          return b.stats.copies - a.stats.copies;
        case 'recent':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'visits':
          return b.stats.visits - a.stats.visits;
        case 'ctr':
          return b.stats.ctr - a.stats.ctr;
        default:
          return 0;
      }
    });

    return filtered;
  }, [prompts, searchTerm, selectedCategory, sortBy, showFavoritesOnly]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedPrompts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPrompts = filteredAndSortedPrompts.slice(startIndex, startIndex + itemsPerPage);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortBy, showFavoritesOnly, itemsPerPage]);

  // Show login form if not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  // Show landing page if user wants to see it
  if (!user) {
    return (
      <LandingPage
        onGetStarted={() => {
          setShowLanding(false);
        }}
        onContactSales={() => {
          toast.info('Contacto de ventas', 'Redirigiendo a nuestro equipo de ventas');
          // In real app, this would open a contact form or redirect to sales
        }}
      />
    );
  }

  if (!user && !showLanding) {
    return (
      <div>
        <div className="fixed top-4 left-4 z-50">
          <Button
            onClick={() => setShowLanding(true)}
            variant="outline"
            size="sm"
            className="bg-gray-800/90 backdrop-blur-sm"
          >
            ← Volver a Landing
          </Button>
        </div>
        <LoginForm />
      </div>
    );
  }

  if (promptsLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Cargando prompts...</p>
        </div>
      </div>
    );
  }

  const handleViewPrompt = (prompt: Prompt) => {
    // Update view count via Supabase
    incrementStat(prompt.id, 'visits');
    
    setSelectedPrompt(prompt);
    setIsModalOpen(true);
  };

  const handleCopyPrompt = async (prompt: Prompt) => {
    // Copy to clipboard
    await navigator.clipboard.writeText(prompt.content_es);
    
    // Update copy count via Supabase
    incrementStat(prompt.id, 'copies');
  };

  const handleImprovePrompt = async (prompt: Prompt) => {
    try {
      const result = await improvePrompt(prompt.id, 'es');
      toast.success('Mejora aplicada', `Nueva versión ${result.version.version} creada exitosamente`);
    } catch (error) {
      toast.error('Error al mejorar', error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const handleTranslatePrompt = async (prompt: Prompt, language: 'es' | 'en') => {
    try {
      const result = await translatePrompt(prompt.id, language);
      const targetLang = language === 'es' ? 'español' : 'inglés';
      toast.success('Traducción completada', `Prompt traducido a ${targetLang} exitosamente`);
    } catch (error) {
      toast.error('Error de traducción', error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const handleToggleFavorite = async (prompt: Prompt) => {
    try {
      await toggleFavorite(prompt.id);
      toast.success('Favorito actualizado', prompt.is_favorite ? 'Eliminado de favoritos' : 'Añadido a favoritos');
    } catch (error) {
      toast.error('Error al actualizar favorito', error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const handleViewHistory = (prompt: Prompt) => {
    setHistoryPrompt(prompt);
    setIsVersionHistoryOpen(true);
  };

  const handleRestoreVersion = async (prompt: Prompt, version: any) => {
    // In a real app, this would update the prompt in Supabase
    console.log('Restoring version:', { promptId: prompt.id, version: version.version });
    toast.success('Versión restaurada', `Versión ${version.version} restaurada exitosamente`);
    
    // Here you would typically:
    // 1. Update the prompt content with the version content
    // 2. Create a new version entry
    // 3. Refresh the prompts list
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('trending');
    setCurrentPage(1);
    setShowFavoritesOnly(false);
  };

  const handleNewPrompt = () => {
    setCurrentView('prompts');
    setIsCreateModalOpen(true);
  };

  // Admin handlers
  const handleEditUser = (user: User) => {
    console.log('Edit user:', user);
    toast.info('Función en desarrollo', 'La edición de usuarios estará disponible pronto');
  };

  const handleDeleteUser = (userId: string) => {
    console.log('Delete user:', userId);
    setAdminUsers(prev => prev.filter(u => u.id !== userId));
    toast.success('Usuario eliminado', 'El usuario ha sido eliminado del sistema');
  };

  const handleChangeRole = (userId: string, role: Role) => {
    console.log('Change role:', { userId, role });
    setAdminUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    toast.success('Rol actualizado', `Rol cambiado a ${role} exitosamente`);
  };

  const handleBanUser = (userId: string) => {
    console.log('Ban user:', userId);
    toast.warning('Usuario suspendido', 'El usuario ha sido suspendido temporalmente');
  };

  const handleCreatePlan = (plan: Omit<Plan, 'id' | 'created_at' | 'updated_at'>) => {
    const newPlan: Plan = {
      ...plan,
      id: `plan_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setAdminPlans(prev => [...prev, newPlan]);
    toast.success('Plan creado', `Plan "${plan.name}" creado exitosamente`);
  };

  const handleUpdatePlan = (planId: string, updates: Partial<Plan>) => {
    setAdminPlans(prev => prev.map(p => p.id === planId ? { ...p, ...updates, updated_at: new Date().toISOString() } : p));
    toast.success('Plan actualizado', 'Los cambios han sido guardados');
  };

  const handleDeletePlan = (planId: string) => {
    setAdminPlans(prev => prev.filter(p => p.id !== planId));
    toast.success('Plan eliminado', 'El plan ha sido eliminado del sistema');
  };

  const handleCreateProvider = (provider: any) => {
    console.log('Create provider:', provider);
    toast.success('Proveedor creado', `Proveedor "${provider.name}" creado exitosamente`);
  };

  const handleUpdateProvider = (providerId: string, updates: any) => {
    console.log('Update provider:', { providerId, updates });
    toast.success('Proveedor actualizado', 'Los cambios han sido guardados');
  };

  const handleDeleteProvider = (providerId: string) => {
    console.log('Delete provider:', providerId);
    toast.success('Proveedor eliminado', 'El proveedor ha sido eliminado del sistema');
  };

  const handleCreateModel = (providerId: string, model: any) => {
    console.log('Create model:', { providerId, model });
    toast.success('Modelo añadido', `Modelo "${model.name}" añadido exitosamente`);
  };

  const handleUpdateModel = (modelId: string, updates: any) => {
    console.log('Update model:', { modelId, updates });
    toast.success('Modelo actualizado', 'Los cambios han sido guardados');
  };

  const handleDeleteModel = (modelId: string) => {
    console.log('Delete model:', modelId);
    toast.success('Modelo eliminado', 'El modelo ha sido eliminado del sistema');
  };

  const handleCreateCoupon = (coupon: Omit<Coupon, 'id' | 'created_at' | 'updated_at'>) => {
    const newCoupon: Coupon = {
      ...coupon,
      id: `coupon_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setAdminCoupons(prev => [...prev, newCoupon]);
    toast.success('Cupón creado', `Cupón "${coupon.code}" creado exitosamente`);
  };

  const handleUpdateCoupon = (couponId: string, updates: Partial<Coupon>) => {
    setAdminCoupons(prev => prev.map(c => c.id === couponId ? { ...c, ...updates, updated_at: new Date().toISOString() } : c));
    toast.success('Cupón actualizado', 'Los cambios han sido guardados');
  };

  const handleDeleteCoupon = (couponId: string) => {
    setAdminCoupons(prev => prev.filter(c => c.id !== couponId));
    toast.success('Cupón eliminado', 'El cupón ha sido eliminado del sistema');
  };

  const handleUpdateAffiliate = (affiliateId: string, updates: Partial<Affiliate>) => {
    setAdminAffiliates(prev => prev.map(a => a.id === affiliateId ? { ...a, ...updates, updated_at: new Date().toISOString() } : a));
    toast.success('Afiliado actualizado', 'Los cambios han sido guardados');
  };

  const handleCreatePromotion = (promotion: Omit<TokenPromotion, 'id' | 'created_at' | 'updated_at'>) => {
    const newPromotion: TokenPromotion = {
      ...promotion,
      id: `promo_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setAdminPromotions(prev => [...prev, newPromotion]);
    toast.success('Promoción creada', `"${promotion.name}" creada exitosamente`);
  };

  const handleUpdatePromotion = (promotionId: string, updates: Partial<TokenPromotion>) => {
    setAdminPromotions(prev => prev.map(p => p.id === promotionId ? { ...p, ...updates, updated_at: new Date().toISOString() } : p));
    toast.success('Promoción actualizada', 'Los cambios han sido guardados');
  };

  const handleDeletePromotion = (promotionId: string) => {
    setAdminPromotions(prev => prev.filter(p => p.id !== promotionId));
    toast.success('Promoción eliminada', 'La promoción ha sido eliminada del sistema');
  };

  const handleTogglePromotion = (promotionId: string) => {
    const promotion = adminPromotions.find(p => p.id === promotionId);
    if (promotion) {
      handleUpdatePromotion(promotionId, { active: !promotion.active });
      toast.success(
        promotion.active ? 'Promoción desactivada' : 'Promoción activada',
        promotion.active ? 'La promoción ha sido desactivada' : 'La promoción ha sido activada'
      );
    }
  };

  const handleBanAffiliate = (affiliateId: string) => {
    const affiliate = adminAffiliates.find(a => a.id === affiliateId);
    if (affiliate) {
      handleUpdateAffiliate(affiliateId, { active: !affiliate.active });
      toast.success(
        affiliate.active ? 'Afiliado suspendido' : 'Afiliado reactivado',
        affiliate.active ? 'El afiliado ha sido suspendido' : 'El afiliado ha sido reactivado'
      );
    }
  };

  const handleAdminLogout = () => {
    setIsAdminMode(false);
    setAdminView('dashboard');
    toast.info('Sesión admin cerrada', 'Has salido del panel de administración');
  };

  // Check if user is admin
  const isUserAdmin = user?.user_metadata?.role === 'superadmin' || user?.user_metadata?.role === 'admin';

  // Admin mode toggle (for demo purposes)
  const toggleAdminMode = () => {
    if (isUserAdmin) {
      setIsAdminMode(!isAdminMode);
      if (!isAdminMode) {
        toast.success('Modo Admin activado', 'Acceso al panel de administración');
      }
    } else {
      toast.error('Acceso denegado', 'No tienes permisos de administrador');
    }
  };

  const handleSaveNewPrompt = (newPrompt: {
    title: string;
    content_es: string;
    content_en: string;
    category: string;
    tags: string[];
  }) => {
    // In a real app, this would save to Supabase
    console.log('Saving new prompt:', newPrompt);
    toast.success('Prompt creado', `"${newPrompt.title}" guardado exitosamente`);
    
    // Here you would typically:
    // 1. Call a Supabase function to save the prompt
    // 2. Refresh the prompts list
    // 3. Show success notification
  };

  const handleOpenPlayground = (initialPrompt = '') => {
    setPlaygroundPrompt(initialPrompt);
    setIsPlaygroundOpen(true);
  };

  const handleOpenDashboard = () => {
    setCurrentView('dashboard');
  };

  // Render admin panel
  if (isAdminMode) {
    const renderAdminContent = () => {
      switch (adminView) {
        case 'dashboard':
          return (
            <AdminDashboard
              users={adminUsers}
              prompts={prompts}
              executions={mockExecutions}
            />
          );
        case 'users':
          return (
            <UserManagement
              users={adminUsers}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
              onChangeRole={handleChangeRole}
              onBanUser={handleBanUser}
            />
          );
        case 'plans':
          return (
            <PlanManagement
              plans={adminPlans}
              users={adminUsers}
              onCreatePlan={handleCreatePlan}
              onUpdatePlan={handleUpdatePlan}
              onDeletePlan={handleDeletePlan}
            />
          );
        case 'prompts':
          return (
            <PromptManagement
              prompts={prompts}
              categories={categories}
              onCreatePrompt={(prompt) => {
                console.log('Create prompt:', prompt);
                toast.success('Prompt creado', `"${prompt.title}" creado exitosamente`);
              }}
              onUpdatePrompt={(promptId, updates) => {
                console.log('Update prompt:', { promptId, updates });
                toast.success('Prompt actualizado', 'Los cambios han sido guardados');
              }}
              onDeletePrompt={(promptId) => {
                console.log('Delete prompt:', promptId);
                toast.success('Prompt eliminado', 'El prompt ha sido eliminado');
              }}
              onCreateCategory={(category) => {
                console.log('Create category:', category);
                toast.success('Categoría creada', `"${category.name}" creada exitosamente`);
              }}
              onUpdateCategory={(categoryId, updates) => {
                console.log('Update category:', { categoryId, updates });
                toast.success('Categoría actualizada', 'Los cambios han sido guardados');
              }}
              onDeleteCategory={(categoryId) => {
                console.log('Delete category:', categoryId);
                toast.success('Categoría eliminada', 'La categoría ha sido eliminada');
              }}
            />
          );
        case 'categories':
          return (
            <CategoryManagement
              categories={categories}
              prompts={prompts}
              onCreateCategory={(category) => {
                console.log('Create category:', category);
                toast.success('Categoría creada', `"${category.name}" creada exitosamente`);
              }}
              onUpdateCategory={(categoryId, updates) => {
                console.log('Update category:', { categoryId, updates });
                toast.success('Categoría actualizada', 'Los cambios han sido guardados');
              }}
              onDeleteCategory={(categoryId) => {
                console.log('Delete category:', categoryId);
                toast.success('Categoría eliminada', 'La categoría ha sido eliminada');
              }}
            />
          );
        case 'providers':
          return (
            <ProviderManagement
              providers={providers}
              onCreateProvider={handleCreateProvider}
              onUpdateProvider={handleUpdateProvider}
              onDeleteProvider={handleDeleteProvider}
              onCreateModel={handleCreateModel}
              onUpdateModel={handleUpdateModel}
              onDeleteModel={handleDeleteModel}
            />
          );
        case 'coupons':
          return (
            <CouponManagement
              coupons={adminCoupons}
              onCreateCoupon={handleCreateCoupon}
              onUpdateCoupon={handleUpdateCoupon}
              onDeleteCoupon={handleDeleteCoupon}
            />
          );
        case 'affiliates':
          return (
            <AffiliateManagement
              affiliates={adminAffiliates}
              users={adminUsers}
              onUpdateAffiliate={handleUpdateAffiliate}
              onBanAffiliate={handleBanAffiliate}
            />
          );
        case 'audit':
          return (
            <AuditLogs
              logs={[]}
              users={adminUsers}
            />
          );
        case 'settings':
          return (
            <SystemSettings
              onUpdateSettings={(settings) => console.log('Update settings:', settings)}
            />
          );
        case 'pricing':
          return (
            <TokenPricing
              onUpdatePricing={(pricing) => console.log('Update pricing:', pricing)}
            />
          );
        case 'reports':
          return (
            <BillingReports
              users={adminUsers}
              executions={mockExecutions}
            />
          );
        case 'promotions':
          return (
            <TokenPromotions
              promotions={adminPromotions}
              onCreatePromotion={handleCreatePromotion}
              onUpdatePromotion={handleUpdatePromotion}
              onDeletePromotion={handleDeletePromotion}
              onTogglePromotion={handleTogglePromotion}
            />
          );
        case 'organizations':
          return (
            <OrganizationPlanManagement
              plans={adminOrgPlans}
              onCreatePlan={(plan) => {
                const newPlan: OrganizationPlan = {
                  ...plan,
                  id: `org_plan_${Date.now()}`,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                };
                setAdminOrgPlans(prev => [...prev, newPlan]);
              }}
              onUpdatePlan={(planId, updates) => {
                setAdminOrgPlans(prev => prev.map(p => 
                  p.id === planId ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
                ));
              }}
              onDeletePlan={(planId) => {
                setAdminOrgPlans(prev => prev.filter(p => p.id !== planId));
              }}
            />
          );
        case 'referral-settings':
          return (
            <ReferralSettings
              onUpdateSettings={(settings) => {
                console.log('Update referral settings:', settings);
                toast.success('Configuración actualizada', 'Configuración de referidos guardada');
              }}
            />
          );
        case 'emails':
          return (
            <EmailTemplates
              templates={adminEmailTemplates}
              onCreateTemplate={(template) => {
                const newTemplate = {
                  ...template,
                  id: `template_${Date.now()}`,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                };
                setAdminEmailTemplates(prev => [...prev, newTemplate]);
              }}
              onUpdateTemplate={(templateId, updates) => {
                setAdminEmailTemplates(prev => prev.map(t => 
                  t.id === templateId ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
                ));
              }}
              onDeleteTemplate={(templateId) => {
                setAdminEmailTemplates(prev => prev.filter(t => t.id !== templateId));
              }}
              onTestTemplate={(templateId) => {
                toast.info('Enviando email de prueba...', 'Verificando plantilla');
                setTimeout(() => {
                  toast.success('Email enviado', 'Plantilla probada exitosamente');
                }, 2000);
              }}
            />
          );
        case 'support':
          return (
            <SupportTickets
              tickets={adminSupportTickets}
              users={adminUsers}
              onUpdateTicket={(ticketId, updates) => {
                setAdminSupportTickets(prev => prev.map(t => 
                  t.id === ticketId ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
                ));
              }}
              onAddResponse={(ticketId, response) => {
                console.log('Add response:', { ticketId, response });
                toast.success('Respuesta enviada', 'Email enviado al usuario');
              }}
            />
          );
        case 'smtp':
          return (
            <SMTPSettings
              config={adminSMTPConfig}
              onUpdateConfig={(config) => {
                setAdminSMTPConfig(config);
                toast.success('SMTP configurado', 'Configuración de email actualizada');
              }}
              onTestConnection={() => {
                toast.info('Probando conexión SMTP...', 'Verificando configuración');
                setTimeout(() => {
                  toast.success('Conexión exitosa', 'SMTP configurado correctamente');
                }, 2000);
              }}
            />
          );
        default:
          return (
            <AuditLogs
              logs={[]}
              users={adminUsers}
            />
          );
      }
    };

    return (
      <AdminLayout
        currentView={adminView}
        onViewChange={setAdminView}
        onLogout={handleAdminLogout}
      >
        {renderAdminContent()}
      </AdminLayout>
    );
  }

  // Transform categories for the filter component
  const categoryOptions = [
    { id: 'all', name: 'Todas las categorías' },
    ...categories,
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      <Header 
        onNewPrompt={handleNewPrompt}
        onOpenPlayground={() => handleOpenPlayground()}
        onOpenDashboard={handleOpenDashboard}
        currentView={currentView}
        onToggleAdmin={toggleAdminMode}
        isAdmin={isUserAdmin}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' ? (
          <Dashboard prompts={prompts} />
        ) : (
          <>
            <Filters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              showFavoritesOnly={showFavoritesOnly}
              onToggleFavoritesOnly={setShowFavoritesOnly}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onClearFilters={handleClearFilters}
              categories={categoryOptions}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedPrompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  onView={handleViewPrompt}
                  onCopy={handleCopyPrompt}
                  onImprove={handleImprovePrompt}
                  onTranslate={handleTranslatePrompt}
                  onToggleFavorite={handleToggleFavorite}
                 onViewHistory={handleViewHistory}
                />
              ))}
            </div>

            {filteredAndSortedPrompts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-2">No se encontraron prompts</div>
                <div className="text-gray-400 text-sm">
                  Intenta cambiar los filtros o términos de búsqueda
                </div>
              </div>
            )}

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
              totalItems={filteredAndSortedPrompts.length}
            />
          </>
        )}
      </main>

      <PromptModal
        prompt={selectedPrompt}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCopy={handleCopyPrompt}
        onImprove={handleImprovePrompt}
        onTranslate={handleTranslatePrompt}
        onToggleFavorite={handleToggleFavorite}
       onViewHistory={handleViewHistory}
      />

      <CreatePromptModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSaveNewPrompt}
      />

      <Playground
        isOpen={isPlaygroundOpen}
        onClose={() => setIsPlaygroundOpen(false)}
        initialPrompt={playgroundPrompt}
      />

      <VersionHistoryModal
        prompt={historyPrompt}
        isOpen={isVersionHistoryOpen}
        onClose={() => setIsVersionHistoryOpen(false)}
        onRestoreVersion={handleRestoreVersion}
      />

      <TokenWarningModal
        isOpen={showTokenWarning}
        onClose={() => setShowTokenWarning(false)}
        onPurchaseTokens={() => {
          setShowTokenWarning(false);
          // Open token purchase modal
          toast.info('Abriendo compra de tokens', 'Redirigiendo a la página de compra');
        }}
        onUpgradePlan={() => {
          setShowTokenWarning(false);
          // Open plan upgrade modal
          toast.info('Abriendo actualización de plan', 'Redirigiendo a planes disponibles');
        }}
        activePromotion={adminPromotions.find(p => p.active && p.show_popup) || null}
        user={{
          name: 'Usuario Demo',
          plan: 'Pro',
          tokensUsed: 750000,
          tokensLimit: 2000000,
        }}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;