'use client';
import { Badge } from "@/components/lib/ui/badge";
import { Button } from "@/components/lib/ui/button";
import { Icon } from "@iconify/react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/lib/ui/card";
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
import { EventDetailsPopup } from "./components/EventDetailsPopup";
import { getMondayOfWeek } from "./utils/calendarUtils";
import styles from './ArtistCalendarStyles.module.css';
import { Skeleton } from "@/components/lib/ui/skeleton";

// localizer cho react-big-calendar, tuần bắt đầu từ thứ 2
moment.locale("vi"); // hoặc "en-gb" nếu muốn tiếng Anh nhưng tuần bắt đầu từ thứ 2
const localizer = momentLocalizer(moment);

const DragAndDropCalendar = withDragAndDrop(Calendar);

export function ArtistCalendar({ 
  id, 
  height = 'calc(100vh - 5rem)' 
}: { 
  readonly id: string;
  readonly height?: string;
}) {
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
  const [isCompleting, setIsCompleting] = useState(false);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);
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

  // Handle mark booking as COMPLETED
  const handleMarkCompleted = useCallback(async () => {
    if (!selectedEvent) return;
    try {
      setIsCompleting(true);
      // Use the real Booking _id mapped into slotData.slotId
      const bookingId = selectedEvent?.slotData?.slotId;
      if (!bookingId) throw { code: 'invalid_request', message: 'Missing booking id' };
      const res = await BookingService.completeBooking(String(bookingId));
      // Success: update local state and notify
      const newSelected = {
        ...selectedEvent,
        slotData: {
          ...selectedEvent.slotData,
          status: 'COMPLETED'
        }
      };
      setSelectedEvent(newSelected);
      // Keep calendar data in sync: update slotData list so future selections reflect COMPLETED
      setSlotData(prev => prev.map(s => s.slotId === bookingId ? { ...s, status: 'COMPLETED' } : s));
      showSuccess('Booking marked as completed');
    } catch (err: any) {
      const code = err?.code;
      if (code === 'not_owner') showError('You are not the owner of this booking');
      else if (code === 'invalid_status') showError('Only CONFIRMED bookings can be completed');
      else if (code === 'too_early') showError('This booking has not ended yet');
      else if (code === 'booking_not_found') showError('Booking not found');
      else showError(err?.message || 'Failed to mark booking completed');
    } finally {
      setIsCompleting(false);
    }
  }, [selectedEvent, showError, showSuccess]);

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
    console.log("=== DEBUG handleUpdateEventWrapper ===");
    console.log("selectedEvent in wrapper:", selectedEvent);
    console.log("newEventForm in wrapper:", newEventForm);
    console.log("modalSlotInfo in wrapper:", modalSlotInfo);
    
    if (!modalSlotInfo.originalEvent) {
      console.error("selectedEvent is null in wrapper!");
      showError("Selected event is missing. Please try selecting the event again.");
      return;
    }
    
    handleUpdateEvent(newEventForm, modalSlotInfo, modalSlotInfo.originalEvent);
  }, [handleUpdateEvent, newEventForm, modalSlotInfo, selectedEvent, showError]);

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
      
      // Check if booking was updated within last 2 hours
      const isRecentlyUpdated = slot.type === 'BOOKING' && slot.updatedAt && 
        moment().diff(moment(slot.updatedAt), 'minutes') <= 10;
      let title = '';
      if (slot.type === 'BOOKING') {
        title = `${slot.customerName} - ${slot.serviceName}`;
      } else if (slot.type === 'BLOCKED') {
        title = 'Blocked Time';
      }
      // title already defaults to '' so no need to reassign in else
      return {
        id: slot.slotId +"_"+ slot.startTime|| slot.day +"_"+  slot.startTime,
        title,
        start,
        end,
        type: slot.type,
        note: slot.note,
        isRecentlyUpdated,
        updatedAt: slot.updatedAt,
        slotData: slot,
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

  // Custom event component to render badge button
  const EventComponent = ({ event }: { event: any }) => {
    return (
      <div className="flex items-center justify-between w-full">
        <span className="flex-1 truncate">{event.title}</span>
        {event.isRecentlyUpdated && (
          <span className="ml-1 px-1.5 py-0.5 bg-[#EC5A86] text-white text-[10px] font-semibold rounded-full shadow-sm">
            New
          </span>
        )}
      </div>
    );
  };

  // Điều chỉnh bảng màu: nhấn mạnh tông hồng nhẹ nhưng vẫn phân biệt rõ các loại slot
  // BOOKING: hồng rõ ràng (để nhận biết khách đã đặt) – nền hồng nhạt + viền hồng đậm
  // WORKING (ORIGINAL/NEW_WORKING): nền trắng hơi hồng rất nhạt + viền hồng mềm để thể hiện khả dụng
  // OVERRIDE (OVERRIDE/NEW_OVERRIDE): tím hồng (lavender) để nổi bật thởi gian được chỉnh sửa/ghi đè
  // BLOCKED: xám trung tính để thể hiện không khả dụng
  const eventStyleGetter = (event: any) => {
    // Base: white backgrounds với rose accents và text đen
    let backgroundColor = 'rgba(255,255,255,0.9)'; // white background
    let borderColor = 'rgba(229,231,235,0.8)'; // gray-200 border
    let textColor = '#1f2937'; // gray-800 text
    let leftBorderWidth = 3;
    let fontWeight = 600;
    let zIndex = 1;

    switch (event.type) {
      case 'BOOKING':
        backgroundColor = 'rgba(254,242,242,0.8)'; // rose-50 background
        borderColor = '#f43f5e'; // rose-500 border
        textColor = '#1f2937'; // gray-800 text
        leftBorderWidth = 4;
        zIndex = 2;
        
        // Add glow for recently updated bookings
        if (event.isRecentlyUpdated) {
          leftBorderWidth = 5;
          zIndex = 3;
        }
        break;
      case 'BLOCKED':
        backgroundColor = 'rgba(249,250,251,0.9)'; // gray-50 background
        borderColor = 'rgba(107,114,128,0.6)'; // gray-500 border
        textColor = '#374151'; // gray-700 text
        fontWeight = 500;
        break;
      case 'OVERRIDE':
      case 'NEW_OVERRIDE':
        backgroundColor = 'rgba(250,245,255,0.8)'; // purple-50 background
        borderColor = 'rgba(147,51,234,0.6)'; // purple-600 border
        textColor = '#1f2937'; // gray-800 text
        fontWeight = 500;
        break;
      case 'ORIGINAL_WORKING':
      case 'NEW_WORKING':
        backgroundColor = 'rgba(249,250,251,0.7)'; // gray-50 background
        borderColor = 'rgba(156,163,175,0.5)'; // gray-400 border
        textColor = '#4b5563'; // gray-600 text
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
        boxShadow: event.isRecentlyUpdated 
          ? '0 2px 8px rgba(244,63,94,0.15), 0 0 0 1px rgba(244,63,94,0.1)' 
          : zIndex === 2 ? '0 1px 2px rgba(244,63,94,0.1)' : '0 1px 2px rgba(0,0,0,0.05)',
        letterSpacing: '0.25px',
        backdropFilter: 'saturate(1.05)',
        pointerEvents: 'auto' as React.CSSProperties['pointerEvents'],
        transition: 'background .15s, box-shadow .15s'
      },
      className: event.isRecentlyUpdated ? 'new-booking-animation' : ''
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

  const handleSelectEvent = useCallback((event: any, e: any) => {
        console.log("Event selected:", event);
        
        // Tính toán vị trí popup dựa trên vị trí click
        const rect = e.target.getBoundingClientRect();
        const x = rect.right + 10; // Hiển thị bên phải event
        const y = rect.top;
        
        // Find the corresponding slot data
        const slot = slotData.find(s => 
          (s.slotId && s.slotId === event.id) || 
          (s.slotId +"_"+ s.startTime === event.id)
        );
        console.log("Corresponding slot data:", slot);
        setSelectedEvent({
          ...event,
          slotData: slot,
          canUpdate: event.type !== 'BOOKING'
        });
        
        setPopupPosition({ x, y });
    }, [slotData]);

// Skeleton Components
const CalendarSkeleton = () => (
  <div className="w-[70%] border-r border-gray-300 bg-white flex flex-col">
    {/* Legend Skeleton */}
    <div className="flex flex-wrap gap-5 px-6 pt-4 pb-2 border-b border-gray-300">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-sm bg-gradient-to-br from-rose-100 to-rose-200 border border-rose-300 animate-pulse" />
          <div className="h-3 w-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse" />
        </div>
      ))}
    </div>
    
    {/* Calendar Skeleton */}
    <div className="flex-1 px-6 pb-4 flex flex-col">
      <div className="flex-1 rounded-md border border-gray-300 bg-white shadow-sm">
        {/* Calendar Header */}
        <div className="p-4 border-b border-gray-300">
          <div className="flex justify-between items-center">
            <div className="h-6 w-32 bg-gradient-to-r from-gray-200 to-rose-200 rounded animate-pulse" />
            <div className="flex gap-2">
              <div className="h-8 w-16 bg-gradient-to-r from-rose-200 to-rose-300 rounded animate-pulse" />
              <div className="h-8 w-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse" />
            </div>
          </div>
        </div>
        
        {/* Calendar Grid */}
        <div className="p-4">
          {/* Week days header */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="h-8 bg-gradient-to-br from-rose-100 to-rose-200 border border-rose-200 rounded animate-pulse" />
            ))}
          </div>
          
          {/* Time slots */}
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="grid grid-cols-7 gap-1">
                {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                  <div key={j} className={`h-12 rounded animate-pulse ${
                    Math.random() > 0.7 ? 'bg-gradient-to-br from-rose-100 to-rose-200 border border-rose-300' : 
                    Math.random() > 0.5 ? 'bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300' : 
                    'bg-white border border-gray-200'
                  }`} />
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
  <div className="flex-1 flex flex-col p-4 bg-gradient-to-br from-white via-rose-50 to-white">
    {/* Header skeleton */}
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-2 h-6 bg-gradient-to-b from-rose-400 to-rose-500 rounded-full animate-pulse shadow-sm"></div>
        <div className="h-4 w-32 bg-gradient-to-r from-gray-300 to-gray-400 rounded animate-pulse" />
      </div>
      <div className="h-6 w-8 bg-gradient-to-r from-rose-400 to-rose-500 rounded-full animate-pulse shadow-sm" />
    </div>
    
    {/* Pagination skeleton */}
    <div className="mb-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <div className="h-3 w-10 bg-gradient-to-r from-gray-300 to-gray-400 rounded animate-pulse" />
        <div className="h-6 w-8 bg-white border border-gray-300 rounded animate-pulse shadow-sm" />
      </div>
      <div className="flex items-center gap-1">
        <div className="h-7 w-7 bg-white border border-gray-300 rounded animate-pulse shadow-sm" />
        <div className="h-3 w-3 bg-gradient-to-r from-gray-300 to-gray-400 rounded animate-pulse" />
        <div className="h-7 w-7 bg-white border border-gray-300 rounded animate-pulse shadow-sm" />
      </div>
    </div>
    
    {/* Cards skeleton */}
    <div className="flex-1 space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-3 border border-gray-300 bg-white rounded-xl shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse shadow-sm" />
                <div className="h-3 w-20 bg-gradient-to-r from-gray-300 to-gray-400 rounded animate-pulse" />
              </div>
              <div className="h-2.5 w-32 bg-gradient-to-r from-rose-200 to-rose-300 rounded animate-pulse" />
              <div className="h-2 w-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse" />
            </div>
            <div className="h-5 w-12 bg-gradient-to-r from-rose-100 to-rose-200 border border-rose-300 rounded animate-pulse" />
          </div>
          <div className="flex gap-1.5">
            <div className="flex-1 h-7 bg-gradient-to-r from-rose-400 to-rose-500 rounded animate-pulse shadow-sm" />
            <div className="flex-1 h-7 bg-white border border-gray-400 rounded animate-pulse shadow-sm" />
          </div>
        </div>
      ))}
    </div>
    
    {/* Footer skeleton */}
    <div className="mt-3 pt-3 border-t border-gray-300">
      <div className="w-full h-9 bg-white border border-gray-300 rounded animate-pulse shadow-sm" />
    </div>
  </div>
);

if(loading && scheduleLoading && pendingBookingsLoading){
  return (
    <div className={`h-fit max-w-8xl mx-auto px-4 bg-white text-gray-900 font-sans tracking-wide ${styles.calendarRoot}`}>
      {/* Header skeleton với white rose black theme */}
      <div className="bg-gradient-to-r from-white via-rose-100 to-white border-b border-gray-300">
        <div className="h-16 px-6 flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-5 w-24 bg-gradient-to-r from-gray-300 to-gray-400 rounded animate-pulse" />
            <div className="h-3 w-32 bg-gradient-to-r from-rose-200 to-rose-300 rounded animate-pulse" />
          </div>
          <div className="bg-rose-100 border border-gray-300 p-3 rounded-full shadow-sm">
            <div className="h-5 w-5 bg-rose-400 rounded animate-pulse" />
          </div>
        </div>
      </div>

      <div className="flex flex-1">
         {/* Sidebar */}
        <div className="w-[30%] flex flex-col">
          <PendingBookingsSkeleton />
        </div>
        <CalendarSkeleton />
      </div>
    </div>
  );
}
  return (
  <div className={`h-fit max-w-8xl mx-auto px-4 bg-white text-[#191516] font-sans tracking-wide ${styles.calendarRoot}`}> 
      {extraStyles /* kept for structure; null now */}
      {matchedHeight && (
        <style>{`
          [data-equal-height]{height:var(--equal-col-height);}
          @keyframes newBookingPulse {
            0%, 100% { 
              box-shadow: 0 2px 8px rgba(236,90,134,0.25), 0 0 0 1px rgba(236,90,134,0.15); 
            }
            50% { 
              box-shadow: 0 4px 12px rgba(236,90,134,0.4), 0 0 0 2px rgba(236,90,134,0.25); 
            }
          }
          .new-booking-animation {
            animation: newBookingPulse 2s ease-in-out infinite;
          }
          .rbc-event-content {
            overflow: visible !important;
          }
        `}</style>
      )}
     

  <div 
    className={`flex flex-1 ${styles.calendarContainer}`} 
    style={{ 
      '--calendar-height': height 
    } as React.CSSProperties & { '--calendar-height': string }}
  >{/* main workspace area below header; allow natural page scroll */}
    {/* Calendar chiếm 2/3 */}
   {/* Sidebar */}
        <div ref={rightColumnRef} className="w-[30%] flex flex-col bg-gradient-to-br from-white via-rose-50 to-white">
           {/* Header với white rose black theme */}
           <div className="bg-gradient-to-r from-white via-rose-100 to-white text-gray-900 border-b border-gray-300">
             <div className="flex h-16 items-center justify-between px-6">
               <div className="select-none">
                 <h1 className="text-[1.3rem] font-bold tracking-wide text-gray-900">Calendar</h1>
                 <p className="text-[0.75rem] font-medium text-gray-700">Manage your schedule</p>
               </div>
               <div className="bg-rose-100 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-300">
                 <Icon icon="lucide:calendar-heart" className="h-5 w-5 text-rose-600" />
               </div>
             </div>
           </div>
           
           {/* Pending Bookings Section */}
           <div className="flex-1 flex flex-col p-4" data-equal-height>
             {/* Section Header */}
             <div className="mb-3 flex items-center justify-between ">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-6 bg-gradient-to-b from-rose-500 to-rose-600 rounded-full shadow-sm shadow-rose-300/50"></div>
                 <h3 className="font-semibold text-base text-gray-900">Pending Requests</h3>
               </div>
               <Badge className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white border border-gray-300 font-semibold hover:scale-105 transition-all duration-200 shadow-md shadow-rose-200/50">
                 {pendingBookings.length}
               </Badge>
             </div>
             
             {/* Compact Pagination Controls */}
             <div className="mb-3 flex items-center justify-between gap-3">
               <div className="flex items-center gap-2 text-sm">
                 <span className="text-gray-700">Show:</span>
                 <select
                   aria-label="Select page size"
                   value={pageSize}
                   onChange={(e) => setPageSize(Number(e.target.value))}
                   className="px-2 py-1 text-xs border border-gray-400 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400 transition-colors"
                 >
                   <option value={3}>3</option>
                   <option value={5}>5</option>
                 </select>
               </div>
               
               <div className="flex items-center gap-1">
                 <Button 
                   size="sm" 
                   variant="ghost"
                   onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
                   disabled={pageNumber === 1}
                   className="h-7 w-7 p-0 text-gray-700 hover:bg-rose-100 hover:text-gray-900 disabled:opacity-50 transition-all border border-gray-300 hover:border-rose-300"
                 >
                   <Icon icon="lucide:chevron-left" className="h-3 w-3" />
                 </Button>
                 <span className="text-xs text-gray-700 px-2 font-medium">{pageNumber}</span>
                 <Button 
                   size="sm" 
                   variant="ghost"
                   onClick={() => setPageNumber(prev => prev + 1)}
                   disabled={pendingBookings.length < pageSize}
                   className="h-7 w-7 p-0 text-gray-700 hover:bg-rose-100 hover:text-gray-900 disabled:opacity-50 transition-all border border-gray-300 hover:border-rose-300"
                 >
                   <Icon icon="lucide:chevron-right" className="h-3 w-3" />
                 </Button>
               </div>
             </div>
             
             {/* Dynamic Cards Container */}
             <div className={`flex-1 overflow-hidden  ${pageSize === 3 ? 'space-y-3' : 'space-y-2'}`}>
               {pendingBookingsLoading ? (
                 // Skeleton loading với white rose black theme
                 [1, 2, 3].map((i) => (
                   <div key={i} className={`${pageSize === 3 ? 'p-3' : 'p-2'} border border-gray-300 bg-white rounded-lg animate-pulse shadow-sm`}>
                     <div className="flex items-start justify-between mb-2">
                       <div className="space-y-1 flex-1">
                         <div className={`${pageSize === 3 ? 'h-3' : 'h-2.5'} w-20 bg-gray-200 rounded`} />
                         <div className={`${pageSize === 3 ? 'h-2.5' : 'h-2'} w-32 bg-gray-200 rounded`} />
                         <div className={`${pageSize === 3 ? 'h-2' : 'h-1.5'} w-24 bg-gray-200 rounded`} />
                       </div>
                       <div className={`${pageSize === 3 ? 'h-5 w-12' : 'h-4 w-10'} bg-gray-200 rounded`} />
                     </div>
                     <div className="flex gap-1.5">
                       <div className={`flex-1 ${pageSize === 3 ? 'h-7' : 'h-6'} bg-gray-200 rounded`} />
                       <div className={`flex-1 ${pageSize === 3 ? 'h-7' : 'h-6'} bg-gray-200 rounded`} />
                     </div>
                   </div>
                 ))
               ) : pendingBookings.length > 0 ? (
                 pendingBookings.map((booking) => (
                   <Card 
                     key={booking._id} 
                     className={`${pageSize === 3 ? 'p-3' : 'p-2'} border border-gray-300 bg-white hover:bg-gradient-to-r hover:from-white hover:to-rose-50 hover:shadow-md hover:scale-[1.01] hover:border-rose-400 transition-all duration-200 rounded-xl group cursor-pointer`}
                   >
                     <div className="flex items-start justify-between mb-2">
                       <div className="flex-1 min-w-0">
                         <div className="flex items-center gap-2 mb-1">
                           <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse shadow-sm shadow-rose-300/50"></div>
                           <p className={`font-semibold ${pageSize === 3 ? 'text-sm' : 'text-xs'} text-gray-900 truncate`}>
                             {booking.customerName}
                           </p>
                         </div>
                         <p className={`${pageSize === 3 ? 'text-xs' : 'text-[10px]'} text-gray-700 line-clamp-2 leading-tight`}>
                           <span className="font-medium text-rose-600">{booking.serviceName}</span>
                           <br />
                           <span className="text-gray-600">{dayjs(booking.bookingDate).format('MMM DD')} • {dayjs(`2000-01-01 ${booking.startTime}`).format('HH:mm')} - {dayjs(`2000-01-01 ${booking.endTime}`).format('HH:mm')}</span>
                         </p>
                         {booking.address && pageSize === 3 && (
                           <p className="text-[10px] text-gray-600 mt-1 truncate">
                             <Icon icon="lucide:map-pin" className="inline h-2.5 w-2.5 mr-1" />
                             {booking.address}
                           </p>
                         )}
                         {booking.notes && pageSize === 3 && (
                           <p className="text-[10px] text-gray-500 mt-1 italic line-clamp-1">
                             "{booking.notes}"
                           </p>
                         )}
                       </div>
                       <Badge 
                         variant="outline" 
                         className={`${pageSize === 3 ? 'text-xs px-2' : 'text-[10px] px-1.5'} border-rose-400 text-rose-600 bg-rose-50 font-semibold whitespace-nowrap ml-2`}
                       >
                         {booking.totalPrice.toLocaleString()}VND
                       </Badge>
                     </div>
                     <div className="flex gap-1.5">
                       <Button 
                         size="sm" 
                         className={`flex-1 ${pageSize === 3 ? 'h-7 text-xs' : 'h-6 text-[10px]'} bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white border-0 shadow-sm hover:shadow-md group-hover:scale-105 transition-all duration-200`}
                         onClick={() => handleAcceptBooking(booking._id)}
                       >
                         <Icon icon="lucide:check" className={`${pageSize === 3 ? 'mr-1 h-3 w-3' : 'h-2.5 w-2.5'}`} />
                         {pageSize === 3 ? 'Accept' : '✓'}
                       </Button>
                       <Button 
                         variant="outline" 
                         size="sm" 
                         className={`flex-1 ${pageSize === 3 ? 'h-7 text-xs' : 'h-6 text-[10px]'} border-gray-400 text-gray-700 hover:bg-gray-100 hover:border-gray-500 group-hover:scale-105 transition-all duration-200`}
                         onClick={() => handleRejectBooking(booking._id)}
                       >
                         <Icon icon="lucide:x" className={`${pageSize === 3 ? 'mr-1 h-3 w-3' : 'h-2.5 w-2.5'}`} />
                         {pageSize === 3 ? 'Decline' : '✗'}
                       </Button>
                     </div>
                   </Card>
                 ))
               ) : (
                 <div className="text-center py-8 flex-1 flex flex-col items-center justify-center">
                   <div className="bg-gradient-to-br from-rose-100 to-rose-200 rounded-full p-4 mb-3 border border-gray-300">
                     <Icon icon="lucide:calendar-check" className="h-8 w-8 text-rose-600" />
                   </div>
                   <p className="text-sm font-medium text-gray-900 mb-1">All Clear!</p>
                   <p className="text-xs text-gray-600">No pending requests</p>
                 </div>
               )}
             </div>
             
             {/* Footer Action */}
             <div className=" pt-3 border-t border-gray-300">
               <Button 
                 variant="ghost" 
                 className="w-full h-9 text-sm text-gray-700 hover:bg-rose-100 hover:text-gray-900 hover:scale-[1.02] transition-all duration-200 group border border-gray-300 hover:border-rose-300"
               >
                 <span>View All Requests</span>
                 <Icon icon="lucide:arrow-right" className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
               </Button>
             </div>
           </div>
         </div>
  
        <div
        ref={leftColumnRef}
        // data-equal-height
        className="w-[70%] border-r border-gray-300 bg-white flex flex-col h-full"
      >
          {/* Legend với white rose black theme */}
          <div className="flex flex-wrap gap-5 px-6 pt-4 pb-2 text-[11px] font-medium text-gray-800 select-none border-b border-gray-300">
            {/* Booking: rose theme với text đen */}
            <div className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-sm bg-rose-100 border border-rose-500" /> <span>Booking</span></div>
            {/* Working: light theme với text đen */}
            <div className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-sm bg-gray-100 border border-gray-400" /> <span>Working</span></div>
            {/* Override: purple rose theme với text đen */}
            <div className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-sm bg-purple-100 border border-purple-500" /> <span>Override</span></div>
            {/* Blocked: gray theme với text đen */}
            <div className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-sm bg-gray-200 border border-gray-500" /> <span>Blocked</span></div>
          </div>
          <div className="flex-1 px-6 pb-4 flex flex-col">
            <div className={`flex-1 rounded-md border border-gray-300 bg-white hover:shadow-lg hover:shadow-gray-200/50 transition-shadow duration-300 ${styles.calendarShell}`}>
              {scheduleLoading ? (
                <div className="p-4">
                  {/* Calendar Header skeleton với theme mới */}
                  <div className="p-4 border-b border-gray-300">
                    <div className="flex justify-between items-center">
                      <div className="h-6 w-32 bg-gradient-to-r from-gray-300 to-rose-300 rounded animate-pulse shadow-sm" />
                      <div className="flex gap-2">
                        <div className="h-8 w-16 bg-gradient-to-r from-rose-300 to-rose-400 rounded animate-pulse shadow-sm" />
                        <div className="h-8 w-16 bg-white border border-gray-300 rounded animate-pulse shadow-sm" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Calendar Grid skeleton với theme mới */}
                  <div className="p-4">
                    {/* Week days header */}
                    <div className="grid grid-cols-7 gap-1 mb-4">
                      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <div key={i} className="h-8 bg-gradient-to-br from-rose-100 to-rose-200 border border-rose-200 rounded animate-pulse" />
                      ))}
                    </div>
                    
                    {/* Time slots với random pattern đẹp hơn */}
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="grid grid-cols-7 gap-1">
                          {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                            <div key={j} className={`h-12 rounded animate-pulse ${
                              Math.random() > 0.8 ? 'bg-gradient-to-br from-rose-100 to-rose-200 border border-rose-300 shadow-sm' : 
                              Math.random() > 0.6 ? 'bg-gradient-to-br from-purple-100 to-purple-200 border border-purple-300 shadow-sm' :
                              Math.random() > 0.4 ? 'bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300' : 
                              'bg-white border border-gray-200'
                            }`} />
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
                  style={{ height: "calc(100vh - 150px)" }}
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
                  components={{
                    event: EventComponent
                  }}
                />
              )}
            </div>
          </div>
        </div>
       
      </div>
    
      {/* Event Details Popup */}
      {selectedEvent && popupPosition && (
        <EventDetailsPopup
          selectedEvent={selectedEvent}
          loading={loading}
          onEditEvent={(event) => {
            console.log("Editing event:", event);
            // Lưu selectedEvent data trước khi popup đóng
            const eventToEdit = { ...event };
            handleOpenEditEvent(eventToEdit, setNewEventForm, setModalSlotInfo, setShowAddEventModal);
          }}
          onDeleteEvent={handleDeleteEvent}
          onClose={() => {
            setSelectedEvent(null);
            setPopupPosition(null);
          }}
          position={popupPosition}
        />
      )}
      
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