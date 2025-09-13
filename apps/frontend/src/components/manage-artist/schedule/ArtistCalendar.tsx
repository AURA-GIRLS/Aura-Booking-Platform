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
import "react-big-calendar/lib/css/react-big-calendar.css";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import {artistService} from "@/services/artist";
import { ISlot } from "@/types/schedule.dtos";

// localizer cho react-big-calendar, tuần bắt đầu từ thứ 2
moment.locale("vi"); // hoặc "en-gb" nếu muốn tiếng Anh nhưng tuần bắt đầu từ thứ 2
const localizer = momentLocalizer(moment);

const DragAndDropCalendar = withDragAndDrop(Calendar);

export function ArtistCalendar({ id }: { readonly id: string }) {
  const [slotData, setSlotData] = useState<ISlot[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>("week");
  const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
  useEffect(() => {
    fetchSchedule();
  }, [id]);
   const fetchSchedule = async (weekStart?:string ) => {
      console.log("Artist ID:", id);
      setLoading(true);
      setError('');
      setSuccess('');
      if(!weekStart) {
        const today = new Date();
        weekStart = dayjs(today).startOf('week').add(1, 'day').startOf('day').format('YYYY-MM-DDT00:00:00');
      }
      try {
            const res = await artistService.getSchedule({ muaId: id, weekStart });
            if (res.success) {
              console.log('Get lịch thành công!.');
              setSlotData(res.data.slots || []);
              console.log("Fetched slots:", res.data.slots);
            } else {
              setError(res.message || 'Đăng ký thất bại');
            }
          } catch (err: any) {
            setError(err.message || 'Đăng ký thất bại');
          } finally {
            setLoading(false);
          }
    };
  console.log("slotData",slotData);

  // convert slotData thành event cho react-big-calendar
  const events = useMemo(() => {
    return slotData.map((slot) => {
      const start = moment(`${slot.day} ${slot.startTime}`, "YYYY-MM-DD HH:mm").toDate();
      const end = moment(`${slot.day} ${slot.endTime}`, "YYYY-MM-DD HH:mm").toDate();
      let title = "";

      if (slot.type === "BOOKING") {
        title = `${slot.note} `;
      } else if (slot.type === "BLOCKED") {
        title = `${slot.type.toLowerCase()}`;
      } else{
        title = 'working';
      }

      return {
        id: slot.slotId || slot.day + slot.startTime,
        title,
        start,
        end,
        type: slot.type
      };
    });
  }, [slotData]);

  console.log("Events for Calendar:", events);
  // custom style cho event
  const eventStyleGetter = (event: any) => {
    let backgroundColor = "#FFD9DA";
    let borderColor = "#EB638B";
    if (event.type === "BOOKING") {
      backgroundColor = "#FEE2E2";
      borderColor = "#EF4444";
    } else if (event.type === "BLOCKED") {
      backgroundColor = "#E5E7EB";
      borderColor = "#6B7280";
    } else if (event.type === "OVERRIDE"||event.type === "NEW_WORKING") {
      backgroundColor = "#f6f0f8ff";
      borderColor = "#7d16a3ff";
    } else if (event.type === "ORIGINAL_WORKING") {
      backgroundColor = "#e7f6ecff";
      borderColor = "#16A34A";
    }

    return {
      style: {
        backgroundColor,
        borderLeft: `4px solid ${borderColor}`,
        color: "#191516",
        fontSize: "0.8rem",
        fontWeight: 600,
        borderRadius: "6px",
        padding: "2px 4px"
      }
    };
  };


  // Xử lý khi chuyển ngày (Back, Next, Today)
  const handleNavigate = (date:any, action:any) => {
    setCurrentDate(date);
    const weekStart = dayjs(date).startOf('week').add(1, 'day').startOf('day').format('YYYY-MM-DDT00:00:00');
    fetchSchedule(weekStart);
  };

  // Xử lý khi đổi view (week/day)
  const handleViewChange = (view: View) => {
    setCurrentView(view);
    const weekStart = dayjs(currentDate).startOf('week').add(1, 'day').startOf('day').format('YYYY-MM-DDT00:00:00');
    fetchSchedule(weekStart);
  };
   const handleOpenAddTaskModal = useCallback((slotInfo:any) => {
        console.log("Slot selected:", slotInfo);
        const start = dayjs(slotInfo.start);
        const end = dayjs(slotInfo.end);
    }, []); // No dependencies needed

  const handleSelectEvent = useCallback((event:any) => {
        console.log("Event selected:", event);
        
    }, []);

  const handleEventDrop = useCallback((args: any) => {
    // args: { event, start, end, allDay, ... }
    const { event, start, end } = args;
    // start/end can be string or Date
    const startDate = typeof start === 'string' ? new Date(start) : start;
    const endDate = typeof end === 'string' ? new Date(end) : end;
    console.log("Event dropped:", event.id, startDate, endDate);
    // TODO: update event in state/backend here
  }, []);

  const handleEventResize = useCallback((args: any) => {
    // args: { event, start, end, ... }
    const { event, start, end } = args;
    const startDate = typeof start === 'string' ? new Date(start) : start;
    const endDate = typeof end === 'string' ? new Date(end) : end;
    console.log("Event resized:", event.id, startDate, endDate);
    // TODO: update event in state/backend here
  }, []);
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
              New Booking
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
            views={["week", "day"]}
            step={30}
            timeslots={1}
            style={{ height: "100vh", padding: "1rem" }}
            eventPropGetter={eventStyleGetter}
            defaultView="week"
            // defaultDate={new Date(2025, 8, 15)}
            onSelectEvent={handleSelectEvent}
            onEventDrop={handleEventDrop}
            onEventResize={handleEventResize}
            onSelectSlot={handleOpenAddTaskModal}
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
                  Booking Details
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-pink-700">Bridal Makeup</h3>
                  <p className="text-sm text-pink-400">Monday, September 15, 2025</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Client:</span>
                    <span className="text-sm font-medium text-pink-700">Huyen</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Time:</span>
                    <span className="text-sm font-medium text-pink-700">02:00 - 03:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Service:</span>
                    <span className="text-sm font-medium text-pink-700">Bridal Makeup Package</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Status:</span>
                    <Badge className="bg-pink-500 text-white">Confirmed</Badge>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-2">Notes:</p>
                  <p className="text-sm text-pink-400">Khách: Huyen, Dịch vụ: Bridal Makeup Package</p>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    className="flex-1 border-pink-300 text-pink-500 hover:bg-pink-100"
                  >
                    <Icon icon="lucide:edit" className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 bg-pink-500 hover:bg-pink-600 text-white border-none"
                  >
                    <Icon icon="lucide:x" className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </CardFooter>
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
    </div>
  );
}




