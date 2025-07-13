'use client';

import { useMemo, useCallback, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AllPosts, Tag } from '../utils/types/types';

interface FilterState {
  category: string;
  startDate: string;
  endDate: string;
  filterMode: 'inclusive' | 'exclusive';
}

interface UseFilteredProjectsReturn {
  filteredProjects: AllPosts[];
  totalCount: number;
  currentFilters: FilterState;
  updateFilter: (key: string, value: string) => void;
  clearFilters: () => void;
  isTransitioning: boolean;
}

export function useFilteredProjects(
  allProjects: AllPosts[]
): UseFilteredProjectsReturn {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isTransitioning, startTransition] = useTransition();

  const currentFilters = useMemo(
    (): FilterState => ({
      category: searchParams.get('category') || '',
      startDate: searchParams.get('startDate') || '',
      endDate: searchParams.get('endDate') || '',
      filterMode:
        (searchParams.get('filterMode') as 'inclusive' | 'exclusive') ||
        'inclusive',
    }),
    [searchParams]
  );

  const filteredProjects = useMemo(() => {
    return allProjects.filter((project) => {
      // Category filtering
      if (currentFilters.category) {
        const selectedCategories = currentFilters.category
          .split(',')
          .filter(Boolean);

        if (
          selectedCategories.length > 0 &&
          (!project.tags ||
            (currentFilters.filterMode === 'exclusive'
              ? !selectedCategories.every((cat) =>
                  project.tags.some((tag) => tag.title === cat)
                )
              : !selectedCategories.some((cat) =>
                  project.tags.some((tag) => tag.title === cat)
                )))
        ) {
          return false;
        }
      }

      // Date range filtering
      if (currentFilters.startDate || currentFilters.endDate) {
        const projectDate = project.date ? new Date(project.date) : undefined;
        if (!projectDate) return false;

        if (currentFilters.startDate) {
          const startDate = new Date(currentFilters.startDate);
          if (projectDate < startDate) return false;
        }

        if (currentFilters.endDate) {
          const endDate = new Date(currentFilters.endDate);
          endDate.setHours(23, 59, 59, 999);
          if (projectDate > endDate) return false;
        }
      }

      return true;
    });
  }, [allProjects, currentFilters]);

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      if (value) params.set(key, value);
      else params.delete(key);
      startTransition(() => router.push(`/projects?${params.toString()}`));
    },
    [searchParams, router]
  );

  const clearFilters = useCallback(() => {
    startTransition(() => router.push('/projects'));
  }, [router]);

  return {
    filteredProjects,
    totalCount: filteredProjects.length,
    currentFilters,
    updateFilter,
    clearFilters,
    isTransitioning,
  };
}
