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

// Imported hooks and components
import { useNotification } from "./hooks/useNotification";
import { useCalendarEvents } from "./hooks/useCalendarEvents";
import { useEventManagement } from "./hooks/useEventManagement";
import { EventModal } from "./components/EventModal";
import { getMondayOfWeek } from "./utils/calendarUtils";

// localizer cho react-big-calendar, tuần bắt đầu từ thứ 2
moment.locale("vi"); // hoặc "en-gb" nếu muốn tiếng Anh nhưng tuần bắt đầu từ thứ 2
const localizer = momentLocalizer(moment);

const DragAndDropCalendar = withDragAndDrop(Calendar);

export function ArtistCalendar({ id }: { readonly id: string }) {
  // Inline style augmentation (could be moved to a global CSS module if preferred)
  // Increase slot height slightly for more airy layout
  // Using :where selector to keep specificity low
  const extraStyles = (
    <style>
      {`
        .calendar-shell :where(.rbc-time-slot) { min-height: 28px; }
        .calendar-shell :where(.rbc-time-header) { background: linear-gradient(to right, #ffffff, #fff6f9 45%, #ffffff); }
        .calendar-shell :where(.rbc-time-header-cell) { color:#111; font-weight:600; letter-spacing:.5px; }
        .calendar-shell :where(.rbc-time-view) { background: #ffffff; }
        .calendar-shell :where(.rbc-day-bg) { transition: background .15s ease; }
        .calendar-shell :where(.rbc-day-bg.rbc-today) { background: #fff1f6 !important; box-shadow: inset 0 0 0 1px #fecdd3; }
        .calendar-shell :where(.rbc-time-content) { border-top:1px solid #f4f4f5; }
        .calendar-shell :where(.rbc-time-gutter) { background:#fff; color:#6b6b6b; font-size:11px; }
        .calendar-shell :where(.rbc-time-gutter .rbc-timeslot-group) { border-color:#f1f5f9; }
        .calendar-shell :where(.rbc-timeslot-group) { border-color:#f1f5f9; }
        .calendar-shell :where(.rbc-time-header-content) { border-left:1px solid #f1f5f9; }
        .calendar-shell :where(.rbc-time-content > * + * > * ) { border-left:1px solid #f1f5f9; }
        .calendar-shell :where(.rbc-current-time-indicator) { background:#ec5a86; height:2px; }
        .calendar-shell :where(.rbc-slot-selection) { background:rgba(236,90,134,0.15); border:1px solid #ec5a86; }
        .calendar-shell :where(.rbc-selected) { background:rgba(236,90,134,0.08); }
      `}
    </style>
  );
  const [slotData, setSlotData] = useState<ISlot[]>([]);
  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
 const [pageNumber,setPageNumber] = useState(1);
 const [pageSize,setPageSize] = useState(3);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>("week");
  const [loading, setLoading] = useState(false);
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
  }, [pendingBookings, selectedEvent, pageNumber, pageSize]);

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
      setLoading(false);
    }
  }, [id, showError]);

  const fetchPendingBookings = useCallback(async()=>{
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
      setLoading(false);
    }
  }, [id, pageNumber, pageSize, showError])
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
  }, [fetchSchedule,currentDate]);

  useEffect(() => {
    fetchPendingBookings();
  }, [fetchPendingBookings]);
  // (debug removed)

  // Tách events thành 2 loại: backgroundEvents (working, override), events (booking, blocked)
  const { events, backgroundEvents } = useMemo(() => {
    const evts: any[] = [];
    const bgEvts: any[] = [];
    slotData.forEach((slot) => {
      const start = moment(`${slot.day} ${slot.startTime}`, "YYYY-MM-DD HH:mm").toDate();
      const end = moment(`${slot.day} ${slot.endTime}`, "YYYY-MM-DD HH:mm").toDate();
      let title = "";
      if (slot.type === "BOOKING") {
        title = `${slot.customerName} - ${slot.serviceName} `;
      } else if (slot.type === "BLOCKED") {
        title = `Blocked Time`;
      } else {
        title = 'Working Time';
      }
      const eventObj = {
        id: slot.slotId || slot.day + slot.startTime,
        title,
        start,
        end,
        type: slot.type,
        note: slot.note
      };
      if (slot.type === "ORIGINAL_WORKING" || slot.type === "OVERRIDE" || slot.type === "NEW_WORKING"|| slot.type === "NEW_OVERRIDE") {
        bgEvts.push(eventObj);
      } else {
        evts.push(eventObj);
      }
    });
    return { events: evts, backgroundEvents: bgEvts };
  }, [slotData]);

  // Điều chỉnh bảng màu: nhấn mạnh tông hồng nhẹ nhưng vẫn phân biệt rõ các loại slot
  // BOOKING: hồng rõ ràng (để nhận biết khách đã đặt) – nền hồng nhạt + viền hồng đậm
  // WORKING (ORIGINAL/NEW_WORKING): nền trắng hơi hồng rất nhạt + viền hồng mềm để thể hiện khả dụng
  // OVERRIDE (OVERRIDE/NEW_OVERRIDE): tím hồng (lavender) để nổi bật thời gian được chỉnh sửa/ghi đè
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
        borderColor = 'rgba(236,90,134,0.35)';
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
        setShowAddEventModal(true);
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


  return (
    <div className="min-h-screen bg-white text-[#191516] font-sans tracking-wide">
      {extraStyles}
      {matchedHeight && (
        <style>{`[data-equal-height]{height:var(--equal-col-height);}`}</style>
      )}
      {/* Header giữ nguyên */}
  <div className="border-b border-[#EC5A86]/30 bg-white">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="select-none">
            <h1 className="text-[1.4rem] font-black tracking-wider uppercase text-[#111]">Calendar</h1>
            <p className="text-[0.8rem] font-medium text-[#EC5A86]">Manage your bookings & schedule</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-[#111] text-white border border-[#EC5A86]/40 font-semibold">
              {pendingBookings.length} Pending
            </Badge>
            <Button
              onClick={() => setShowAddEventModal(true)}
              className="bg-[#EC5A86] hover:bg-[#d54e77] text-white font-semibold rounded-full shadow-sm px-5 focus-visible:ring-2 focus-visible:ring-[#EC5A86]/40 focus-visible:outline-none"
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
        data-equal-height
        className="w-2/3 border-r border-neutral-200 bg-white flex flex-col"
      >
          {/* Legend */}
          <div className="flex flex-wrap gap-5 px-6 pt-4 pb-2 text-[11px] font-medium text-[#111] select-none">
            <div className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-sm bg-[rgba(236,90,134,0.10)] border border-[#EC5A86]" /> <span>Booking</span></div>
            <div className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-sm bg-[rgba(255,255,255,0.55)] border border-[rgba(236,90,134,0.22)]" /> <span>Working</span></div>
            <div className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-sm bg-[rgba(255,227,238,0.22)] border border-[rgba(236,90,134,0.35)]" /> <span>Override</span></div>
            <div className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-sm bg-[rgba(17,17,17,0.07)] border border-[rgba(17,17,17,0.35)]" /> <span className="text-[#111]">Blocked</span></div>
          </div>
          <div className="flex-1 px-6 pb-4 flex flex-col">
            <div className="flex-1 rounded-md border border-neutral-200 bg-white calendar-shell">
              <DragAndDropCalendar
                localizer={localizer}
                selectable
                resizable
                popup
                events={events}
                backgroundEvents={backgroundEvents}
                views={["week", "day"]}
                step={30}
                timeslots={1}
                className="h-full p-4"
                eventPropGetter={eventStyleGetter}
                defaultView="week"
                onEventDrop={handleEventDrop}
                onEventResize={handleEventResize}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleOpenAddEventModal}
                date={currentDate}
                onNavigate={handleNavigate}
                view={currentView}
                onView={handleViewChange}
              />
            </div>
          </div>
        </div>

        {/* Sidebar giữ nguyên */}
        <div ref={rightColumnRef} className="w-1/3 flex flex-col">
          <div className="p-6 pb-4">{/* event details (no internal scroll; page will scroll) */}
            <Card className="border-neutral-200 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#111]">
                  <Icon icon="lucide:calendar" className="h-5 w-5 text-[#EC5A86]" />
                {selectedEvent && (selectedEvent.canUpdate?"Event Details": "Booking Details")}  
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 space-y-4">
                {selectedEvent ? (
                  <>
                    <div>
                      <h3 className="font-semibold text-neutral-800">{selectedEvent.title}</h3>
                      <p className="text-sm text-neutral-400">{dayjs(selectedEvent.start).format('dddd, MMMM D, YYYY')}</p>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-500">Type:</span>
                        <span className="text-sm font-medium text-neutral-700">{selectedEvent.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-500">Time:</span>
                        <span className="text-sm font-medium text-neutral-700">
                          {dayjs(selectedEvent.start).format('HH:mm')} - {dayjs(selectedEvent.end).format('HH:mm')}
                        </span>
                      </div>
                      {selectedEvent.slotData?.customerName && (
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-500">Customer:</span>
                          <span className="text-sm font-medium text-neutral-700">{selectedEvent.slotData.customerName}</span>
                        </div>
                      )}
                       {selectedEvent.slotData?.serviceName && (
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-500">Service:</span>
                          <span className="text-sm font-medium text-neutral-700">{selectedEvent.slotData.serviceName}</span>
                        </div>
                      )}
                     {selectedEvent.slotData?.status && (() => {
                       const st = selectedEvent.slotData.status;
                       let badgeClass = 'bg-[#EC5A86]';
                       let label = 'Working';
                       if (st === 'COMPLETED') { badgeClass = 'bg-[#111]'; label = 'Completed'; }
                       else if (st === 'CONFIRMED') { badgeClass = 'bg-[#EC5A86]/80'; label = 'Confirmed'; }
                       return (
                         <div className="flex justify-between">
                           <span className="text-sm text-neutral-500">Status:</span>
                           <Badge className={`${badgeClass} text-white`}>{label}</Badge>
                         </div>
                       );
                     })()}
                    </div>
                    {selectedEvent.slotData?.note && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-sm font-medium mb-2 text-neutral-600">Notes:</p>
                          <p className="text-sm text-neutral-500">{selectedEvent.slotData.note}</p>
                        </div>
                      </>
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
                <CardFooter>
                  <div className="flex gap-2 w-full">
                    {selectedEvent.canUpdate ? (
                      <>
                        <Button
                          variant="outline"
                          className="flex-1 border-[#EC5A86] text-[#111] hover:bg-[#EC5A86]/10 focus-visible:ring-2 focus-visible:ring-[#EC5A86]/40"
                          onClick={() => handleOpenEditEvent(selectedEvent, setNewEventForm, setModalSlotInfo, setShowAddEventModal)}
                        >
                          <Icon icon="lucide:edit" className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1 bg-[#EC5A86] hover:bg-[#d54e77] text-white border-none focus-visible:ring-2 focus-visible:ring-[#EC5A86]/40"
                          onClick={() => handleDeleteEvent(selectedEvent)}
                          disabled={loading}
                        >
                          <Icon icon="lucide:trash" className="mr-2 h-4 w-4" />
                          {loading ? 'Deleting...' : 'Delete'}
                        </Button>
                      </>
                    ) : (
                      <div className="w-full text-center py-2">
                        <p className="text-sm text-neutral-400">Booking cannot be modified</p>
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
                  className="h-8 px-2 border-neutral-300 text-neutral-600 hover:bg-neutral-50"
                >
                  <Icon icon="lucide:chevron-left" className="h-4 w-4" />
                </Button>
                <span className="text-sm text-[#EC5A86] px-2">Page {pageNumber}</span>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setPageNumber(prev => prev + 1)}
                  disabled={pendingBookings.length < pageSize}
                  className="h-8 px-2 border-neutral-300 text-neutral-600 hover:bg-neutral-50"
                >
                  <Icon icon="lucide:chevron-right" className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              {pendingBookings.length > 0 ? (
                pendingBookings.map((booking) => (
                  <Card key={booking._id} className="p-4 border-neutral-200 bg-white hover:bg-[#FFE3EE] hover:shadow-sm transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm text-neutral-800">{booking.customerName}</p>
                        <p className="text-xs text-neutral-500">
                          {booking.serviceName} - {dayjs(booking.bookingDate).format('MMM DD')}, {booking.startTime} - {booking.endTime}
                        </p>
                        {booking.address && (
                          <p className="text-xs text-neutral-500 mt-1">📍 {booking.address}</p>
                        )}
                        {booking.notes && (
                          <p className="text-xs text-neutral-400 mt-1 italic">"{booking.notes}"</p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs border-[#EC5A86] text-[#EC5A86] bg-white font-medium">
                        {(booking.totalPrice).toLocaleString()}k
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 h-8 text-xs bg-[#EC5A86] hover:bg-[#d54e77] text-white shadow-sm focus-visible:ring-2 focus-visible:ring-[#EC5A86]/40">
                        <Icon icon="lucide:check" className="mr-1 h-3 w-3" />
                        Accept
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 h-8 text-xs border-[#EC5A86] text-[#EC5A86] hover:bg-[#FFE3EE] focus-visible:ring-2 focus-visible:ring-[#EC5A86]/40">
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
            <Button variant="ghost" className="w-full mt-4 text-sm text-neutral-600 hover:bg-neutral-100">
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
