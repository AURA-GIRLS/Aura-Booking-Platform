"use client";

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  className = "" 
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`
          flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300
          ${currentPage === 1 
            ? 'text-gray-400 cursor-not-allowed bg-gray-100' 
            : 'text-rose-600 hover:text-white hover:bg-gradient-to-r hover:from-rose-500 hover:to-pink-600 hover:scale-105 hover:shadow-lg bg-white border border-rose-200'
          }
        `}
      >
        <ChevronLeft size={16} />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {visiblePages.map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 text-gray-400 text-sm">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 min-w-[40px]
                  ${currentPage === page
                    ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg scale-105'
                    : 'text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-rose-500 hover:to-pink-600 hover:scale-105 hover:shadow-lg bg-white border border-rose-200'
                  }
                `}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`
          flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300
          ${currentPage === totalPages 
            ? 'text-gray-400 cursor-not-allowed bg-gray-100' 
            : 'text-rose-600 hover:text-white hover:bg-gradient-to-r hover:from-rose-500 hover:to-pink-600 hover:scale-105 hover:shadow-lg bg-white border border-rose-200'
          }
        `}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
