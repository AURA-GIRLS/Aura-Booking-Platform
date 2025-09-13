'use client';
import { Badge } from "@/components/lib/ui/badge";
import { Button } from "@/components/lib/ui/button";
import { Icon } from "@iconify/react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/lib/ui/card";
import { Separator } from "@/components/lib/ui/separator";
import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from 'dayjs';
import { Calendar, momentLocalizer, View } from "react-big-calendar";
import moment from "moment";
import "moment/locale/vi";
import "react-big-calendar/lib/css/react-big-calendar.css";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
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
  const [slotData, setSlotData] = useState<ISlot[]>([]);
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

  // Initialize calendar event handlers
  const { handleEventDrop, handleEventResize } = useCalendarEvents({
    id,
    fetchSchedule,
    setLoading,
    showSuccess,
    showError
  });

  // Initialize event management handlers
  const { handleCreateEvent, handleDeleteEvent, handleUpdateEvent, handleOpenEditEvent } = useEventManagement({
    id,
    fetchSchedule,
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
  // console.log("slotData",slotData);

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

  // console.log("Events for Calendar:", events);
  // custom style cho event và background event
  const eventStyleGetter = (event: any, _start: any, _end: any, isSelected: boolean) => {
    let backgroundColor = "#FFD9DA";
    let borderColor = "#EB638B";
    let opacity = 1;
    let zIndex = 2;
    if (event.type === "BOOKING") {
      backgroundColor = "#FEE2E2";
      borderColor = "#EF4444";
    } else if (event.type === "BLOCKED") {
      backgroundColor = "#E5E7EB";
      borderColor = "#6B7280";
    } else if (event.type === "OVERRIDE" || event.type === "NEW_WORKING" || event.type === "ORIGINAL_WORKING"|| event.type === "NEW_OVERRIDE") {
      // background events: nhạt màu, nằm dưới
      backgroundColor = event.type === "OVERRIDE" || event.type === "NEW_OVERRIDE" ? "#f6f0f8ff" : "#e7f6ecff";
      borderColor = event.type === "OVERRIDE"|| event.type === "NEW_OVERRIDE" ? "#7d16a3ff" : "#16A34A";
      opacity = 0.3;
      zIndex = 1;
    }
    return {
      style: {
        backgroundColor,
        borderLeft: `4px solid ${borderColor}`,
        color: "#191516",
        fontSize: "0.8rem",
        fontWeight: 600,
        borderRadius: "6px",
        padding: "2px 4px",
        opacity,
        zIndex,
        pointerEvents: "auto" as React.CSSProperties["pointerEvents"] // vẫn cho phép tương tác
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
    <div
      style={{
        background: "#FFF",
        minHeight: "100vh",
        color: "#191516",
        fontFamily: "Montserrat, Poppins, Arial, sans-serif",
        letterSpacing: "0.04em"
      }}
    >
      {/* Header giữ nguyên */}
      <div style={{ borderBottom: "2px solid #FFD9DA", background: "#FFF" }}>
        <div className="flex h-16 items-center justify-between px-6">
          <div>
            <h1
              style={{
                color: "#EB638B",
                fontWeight: 900,
                fontSize: "1.4rem",
                fontFamily: "Montserrat, Poppins, Arial, sans-serif",
                letterSpacing: "0.08em",
                textTransform: "uppercase"
              }}
            >
              Calendar
            </h1>
            <p style={{ color: "#AC274F", fontSize: "0.8rem" }}>Manage your bookings and schedule</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge
              style={{
                background: "#FFD9DA",
                color: "#AC274F",
                border: "1.5px solid #EB638B",
                fontWeight: 700
              }}
            >
              12 Pending Requests
            </Badge>
            <Button
              onClick={() => setShowAddEventModal(true)}
              style={{
                background: "#EB638B",
                color: "#fff",
                fontWeight: 700,
                borderRadius: "999px",
                boxShadow: "0 0 0 2px #FFD9DA",
                border: "none"
              }}
            >
              <Icon icon="lucide:plus" className="mr-2 h-4 w-4" />
              New Event
            </Button>
          </div>
        </div>
      </div>

      <div className="flex ">
        {/* Calendar chiếm 2/3 */}
        <div style={{ width: "66.666%", borderRight: "2px solid #FFD9DA", background: "#FFF" }}>
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
            style={{ height: "100vh", padding: "1rem" }}
            eventPropGetter={eventStyleGetter}
            defaultView="week"
            // defaultDate={new Date(2025, 8, 15)}
            onEventDrop={handleEventDrop}
            onEventResize={handleEventResize}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleOpenAddEventModal}
            date={currentDate}
            onNavigate={handleNavigate}
            view={currentView}
            onView={handleViewChange}
            // tooltipAccessor={(event) => `${event.title}\n(${event?.resource?.status?.statusName || 'No Status'})\n${dayjs(event.start).format('HH:mm')} - ${dayjs(event.end).format('HH:mm')}`} // Enhanced tooltip
          />
        </div>

        {/* Sidebar giữ nguyên */}
        <div className="w-1/3 flex flex-col">
          <div className="flex-1 p-6">
            <Card className="border-pink-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-pink-600">
                  <Icon icon="lucide:calendar" className="h-5 w-5 text-pink-500" />
                {selectedEvent && (selectedEvent.canUpdate?"Event Details": "Booking Details")}  
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 space-y-4">
                {selectedEvent ? (
                  <>
                    <div>
                      <h3 className="font-semibold text-pink-700">{selectedEvent.title}</h3>
                      <p className="text-sm text-pink-400">{dayjs(selectedEvent.start).format('dddd, MMMM D, YYYY')}</p>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Type:</span>
                        <span className="text-sm font-medium text-pink-700">{selectedEvent.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Time:</span>
                        <span className="text-sm font-medium text-pink-700">
                          {dayjs(selectedEvent.start).format('HH:mm')} - {dayjs(selectedEvent.end).format('HH:mm')}
                        </span>
                      </div>
                      {selectedEvent.slotData?.customerName && (
                        <div className="flex justify-between">
                          <span className="text-sm">Customer:</span>
                          <span className="text-sm font-medium text-pink-700">{selectedEvent.slotData.customerName}</span>
                        </div>
                      )}
                       {selectedEvent.slotData?.serviceName && (
                        <div className="flex justify-between">
                          <span className="text-sm">Service:</span>
                          <span className="text-sm font-medium text-pink-700">{selectedEvent.slotData.serviceName}</span>
                        </div>
                      )}
                     {selectedEvent.slotdata?.status && (
                       <div className="flex justify-between">
                       <span className="text-sm">Status:</span>
                       <Badge className={`${
                         selectedEvent.slotData.status === 'COMPLETED' ? 'bg-red-500' :
                         selectedEvent.slotData.status === 'CONFIRMED' ? 'bg-orange-500' :
                         'bg-green-500'
                       } text-white`}>
                         {selectedEvent.slotData.status === 'COMPLETED' ? 'Completed' :
                          selectedEvent.slotData.status === 'CONFIRMED' ? 'Confirmed' :
                          'Working'}
                       </Badge>
                     </div>
                     )}
                    </div>
                    {selectedEvent.slotData?.note && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-sm font-medium mb-2">Notes:</p>
                          <p className="text-sm text-pink-400">{selectedEvent.slotData.note}</p>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Icon icon="lucide:calendar" className="h-12 w-12 text-pink-300 mx-auto mb-4" />
                    <p className="text-pink-400">Select an event to view details</p>
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
                          className="flex-1 border-pink-300 text-pink-500 hover:bg-pink-100"
                          onClick={() => handleOpenEditEvent(selectedEvent, setNewEventForm, setModalSlotInfo, setShowAddEventModal)}
                        >
                          <Icon icon="lucide:edit" className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1 bg-pink-500 hover:bg-pink-600 text-white border-none"
                          onClick={() => handleDeleteEvent(selectedEvent)}
                          disabled={loading}
                        >
                          <Icon icon="lucide:trash" className="mr-2 h-4 w-4" />
                          {loading ? 'Deleting...' : 'Delete'}
                        </Button>
                      </>
                    ) : (
                      <div className="w-full text-center py-2">
                        <p className="text-sm text-pink-400">Booking cannot be modified</p>
                      </div>
                    )}
                  </div>
                </CardFooter>
              )}
            </Card>
          </div>
           <div className="border-t bg-pink-100 p-6 rounded-br-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-lg font-semibold text-pink-600">Pending Requests</h3>
              <Badge className="bg-pink-200 text-pink-700 border-pink-300" variant="secondary">3 New</Badge>
            </div>
            <div className="space-y-3">
              <Card className="p-4 border-pink-200">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm text-pink-700">Jessica Wilson</p>
                    <p className="text-xs text-pink-400">Party Makeup - Dec 20, 2:00 PM</p>
                  </div>
                  <Badge variant="outline" className="text-xs border-pink-300 text-pink-500">
                    $80
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 h-8 text-xs bg-pink-500 hover:bg-pink-600 text-white">
                    <Icon icon="lucide:check" className="mr-1 h-3 w-3" />
                    Accept
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 h-8 text-xs border-pink-300 text-pink-500 hover:bg-pink-100">
                    <Icon icon="lucide:x" className="mr-1 h-3 w-3" />
                    Decline
                  </Button>
                </div>
              </Card>
              <Card className="p-4 border-pink-200">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm text-pink-700">Maria Garcia</p>
                    <p className="text-xs text-pink-400">Photoshoot - Dec 21, 10:00 AM</p>
                  </div>
                  <Badge variant="outline" className="text-xs border-pink-300 text-pink-500">
                    $120
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 h-8 text-xs bg-pink-500 hover:bg-pink-600 text-white">
                    <Icon icon="lucide:check" className="mr-1 h-3 w-3" />
                    Accept
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 h-8 text-xs border-pink-300 text-pink-500 hover:bg-pink-100">
                    <Icon icon="lucide:x" className="mr-1 h-3 w-3" />
                    Decline
                  </Button>
                </div>
              </Card>
              <Card className="p-4 border-pink-200">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm text-pink-700">Anna Thompson</p>
                    <p className="text-xs text-pink-400">Evening Event - Dec 19, 4:00 PM</p>
                  </div>
                  <Badge variant="outline" className="text-xs border-pink-300 text-pink-500">
                    $100
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 h-8 text-xs bg-pink-500 hover:bg-pink-600 text-white">
                    <Icon icon="lucide:check" className="mr-1 h-3 w-3" />
                    Accept
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 h-8 text-xs border-pink-300 text-pink-500 hover:bg-pink-100">
                    <Icon icon="lucide:x" className="mr-1 h-3 w-3" />
                    Decline
                  </Button>
                </div>
              </Card>
            </div>
            <Button variant="ghost" className="w-full mt-4 text-sm text-pink-600 hover:bg-pink-100">
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
