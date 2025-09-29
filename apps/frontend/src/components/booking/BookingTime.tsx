import { useMemo, useState, useEffect } from "react";
import type { BookingSlot } from "@/types/booking.dtos";

interface BookingTimeProps {
  slots: BookingSlot[]; // already transformed monthly slots for the current or multiple months
  loading?: boolean;
  error?: string;
  selectedDate?: string;
  selectedTime?: string;
  onChangeMonth?: (year: number, month: number) => void;
  onSelectSlot: (day: string, start: string, end?: string) => void;
  onBack?: () => void;
}

export function BookingTime({
  slots,
  loading,
  error,
  selectedDate,
  selectedTime,
  onChangeMonth,
  onSelectSlot,
  onBack
}: Readonly<BookingTimeProps>) {
  const today = new Date();
  const formatDayKey = (year: number, month: number, day: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-based
  const [activeDay, setActiveDay] = useState<string | undefined>(selectedDate);
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | undefined>(undefined);
  // Presentation component: relies purely on passed-in slots/loading/error

  // Start of today for past-day checks
  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const daysInMonth = useMemo(() => new Date(viewYear, viewMonth + 1, 0).getDate(), [viewYear, viewMonth]);

  const monthSlots = useMemo(() => slots.filter(s => {
    const d = s.day.split("T")[0] || s.day; // assume ISO date string
    const date = new Date(d);
    return date.getFullYear() === viewYear && date.getMonth() === viewMonth;
  }), [slots, viewYear, viewMonth]);

  const slotsByDay = useMemo(() => {
    const now = new Date();
    const currentTime = now.getTime();
    const currentDate = now.toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    
    return monthSlots.reduce<Record<string, BookingSlot[]>>((acc, s) => {
      if (!acc[s.day]) {
        acc[s.day] = [];
      }
      
      // Parse slot date and time
      const slotDate = s.day.split("T")[0] || s.day; // Get date part (YYYY-MM-DD)
      const [hours, minutes] = s.startTime.split(':').map(Number);
      
      // Create Date object for this slot
      const slotDateTime = new Date(slotDate);
      slotDateTime.setHours(hours, minutes, 0, 0);
      
      // Only filter by time if it's today, otherwise show all future slots
      if (slotDate === currentDate) {
        if (slotDateTime.getTime() <= currentTime) {
          return acc; // Skip past slots for today
        }
      }
      
      acc[s.day].push(s);
      return acc;
    }, {});
  }, [monthSlots]);

  const isDayFull = (dayNum: number) => {
    const key = formatDayKey(viewYear, viewMonth, dayNum);
    const daySlots = slotsByDay[key] || [];
    // define full: 0 available slots or maybe flagged externally; here mock: if no slots => full
    return daySlots.length === 0;
  };

  const isPastDay = (year: number, month: number, dayNum: number) => {
    const d = new Date(year, month, dayNum);
    d.setHours(0, 0, 0, 0);
    return d.getTime() < todayStart.getTime();
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11); setViewYear(y => y - 1);
    } else setViewMonth(m => m - 1);
    setActiveDay(undefined);
  };
  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0); setViewYear(y => y + 1);
    } else setViewMonth(m => m + 1);
    setActiveDay(undefined);
  };

  // notify parent when changing month (side-effect)
  useEffect(() => { onChangeMonth?.(viewYear, viewMonth); }, [viewYear, viewMonth, onChangeMonth]);

  const weekdays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]; // show header
  const firstDayOffset = new Date(viewYear, viewMonth, 1).getDay();

  const selectDay = (dayNum: number) => {
    const key = formatDayKey(viewYear, viewMonth, dayNum);
    setActiveDay(key);
    // reset previously chosen slot if switching day
    setSelectedSlot(undefined);
  };

  const daySlots = activeDay ? (slotsByDay[activeDay] || []) : [];

  // If parent passes in a pre-selected date/time (e.g., user navigating back), hydrate local selection
  useEffect(() => {
    if (selectedDate && selectedTime) {
      const match = slots.find(s => s.day === selectedDate && s.startTime === selectedTime);
      if (match) {
        setActiveDay(selectedDate);
        setSelectedSlot(match);
      }
    }
  }, [selectedDate, selectedTime, slots]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex flex-col items-start gap-2">
        <h3 className="text-2xl font-semibold text-pink-600">When are you free?</h3>
        <p className="text-sm text-neutral-500">Pick the most convenient date & time</p>
      </div>

      <div className="rounded-2xl overflow-hidden shadow-sm border bg-white">
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-pink-600 to-pink-500 text-white text-sm font-medium">
          <button onClick={handlePrevMonth} className="px-2 py-1 rounded hover:bg-white/20" aria-label="Previous month">‹</button>
          <span>Month {viewMonth + 1} {viewYear}</span>
          <button onClick={handleNextMonth} className="px-2 py-1 rounded hover:bg-white/20" aria-label="Next month">›</button>
        </div>
        <div className="p-4 grid grid-cols-7 gap-1 text-[11px] text-center">
          {weekdays.map(d => <div key={d} className="font-medium text-neutral-500 py-1">{d}</div>)}
          {Array.from({ length: firstDayOffset }).map((_, i) => <div key={"blank-"+i} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const key = formatDayKey(viewYear, viewMonth, dayNum);
            const selected = activeDay === key;
            const full = isDayFull(dayNum);
            const past = isPastDay(viewYear, viewMonth, dayNum);
            const disabled = full || past;
            return (
              <button
                key={key}
                disabled={disabled}
                onClick={() => selectDay(dayNum)}
                className={[
                  "relative h-10 flex flex-col items-center justify-center rounded-md text-[11px] font-medium border transition",
                  selected && "bg-pink-500 text-white border-pink-500 shadow-inner",
                  !selected && !disabled && "bg-white hover:border-pink-400",
                  disabled && "opacity-30 cursor-not-allowed bg-neutral-50"
                ].filter(Boolean).join(" ")}
              >
                <span>{dayNum}</span>
                {disabled && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-pink-500/60 rounded" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3 bg-gradient-to-r from-pink-600 to-pink-500 text-white text-sm font-medium flex items-center justify-between">
          <span>Select a time</span>
          {activeDay && <span className="text-xs font-normal opacity-90">{activeDay}</span>}
        </div>
        <div className="p-5">
          {loading && <div className="text-xs text-neutral-500 animate-pulse">Loading...</div>}
          {error && <div className="text-xs text-red-500">{error}</div>}
          {!loading && !activeDay && <div className="text-xs text-neutral-500">Pick a day first.</div>}
          {!loading && activeDay && daySlots.length === 0 && <div className="text-xs text-neutral-500">No availability.</div>}
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mt-2">
            {daySlots.map(slot => {
              const slotKey = `${slot.startTime}-${slot.endTime}`;
              const chosen = selectedSlot?.day === slot.day && selectedSlot?.startTime === slot.startTime;
              return (
                <button
                  key={slotKey}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={[
                    "h-9 rounded-full text-[11px] font-medium border flex items-center justify-center tracking-wide transition",
                    chosen
                      ? "bg-pink-500 border-pink-500 text-white shadow"
                      : "bg-white hover:border-pink-400"
                  ].join(" ")}
                >
                  {slot.startTime} - {slot.endTime}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex justify-between gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 border rounded-md text-sm bg-neutral-50 hover:bg-neutral-100"
          >Back</button>
        )}
        <button
          type="button"
          disabled={!selectedSlot}
          onClick={() => selectedSlot && onSelectSlot(selectedSlot.day, selectedSlot.startTime, selectedSlot.endTime)}
          className="px-4 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >Continue</button>
      </div>
    </div>
  );
}
