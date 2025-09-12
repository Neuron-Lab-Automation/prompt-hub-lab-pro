import React, { useState } from 'react';
import { Tag, Plus, Edit, Trash2, FileText, Palette } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { formatNumber } from '../../lib/utils';
import { Category, Prompt } from '../../types';
import { useToast } from '../../hooks/useToast';

interface CategoryManagementProps {
  categories: Category[];
  prompts: Prompt[];
  onCreateCategory: (category: Omit<Category, 'id' | 'created_at'>) => void;
  onUpdateCategory: (categoryId: string, updates: Partial<Category>) => void;
  onDeleteCategory: (categoryId: string) => void;
}

export function CategoryManagement({
  categories,
  prompts,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
}: CategoryManagementProps) {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'FileText',
    color: 'bg-blue-500',
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCategory) {
      onUpdateCategory(editingCategory.id, formData);
      toast.success('Categoría actualizada', `"${formData.name}" actualizada exitosamente`);
      setEditingCategory(null);
    } else {
      onCreateCategory(formData);
      toast.success('Categoría creada', `"${formData.name}" creada exitosamente`);
      setIsCreating(false);
    }
    
    setFormData({
      name: '',
      description: '',
      icon: 'FileText',
      color: 'bg-blue-500',
    });
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color,
    });
    setIsCreating(true);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      icon: 'FileText',
      color: 'bg-blue-500',
    });
  };

  const getCategoryStats = (categoryId: string) => {
    const categoryPrompts = prompts.filter(p => p.category === categoryId);
    const totalVisits = categoryPrompts.reduce((sum, p) => sum + p.stats.visits, 0);
    const totalCopies = categoryPrompts.reduce((sum, p) => sum + p.stats.copies, 0);
    const avgCTR = categoryPrompts.length > 0 
      ? categoryPrompts.reduce((sum, p) => sum + p.stats.ctr, 0) / categoryPrompts.length 
      : 0;

    return {
      promptCount: categoryPrompts.length,
      totalVisits,
      totalCopies,
      avgCTR,
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-lg">
            <Tag className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Gestión de Categorías</h1>
            <p className="text-gray-400">Organizar y gestionar categorías de prompts</p>
          </div>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nueva Categoría
        </Button>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingCategory ? 'Editar Categoría' : 'Crear Nueva Categoría'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre de la Categoría
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Marketing Digital"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Icono
                  </label>
                  <Select
                    options={iconOptions}
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descripción
                  </label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descripción de la categoría y su propósito"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Color
                  </label>
                  <Select
                    options={colorOptions}
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>
                <div className="flex items-center">
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <div className="text-sm text-gray-400 mb-2">Vista Previa</div>
                    <div className="flex items-center gap-2">
                      <div className={`${formData.color} p-2 rounded-lg`}>
                        <FileText className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-100">{formData.name || 'Nombre'}</div>
                        <div className="text-xs text-gray-400">{formData.description || 'Descripción'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button type="submit">
                  {editingCategory ? 'Actualizar Categoría' : 'Crear Categoría'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const stats = getCategoryStats(category.id);
          
          return (
            <Card key={category.id} className="hover:shadow-lg transition-shadow">
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
                      onClick={() => handleEdit(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (stats.promptCount > 0) {
                          toast.warning('No se puede eliminar', 'La categoría tiene prompts asociados');
                          return;
                        }
                        onDeleteCategory(category.id);
                        toast.success('Categoría eliminada', `"${category.name}" eliminada exitosamente`);
                      }}
                      className="text-red-400 hover:text-red-300"
                      disabled={stats.promptCount > 0}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-400">{stats.promptCount}</div>
                    <div className="text-xs text-gray-400">Prompts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-400">{formatNumber(stats.totalVisits)}</div>
                    <div className="text-xs text-gray-400">Visitas</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Copias:</span>
                    <span className="font-medium">{formatNumber(stats.totalCopies)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">CTR:</span>
                    <span className="font-medium">{stats.avgCTR.toFixed(1)}%</span>
                  </div>
                </div>

                <div className="mt-4">
                  {stats.promptCount === 0 ? (
                    <Badge variant="outline" className="w-full justify-center">
                      Sin prompts
                    </Badge>
                  ) : (
                    <Badge variant="default" className="w-full justify-center">
                      Activa
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Distribución por Categorías
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {categories.map(category => {
              const stats = getCategoryStats(category.id);
              const percentage = prompts.length > 0 ? (stats.promptCount / prompts.length) * 100 : 0;
              
              return (
                <div key={category.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${category.color}`} />
                    <span className="text-gray-300">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${category.color}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-sm text-gray-400 min-w-16 text-right">
                      {stats.promptCount} ({percentage.toFixed(1)}%)
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}