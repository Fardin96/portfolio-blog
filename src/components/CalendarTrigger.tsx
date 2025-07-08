'use client';

import * as React from 'react';
import { ChevronDownIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RangeCalendar } from './RangeCalendar';

export function CalendarTrigger() {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(undefined);

  // Responsive alignment based on screen size
  const [alignment, setAlignment] = React.useState<'start' | 'end'>('end');

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
    <div className='flex flex-col gap-3'>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            id='date'
            className='w-full sm:w-48 justify-between font-normal min-w-0'
          >
            <span className='truncate'>
              {date ? date.toLocaleDateString() : 'Select Date Range'}
            </span>
            <ChevronDownIcon className='ml-2 flex-shrink-0' />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className='w-auto overflow-hidden p-0'
          align={alignment}
        >
          <RangeCalendar />
        </PopoverContent>
      </Popover>
    </div>
  );
}
