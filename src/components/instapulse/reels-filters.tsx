'use client';

import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface ReelsFilters {
  dateRange?: DateRange;
  sortBy: string;
  sortOrder: string;
}

interface ReelsFiltersProps {
  onFiltersChange: (filters: ReelsFilters) => void;
  onApply: () => void;
  onReset: () => void;
  initialFilters?: Partial<ReelsFilters>;
}

const SORT_OPTIONS = [
  {
    value: 'publishedAt_desc',
    label: 'Published Date (Newest)',
  },
  {
    value: 'publishedAt_asc',
    label: 'Published Date (Oldest)',
  },
  {
    value: 'viewCount_desc',
    label: 'View Count (Most)',
  },
  {
    value: 'viewCount_asc',
    label: 'View Count (Least)',
  },
];

export default function ReelsFilters({
  onFiltersChange,
  onApply,
  onReset,
  initialFilters = {},
}: ReelsFiltersProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    initialFilters.dateRange
  );
  const [sortBy, setSortBy] = useState(
    initialFilters.sortBy || 'publishedAt'
  );
  const [sortOrder, setSortOrder] = useState(
    initialFilters.sortOrder || 'desc'
  );

  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
    applyFilters({
      dateRange: newDateRange,
      sortBy,
      sortOrder,
    });
  };

  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split('_');
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    applyFilters({
      dateRange,
      sortBy: newSortBy,
      sortOrder: newSortOrder,
    });
  };

  const applyFilters = (filters: ReelsFilters) => {
    onFiltersChange(filters);
  };

  const handleApply = () => {
    onApply();
  };

  const handleReset = () => {
    const defaultFilters: ReelsFilters = {
      dateRange: undefined,
      sortBy: 'publishedAt',
      sortOrder: 'desc',
    };
    
    setDateRange(undefined);
    setSortBy('publishedAt');
    setSortOrder('desc');
    onReset();
  };

  const hasActiveFilters = dateRange?.from || sortBy !== 'publishedAt' || sortOrder !== 'desc';

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/30 rounded-lg border">
      {/* Date Range Picker */}
      <div className="flex-1 min-w-[280px]">
        <label className="text-sm font-medium text-foreground mb-2 block">
          Date Range
        </label>
        <DateRangePicker
          date={dateRange}
          onDateChange={handleDateRangeChange}
          placeholder="Pick a date range"
          className="w-full"
        />
      </div>

      {/* Sort By Dropdown */}
      <div className="min-w-[200px]">
        <label className="text-sm font-medium text-foreground mb-2 block">
          Sort By
        </label>
        <Select
          value={`${sortBy}_${sortOrder}`}
          onValueChange={handleSortChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select sort option" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Action Buttons */}
      <div className="flex items-end gap-2">
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="h-10"
          >
            <X className="h-4 w-4 mr-2" />
            Reset
          </Button>
        )}
        
        <Button
          size="sm"
          onClick={handleApply}
          className="h-10"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
}
