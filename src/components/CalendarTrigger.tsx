'use client';

import * as React from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface CalendarTriggerProps {
  startDate?: string;
  endDate?: string;
  onDateRangeChange?: (startDate: string, endDate: string) => void;
}

export function CalendarTrigger({
  startDate,
  endDate,
  onDateRangeChange,
}: CalendarTriggerProps) {
  const [open, setOpen] = React.useState(false);

  // Convert string dates to DateRange object for the calendar
  const dateRange: DateRange | undefined = React.useMemo(() => {
    if (startDate || endDate) {
      return {
        from: startDate ? new Date(startDate) : undefined,
        to: endDate ? new Date(endDate) : undefined,
      };
    }
    return undefined;
  }, [startDate, endDate]);

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

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    if (onDateRangeChange) {
      if (range?.from && range?.to) {
        // Convert to ISO string for consistent formatting
        onDateRangeChange(
          range.from.toISOString().split('T')[0],
          range.to.toISOString().split('T')[0]
        );
        setOpen(false);
      } else if (range?.from && !range?.to) {
        // If only start date is selected, don't close the popover yet
        onDateRangeChange(range.from.toISOString().split('T')[0], '');
      }
    }
  };

  const handleClearDates = () => {
    if (onDateRangeChange) {
      onDateRangeChange('', '');
    }
    setOpen(false);
  };

  const formatDateRange = () => {
    if (dateRange?.from && dateRange?.to) {
      return `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`;
    } else if (dateRange?.from) {
      return `${dateRange.from.toLocaleDateString()} - ...`;
    }

    return 'Date Range';
  };

  return (
    <div className='flex flex-col gap-3'>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            id='date'
            className='w-full sm:w-34 justify-between font-normal min-w-0'
          >
            <span className='truncate'>{formatDateRange()}</span>
            <ChevronDownIcon className='ml-2 flex-shrink-0' />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className='w-auto overflow-hidden p-0'
          align={alignment}
        >
          <Calendar
            mode='range'
            selected={dateRange}
            onSelect={handleDateRangeSelect}
            numberOfMonths={2}
            initialFocus
          />
          {(startDate || endDate) && (
            <div className='p-3 border-t'>
              <Button
                variant='outline'
                size='sm'
                onClick={handleClearDates}
                className='w-full'
              >
                Clear Dates
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
