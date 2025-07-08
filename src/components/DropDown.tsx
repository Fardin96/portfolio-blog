'use client';

import * as React from 'react';
import { DropdownMenuCheckboxItemProps } from '@radix-ui/react-dropdown-menu';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Checked = DropdownMenuCheckboxItemProps['checked'];

export function DropDown({ categories }: { categories: string[] }) {
  const [showStatusBar, setShowStatusBar] = React.useState<Checked>(true);
  const [showActivityBar, setShowActivityBar] = React.useState<Checked>(false);
  const [showPanel, setShowPanel] = React.useState<Checked>(false);

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' disabled={categories.length === 0}>
          Categories
        </Button>
      </DropdownMenuTrigger>

      {categories.length > 0 && (
        <DropdownMenuContent className='w-56' align={alignment}>
          {/* <DropdownMenuLabel>Appearance</DropdownMenuLabel> */}
          {/* <DropdownMenuSeparator /> */}

          {categories.map((category) => (
            <DropdownMenuCheckboxItem
              key={category}
              checked={showStatusBar}
              onCheckedChange={setShowStatusBar}
            >
              {category}
            </DropdownMenuCheckboxItem>
          ))}

          {/* <DropdownMenuCheckboxItem
          checked={showStatusBar}
          onCheckedChange={setShowStatusBar}
        >
          Status Bar
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={showActivityBar}
          onCheckedChange={setShowActivityBar}
        >
          Activity Bar
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={showPanel}
          onCheckedChange={setShowPanel}
        >
          Panel
        </DropdownMenuCheckboxItem> */}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}
