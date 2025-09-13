import React from 'react';
import { ChevronLeft, ChevronRight, Grid3X3 } from 'lucide-react';
import { Button } from './ui/Button';
import { Select } from './ui/Select';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (items: number) => void;
  totalItems: number;
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  itemsPerPage, 
  onItemsPerPageChange, 
  totalItems 
}: PaginationProps) {
  const pages = [];
  const maxVisiblePages = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const itemsPerPageOptions = [
    { value: '6', label: '6 por página' },
    { value: '12', label: '12 por página' },
    { value: '24', label: '24 por página' },
    { value: '48', label: '48 por página' },
    { value: '100', label: '100 por página' },
  ];

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Always show pagination info, even if only one page
  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 bg-gray-800 rounded-lg p-4 border border-gray-700">
      {/* Items per page selector */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Grid3X3 className="h-4 w-4" />
          <span>Mostrar:</span>
        </div>
        <div className="min-w-40">
          <Select
            options={itemsPerPageOptions}
            value={itemsPerPage.toString()}
            onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
          />
        </div>
        <div className="text-sm text-gray-400">
          {startItem}-{endItem} de {totalItems}
        </div>
      </div>

      {/* Pagination controls - only show if more than one page */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          <div className="flex gap-1">
            {startPage > 1 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(1)}
                >
                  1
                </Button>
                {startPage > 2 && <span className="px-2 py-1 text-gray-500">...</span>}
              </>
            )}

            {pages.map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(page)}
                className="min-w-10"
              >
                {page}
              </Button>
            ))}

            {endPage < totalPages && (
              <>
                {endPage < totalPages - 1 && <span className="px-2 py-1 text-gray-500">...</span>}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(totalPages)}
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}