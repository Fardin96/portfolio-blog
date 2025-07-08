'use client';

import * as React from 'react';

import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function RangeCalendar() {
  // const [dropdown, setDropdown] =
  //   React.useState<React.ComponentProps<typeof Calendar>['captionLayout']>(
  //     'dropdown'
  //   );
  const [date, setDate] = React.useState<Date | undefined>(
    new Date(2025, 5, 12)
  );

  return (
    <div className='flex flex-col gap-4'>
      <Calendar
        mode='single'
        defaultMonth={date}
        numberOfMonths={2}
        selected={date}
        onSelect={setDate}
        className='rounded-lg border shadow-sm'
        captionLayout='dropdown'
      />
    </div>
  );
}
