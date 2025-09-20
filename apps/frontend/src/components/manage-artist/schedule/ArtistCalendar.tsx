'use client';
import { Badge } from "@/components/lib/ui/badge";
import { Button } from "@/components/lib/ui/button";
import { Icon } from "@iconify/react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/lib/ui/card";
import { Separator } from "@/components/lib/ui/separator";
import { useCallback, useEffect, useMemo, useState, useRef, useLayoutEffect } from "react";
import dayjs from 'dayjs';
import { Calendar, momentLocalizer, View } from "react-big-calendar";
import moment from "moment";
import "moment/locale/vi";
import "react-big-calendar/lib/css/react-big-calendar.css";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import {artistScheduleService} from "@/services/artist-schedule";
import { ISlot } from "@/types/schedule.dtos";
import Notification from "@/components/generalUI/Notification";
import { BookingService } from "@/services/booking";

// Imported hooks and components
import { useNotification } from "../../../hooks/useNotification";
import { useCalendarEvents } from "./hooks/useCalendarEvents";
import { useEventManagement } from "./hooks/useEventManagement";
import { EventModal } from "./components/EventModal";
import { getMondayOfWeek } from "./utils/calendarUtils";
import styles from './ArtistCalendarStyles.module.css';

// localizer cho react-big-calendar, tuần bắt đầu từ thứ 2
moment.locale("vi"); // hoặc "en-gb" nếu muốn tiếng Anh nhưng tuần bắt đầu từ thứ 2
const localizer = momentLocalizer(moment);

const DragAndDropCalendar = withDragAndDrop(Calendar);

export function ArtistCalendar({ id }: { readonly id: string }) {
  // Styles moved to CSS module (ArtistCalendarStyles.module.css) to avoid hydration mismatch
  const extraStyles = null;
  const [slotData, setSlotData] = useState<ISlot[]>([]);
  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
 const [pageNumber,setPageNumber] = useState(1);
 const [pageSize,setPageSize] = useState(3);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>("week");
  const [loading, setLoading] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [pendingBookingsLoading, setPendingBookingsLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [modalSlotInfo, setModalSlotInfo] = useState<any>(null);
  const [newEventForm, setNewEventForm] = useState({
    type: 'BLOCKED',
    name: '',
    note: '',
    startTime: '',
    endTime: ''
  });

  // Refs for dynamic equal-height layout
  const rightColumnRef = useRef<HTMLDivElement | null>(null);
  const leftColumnRef = useRef<HTMLDivElement | null>(null);
  const [matchedHeight, setMatchedHeight] = useState<number | null>(null);

  // Measure right column height and apply to left column so calendar equals the content height.
  useLayoutEffect(() => {
    const measure = () => {
      if (rightColumnRef.current) {
        const h = rightColumnRef.current.scrollHeight; // full content height
        setMatchedHeight(h);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [pendingBookings]);

  // Apply CSS variable for dynamic height (avoids inline height style lint warning)
  useLayoutEffect(() => {
    if (leftColumnRef.current && matchedHeight) {
      leftColumnRef.current.style.setProperty('--equal-col-height', matchedHeight + 'px');
    }
  }, [matchedHeight]);

  // Use custom hooks
  const { notification, showSuccess, showError, closeNotification } = useNotification();

  const fetchSchedule = useCallback(async (weekStart?: string) => {
    console.log("Artist ID:", id);
    setScheduleLoading(true);
    setLoading(true);
    if (!weekStart) {
      const today = new Date();
      weekStart = getMondayOfWeek(today);
    }
    try {
      const res = await artistScheduleService.getSchedule({ muaId: id, weekStart });
      if (res.success) {
        console.log('Schedule fetched successfully.');
        setSlotData(res.data.slots || []);
        console.log("Fetched slots:", res.data.slots);
      } else {
        showError(res.message || 'Failed to fetch schedule');
      }
    } catch (err: any) {
      showError(err.message || 'Failed to fetch schedule');
    } finally {
      setScheduleLoading(false);
      setLoading(false);
    }
  }, [id, showError]);

  const fetchPendingBookings = useCallback(async()=>{
    setPendingBookingsLoading(true);
    try {
      const res = await artistScheduleService.getPendingBookings(id,pageNumber.toString(),pageSize.toString());
      if (res.success) {
        console.log('Pending bookings fetched successfully.');
        setPendingBookings(res.data || []);
        console.log("Fetched pending bookings:", res.data);
      } else {
        showError(res.message || 'Failed to fetch pending bookings');
      }
    } catch (err: any) {
      showError(err.message || 'Failed to fetch pending bookings');
    } finally {
      setPendingBookingsLoading(false);
    }
  }, [id, pageNumber, pageSize, showError])

  // Handle accept booking
  const handleAcceptBooking = useCallback(async (bookingId: string) => {
    setLoading(true);
    try {
      const response = await BookingService.acceptBooking(bookingId);
      if (response.success) {
        showSuccess('Booking accepted successfully!');
        // Refresh both pending bookings and calendar schedule
        await fetchPendingBookings();
        const weekStart = getMondayOfWeek(response.data?.bookingDate);
        await fetchSchedule(weekStart);
        setCurrentDate(new Date(response.data?.bookingDate || new Date()));
      } else {
        showError(response.message || 'Failed to accept booking');
      }
    } catch (error: any) {
      showError(error.message || 'Failed to accept booking');
    } finally {
      setLoading(false);
    }
  }, [fetchPendingBookings, fetchSchedule, showSuccess, showError]);

  // Handle reject booking
  const handleRejectBooking = useCallback(async (bookingId: string) => {
    setLoading(true);
    try {
      const response = await BookingService.rejectBooking(bookingId);
      if (response.success) {
        showSuccess('Booking rejected successfully!');
        // Refresh both pending bookings and calendar schedule
        await fetchPendingBookings();
        await fetchSchedule();
      } else {
        showError(response.message || 'Failed to reject booking');
      }
    } catch (error: any) {
      showError(error.message || 'Failed to reject booking');
    } finally {
      setLoading(false);
    }
  }, [fetchPendingBookings, fetchSchedule, showSuccess, showError]);

  // Initialize calendar event handlers
  const { handleEventDrop, handleEventResize } = useCalendarEvents({
    id,
    fetchSchedule: (weekStart?: string) => { void fetchSchedule(weekStart); },
    setLoading,
    showSuccess,
    showError
  });

  // Initialize event management handlers
  const { handleCreateEvent, handleDeleteEvent, handleUpdateEvent, handleOpenEditEvent } = useEventManagement({
    id,
    fetchSchedule: (weekStart?: string) => { void fetchSchedule(weekStart); },
    setLoading,
    showSuccess,
    showError,
    setShowAddEventModal,
    setNewEventForm,
    setSelectedEvent
  });

  // Wrapper functions for modal integration
  const handleCreateEventWrapper = useCallback(() => {
    handleCreateEvent(newEventForm, modalSlotInfo);
  }, [handleCreateEvent, newEventForm, modalSlotInfo]);

  const handleUpdateEventWrapper = useCallback(() => {
    handleUpdateEvent(newEventForm, modalSlotInfo, selectedEvent);
  }, [handleUpdateEvent, newEventForm, modalSlotInfo, selectedEvent]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  useEffect(() => {
    fetchPendingBookings();
  }, [fetchPendingBookings,currentDate]);
  // (debug removed)

  // Tách events thành 2 loại: backgroundEvents (working, override), events (booking, blocked)
  const { events, backgroundEvents } = useMemo(() => {
    const evts: any[] = [];
    const bgEvts: any[] = [];

    // Priority (higher number = higher priority / stays on top)
    const priority: Record<string, number> = {
      BOOKING: 100,
      BLOCKED: 90,
      NEW_OVERRIDE: 80,
      OVERRIDE: 70,
      NEW_WORKING: 60,
      ORIGINAL_WORKING: 50,
    };

    const makeEvent = (slot: any) => {
      if(slot.type==="BOOKING" && slot.status ==="PENDING"){ return null;}
      
      const start = moment(`${slot.day} ${slot.startTime}`, "YYYY-MM-DD HH:mm").toDate();
      const end = moment(`${slot.day} ${slot.endTime}`, "YYYY-MM-DD HH:mm").toDate();
      let title = '';
      if (slot.type === 'BOOKING') title = `${slot.customerName} - ${slot.serviceName} `;
      else if (slot.type === 'BLOCKED') title = 'Blocked Time';
  // title already defaults to '' so no need to reassign in else
      return {
        id: slot.slotId + slot.startTime|| slot.day + slot.startTime,
        title,
        start,
        end,
        type: slot.type,
        note: slot.note,
        _p: priority[slot.type] ?? 1
      };
    };

    slotData.forEach(slot => {
      // Skip pending bookings from the calendar
      if (slot.type === 'BOOKING' && slot.status === 'PENDING') {
        return;
      }
      const evt = makeEvent(slot);
      if (!evt) return; // avoid pushing null/undefined
      if (slot.type === 'ORIGINAL_WORKING' || slot.type === 'OVERRIDE' || slot.type === 'NEW_WORKING' || slot.type === 'NEW_OVERRIDE') {
        bgEvts.push(evt);
      } else {
        evts.push(evt);
      }
    });

    // Generic overlap filter: keep only highest priority per overlapping region (same day)
    const sameDay = (a: Date, b: Date) => dayjs(a).format('YYYY-MM-DD') === dayjs(b).format('YYYY-MM-DD');
    const isOverlap = (a: any, b: any) => a.start < b.end && b.start < a.end;
    const pruneLowerPriority = (kept: any[], current: any) => {
      let i = kept.length - 1;
      while (i >= 0) {
        const k = kept[i];
        if (sameDay(k.start, current.start) && isOverlap(k, current) && current._p > k._p) {
          kept.splice(i, 1);
        }
        i--;
      }
    };
    const isCovered = (kept: any[], current: any) => {
      for (const k of kept) {
        if (sameDay(k.start, current.start) && isOverlap(k, current) && k._p >= current._p) return true;
      }
      return false;
    };
    const filterOverlaps = (list: any[]) => {
      if (list.length <= 1) return list;
      const sorted = [...list].sort((a, b) => (a.start.getTime() - b.start.getTime()) || (b._p - a._p));
      const kept: any[] = [];
      for (const current of sorted) {
        if (isCovered(kept, current)) continue;
        pruneLowerPriority(kept, current);
        kept.push(current);
      }
      return kept;
    };

    const filteredEvents = filterOverlaps(evts).map(({ _p, ...rest }) => rest);
    const filteredBg = filterOverlaps(bgEvts).map(({ _p, ...rest }) => rest);

    return { events: filteredEvents, backgroundEvents: filteredBg };
  }, [slotData,fetchSchedule]);

  // Điều chỉnh bảng màu: nhấn mạnh tông hồng nhẹ nhưng vẫn phân biệt rõ các loại slot
  // BOOKING: hồng rõ ràng (để nhận biết khách đã đặt) – nền hồng nhạt + viền hồng đậm
  // WORKING (ORIGINAL/NEW_WORKING): nền trắng hơi hồng rất nhạt + viền hồng mềm để thể hiện khả dụng
  // OVERRIDE (OVERRIDE/NEW_OVERRIDE): tím hồng (lavender) để nổi bật thởi gian được chỉnh sửa/ghi đè
  // BLOCKED: xám trung tính để thể hiện không khả dụng
  const eventStyleGetter = (event: any) => {
    // Base: ultra-light backgrounds; booking slightly stronger tint & solid border
    let backgroundColor = 'rgba(255,255,255,0.55)';
    let borderColor = 'rgba(236,90,134,0.18)';
    let textColor = '#222';
    let leftBorderWidth = 3;
    let fontWeight = 600;
    let zIndex = 1;

    switch (event.type) {
      case 'BOOKING':
        backgroundColor = 'rgba(236,90,134,0.10)'; // subtle pink veil
        borderColor = '#EC5A86';
        textColor = '#111';
        leftBorderWidth = 4;
        zIndex = 2;
        break;
      case 'BLOCKED':
        backgroundColor = 'rgba(17,17,17,0.04)';
        borderColor = 'rgba(17,17,17,0.25)';
        textColor = '#444';
        fontWeight = 500;
        break;
      case 'OVERRIDE':
      case 'NEW_OVERRIDE':
        backgroundColor = 'rgba(255,227,238,0.22)'; // faint soft pink (different hue than booking)
        borderColor = 'rgba(182, 90, 236, 0.35)';
        textColor = '#333';
        fontWeight = 500;
        break;
      case 'ORIGINAL_WORKING':
      case 'NEW_WORKING':
        backgroundColor = 'rgba(255,255,255,0.35)';
        borderColor = 'rgba(236,90,134,0.22)';
        textColor = '#333';
        fontWeight = 500;
        break;
      default:
        break;
    }

    return {
      style: {
        backgroundColor,
        borderLeft: `${leftBorderWidth}px solid ${borderColor}`,
        color: textColor,
        fontSize: '0.75rem',
        fontWeight,
        borderRadius: '6px',
        padding: '2px 4px 2px 6px',
        zIndex,
        boxShadow: zIndex === 2 ? '0 1px 2px rgba(236,90,134,0.15)' : '0 1px 2px rgba(0,0,0,0.04)',
        letterSpacing: '0.25px',
        backdropFilter: 'saturate(1.05)',
        pointerEvents: 'auto' as React.CSSProperties['pointerEvents'],
        transition: 'background .15s, box-shadow .15s'
      }
    };
  };


  // Xử lý khi chuyển ngày (Back, Next, Today)
  const handleNavigate = (date:any, action:any) => {
    setCurrentDate(date);
    const weekStart = getMondayOfWeek(date);
    fetchSchedule(weekStart);
  };

  // Xử lý khi đổi view (week/day)
  const handleViewChange = (view: View) => {
    setCurrentView(view);
    const weekStart = getMondayOfWeek(currentDate);
    fetchSchedule(weekStart);
  };
   const handleOpenAddEventModal = useCallback((slotInfo:any) => {
        console.log("Slot selected:", slotInfo);
        const start = dayjs(slotInfo.start);
        const end = dayjs(slotInfo.end);
        setModalSlotInfo({
          start: start.format('YYYY-MM-DDTHH:mm'),
          end: end.format('YYYY-MM-DDTHH:mm'),
          day: start.format('YYYY-MM-DD')
        });
       if(slotInfo.action==="select") {
        setShowAddEventModal(true);
        const weekStart = getMondayOfWeek(start.format('YYYY-MM-DD'));
       fetchSchedule(weekStart);
       }
       
    }, []);

  const handleSelectEvent = useCallback((event:any) => {
        console.log("Event selected:", event);
        // Find the corresponding slot data
        const slot = slotData.find(s => 
          (s.slotId && s.slotId === event.id) || 
          (s.day + s.startTime === event.id)
        );
        setSelectedEvent({
          ...event,
          slotData: slot,
          canUpdate: event.type !== 'BOOKING'
        });
    }, [slotData]);

// Skeleton Components
const CalendarSkeleton = () => (
  <div className="w-2/3 border-r border-neutral-200 bg-white flex flex-col">
    {/* Legend Skeleton */}
    <div className="flex flex-wrap gap-5 px-6 pt-4 pb-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-sm bg-gray-200 animate-pulse" />
          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
    
    {/* Calendar Skeleton */}
    <div className="flex-1 px-6 pb-4 flex flex-col">
      <div className="flex-1 rounded-md border border-neutral-200 bg-white">
        {/* Calendar Header */}
        <div className="p-4 border-b border-neutral-200">
          <div className="flex justify-between items-center">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="flex gap-2">
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
        
        {/* Calendar Grid */}
        <div className="p-4">
          {/* Week days header */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
          
          {/* Time slots */}
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="grid grid-cols-7 gap-1">
                {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                  <div key={j} className="h-12 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const PendingBookingsSkeleton = () => (
  <div className="border-t bg-white p-6 rounded-br-lg">
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse" />
        <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
    </div>
    
    {/* Pagination skeleton */}
    <div className="mb-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="h-4 w-10 bg-gray-200 rounded animate-pulse" />
        <div className="h-8 w-12 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
    
    {/* Booking cards skeleton */}
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 border border-neutral-200 bg-white rounded">
          <div className="flex items-start justify-between mb-2">
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="flex-1 h-8 bg-gray-200 rounded animate-pulse" />
            <div className="flex-1 h-8 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

if(loading && scheduleLoading && pendingBookingsLoading){
  return (
    <div style={{height:"fit-content"}} className="min-h-screen bg-white text-[#191516] font-sans tracking-wide">
      {/* Header */}
      <div className="border-b border-[#EC5A86]/30 bg-white">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="select-none">
            <h1 className="text-[1.4rem] font-black tracking-wider uppercase text-[#111]">Calendar</h1>
            <p className="text-[0.8rem] font-medium text-[#EC5A86]">Manage your bookings & schedule</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-28 bg-gray-200 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        <CalendarSkeleton />
        
        {/* Sidebar */}
        <div className="w-1/3 flex flex-col">
          <div className="p-6 pb-4">
            <Card className="border-neutral-200 bg-white">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
              </CardHeader>
              <CardContent className="px-6 space-y-4">
                <div className="text-center py-8">
                  <div className="h-12 w-12 bg-gray-200 rounded mx-auto mb-4 animate-pulse" />
                  <div className="h-4 w-40 bg-gray-200 rounded mx-auto animate-pulse" />
                </div>
              </CardContent>
            </Card>
          </div>
          <PendingBookingsSkeleton />
        </div>
      </div>
    </div>
  );
}
  return (
  <div className={`min-h-screen max-w-7xl mx-auto px-4 bg-white text-[#191516] font-sans tracking-wide ${styles.calendarRoot}`}> 
      {extraStyles /* kept for structure; null now */}
      {matchedHeight && (
        <style>{`[data-equal-height]{height:var(--equal-col-height);}`}</style>
      )}
      {/* Header */}
  <div className="border-b border-[#EC5A86]/30 bg-white">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="select-none">
            <h1 className="text-[1.4rem] font-black tracking-wider uppercase text-[#111]">Calendar</h1>
            <p className="text-[0.8rem] font-medium text-[#EC5A86]">Manage your bookings & schedule</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-[#111] text-white border border-[#EC5A86]/40 font-semibold hover:scale-105 transition-transform duration-200">
              {pendingBookings.length} Pending
            </Badge>
            <Button
              onClick={() => setShowAddEventModal(true)}
              className="bg-[#EC5A86] hover:bg-[#d54e77] text-white font-semibold rounded-full shadow-sm px-5 focus-visible:ring-2 focus-visible:ring-[#EC5A86]/40 focus-visible:outline-none hover:scale-105 hover:shadow-md transition-all duration-200"
            >
              <Icon icon="lucide:plus" className="mr-2 h-4 w-4" />
              New Event
            </Button>
          </div>
        </div>
      </div>

  <div className="flex flex-1">{/* main workspace area below header; allow natural page scroll */}
    {/* Calendar chiếm 2/3 */}
  <div
        ref={leftColumnRef}
        // data-equal-height
        style={{ height: "fit-content" }}
        className="w-2/3 border-r border-neutral-200 bg-white flex flex-col"
      >
          {/* Legend */}
          <div className="flex flex-wrap gap-5 px-6 pt-4 pb-2 text-[11px] font-medium text-[#111] select-none">
            {/* Booking: matches eventStyleGetter (background rgba(236,90,134,0.10), border #EC5A86) */}
            <div className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-sm bg-[rgba(236,90,134,0.10)] border border-[#EC5A86]" /> <span>Booking</span></div>
            {/* Working: background rgba(255,255,255,0.35), border rgba(236,90,134,0.22) */}
            <div className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-sm bg-[rgba(255,255,255,0.35)] border border-[rgba(236,90,134,0.22)]" /> <span>Working</span></div>
            {/* Override: background rgba(255,227,238,0.22), border rgba(182,90,236,0.35) */}
            <div className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-sm bg-[rgba(255,227,238,0.22)] border border-[rgba(182,90,236,0.35)]" /> <span>Override</span></div>
            {/* Blocked: background rgba(17,17,17,0.04), border rgba(17,17,17,0.25) */}
            <div className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-sm bg-[rgba(17,17,17,0.04)] border border-[rgba(17,17,17,0.25)]" /> <span className="text-[#111]">Blocked</span></div>
          </div>
          <div className="flex-1 px-6 pb-4 flex flex-col">
            <div  style={{ height: "70rem" }} className=" flex-1 rounded-md border border-neutral-200 bg-white calendar-shell hover:shadow-lg transition-shadow duration-300">
              {scheduleLoading ? (
                <div className="p-4">
                  {/* Calendar Header */}
                  <div className="p-4 border-b border-neutral-200">
                    <div className="flex justify-between items-center">
                      <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                      <div className="flex gap-2">
                        <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                        <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Calendar Grid */}
                  <div className="p-4">
                    {/* Week days header */}
                    <div className="grid grid-cols-7 gap-1 mb-4">
                      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <div key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
                      ))}
                    </div>
                    
                    {/* Time slots */}
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                        <div key={i} className="grid grid-cols-7 gap-1">
                          {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                            <div key={j} className="h-12 bg-gray-100 rounded animate-pulse" />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <DragAndDropCalendar
                  localizer={localizer}
                  selectable
                  resizable
                  popup
                  events={events}
                  backgroundEvents={backgroundEvents}
                  views={["week", "day"]}
                  style={{ height: "70rem" }}
                  step={30}
                  timeslots={1}
                  eventPropGetter={eventStyleGetter}
                  defaultView="week"
                  scrollToTime={new Date(1970, 1, 1, 5, 0, 0)}
                  onEventDrop={handleEventDrop}
                  onEventResize={handleEventResize}
                  onSelectEvent={handleSelectEvent}
                  onSelectSlot={handleOpenAddEventModal}
                  date={currentDate}
                  onNavigate={handleNavigate}
                  view={currentView}
                  onView={handleViewChange}
                />
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div ref={rightColumnRef} className="w-1/3 flex flex-col">
          <div className="p-6 pb-4">{/* event details (no internal scroll; page will scroll) */}
            <Card className="border-neutral-200 bg-white hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-0">
                {selectedEvent ? (
                  <>
                    {/* Booking Details - Special Layout */}
                    {selectedEvent.type === 'BOOKING' ? (
                      <div className="p-4 space-y-4">
                        {/* Service Header with Status */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#EC5A86]/10 rounded-lg flex items-center justify-center">
                              <Icon icon="lucide:sparkles" className="w-4 h-4 text-[#EC5A86]" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-[#111] text-base">{selectedEvent.slotData?.serviceName || 'Service'}</h3>
                              <p className="text-xs text-neutral-500">#{selectedEvent.id?.slice(-6) || '456789'}</p>
                            </div>
                          </div>
                          {selectedEvent.slotData?.status && (() => {
                            const st = selectedEvent.slotData.status;
                            let badgeClass = 'bg-green-500';
                            let label = 'Confirmed';
                            if (st === 'COMPLETED') { badgeClass = 'bg-[#111]'; label = 'Completed'; }
                            else if (st === 'CONFIRMED') { badgeClass = 'bg-green-700'; label = 'Confirmed'; }
                            return (
                              <Badge className={`${badgeClass} text-white px-2 py-1 text-xs`}>
                                {label}
                              </Badge>
                            );
                          })()}
                        </div>

                        {/* Customer Info */}
                        {selectedEvent.slotData?.customerName && (
                          <div className="flex items-center gap-2">
                            <Icon icon="lucide:user" className="w-3 h-3 text-neutral-400" />
                            <div>
                              <p className="text-sm text-[#111]">{selectedEvent.slotData.customerName}</p>
                              {selectedEvent.slotData.phoneNumber && (
                                <div className="flex items-center gap-1">
                                  <Icon icon="lucide:phone" className="w-2.5 h-2.5 text-neutral-400" />
                                  <p className="text-xs text-neutral-500">{selectedEvent.slotData.phoneNumber}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <Separator className="bg-gray-300"/>
                        
                        {/* Date & Time */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Icon icon="lucide:calendar-days" className="w-3 h-3 text-neutral-400" />
                            <p className="text-sm text-[#111]">{dayjs(selectedEvent.start).format('MMM D, YYYY')}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Icon icon="lucide:clock" className="w-3 h-3 text-neutral-400" />
                            <p className="text-sm text-[#111]">
                              {dayjs(selectedEvent.start).format('HH:mm')} - {dayjs(selectedEvent.end).format('HH:mm')}
                            </p>
                          </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-start gap-2">
                          <Icon icon="lucide:map-pin" className="w-3 h-3 text-neutral-400 mt-0.5" />
                          <p className="text-sm text-[#111]">{selectedEvent.slotData?.address}</p>
                        </div>

                        <Separator className="bg-gray-300"/>

                        {/* Total Price */}
                        {selectedEvent.slotData?.totalPrice && (
                          <div className="flex items-center justify-between bg-gray-100 p-2 rounded">
                            <div className="flex items-center gap-1">
                              <Icon icon="lucide:dollar-sign" className="w-3 h-3 text-green-700" />
                              <span className="text-sm font-medium text-[#111]">Total</span>
                            </div>
                            <span className="text-lg font-bold text-green-700">
                              {selectedEvent.slotData.totalPrice.toLocaleString()}đ
                            </span>
                          </div>
                        )}

                        {/* Notes */}
                        {selectedEvent.slotData?.note && (
                          <div className="bg-gray-50 p-2 rounded">
                            <p className="text-xs font-medium text-[#111] mb-1">Notes:</p>
                            <p className="text-xs text-neutral-600">{selectedEvent.slotData.note}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Other Event Types - Card Layout */
                      <div className="p-4 space-y-4">
                        {/* Event Header with Status */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center">
                              <Icon icon={
                                selectedEvent.type === 'BLOCKED' ? "lucide:ban" :
                                selectedEvent.type === 'OVERRIDE' || selectedEvent.type === 'NEW_OVERRIDE' ? "lucide:edit" :
                                "lucide:clock"
                              } className="w-4 h-4 text-neutral-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-[#111] text-base">
                                {selectedEvent.type ==="ORIGINAL_WORKING"||selectedEvent.type ==="NEW_WORKING" ? "Working Time" : 
                                 selectedEvent.type ==="OVERRIDE"||selectedEvent.type ==="NEW_OVERRIDE" ? "Override Time" : 
                                 selectedEvent.type ==="BLOCKED" ? "Blocked Time" : "Event"}
                              </h3>
                              <p className="text-xs text-neutral-500">Event #{selectedEvent.id?.slice(-6) || '456789'}</p>
                            </div>
                          </div>
                          {(() => {
                            let badgeClass = 'bg-gray-500';
                            let label = 'Blocked Time';
                            if (selectedEvent.type === 'ORIGINAL_WORKING' || selectedEvent.type === 'NEW_WORKING') {
                              badgeClass = 'bg-pink-500';
                              label = 'Working Time';
                            } else if (selectedEvent.type === 'OVERRIDE' || selectedEvent.type === 'NEW_OVERRIDE') {
                              badgeClass = 'bg-purple-500';
                              label = 'Override Time';
                            }
                            return (
                              <Badge className={`${badgeClass} text-white px-2 py-1 text-xs`}>
                                {label}
                              </Badge>
                            );
                          })()}
                        </div>

                        <Separator className="bg-gray-300"/>
                        
                        {/* Date & Time */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Icon icon="lucide:calendar-days" className="w-3 h-3 text-neutral-400" />
                            <div>
                              <p className="text-sm text-[#111]">{dayjs(selectedEvent.start).format('dddd, MMMM D, YYYY')}</p>
                              <p className="text-xs text-neutral-500">Date</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Icon icon="lucide:clock" className="w-3 h-3 text-neutral-400" />
                            <div>
                              <p className="text-sm text-[#111]">
                                {dayjs(selectedEvent.start).format('HH:mm')} - {dayjs(selectedEvent.end).format('HH:mm')} 
                                ({dayjs(selectedEvent.end).diff(dayjs(selectedEvent.start), 'hour', true)} hour)
                              </p>
                              <p className="text-xs text-neutral-500">Time</p>
                            </div>
                          </div>
                        </div>

                        {/* Notes */}
                        {selectedEvent.slotData?.note && (
                          <>
                            <Separator className="bg-gray-300"/>
                            <div className="bg-gray-50 p-2 rounded">
                              <p className="text-xs font-medium text-[#111] mb-1">Notes:</p>
                              <p className="text-xs text-neutral-600">{selectedEvent.slotData.note}</p>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Icon icon="lucide:calendar" className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                    <p className="text-neutral-400">Select an event to view details</p>
                  </div>
                )}
              </CardContent>
              {selectedEvent && (
                <CardFooter className="px-6 pb-6">
                  <div className="flex gap-3 w-full">
                    {selectedEvent.type === 'BOOKING' ? (
                      /* Booking Actions - Reschedule/Cancel */
                      <>
                        <Button
                          variant="outline" disabled={true}
                          className="flex-1 border-neutral-300 text-[#111] hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-neutral-300 transition-all duration-200"
                          onClick={() => handleOpenEditEvent(selectedEvent, setNewEventForm, setModalSlotInfo, setShowAddEventModal)}
                        >
                          <Icon icon="lucide:calendar" className="mr-2 h-4 w-4" />
                          Reschedule
                        </Button>
                        <Button
                          variant="outline" 
                          className="flex-1 border-red-300 text-red-600 hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-300 transition-all duration-200"
                          onClick={() => handleDeleteEvent(selectedEvent)}
                          disabled={true}
                        >
                          <Icon icon="lucide:x" className="mr-2 h-4 w-4" />
                          {loading ? 'Canceling...' : 'Cancel'}
                        </Button>
                      </>
                    ) : selectedEvent.canUpdate ? (
                      /* Other Event Actions - Edit/Delete */
                      <>
                        <Button
                          variant="outline"
                          className="flex-1 border-[#EC5A86] text-[#111] hover:bg-[#EC5A86]/10 focus-visible:ring-2 focus-visible:ring-[#EC5A86]/40 hover:scale-105 transition-all duration-200"
                          onClick={() => handleOpenEditEvent(selectedEvent, setNewEventForm, setModalSlotInfo, setShowAddEventModal)}
                        >
                          <Icon icon="lucide:edit" className="mr-2 h-4 w-4" />
                          Reschedule
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1 bg-[#EC5A86] hover:bg-[#d54e77] text-white border-none focus-visible:ring-2 focus-visible:ring-[#EC5A86]/40 hover:scale-105 transition-all duration-200"
                          onClick={() => handleDeleteEvent(selectedEvent)}
                          disabled={loading}
                        >
                          <Icon icon="lucide:trash" className="mr-2 h-4 w-4" />
                          {loading ? 'Canceling...' : 'Cancel'}
                        </Button>
                      </>
                    ) : (
                      <div className="w-full text-center py-2">
                        <p className="text-sm text-neutral-400">This event cannot be modified</p>
                      </div>
                    )}
                  </div>
                </CardFooter>
              )}
            </Card>
          </div>
           <div className="border-t bg-white p-6 rounded-br-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-lg font-semibold text-neutral-700">
                <span className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-rose-600 text-xs font-bold tabular-nums">{pendingBookings.length}</span>
                  <span>Pending Requests</span>
                </span>
              </h3>
              <Badge className="bg-[#EC5A86] text-white font-medium border border-[#111]" variant="secondary">{pendingBookings.length} New</Badge>
            </div>
            
            {/* Pagination Controls */}
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#EC5A86]">Show:</span>
                <select
                  aria-label="Select page size"
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="px-2 py-1 text-sm border border-neutral-300 rounded bg-white text-neutral-600 focus:outline-none focus:ring-2 focus:ring-rose-200"
                >
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                  {/* <option value={15}>15</option>
                  <option value={20}>20</option> */}
                </select>
                <span className="text-sm text-[#EC5A86]">per page</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
                  disabled={pageNumber === 1}
                  className="h-8 px-2 border-neutral-300 text-neutral-600 hover:bg-neutral-50 hover:scale-105 transition-all duration-200"
                >
                  <Icon icon="lucide:chevron-left" className="h-4 w-4" />
                </Button>
                <span className="text-sm text-[#EC5A86] px-2">Page {pageNumber}</span>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setPageNumber(prev => prev + 1)}
                  disabled={pendingBookings.length < pageSize}
                  className="h-8 px-2 border-neutral-300 text-neutral-600 hover:bg-neutral-50 hover:scale-105 transition-all duration-200"
                >
                  <Icon icon="lucide:chevron-right" className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              {pendingBookingsLoading ? (
                // Skeleton for pending bookings
                [1, 2, 3].map((i) => (
                  <div key={i} className="p-4 border border-neutral-200 bg-white rounded">
                    <div className="flex items-start justify-between mb-2">
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 w-40 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                      </div>
                      <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 h-8 bg-gray-200 rounded animate-pulse" />
                      <div className="flex-1 h-8 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                ))
              ) : pendingBookings.length > 0 ? (
                pendingBookings.map((booking) => (
                  <Card key={booking._id} className="p-4 border-neutral-200 bg-white hover:bg-[#FFE3EE] hover:shadow-md hover:scale-[1.02] transition-all duration-300">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm text-neutral-800">{booking.customerName}</p>
                        <p className="text-xs text-neutral-500">
                          {booking.serviceName} - {dayjs(booking.bookingDate).format('MMM DD')}, {booking.startTime} - {booking.endTime}
                        </p>
                        {booking.address && (
                          <p className="text-xs text-neutral-500 mt-1"> {booking.address}</p>
                        )}
                        {booking.notes && (
                          <p className="text-xs text-neutral-400 mt-1 italic">"{booking.notes}"</p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs border-[#EC5A86] text-[#EC5A86] bg-white font-medium">
                        {(booking.totalPrice).toLocaleString()}đ
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 h-8 text-xs bg-[#EC5A86] hover:bg-[#d54e77] text-white shadow-sm focus-visible:ring-2 focus-visible:ring-[#EC5A86]/40"
                        onClick={() => handleAcceptBooking(booking._id)}
                      >
                        <Icon icon="lucide:check" className="mr-1 h-3 w-3" />
                        Accept
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 h-8 text-xs border-[#EC5A86] text-[#EC5A86] hover:bg-[#FFE3EE] focus-visible:ring-2 focus-visible:ring-[#EC5A86]/40"
                        onClick={() => handleRejectBooking(booking._id)}
                      >
                        <Icon icon="lucide:x" className="mr-1 h-3 w-3" />
                        Decline
                      </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <Icon icon="lucide:calendar-check" className="mx-auto h-12 w-12 text-neutral-300 mb-2" />
                  <p className="text-sm text-neutral-600">No pending bookings</p>
                  <p className="text-xs text-neutral-400">All caught up!</p>
                </div>
              )}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-sm text-neutral-600 hover:bg-neutral-100 hover:scale-105 transition-all duration-200">
              View All Requests
              <Icon icon="lucide:arrow-right" className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Event Modal */}
      <EventModal
        showAddEventModal={showAddEventModal}
        modalSlotInfo={modalSlotInfo}
        newEventForm={newEventForm}
        loading={loading}
        onClose={() => {
          setShowAddEventModal(false);
          setNewEventForm({ type: 'BLOCKED', name: '', note: '', startTime: '', endTime: '' });
        }}
        onSubmit={modalSlotInfo?.isEdit ? handleUpdateEventWrapper : handleCreateEventWrapper}
        onFormChange={setNewEventForm}
      />
      
      {/* Notification Component */}
      <Notification
        isVisible={notification.isVisible}
        type={notification.type}
        message={notification.message}
        onClose={closeNotification}
      />
    </div>
  );
}
