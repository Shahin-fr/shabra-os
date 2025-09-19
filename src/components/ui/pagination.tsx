import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (__newPage: number) => void;
  isLoading?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  isLoading = false,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const handlePageChange = (newPage: number) => {
    // Use the newPage parameter to validate before calling the parent function
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };

  return (
    <div className='flex items-center justify-between px-2 py-4'>
      <div className='flex items-center gap-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!hasPreviousPage || isLoading}
          className='flex items-center gap-2'
        >
          <ChevronRight className='h-4 w-4' />
          قبلی
        </Button>
      </div>

      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
        <span>
          صفحه {currentPage} از {totalPages}
        </span>
      </div>

      <div className='flex items-center gap-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!hasNextPage || isLoading}
          className='flex items-center gap-2'
        >
          بعدی
          <ChevronLeft className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}

