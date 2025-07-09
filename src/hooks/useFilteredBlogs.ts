'use client';

import { useMemo, useCallback, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { BlogPost } from '../utils/types/types';

interface FilterState {
  category: string;
  startDate: string;
  endDate: string;
}

interface UseFilteredBlogsReturn {
  filteredBlogs: BlogPost[];
  totalCount: number;
  currentFilters: FilterState;
  updateFilter: (key: string, value: string) => void;
  clearFilters: () => void;
  isTransitioning: boolean;
}

export function useFilteredBlogs(
  allBlogs: BlogPost[],
  commitMap: Map<string, any>
): UseFilteredBlogsReturn {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isTransitioning, startTransition] = useTransition();

  // Derive all state from URL - no stored state!
  const currentFilters = useMemo(
    (): FilterState => ({
      category: searchParams.get('category') || '',
      startDate: searchParams.get('startDate') || '',
      endDate: searchParams.get('endDate') || '',
    }),
    [searchParams]
  );

  // Compute filtered results
  const filteredBlogs = useMemo(() => {
    return allBlogs.filter((blog) => {
      // Category filtering
      if (
        currentFilters.category &&
        (!blog.tags || !blog.tags.includes(currentFilters.category))
      ) {
        return false;
      }

      // Date range filtering
      if (currentFilters.startDate || currentFilters.endDate) {
        const commit = commitMap.get(blog.id);
        if (commit) {
          const blogDate = new Date(commit.commit.author.date);

          if (currentFilters.startDate) {
            const startDate = new Date(currentFilters.startDate);
            if (blogDate < startDate) {
              return false;
            }
          }

          if (currentFilters.endDate) {
            const endDate = new Date(currentFilters.endDate);
            // Set end date to end of day for inclusive range
            endDate.setHours(23, 59, 59, 999);
            if (blogDate > endDate) {
              return false;
            }
          }
        } else {
          return false; // If no commit data, exclude from date filtering
        }
      }

      return true;
    });
  }, [allBlogs, currentFilters, commitMap]);

  // Simple URL updater - no state mutations!
  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams);

      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      startTransition(() => {
        router.push(`/blogs?${params.toString()}`);
      });
    },
    [searchParams, router]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    startTransition(() => {
      router.push('/blogs');
    });
  }, [router]);

  return {
    filteredBlogs,
    totalCount: filteredBlogs.length,
    currentFilters,
    updateFilter,
    clearFilters,
    isTransitioning,
  };
}
