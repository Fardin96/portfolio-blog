'use client';

import * as React from 'react';
import { DropdownMenuCheckboxItemProps } from '@radix-ui/react-dropdown-menu';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Checked = DropdownMenuCheckboxItemProps['checked'];

interface DropDownProps {
  categories: string[];
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export function DropDown({
  categories,
  selectedCategory,
  onCategoryChange,
}: DropDownProps) {
  // Responsive alignment based on screen size
  const [alignment, setAlignment] = React.useState<'start' | 'end'>('start');

  // handle window resize
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // lg breakpoint
        setAlignment('end');
      } else {
        setAlignment('start');
      }
    };

    // Set initial alignment
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCategoryToggle = (category: string) => {
    if (onCategoryChange) {
      // If category is already selected, deselect it, otherwise select it
      const newCategory = selectedCategory === category ? '' : category;
      onCategoryChange(newCategory);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' disabled={categories.length === 0}>
          {selectedCategory ? selectedCategory : 'Categories'}
        </Button>
      </DropdownMenuTrigger>

      {categories.length > 0 && (
        <DropdownMenuContent
          className='w-56 max-h-60 overflow-y-auto'
          align={alignment}
        >
          {categories.map((category) => (
            <DropdownMenuCheckboxItem
              key={category}
              checked={selectedCategory === category}
              onCheckedChange={() => handleCategoryToggle(category)}
            >
              {category}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}
