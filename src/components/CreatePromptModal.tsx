import React, { useState } from 'react';
import { X, Save, Wand2, Languages, Plus } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Badge } from './ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { categories } from '../data/mockData';
import { estimateTokens } from '../lib/utils';

interface CreatePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (prompt: {
    title: string;
    content_es: string;
    content_en: string;
    category: string;
    tags: string[];
  }) => void;
}

export function CreatePromptModal({ isOpen, onClose, onSave }: CreatePromptModalProps) {
  const [activeTab, setActiveTab] = useState<'es' | 'en'>('es');
  const [title, setTitle] = useState('');
  const [contentEs, setContentEs] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Set default category
      if (categories.length > 0 && !selectedCategory) {
        setSelectedCategory(categories[0].id);
      }
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, selectedCategory]);

  if (!isOpen) return null;

  const currentContent = activeTab === 'es' ? contentEs : contentEn;
  const setCurrentContent = activeTab === 'es' ? setContentEs : setContentEn;
  const currentTokens = estimateTokens(currentContent);

  const categoryOptions = categories.map(cat => ({
    value: cat.id,
    label: cat.name,
  })).concat([{ value: 'new', label: '+ Crear nueva categoría' }]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleGenerateIdeas = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const ideas = [
      'Actúa como un experto en {tema} y proporciona una guía detallada paso a paso.',
      'Eres un consultor especializado en {área}. Analiza la siguiente situación y ofrece recomendaciones.',
      'Como {rol_profesional}, explica {concepto} de manera clara y con ejemplos prácticos.',
    ];
    
    const randomIdea = ideas[Math.floor(Math.random() * ideas.length)];
    setCurrentContent(randomIdea);
    setIsGenerating(false);
  };

  const handleTranslate = async () => {
    const sourceContent = activeTab === 'es' ? contentEs : contentEn;
    if (!sourceContent.trim()) return;

    setIsTranslating(true);
    // Simulate translation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const translatedContent = `[Traducción simulada] ${sourceContent}`;
    if (activeTab === 'es') {
      setContentEn(translatedContent);
    } else {
      setContentEs(translatedContent);
    }
    setIsTranslating(false);
  };

  const handleCategoryChange = (value: string) => {
    if (value === 'new') {
      setShowNewCategory(true);
      setSelectedCategory('');
    } else {
      setShowNewCategory(false);
      setSelectedCategory(value);
    }
  };

  const handleCreateCategory = () => {
    if (newCategoryName.trim()) {
      // In a real app, this would create the category in the database
      console.log('Creating new category:', newCategoryName);
      toast.success('Categoría creada', `"${newCategoryName}" creada exitosamente`);
      setShowNewCategory(false);
      setNewCategoryName('');
      // For now, just select the first category
      setSelectedCategory(categories[0]?.id || '');
    }
  };

  const handleSave = () => {
    if (!title.trim() || !contentEs.trim()) {
      toast.warning('Campos requeridos', 'Por favor completa el título y contenido en español');
      return;
    }

    onSave({
      title: title.trim(),
      content_es: contentEs.trim(),
      content_en: contentEn.trim() || contentEs.trim(), // Fallback to Spanish if English is empty
      category: selectedCategory,
      tags,
    });

    // Reset form
    setTitle('');
    setContentEs('');
    setContentEn('');
    setTags([]);
    setTagInput('');
    onClose();
  };

  const handleClose = () => {
    // Reset form on close
    setTitle('');
    setContentEs('');
    setContentEn('');
    setTags([]);
    setTagInput('');
    setSelectedCategory('');
    setShowNewCategory(false);
    setNewCategoryName('');
    setShowNewCategory(false);
    setNewCategoryName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-gray-800 rounded-xl shadow-2xl max-w-4xl h-[90vh] w-full mx-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-100">Crear Nuevo Prompt</h2>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Form */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="space-y-6">
            {/* Title and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Título *
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Generador de Artículos SEO"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Categoría
                </label>
                {showNewCategory ? (
                  <div className="flex gap-2">
                    <Input
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Nombre de la nueva categoría"
                      className="flex-1"
                    />
                    <Button
                      onClick={handleCreateCategory}
                      disabled={!newCategoryName.trim()}
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Crear
                    </Button>
                    <Button
                      onClick={() => {
                        setShowNewCategory(false);
                        setNewCategoryName('');
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <Select
                    options={categoryOptions}
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                  />
                )}
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
                className="w-full mb-2"
              />
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
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

            {/* Content Tabs */}
            <div>
              <div className="flex border-b border-gray-700 mb-4">
                <button
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'es'
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('es')}
                >
                  Español ({estimateTokens(contentEs)} tokens)
                </button>
                <button
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'en'
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('en')}
                >
                  English ({estimateTokens(contentEn)} tokens)
                </button>
              </div>

              {/* Content Editor */}
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    onClick={handleGenerateIdeas}
                    disabled={isGenerating}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4" />
                        Ideas IA
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleTranslate}
                    disabled={isTranslating || !currentContent.trim()}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {isTranslating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                        Traduciendo...
                      </>
                    ) : (
                      <>
                        <Languages className="h-4 w-4" />
                        Traducir {activeTab === 'es' ? 'a EN' : 'a ES'}
                      </>
                    )}
                  </Button>
                </div>

                <textarea
                  value={currentContent}
                  onChange={(e) => setCurrentContent(e.target.value)}
                  placeholder={`Escribe tu prompt en ${activeTab === 'es' ? 'español' : 'inglés'}...`}
                  className="w-full h-64 p-4 border border-gray-600 bg-gray-900 text-gray-100 rounded-lg resize-none focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono text-sm overflow-y-auto"
                />

                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>{currentContent.length} caracteres · {currentTokens} tokens</span>
                  <span>Usa {'{variables}'} para parámetros dinámicos</span>
                </div>
              </div>
            </div>

            {/* Preview */}
            {(contentEs || contentEn) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Vista Previa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <div className="text-sm text-gray-300 mb-2">
                      <strong>{title || 'Título del prompt'}</strong>
                    </div>
                    <div className="font-mono text-sm text-gray-100 whitespace-pre-wrap">
                      {currentContent || 'Contenido del prompt...'}
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700 flex-shrink-0">
          <div className="text-sm text-gray-400">
            * Los campos marcados son obligatorios
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!title.trim() || !contentEs.trim()}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Guardar Prompt
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}