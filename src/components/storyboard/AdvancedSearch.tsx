'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  X,
  History,
  Bookmark,
  ChevronDown,
} from 'lucide-react';
import { User as UserType } from 'next-auth';
import React, { useState, useCallback, useMemo, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDebounce } from '@/hooks/use-debounce';
import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';
import { Project } from '@/types/project';
import { Story, StoryType } from '@/types/story';

interface SearchFilters {
  query: string;
  storyTypes: string[];
  projects: string[];
  assignees: string[];
  statuses: string[];
  priorities: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

interface AdvancedSearchProps {
  stories: Story[];
  storyTypes: StoryType[];
  projects: Project[];
  users: UserType[];
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  className?: string;
}

export function AdvancedSearch({
  stories,
  storyTypes,
  projects,
  users,
  onSearch,
  onClear,
  className = '',
}: AdvancedSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    storyTypes: [],
    projects: [],
    assignees: [],
    statuses: [],
    priorities: [],
    dateRange: { start: null, end: null },
  });

  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [savedSearches, setSavedSearches] = useState<
    Array<{ name: string; filters: SearchFilters }>
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const debouncedQuery = useDebounce(filters.query, 300);

  // Load saved searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('saved-searches');
    if (saved) {
      try {
        setSavedSearches(JSON.parse(saved));
      } catch (error) {
        logger.error('Failed to load saved searches:', error as Error);
      }
    }
  }, []);

  // Save searches to localStorage
  useEffect(() => {
    localStorage.setItem('saved-searches', JSON.stringify(savedSearches));
  }, [savedSearches]);

  // Generate search suggestions based on current query
  const searchSuggestions = useMemo(() => {
    if (!filters.query.trim()) return [];

    const query = filters.query.toLowerCase();
    const suggestions: string[] = [];

    // Add story titles that match
    stories.forEach(story => {
      if (story.title.toLowerCase().includes(query)) {
        suggestions.push(story.title);
      }
    });

    // Add story types that match
    storyTypes.forEach(type => {
      if (type.name.toLowerCase().includes(query)) {
        suggestions.push(type.name);
      }
    });

    // Add project names that match
    projects.forEach(project => {
      if (project.name.toLowerCase().includes(query)) {
        suggestions.push(project.name);
      }
    });

    // Add user names that match
    users.forEach(user => {
      if (user.name.toLowerCase().includes(query)) {
        suggestions.push(user.name);
      }
    });

    return [...new Set(suggestions)].slice(0, 5);
  }, [filters.query, stories, storyTypes, projects, users]);

  const handleSearch = useCallback(() => {
    if (
      filters.query.trim() ||
      filters.storyTypes.length > 0 ||
      filters.projects.length > 0 ||
      filters.assignees.length > 0 ||
      filters.statuses.length > 0 ||
      filters.priorities.length > 0 ||
      filters.dateRange.start ||
      filters.dateRange.end
    ) {
      // Add to search history
      if (filters.query.trim()) {
        setSearchHistory(prev => {
          const newHistory = [
            filters.query,
            ...prev.filter(q => q !== filters.query),
          ].slice(0, 10);
          return newHistory;
        });
      }

      onSearch(filters);
    }
  }, [filters, onSearch]);

  const handleClear = useCallback(() => {
    setFilters({
      query: '',
      storyTypes: [],
      projects: [],
      assignees: [],
      statuses: [],
      priorities: [],
      dateRange: { start: null, end: null },
    });
    onClear();
  }, [onClear]);

  const handleSaveSearch = useCallback(() => {
    const name = prompt('نام جستجوی ذخیره شده:');
    if (name && name.trim()) {
      setSavedSearches(prev => [
        ...prev,
        { name: name.trim(), filters: { ...filters } },
      ]);
    }
  }, [filters]);

  const handleLoadSearch = useCallback(
    (savedSearch: { name: string; filters: SearchFilters }) => {
      setFilters(savedSearch.filters);
      onSearch(savedSearch.filters);
    },
    [onSearch]
  );

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setFilters(prev => ({ ...prev, query: suggestion }));
    setShowSuggestions(false);
  }, []);

  const handleFilterChange = useCallback(
    (key: keyof SearchFilters, value: any) => {
      setFilters(prev => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleDateChange = useCallback(
    (type: 'start' | 'end', date: Date | null) => {
      setFilters(prev => ({
        ...prev,
        dateRange: { ...prev.dateRange, [type]: date },
      }));
    },
    []
  );

  // Auto-search when query changes (debounced)
  useEffect(() => {
    if (debouncedQuery !== filters.query) {
      handleSearch();
    }
  }, [debouncedQuery, handleSearch]);

  const hasActiveFilters =
    filters.query.trim() ||
    filters.storyTypes.length > 0 ||
    filters.projects.length > 0 ||
    filters.assignees.length > 0 ||
    filters.statuses.length > 0 ||
    filters.priorities.length > 0 ||
    filters.dateRange.start ||
    filters.dateRange.end;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Bar */}
      <div className='relative'>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
          <Input
            type='text'
            placeholder='جستجو در داستان‌ها...'
            value={filters.query}
            onChange={e => handleFilterChange('query', e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className='pl-10 pr-4 py-2'
          />
          {filters.query && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => handleFilterChange('query', '')}
              className='absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0'
            >
              <X className='w-3 h-3' />
            </Button>
          )}
        </div>

        {/* Search Suggestions */}
        <AnimatePresence>
          {showSuggestions && searchSuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className='absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1'
            >
              {searchSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className='w-full text-left px-3 py-2 hover:bg-gray-50 text-sm text-gray-700'
                >
                  {suggestion}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Advanced Filters Toggle */}
      <div className='flex items-center justify-between'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => setIsExpanded(!isExpanded)}
          className='flex items-center gap-2'
        >
          <Filter className='w-4 h-4' />
          فیلترهای پیشرفته
          <ChevronDown
            className={cn(
              'w-4 h-4 transition-transform',
              isExpanded && 'rotate-180'
            )}
          />
        </Button>

        <div className='flex items-center gap-2'>
          {hasActiveFilters && (
            <Button
              variant='outline'
              size='sm'
              onClick={handleClear}
              className='text-red-600 hover:text-red-700'
            >
              پاک کردن فیلترها
            </Button>
          )}

          <Button
            variant='outline'
            size='sm'
            onClick={handleSaveSearch}
            disabled={!hasActiveFilters}
          >
            <Bookmark className='w-4 h-4 mr-1' />
            ذخیره جستجو
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className='overflow-hidden'
          >
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>فیلترهای پیشرفته</CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                {/* Story Types */}
                <div>
                  <Label className='text-sm font-medium mb-3 block'>
                    نوع داستان
                  </Label>
                  <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
                    {storyTypes.map(type => (
                      <div
                        key={type.id}
                        className='flex items-center space-x-2'
                      >
                        <Checkbox
                          id={`type-${type.id}`}
                          checked={filters.storyTypes.includes(type.id)}
                          onCheckedChange={checked => {
                            if (checked) {
                              handleFilterChange('storyTypes', [
                                ...filters.storyTypes,
                                type.id,
                              ]);
                            } else {
                              handleFilterChange(
                                'storyTypes',
                                filters.storyTypes.filter(id => id !== type.id)
                              );
                            }
                          }}
                        />
                        <Label htmlFor={`type-${type.id}`} className='text-sm'>
                          {type.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Projects */}
                <div>
                  <Label className='text-sm font-medium mb-3 block'>
                    پروژه
                  </Label>
                  <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
                    {projects.map(project => (
                      <div
                        key={project.id}
                        className='flex items-center space-x-2'
                      >
                        <Checkbox
                          id={`project-${project.id}`}
                          checked={filters.projects.includes(project.id)}
                          onCheckedChange={checked => {
                            if (checked) {
                              handleFilterChange('projects', [
                                ...filters.projects,
                                project.id,
                              ]);
                            } else {
                              handleFilterChange(
                                'projects',
                                filters.projects.filter(id => id !== project.id)
                              );
                            }
                          }}
                        />
                        <Label
                          htmlFor={`project-${project.id}`}
                          className='text-sm'
                        >
                          {project.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status and Priority */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <Label className='text-sm font-medium mb-3 block'>
                      وضعیت
                    </Label>
                    <div className='space-y-2'>
                      {['PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'].map(
                        status => (
                          <div
                            key={status}
                            className='flex items-center space-x-2'
                          >
                            <Checkbox
                              id={`status-${status}`}
                              checked={filters.statuses.includes(status)}
                              onCheckedChange={checked => {
                                if (checked) {
                                  handleFilterChange('statuses', [
                                    ...filters.statuses,
                                    status,
                                  ]);
                                } else {
                                  handleFilterChange(
                                    'statuses',
                                    filters.statuses.filter(s => s !== status)
                                  );
                                }
                              }}
                            />
                            <Label
                              htmlFor={`status-${status}`}
                              className='text-sm'
                            >
                              {status === 'COMPLETED' && 'تکمیل شده'}
                              {status === 'IN_PROGRESS' && 'در حال انجام'}
                              {status === 'PENDING' && 'در انتظار'}
                              {status === 'BLOCKED' && 'مسدود شده'}
                            </Label>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className='text-sm font-medium mb-3 block'>
                      اولویت
                    </Label>
                    <div className='space-y-2'>
                      {['HIGH', 'MEDIUM', 'LOW'].map(priority => (
                        <div
                          key={priority}
                          className='flex items-center space-x-2'
                        >
                          <Checkbox
                            id={`priority-${priority}`}
                            checked={filters.priorities.includes(priority)}
                            onCheckedChange={checked => {
                              if (checked) {
                                handleFilterChange('priorities', [
                                  ...filters.priorities,
                                  priority,
                                ]);
                              } else {
                                handleFilterChange(
                                  'priorities',
                                  filters.priorities.filter(p => p !== priority)
                                );
                              }
                            }}
                          />
                          <Label
                            htmlFor={`priority-${priority}`}
                            className='text-sm'
                          >
                            {priority === 'HIGH' && 'بالا'}
                            {priority === 'MEDIUM' && 'متوسط'}
                            {priority === 'LOW' && 'پایین'}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <Label className='text-sm font-medium mb-3 block'>
                    بازه زمانی
                  </Label>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <Label className='text-xs text-gray-600 mb-1 block'>
                        از تاریخ
                      </Label>
                      <Input
                        type='date'
                        value={
                          filters.dateRange.start
                            ? filters.dateRange.start
                                .toISOString()
                                .split('T')[0]
                            : ''
                        }
                        onChange={e =>
                          handleDateChange(
                            'start',
                            e.target.value ? new Date(e.target.value) : null
                          )
                        }
                        className='w-full'
                      />
                    </div>
                    <div>
                      <Label className='text-xs text-gray-600 mb-1 block'>
                        تا تاریخ
                      </Label>
                      <Input
                        type='date'
                        value={
                          filters.dateRange.end
                            ? filters.dateRange.end.toISOString().split('T')[0]
                            : ''
                        }
                        onChange={e =>
                          handleDateChange(
                            'end',
                            e.target.value ? new Date(e.target.value) : null
                          )
                        }
                        className='w-full'
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search History and Saved Searches */}
      {(searchHistory.length > 0 || savedSearches.length > 0) && (
        <div className='space-y-4'>
          {/* Search History */}
          {searchHistory.length > 0 && (
            <div>
              <Label className='text-sm font-medium mb-2 block flex items-center gap-2'>
                <History className='w-4 h-4' />
                تاریخچه جستجو
              </Label>
              <div className='flex flex-wrap gap-2'>
                {searchHistory.map((query, index) => (
                  <Badge
                    key={index}
                    variant='secondary'
                    className='cursor-pointer hover:bg-gray-200'
                    onClick={() => handleFilterChange('query', query)}
                  >
                    {query}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Saved Searches */}
          {savedSearches.length > 0 && (
            <div>
              <Label className='text-sm font-medium mb-2 block flex items-center gap-2'>
                <Bookmark className='w-4 h-4' />
                جستجوهای ذخیره شده
              </Label>
              <div className='space-y-2'>
                {savedSearches.map((savedSearch, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between p-2 bg-gray-50 rounded-md'
                  >
                    <span className='text-sm font-medium'>
                      {savedSearch.name}
                    </span>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleLoadSearch(savedSearch)}
                    >
                      بارگذاری
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
