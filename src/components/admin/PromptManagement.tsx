import React, { useState } from 'react';
import { FileText, Plus, Edit, Trash2, Eye, Star, Flag, Search, Filter, Tag, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { formatDate, formatNumber } from '../../lib/utils';
import { Prompt, Category } from '../../types';
import { useToast } from '../../hooks/useToast';

interface PromptManagementProps {
  prompts: Prompt[];
  categories: Category[];
  onCreatePrompt: (prompt: Omit<Prompt, 'id' | 'created_at' | 'updated_at' | 'stats'>) => void;
  onUpdatePrompt: (promptId: string, updates: Partial<Prompt>) => void;
  onDeletePrompt: (promptId: string) => void;
  onCreateCategory: (category: Omit<Category, 'id' | 'created_at'>) => void;
  onUpdateCategory: (categoryId: string, updates: Partial<Category>) => void;
  onDeleteCategory: (categoryId: string) => void;
}

export function PromptManagement({
  prompts,
  categories,
  onCreatePrompt,
  onUpdatePrompt,
  onDeletePrompt,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
}: PromptManagementProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('prompts');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);
  
  // Create/Edit states
  const [isCreatingPrompt, setIsCreatingPrompt] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [showPromptDetails, setShowPromptDetails] = useState(false);

  // Form states
  const [promptForm, setPromptForm] = useState({
    title: '',
    content_es: '',
    content_en: '',
    category: '',
    tags: [] as string[],
    type: 'system' as 'system' | 'user',
    is_favorite: false,
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: 'FileText',
    color: 'bg-blue-500',
  });

  const [tagInput, setTagInput] = useState('');

  const ITEMS_PER_PAGE = 15;

  const typeOptions = [
    { value: 'all', label: 'Todos los tipos' },
    { value: 'system', label: 'Sistema' },
    { value: 'user', label: 'Usuario' },
  ];

  const categoryOptions = [
    { value: 'all', label: 'Todas las categorías' },
    ...categories.map(cat => ({ value: cat.id, label: cat.name })),
  ];

  const sortOptions = [
    { value: 'recent', label: 'Más recientes' },
    { value: 'title', label: 'Título A-Z' },
    { value: 'visits', label: 'Más visitados' },
    { value: 'copies', label: 'Más copiados' },
    { value: 'ctr', label: 'Mejor CTR' },
    { value: 'improvements', label: 'Más mejorados' },
  ];

  const iconOptions = [
    { value: 'FileText', label: '📝 Documento' },
    { value: 'Code2', label: '💻 Código' },
    { value: 'BarChart3', label: '📊 Análisis' },
    { value: 'TrendingUp', label: '📈 Marketing' },
    { value: 'GraduationCap', label: '🎓 Educación' },
    { value: 'Palette', label: '🎨 Creatividad' },
    { value: 'Brain', label: '🧠 IA' },
    { value: 'Zap', label: '⚡ Productividad' },
  ];

  const colorOptions = [
    { value: 'bg-blue-500', label: 'Azul' },
    { value: 'bg-green-500', label: 'Verde' },
    { value: 'bg-purple-500', label: 'Morado' },
    { value: 'bg-orange-500', label: 'Naranja' },
    { value: 'bg-red-500', label: 'Rojo' },
    { value: 'bg-pink-500', label: 'Rosa' },
    { value: 'bg-indigo-500', label: 'Índigo' },
    { value: 'bg-yellow-500', label: 'Amarillo' },
  ];

  // Filter and sort prompts
  const filteredPrompts = React.useMemo(() => {
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

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(prompt => prompt.type === typeFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(prompt => prompt.category === categoryFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'visits':
          return b.stats.visits - a.stats.visits;
        case 'copies':
          return b.stats.copies - a.stats.copies;
        case 'ctr':
          return b.stats.ctr - a.stats.ctr;
        case 'improvements':
          return b.stats.improvements - a.stats.improvements;
        default:
          return 0;
      }
    });

    return filtered;
  }, [prompts, searchTerm, typeFilter, categoryFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredPrompts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPrompts = filteredPrompts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Calculate stats
  const promptStats = React.useMemo(() => {
    const totalPrompts = prompts.length;
    const systemPrompts = prompts.filter(p => p.type === 'system').length;
    const userPrompts = prompts.filter(p => p.type === 'user').length;
    const totalVisits = prompts.reduce((sum, p) => sum + p.stats.visits, 0);
    const totalCopies = prompts.reduce((sum, p) => sum + p.stats.copies, 0);
    const avgCTR = prompts.length > 0 ? prompts.reduce((sum, p) => sum + p.stats.ctr, 0) / prompts.length : 0;

    // Category distribution
    const categoryStats = prompts.reduce((acc, prompt) => {
      const category = categories.find(c => c.id === prompt.category);
      const categoryName = category ? category.name : 'Sin categoría';
      acc[categoryName] = (acc[categoryName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalPrompts,
      systemPrompts,
      userPrompts,
      totalVisits,
      totalCopies,
      avgCTR,
      categoryStats,
    };
  }, [prompts, categories]);

  // Handlers
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!promptForm.tags.includes(newTag)) {
        setPromptForm({ ...promptForm, tags: [...promptForm.tags, newTag] });
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setPromptForm({
      ...promptForm,
      tags: promptForm.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPrompt) {
      onUpdatePrompt(editingPrompt.id, promptForm);
      toast.success('Prompt actualizado', `"${promptForm.title}" actualizado exitosamente`);
      setEditingPrompt(null);
    } else {
      onCreatePrompt(promptForm);
      toast.success('Prompt creado', `"${promptForm.title}" creado exitosamente`);
      setIsCreatingPrompt(false);
    }
    
    resetPromptForm();
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCategory) {
      onUpdateCategory(editingCategory.id, categoryForm);
      toast.success('Categoría actualizada', `"${categoryForm.name}" actualizada exitosamente`);
      setEditingCategory(null);
    } else {
      onCreateCategory(categoryForm);
      toast.success('Categoría creada', `"${categoryForm.name}" creada exitosamente`);
      setIsCreatingCategory(false);
    }
    
    resetCategoryForm();
  };

  const resetPromptForm = () => {
    setPromptForm({
      title: '',
      content_es: '',
      content_en: '',
      category: '',
      tags: [],
      type: 'system',
      is_favorite: false,
    });
    setTagInput('');
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      icon: 'FileText',
      color: 'bg-blue-500',
    });
  };

  const handleEditPrompt = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setPromptForm({
      title: prompt.title,
      content_es: prompt.content_es,
      content_en: prompt.content_en,
      category: prompt.category,
      tags: prompt.tags,
      type: prompt.type,
      is_favorite: prompt.is_favorite,
    });
    setIsCreatingPrompt(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color,
    });
    setIsCreatingCategory(true);
  };

  const handleViewPromptDetails = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setShowPromptDetails(true);
  };

  const handleSelectPrompt = (promptId: string) => {
    setSelectedPrompts(prev =>
      prev.includes(promptId)
        ? prev.filter(id => id !== promptId)
        : [...prev, promptId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPrompts.length === paginatedPrompts.length) {
      setSelectedPrompts([]);
    } else {
      setSelectedPrompts(paginatedPrompts.map(prompt => prompt.id));
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} for prompts:`, selectedPrompts);
    
    switch (action) {
      case 'delete':
        selectedPrompts.forEach(id => onDeletePrompt(id));
        toast.success('Prompts eliminados', `${selectedPrompts.length} prompts eliminados`);
        break;
      case 'feature':
        selectedPrompts.forEach(id => onUpdatePrompt(id, { is_favorite: true }));
        toast.success('Prompts destacados', `${selectedPrompts.length} prompts marcados como destacados`);
        break;
      case 'system':
        selectedPrompts.forEach(id => onUpdatePrompt(id, { type: 'system' }));
        toast.success('Prompts convertidos', `${selectedPrompts.length} prompts convertidos a sistema`);
        break;
    }
    
    setSelectedPrompts([]);
  };

  const getPromptStatusBadge = (prompt: Prompt) => {
    if (prompt.type === 'system') {
      return <Badge variant="default" className="bg-orange-600">Sistema</Badge>;
    }
    if (prompt.is_favorite) {
      return <Badge variant="default" className="bg-yellow-600">Destacado</Badge>;
    }
    return <Badge variant="outline">Usuario</Badge>;
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Sin categoría';
  };

  const renderPromptsTab = () => (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-100">{promptStats.totalPrompts}</div>
                <div className="text-sm text-gray-400">Total Prompts</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-orange-600 p-2 rounded-lg">
                <Star className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-100">{promptStats.systemPrompts}</div>
                <div className="text-sm text-gray-400">Sistema</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <Eye className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-100">{formatNumber(promptStats.totalVisits)}</div>
                <div className="text-sm text-gray-400">Total Visitas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-600 p-2 rounded-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-100">{promptStats.avgCTR.toFixed(1)}%</div>
                <div className="text-sm text-gray-400">CTR Promedio</div>
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
                placeholder="Buscar prompts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-4 flex-wrap lg:flex-nowrap">
              <div className="min-w-48">
                <Select
                  options={typeOptions}
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                />
              </div>
              
              <div className="min-w-48">
                <Select
                  options={categoryOptions}
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                />
              </div>
              
              <div className="min-w-48">
                <Select
                  options={sortOptions}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                />
              </div>
            </div>
          </div>

          {selectedPrompts.length > 0 && (
            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-300">
                  {selectedPrompts.length} prompts seleccionados
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('feature')}>
                    <Star className="h-4 w-4 mr-1" />
                    Destacar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('system')}>
                    <Flag className="h-4 w-4 mr-1" />
                    Hacer Sistema
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleBulkAction('delete')}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Prompt Form */}
      {isCreatingPrompt && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingPrompt ? 'Editar Prompt' : 'Crear Nuevo Prompt'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePromptSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Título
                  </label>
                  <Input
                    value={promptForm.title}
                    onChange={(e) => setPromptForm({ ...promptForm, title: e.target.value })}
                    placeholder="Título del prompt"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Categoría
                  </label>
                  <Select
                    options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
                    value={promptForm.category}
                    onChange={(e) => setPromptForm({ ...promptForm, category: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo
                  </label>
                  <Select
                    options={[
                      { value: 'system', label: 'Sistema' },
                      { value: 'user', label: 'Usuario' },
                    ]}
                    value={promptForm.type}
                    onChange={(e) => setPromptForm({ ...promptForm, type: e.target.value as 'system' | 'user' })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_favorite"
                    checked={promptForm.is_favorite}
                    onChange={(e) => setPromptForm({ ...promptForm, is_favorite: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="is_favorite" className="text-sm text-gray-300">
                    Marcar como destacado
                  </label>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags
                </label>
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Escribe un tag y presiona Enter"
                  className="mb-2"
                />
                <div className="flex flex-wrap gap-2">
                  {promptForm.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer hover:bg-red-600"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contenido Español
                  </label>
                  <textarea
                    value={promptForm.content_es}
                    onChange={(e) => setPromptForm({ ...promptForm, content_es: e.target.value })}
                    placeholder="Contenido del prompt en español..."
                    className="w-full h-32 p-3 border border-gray-600 bg-gray-900 text-gray-100 rounded-lg resize-none focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contenido English
                  </label>
                  <textarea
                    value={promptForm.content_en}
                    onChange={(e) => setPromptForm({ ...promptForm, content_en: e.target.value })}
                    placeholder="Prompt content in English..."
                    className="w-full h-32 p-3 border border-gray-600 bg-gray-900 text-gray-100 rounded-lg resize-none focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono text-sm"
                    required
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button type="submit">
                  {editingPrompt ? 'Actualizar Prompt' : 'Crear Prompt'}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setIsCreatingPrompt(false);
                  setEditingPrompt(null);
                  resetPromptForm();
                }}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Prompts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Prompts</CardTitle>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedPrompts.length === paginatedPrompts.length && paginatedPrompts.length > 0}
                onChange={handleSelectAll}
                className="rounded"
              />
              <span className="text-sm text-gray-400">Seleccionar todos</span>
              <Button
                onClick={() => setIsCreatingPrompt(true)}
                className="ml-4 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nuevo Prompt
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900 border-b border-gray-700">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Seleccionar</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Prompt</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Tipo</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Categoría</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Estadísticas</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Actualizado</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPrompts.map((prompt) => (
                  <tr key={prompt.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedPrompts.includes(prompt.id)}
                        onChange={() => handleSelectPrompt(prompt.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="p-4">
                      <div className="max-w-xs">
                        <div className="font-medium text-gray-100 truncate">{prompt.title}</div>
                        <div className="text-sm text-gray-400 truncate">
                          {prompt.content_es.substring(0, 60)}...
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {prompt.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {prompt.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{prompt.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {getPromptStatusBadge(prompt)}
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-300">
                        {getCategoryName(prompt.category)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Visitas:</span>
                          <span className="font-medium">{formatNumber(prompt.stats.visits)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Copias:</span>
                          <span className="font-medium">{formatNumber(prompt.stats.copies)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">CTR:</span>
                          <span className="font-medium">{prompt.stats.ctr.toFixed(1)}%</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-400">
                        {formatDate(prompt.updated_at)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewPromptDetails(prompt)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditPrompt(prompt)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            onDeletePrompt(prompt.id);
                            toast.success('Prompt eliminado', `"${prompt.title}" eliminado exitosamente`);
                          }}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Mostrando {startIndex + 1} a {Math.min(startIndex + ITEMS_PER_PAGE, filteredPrompts.length)} de {filteredPrompts.length} prompts
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <span className="px-3 py-1 text-sm text-gray-400">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderCategoriesTab = () => (
    <div className="space-y-6">
      {/* Create/Edit Category Form */}
      {isCreatingCategory && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingCategory ? 'Editar Categoría' : 'Crear Nueva Categoría'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre
                  </label>
                  <Input
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    placeholder="Nombre de la categoría"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Icono
                  </label>
                  <Select
                    options={iconOptions}
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descripción
                  </label>
                  <Input
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    placeholder="Descripción de la categoría"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Color
                  </label>
                  <Select
                    options={colorOptions}
                    value={categoryForm.color}
                    onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button type="submit">
                  {editingCategory ? 'Actualizar Categoría' : 'Crear Categoría'}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setIsCreatingCategory(false);
                  setEditingCategory(null);
                  resetCategoryForm();
                }}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Categories Grid */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-100">Gestión de Categorías</h2>
        <Button
          onClick={() => setIsCreatingCategory(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nueva Categoría
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const categoryPrompts = prompts.filter(p => p.category === category.id);
          const categoryVisits = categoryPrompts.reduce((sum, p) => sum + p.stats.visits, 0);
          
          return (
            <Card key={category.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`${category.color} p-2 rounded-lg`}>
                      <Tag className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <p className="text-sm text-gray-400">{category.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditCategory(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        onDeleteCategory(category.id);
                        toast.success('Categoría eliminada', `"${category.name}" eliminada exitosamente`);
                      }}
                      className="text-red-400 hover:text-red-300"
                      disabled={categoryPrompts.length > 0}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-blue-400">{categoryPrompts.length}</div>
                    <div className="text-xs text-gray-400">Prompts</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-green-400">{formatNumber(categoryVisits)}</div>
                    <div className="text-xs text-gray-400">Visitas</div>
                  </div>
                </div>
                {categoryPrompts.length === 0 ? (
                  <Badge variant="outline" className="w-full justify-center mt-3">
                    Sin prompts
                  </Badge>
                ) : (
                  <Badge variant="default" className="w-full justify-center mt-3">
                    Activa
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-lg">
          <FileText className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Gestión de Prompts</h1>
          <p className="text-gray-400">Administrar prompts del sistema y usuarios</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('prompts')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'prompts'
              ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-900/20'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Prompts ({promptStats.totalPrompts})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'categories'
              ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-900/20'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Categorías ({categories.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'prompts' && renderPromptsTab()}
      {activeTab === 'categories' && renderCategoriesTab()}

      {/* Prompt Details Modal */}
      {showPromptDetails && selectedPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPromptDetails(false)} />
          <div className="relative bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-100">Detalles del Prompt</h2>
                <Button variant="ghost" onClick={() => setShowPromptDetails(false)}>
                  ×
                </Button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-100 mb-3">Información General</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-400">Título</label>
                        <div className="font-medium text-gray-100">{selectedPrompt.title}</div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Tipo</label>
                        <div>{getPromptStatusBadge(selectedPrompt)}</div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Categoría</label>
                        <div className="font-medium text-gray-100">{getCategoryName(selectedPrompt.category)}</div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Tags</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedPrompt.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-100 mb-3">Estadísticas</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-900 p-3 rounded-lg text-center">
                        <div className="text-lg font-semibold text-blue-400">{formatNumber(selectedPrompt.stats.visits)}</div>
                        <div className="text-xs text-gray-400">Visitas</div>
                      </div>
                      <div className="bg-gray-900 p-3 rounded-lg text-center">
                        <div className="text-lg font-semibold text-green-400">{formatNumber(selectedPrompt.stats.copies)}</div>
                        <div className="text-xs text-gray-400">Copias</div>
                      </div>
                      <div className="bg-gray-900 p-3 rounded-lg text-center">
                        <div className="text-lg font-semibold text-purple-400">{selectedPrompt.stats.ctr.toFixed(1)}%</div>
                        <div className="text-xs text-gray-400">CTR</div>
                      </div>
                      <div className="bg-gray-900 p-3 rounded-lg text-center">
                        <div className="text-lg font-semibold text-yellow-400">{selectedPrompt.stats.improvements}</div>
                        <div className="text-xs text-gray-400">Mejoras</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-100 mb-3">Contenido Español</h3>
                    <div className="bg-gray-900 p-4 rounded-lg font-mono text-sm text-gray-100 whitespace-pre-wrap max-h-64 overflow-y-auto">
                      {selectedPrompt.content_es}
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      {selectedPrompt.stats.characters_es} caracteres • {selectedPrompt.stats.tokens_es} tokens
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-100 mb-3">Contenido English</h3>
                    <div className="bg-gray-900 p-4 rounded-lg font-mono text-sm text-gray-100 whitespace-pre-wrap max-h-64 overflow-y-auto">
                      {selectedPrompt.content_en}
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      {selectedPrompt.stats.characters_en} caracteres • {selectedPrompt.stats.tokens_en} tokens
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      handleEditPrompt(selectedPrompt);
                      setShowPromptDetails(false);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Editar Prompt
                  </Button>
                  <Button
                    onClick={() => {
                      onUpdatePrompt(selectedPrompt.id, { is_favorite: !selectedPrompt.is_favorite });
                      setSelectedPrompt({ ...selectedPrompt, is_favorite: !selectedPrompt.is_favorite });
                      toast.success('Estado actualizado', selectedPrompt.is_favorite ? 'Eliminado de destacados' : 'Marcado como destacado');
                    }}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Star className="h-4 w-4" />
                    {selectedPrompt.is_favorite ? 'Quitar Destacado' : 'Marcar Destacado'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}