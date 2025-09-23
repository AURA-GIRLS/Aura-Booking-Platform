import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CalendarEvent } from '@/services/dashboard';

interface CalendarOverviewProps {
  currentDate: Date;
  calendarEvents: CalendarEvent[];
  navigateMonth: (direction: 'prev' | 'next') => void;
}

export default function CalendarOverview({ currentDate, calendarEvents, navigateMonth }: CalendarOverviewProps) {
  const generateCalendarDays = () => {
    const days: Array<{ day: number; status: string; hasEvents: boolean; events: CalendarEvent[]; confirmedCount: number; pendingCount: number; completedCount: number; inCurrentMonth: boolean; }>= [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startWeekday = firstOfMonth.getDay(); // 0..6
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const today = new Date();
    const isCurrentMonthView = today.getFullYear() === year && today.getMonth() === month;

    // Leading days
    for (let i = startWeekday - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      days.push({ day: d, status: '', hasEvents: false, events: [], confirmedCount: 0, pendingCount: 0, completedCount: 0, inCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dayEvents = calendarEvents.filter(event => event.day === i);
      const confirmedCount = dayEvents.filter(ev => (ev.status || '').toLowerCase() === 'confirmed').length;
      const pendingCount = dayEvents.filter(ev => (ev.status || '').toLowerCase() === 'pending').length;
      const completedCount = dayEvents.filter(ev => (ev.status || '').toLowerCase() === 'completed').length;
      let status = '';
      const hasEvents = dayEvents.length > 0;
      if (completedCount > 0) status = 'completed';
      else if (confirmedCount > 0) status = 'confirmed';
      else if (pendingCount > 0) status = 'pending';

      if (isCurrentMonthView && i === today.getDate()) {
        status = 'today';
      }

      days.push({ day: i, status, hasEvents, events: dayEvents, confirmedCount, pendingCount, completedCount, inCurrentMonth: true });
    }

    // Trailing days to complete grid
    const remainder = days.length % 7;
    if (remainder !== 0) {
      const toAdd = 7 - remainder;
      for (let i = 1; i <= toAdd; i++) {
        days.push({ day: i, status: '', hasEvents: false, events: [], confirmedCount: 0, pendingCount: 0, completedCount: 0, inCurrentMonth: false });
      }
    }

    return days;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">Calendar Overview</h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigateMonth('prev')}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium">{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          <button 
            onClick={() => navigateMonth('next')}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {generateCalendarDays().map(({ day, status, hasEvents, confirmedCount, pendingCount, completedCount, inCurrentMonth }, idx) => (
           <div
             key={`${idx}-${day}`}
             className={`
               aspect-square flex items-center justify-center text-sm rounded-lg cursor-pointer relative
               bg-white border ${status === 'today' ? 'border-pink-300 bg-pink-100' : 'border-gray-200'} hover:bg-gray-50
               ${!inCurrentMonth ? 'text-gray-300' : 'text-gray-900'}
             `}
           >
             <span className={`${status === 'today' ? 'text-pink-600 font-semibold' : ''}`}>{day}</span>
             {hasEvents && (
               <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5 flex-wrap justify-center">
                 {Array.from({ length: confirmedCount }).map((_, idx) => (
                   <div key={`c-${idx}`} className="w-1.5 h-1.5 rounded-full bg-green-500" />
                 ))}
                 {Array.from({ length: pendingCount }).map((_, idx) => (
                   <div key={`p-${idx}`} className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                 ))}
                 {Array.from({ length: completedCount }).map((_, idx) => (
                   <div key={`d-${idx}`} className="w-1.5 h-1.5 rounded-full bg-black" />
                 ))}
               </div>
             )}
           </div>
         ))}
      </div>

      <div className="flex items-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Confirmed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-black rounded-full"></div>
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}
