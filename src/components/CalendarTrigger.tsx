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
import { CalendarTriggerProps } from '@/utils/types/types';

export function CalendarTrigger({
  startDate,
  endDate,
  onDateRangeChange,
}: CalendarTriggerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedRange, setSelectedRange] = React.useState<
    DateRange | undefined
  >();

  // Convert string dates to DateRange object for the calendar
  const dateRange: DateRange | undefined = React.useMemo(() => {
    if (startDate || endDate) {
      return {
        from: startDate ? new Date(`${startDate}T00:00:00Z`) : undefined,
        to: endDate ? new Date(`${endDate}T00:00:00Z`) : undefined,
      };
    }

    return undefined;
  }, [startDate, endDate]);

  // Use selectedRange if actively selecting, otherwise use dateRange from props
  const calendarSelection = selectedRange || dateRange;

  // Responsive alignment based on screen size
  const [alignment, setAlignment] = React.useState<'start' | 'end'>('end');

  // handle responsive alignment via window resize
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
    setSelectedRange(range);

    if (onDateRangeChange) {
      if (
        range?.from &&
        range?.to &&
        range.from.getTime() !== range.to.getTime()
      ) {
        // Complete range selected
        onDateRangeChange(
          getLocalDateString(range.from),
          getLocalDateString(range.to)
        );
        setOpen(false);
        setSelectedRange(undefined); // Clear local state
      } else if (range?.from) {
        // Single date selected
        onDateRangeChange(getLocalDateString(range.from), '');
      }
    }
  };

  // Helper to get YYYY-MM-DD in local timezone
  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleClearDates = () => {
    if (onDateRangeChange) {
      onDateRangeChange('', '');
    }

    setOpen(false);
  };

  const formatDateRange = () => {
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
            selected={calendarSelection}
            onSelect={handleDateRangeSelect}
            numberOfMonths={1}
            captionLayout='dropdown'
            // autoFocus={false}
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
