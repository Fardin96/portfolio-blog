'use client';

import Link from 'next/link';
import { AllPosts, Tag } from '../utils/types/types';
import { formatDate } from '../utils/utils';
import { DropDown } from './DropDown';
import { CalendarTrigger } from './CalendarTrigger';
import { useFilteredProjects } from '../hooks/useFilteredProjects';
import { Button } from './ui/button';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { startTransition } from 'react';
import { truncateDescription } from '../utils/githubServicesHelpers';
import { BsUnion, BsIntersect } from 'react-icons/bs';

interface ProjectsWithFiltersProps {
  allProjects: AllPosts[];
  tags: string[];
}

export function ProjectsWithFilters({
  allProjects,
  tags,
}: ProjectsWithFiltersProps) {
  const {
    filteredProjects,
    totalCount,
    currentFilters,
    updateFilter,
    clearFilters,
    isTransitioning,
  } = useFilteredProjects(allProjects);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Empty view
  if (allProjects.length === 0) {
    return (
      <div>
        <h1 className='text-3xl font-bold mb-6'>My Projects</h1>
        <h3>no projects yet :(</h3>
      </div>
    );
  }

  // No matches view
  if (
    filteredProjects.length === 0 &&
    (currentFilters.category ||
      currentFilters.startDate ||
      currentFilters.endDate)
  ) {
    return (
      <div>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-2 mb-6'>
          <h1 className='text-2xl sm:text-3xl font-bold'>My Projects</h1>
          <div className='flex items-center gap-2 flex-wrap'>
            <DropDown
              categories={tags}
              selectedCategory={currentFilters.category.split(',')}
              onCategoryChange={(category) =>
                updateFilter('category', category)
              }
            />

            {currentFilters.category.split(',').filter(Boolean).length > 1 && (
              <Button
                variant='outline'
                onClick={() =>
                  updateFilter(
                    'filterMode',
                    currentFilters.filterMode === 'inclusive'
                      ? 'exclusive'
                      : 'inclusive'
                  )
                }
                disabled={false}
                title={
                  currentFilters.filterMode === 'exclusive'
                    ? 'Exclusive (AND)'
                    : 'Inclusive (OR)'
                }
              >
                {currentFilters.filterMode === 'exclusive' ? (
                  <BsIntersect />
                ) : (
                  <BsUnion />
                )}
              </Button>
            )}

            <CalendarTrigger
              startDate={currentFilters.startDate}
              endDate={currentFilters.endDate}
              onDateRangeChange={(startDate, endDate) => {
                startTransition(() => {
                  const params = new URLSearchParams(searchParams);
                  if (startDate) params.set('startDate', startDate);
                  else params.delete('startDate');
                  if (endDate) params.set('endDate', endDate);
                  else params.delete('endDate');
                  router.push(`/projects?${params.toString()}`);
                });
              }}
            />
            <Button
              variant='outline'
              onClick={clearFilters}
              disabled={
                !currentFilters.category &&
                !currentFilters.startDate &&
                !currentFilters.endDate
              }
            >
              Reset
            </Button>
          </div>
        </div>
        <div className='text-center py-8'>
          <h3 className='text-lg mb-4'>
            No projects match your current filters
          </h3>
          <button
            onClick={clearFilters}
            className='text-blue-500 hover:text-blue-700 underline'
          >
            Clear all filters
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={isTransitioning ? 'opacity-70 pointer-events-none' : ''}>
      {/* Title and filters */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-2 mb-6'>
        <h1 className='text-2xl sm:text-3xl font-bold'>My Projects</h1>
        <div className='flex items-center gap-2 flex-wrap'>
          <DropDown
            categories={tags}
            selectedCategory={currentFilters.category.split(',')}
            onCategoryChange={(category) => updateFilter('category', category)}
          />

          {currentFilters.category.split(',').filter(Boolean).length > 1 && (
            <Button
              variant='outline'
              onClick={() =>
                updateFilter(
                  'filterMode',
                  currentFilters.filterMode === 'inclusive'
                    ? 'exclusive'
                    : 'inclusive'
                )
              }
              disabled={false}
              title={
                currentFilters.filterMode === 'exclusive'
                  ? 'Exclusive (AND)'
                  : 'Inclusive (OR)'
              }
            >
              {currentFilters.filterMode === 'exclusive' ? (
                <BsIntersect />
              ) : (
                <BsUnion />
              )}
            </Button>
          )}

          <CalendarTrigger
            startDate={currentFilters.startDate}
            endDate={currentFilters.endDate}
            onDateRangeChange={(startDate, endDate) => {
              startTransition(() => {
                const params = new URLSearchParams(searchParams);
                if (startDate) params.set('startDate', startDate);
                else params.delete('startDate');
                if (endDate) params.set('endDate', endDate);
                else params.delete('endDate');
                router.push(`/projects?${params.toString()}`);
              });
            }}
          />
          <Button
            variant='outline'
            onClick={clearFilters}
            disabled={
              !currentFilters.category &&
              !currentFilters.startDate &&
              !currentFilters.endDate
            }
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Results summary */}
      {(currentFilters.category ||
        currentFilters.startDate ||
        currentFilters.endDate) && (
        <div className='flex items-center gap-2 mb-4 text-sm text-gray-600'>
          <span>
            Showing {totalCount} result{totalCount !== 1 ? 's' : ''}
          </span>
          {currentFilters.category && (
            <span className='px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded'>
              Category:{' '}
              {currentFilters.category
                .split(',')
                .filter(Boolean)
                .map((cat) => `#${cat.trim()}`)
                .join(', ')}
            </span>
          )}
          {(currentFilters.startDate || currentFilters.endDate) && (
            <span className='px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded'>
              Date: {currentFilters.startDate || 'Any'} -{' '}
              {currentFilters.endDate || 'Any'}
            </span>
          )}
        </div>
      )}

      {/* Projects grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className='border rounded-lg p-4 shadow transition-all duration-200 custom-dark-shadow hover:scale-102'
          >
            <h2 className='text-xl font-semibold mb-2'>{project.title}</h2>
            <p className='text-gray-500 text-sm mb-2'>
              {project.date ? formatDate(project.date) : 'Date unavailable'}
            </p>
            {/* Tags display */}
            {project.tags && project.tags.length > 0 && (
              <div className='flex flex-wrap gap-2 mb-3'>
                {project.tags.map((tag, index) => (
                  <span
                    key={index}
                    className={`px-2 py-1 text-xs rounded-full cursor-pointer transition-colors ${
                      currentFilters.category.split(',').includes(tag.title)
                        ? 'bg-blue-500 text-white'
                        : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800'
                    }`}
                    onClick={() => {
                      const selected = currentFilters.category
                        .split(',')
                        .filter(Boolean);
                      const newSelected = selected.includes(tag.title)
                        ? selected.filter((c) => c !== tag.title)
                        : [...selected, tag.title];
                      updateFilter('category', newSelected.join(','));
                    }}
                  >
                    {tag.title}
                  </span>
                ))}
              </div>
            )}
            <p className='text-gray-600 mb-4'>
              {truncateDescription(project.description)}
            </p>
            <Link
              href={`/projects/${project.id}`}
              className='text-blue-500 hover:text-blue-700'
            >
              View Project →
            </Link>
          </div>
        ))}
      </div>

      {/* Spacing */}
      <div className='py-4 sm:py-4 lg:py-10' />
    </div>
  );
}
