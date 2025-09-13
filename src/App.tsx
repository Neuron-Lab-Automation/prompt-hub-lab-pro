import React, { useState, useMemo } from 'react';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { LoginForm } from './components/LoginForm';
import { usePrompts, useCategories, useProviders } from './hooks/useSupabase';
import { Header } from './components/Header';
import { Filters } from './components/Filters';
import { PromptCard } from './components/PromptCard';
import { PromptModal } from './components/PromptModal';
import { Playground } from './components/Playground';
import { Pagination } from './components/Pagination';

const ITEMS_PER_PAGE = 12;

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const { prompts, loading: promptsLoading, executePrompt, improvePrompt, translatePrompt, incrementStat } = usePrompts();
  const { categories } = useCategories();
  const { providers } = useProviders();
  
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlaygroundOpen, setIsPlaygroundOpen] = useState(false);
  const [playgroundPrompt, setPlaygroundPrompt] = useState('');
  
  // Filter and pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('trending');
  const [currentPage, setCurrentPage] = useState(1);

  // Show login form if not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  if (promptsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando prompts...</p>
        </div>
      </div>
    );
  }

  // Filter and sort prompts
  const filteredAndSortedPrompts = useMemo(() => {
    let filtered = prompts;

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
  }, [prompts, searchTerm, selectedCategory, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedPrompts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPrompts = filteredAndSortedPrompts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortBy]);

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
      alert(`Prompt mejorado exitosamente. Nueva versión: ${result.version.version}`);
    } catch (error) {
      alert('Error al mejorar el prompt: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const handleTranslatePrompt = async (prompt: Prompt, language: 'es' | 'en') => {
    try {
      const result = await translatePrompt(prompt.id, language);
      const targetLang = language === 'es' ? 'español' : 'inglés';
      alert(`Prompt traducido a ${targetLang} exitosamente.`);
    } catch (error) {
      alert('Error al traducir el prompt: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const handleToggleFavorite = async (prompt: Prompt) => {
    // This would be implemented with a Supabase update
    alert('Función de favoritos en desarrollo.');
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('trending');
    setCurrentPage(1);
  };

  const handleNewPrompt = () => {
    alert('Función de crear nuevo prompt en desarrollo.');
  };

  const handleOpenPlayground = (initialPrompt = '') => {
    setPlaygroundPrompt(initialPrompt);
    setIsPlaygroundOpen(true);
  };

  // Transform categories for the filter component
  const categoryOptions = [
    { id: 'all', name: 'Todas las categorías' },
    ...categories,
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onNewPrompt={handleNewPrompt}
        onOpenPlayground={() => handleOpenPlayground()}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Filters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onClearFilters={handleClearFilters}
          categories={categoryOptions}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedPrompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onView={handleViewPrompt}
              onCopy={handleCopyPrompt}
              onImprove={handleImprovePrompt}
              onTranslate={handleTranslatePrompt}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>

        {filteredAndSortedPrompts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">No se encontraron prompts</div>
            <div className="text-gray-400 text-sm">
              Intenta cambiar los filtros o términos de búsqueda
            </div>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </main>

      <PromptModal
        prompt={selectedPrompt}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCopy={handleCopyPrompt}
        onImprove={handleImprovePrompt}
        onTranslate={handleTranslatePrompt}
        onToggleFavorite={handleToggleFavorite}
      />

      <Playground
        isOpen={isPlaygroundOpen}
        onClose={() => setIsPlaygroundOpen(false)}
        initialPrompt={playgroundPrompt}
      />
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