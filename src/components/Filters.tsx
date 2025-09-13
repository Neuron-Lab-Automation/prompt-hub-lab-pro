import React from 'react';
import { Search, Filter, SortAsc } from 'lucide-react';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';

interface FiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onClearFilters: () => void;
  categories: Array<{ id: string; name: string }>;
}

export function Filters({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  onClearFilters,
  categories,
}: FiltersProps) {
  const categoryOptions = categories.map(cat => ({ value: cat.id, label: cat.name }));

  const sortOptions = [
    { value: 'trending', label: 'Trending' },
    { value: 'copies', label: 'Más copiados' },
    { value: 'recent', label: 'Más recientes' },
    { value: 'visits', label: 'Más visitados' },
    { value: 'ctr', label: 'Mejor CTR' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar prompts..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-4 flex-wrap lg:flex-nowrap">
          <div className="min-w-48">
            <Select
              options={categoryOptions}
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
            />
          </div>
          
          <div className="min-w-48">
            <Select
              options={sortOptions}
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
            />
          </div>
          
          <Button
            onClick={onClearFilters}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Limpiar
          </Button>
        </div>
      </div>
    </div>
  );
}