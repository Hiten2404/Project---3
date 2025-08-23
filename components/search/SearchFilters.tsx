import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select, SelectItem } from '../ui/Select';
import { Search, MapPin, Building2, SlidersHorizontal, X } from '../icons';
import type { Category, Location, SearchFilters as SearchFiltersType } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';

interface SearchFiltersProps {
  categories: Category[];
  locations: Location[];
  states: string[];
  onFiltersChange: (filters: SearchFiltersType) => void;
  disabled?: boolean;
  initialFilters: SearchFiltersType;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({ categories, locations, states, onFiltersChange, disabled = false, initialFilters }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<SearchFiltersType>(initialFilters);

  const debouncedSearch = useDebounce(filters.search, 500);

  useEffect(() => {
    // Exclude the debounced search term from the initial trigger
    const filtersToSync = {...filters, search: debouncedSearch};
    onFiltersChange(filtersToSync);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filters.category, filters.location, filters.state, filters.jobType, filters.salaryMin, filters.salaryMax, filters.sortBy, filters.sortOrder, filters.savedOnly]);

  const updateFilter = <K extends keyof SearchFiltersType,>(key: K, value: SearchFiltersType[K]) => {
    setFilters(prev => {
        const newFilters = { ...prev, [key]: value };
        if (key === 'state') {
            newFilters.location = ''; // Reset location when state changes
        }
        return newFilters;
    });
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    onFiltersChange(initialFilters);
  };
  
  const hasActiveFilters = Object.entries(filters).some(([key, value]) => 
    !!value && !['sortBy', 'sortOrder', 'search'].includes(key) && JSON.stringify(value) !== JSON.stringify(initialFilters[key as keyof SearchFiltersType])
  );

  const filteredLocations = filters.state ? locations.filter(loc => loc.state === filters.state) : [];

  return (
    <div className="space-y-4">
      <fieldset disabled={disabled} className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search jobs, departments, skills..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
            <div className="w-full md:w-auto flex gap-4">
               <Select
                  value={filters.state || ''}
                  onChange={(e) => updateFilter('state', e.target.value)}
                  icon={<MapPin />}
                  className="w-full md:w-[200px] h-12"
               >
                  <SelectItem value="">All States</SelectItem>
                  {states.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}
                </Select>
              <Select
                value={filters.category || ''}
                onChange={(e) => updateFilter('category', e.target.value)}
                icon={<Building2 />}
                className="w-full md:w-[200px] h-12"
              >
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map(cat => <SelectItem key={cat.slug} value={cat.slug}>{cat.name}</SelectItem>)}
              </Select>
            </div>
            <Button variant="outline" onClick={() => setIsExpanded(!isExpanded)} className="whitespace-nowrap h-12">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && <span className="ml-2 h-2 w-2 rounded-full bg-blue-500"></span>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isExpanded && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Advanced Filters</CardTitle>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                    <label className="text-sm font-medium mb-2 block">Location</label>
                    <Select
                      value={filters.location || ''}
                      onChange={(e) => updateFilter('location', e.target.value)}
                      disabled={!filters.state}
                    >
                      {filters.state ? (
                        <>
                          <SelectItem value="">All Locations in {filters.state}</SelectItem>
                          {filteredLocations.map(loc => <SelectItem key={loc.slug} value={loc.slug}>{loc.city}</SelectItem>)}
                        </>
                      ) : (
                        <SelectItem value="" disabled>Select a state first</SelectItem>
                      )}
                    </Select>
                </div>
                <div>
                    <label className="text-sm font-medium mb-2 block">Salary Range (₹ per month)</label>
                    <div className="flex gap-2 items-center">
                        <Input type="number" placeholder="Min" value={filters.salaryMin || ''} onChange={(e) => updateFilter('salaryMin', e.target.value ? Number(e.target.value) : undefined)} />
                        <span className="text-slate-500">to</span>
                        <Input type="number" placeholder="Max" value={filters.salaryMax || ''} onChange={(e) => updateFilter('salaryMax', e.target.value ? Number(e.target.value) : undefined)} />
                    </div>
                </div>
                <div>
                    <label className="text-sm font-medium mb-2 block">Job Type</label>
                    <Select
                      value={filters.jobType || ''}
                      onChange={(e) => updateFilter('jobType', e.target.value as SearchFiltersType['jobType'])}
                    >
                        <SelectItem value="">All Types</SelectItem>
                        <SelectItem value="permanent">Permanent</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="temporary">Temporary</SelectItem>
                    </Select>
                </div>
            </div>
            
             <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-sm font-medium mb-2 block">Sort By</label>
                    <div className="flex gap-2">
                        <Select
                          value={filters.sortBy}
                          onChange={(e) => updateFilter('sortBy', e.target.value as SearchFiltersType['sortBy'])}
                          className="flex-1"
                        >
                            <SelectItem value="posted_date">Posted Date</SelectItem>
                            <SelectItem value="deadline">Application Deadline</SelectItem>
                            <SelectItem value="salary">Salary</SelectItem>
                            <SelectItem value="title">Job Title</SelectItem>
                        </Select>
                        <Select
                          value={filters.sortOrder}
                          onChange={(e) => updateFilter('sortOrder', e.target.value as SearchFiltersType['sortOrder'])}
                          className="w-32"
                        >
                            <SelectItem value="desc">Newest First</SelectItem>
                            <SelectItem value="asc">Oldest First</SelectItem>
                        </Select>
                    </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Preferences</label>
                  <div className="flex items-center space-x-2 mt-2 pt-2">
                    <input
                      type="checkbox"
                      id="savedOnly"
                      checked={!!filters.savedOnly}
                      onChange={(e) => updateFilter('savedOnly', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="savedOnly" className="text-sm text-slate-700 dark:text-slate-300">
                      Show Saved Jobs Only
                    </label>
                  </div>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>
      )}
      </fieldset>
    </div>
  );
};