"use client"
import { Badge } from "@/components/lib/ui/badge"
import type React from "react"

import { Button } from "@/components/lib/ui/button"
import { Icon } from "@iconify/react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/lib/ui/card"
import { Separator } from "@/components/lib/ui/separator"
import { useEffect, useState, useRef } from "react"
import { SlotDetail } from "./SlotDetail"

import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = dayjsLocalizer(dayjs);

interface SlotData {
  day: string
  startTime: string
  endTime: string
  type: "OVERRIDE" | "ORIGINAL_WORKING" | "NEW_WORKING" | "BLOCKED"
}

interface CalendarData {
  muaId: string
  weekStart: string
  weekStartStr: string
  slots: SlotData[]
}

interface DragState {
  isDragging: boolean
  draggedSlot: SlotData | null
  dragStartY: number
  originalStartTime: string
}

export function ArtistCalendar({ id }: { readonly id: string }) {
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null)
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedSlot: null,
    dragStartY: 0,
    originalStartTime: "",
  })
  const calendarRef = useRef<HTMLDivElement>(null)
  // Convert slot data to events for react-big-calendar
  const events = (calendarData?.slots || []).map(slot => {
    const start = dayjs(`${slot.day} ${slot.startTime}`, "YYYY-MM-DD HH:mm").toDate();
    const end = dayjs(`${slot.day} ${slot.endTime}`, "YYYY-MM-DD HH:mm").toDate();
    return {
      title: slot.type.replace("_", " "),
      start,
      end,
      type: slot.type,
      allDay: false
    };
  });

  useEffect(() => {
    console.log("Artist ID:", id)
    const sampleData: CalendarData = {
      muaId: "68c00edaaea1af1231d3a0fc",
      weekStart: "2025-09-14T17:00:00.000Z",
      weekStartStr: "2025-09-15 00:00:00",
      slots: [
        {
          day: "2025-09-15",
          startTime: "13:00",
          endTime: "18:00",
          type: "OVERRIDE",
        },
        {
          day: "2025-09-17",
          startTime: "14:00",
          endTime: "18:00",
          type: "ORIGINAL_WORKING",
        },
        {
          day: "2025-09-19",
          startTime: "10:00",
          endTime: "11:00",
          type: "NEW_WORKING",
        },
        {
          day: "2025-09-19",
          startTime: "13:00",
          endTime: "16:00",
          type: "NEW_WORKING",
        },
        {
          day: "2025-09-19",
          startTime: "11:00",
          endTime: "13:00",
          type: "BLOCKED",
        },
        {
          day: "2025-09-20",
          startTime: "09:00",
          endTime: "12:00",
          type: "OVERRIDE",
        },
      ],
    }
    setCalendarData(sampleData)
  }, [id])

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number)
    return hours * 60 + minutes
  }

  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`
  }

  // Color for slot types
  const slotTypeColor: Record<string, string> = {
    OVERRIDE: "#EB638B",
    ORIGINAL_WORKING: "#FFD9DA",
    NEW_WORKING: "#AC274F",
    BLOCKED: "#382E31"
  };

  // Custom event style for react-big-calendar
  const eventPropGetter = (event: any) => ({
    style: {
      backgroundColor: slotTypeColor[event.type] || "#FFD9DA",
      color: event.type === "BLOCKED" ? "#fff" : "#191516",
      borderRadius: 8,
      border: "2px solid #EB638B",
      fontWeight: 600,
      fontFamily: "Montserrat, Poppins, Arial, sans-serif"
    }
  });

  const getTypeLabel = (type: SlotData["type"]) => {
    switch (type) {
      case "OVERRIDE":
        return "Override"
      case "ORIGINAL_WORKING":
        return "Original Working"
      case "NEW_WORKING":
        return "New Working"
      case "BLOCKED":
        return "Blocked"
      default:
        return type
    }
  }

  const handleMouseDown = (e: React.MouseEvent, slot: SlotData) => {
    e.preventDefault()
    setDragState({
      isDragging: true,
      draggedSlot: slot,
      dragStartY: e.clientY,
      originalStartTime: slot.startTime,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState.isDragging || !dragState.draggedSlot || !calendarData) return

    const deltaY = e.clientY - dragState.dragStartY
    const minutesPerPixel = 2 // Adjust sensitivity
    const deltaMinutes = Math.round(deltaY / minutesPerPixel) * 15 // Snap to 15-minute intervals

    const originalMinutes = timeToMinutes(dragState.originalStartTime)
    const newStartMinutes = Math.max(480, Math.min(1080, originalMinutes + deltaMinutes)) // 8:00 AM to 6:00 PM
    const newStartTime = minutesToTime(newStartMinutes)

    const duration = timeToMinutes(dragState.draggedSlot.endTime) - timeToMinutes(dragState.draggedSlot.startTime)
    const newEndTime = minutesToTime(newStartMinutes + duration)

    // Update the slot in real-time
    const updatedSlots = calendarData.slots.map((s) =>
      s === dragState.draggedSlot ? { ...s, startTime: newStartTime, endTime: newEndTime } : s,
    )

    setCalendarData({ ...calendarData, slots: updatedSlots })
  }

  const handleMouseUp = () => {
    setDragState({
      isDragging: false,
      draggedSlot: null,
      dragStartY: 0,
      originalStartTime: "",
    })
  }

  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 8; hour <= 18; hour++) {
      slots.push(`${hour}:00`)
    }
    return slots
  }

  const renderSlotForDay = (dayIndex: number, timeSlot: string) => {
    if (!calendarData) return null

    const dayDate = new Date(calendarData.weekStart)
    dayDate.setDate(dayDate.getDate() + dayIndex)
    const dayString = dayDate.toISOString().split("T")[0]

    const slotsForDay = calendarData.slots.filter((slot) => {
      const slotDate = new Date(slot.day + "T00:00:00")
      return slotDate.toISOString().split("T")[0] === dayString
    })

    const currentHour = Number.parseInt(timeSlot.split(":")[0])
    const slotsInThisTimeSlot = slotsForDay.filter((slot) => {
      const startMinutes = timeToMinutes(slot.startTime)
      const endMinutes = timeToMinutes(slot.endTime)
      const currentMinutes = currentHour * 60

      return startMinutes < currentMinutes + 60 && endMinutes > currentMinutes
    })

    if (slotsInThisTimeSlot.length === 0) return null

    const sortedSlots = slotsInThisTimeSlot.sort((a, b) => {
      if (a.type === "ORIGINAL_WORKING" && b.type !== "ORIGINAL_WORKING") return -1
      if (a.type !== "ORIGINAL_WORKING" && b.type === "ORIGINAL_WORKING") return 1
      return 0
    })

    return sortedSlots.map((slot, index) => {
      const startMinutes = timeToMinutes(slot.startTime)
      const endMinutes = timeToMinutes(slot.endTime)
      const currentHourMinutes = currentHour * 60

      const slotStartInHour = Math.max(0, startMinutes - currentHourMinutes)
      const slotEndInHour = Math.min(60, endMinutes - currentHourMinutes)
      const slotDurationInHour = slotEndInHour - slotStartInHour

      const topOffset = (slotStartInHour / 60) * 60
      const height = (slotDurationInHour / 60) * 60

  return (
    <div style={{ height: 700 }} key={`${slot.day}-${slot.startTime}-${slot.endTime}-${slot.type}`}>
      <Calendar
        localizer={localizer}
        events={events}
        step={60}
        views={["week", "day"]}
        defaultDate={new Date(2015, 3, 1)}
        popup={false}
        // You may need to adjust or remove onShowMore depending on your requirements
      />
    </div>
  )
    })
  }

  const timeSlots = generateTimeSlots()

  return (
    <div
      style={{
        background: "#FFF",
        minHeight: "100vh",
        color: "#191516",
        fontFamily: "Montserrat, Poppins, Arial, sans-serif",
        letterSpacing: "0.04em",
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
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
                textTransform: "uppercase",
              }}
            >
              Calendar
            </h1>
            <p style={{ color: "#AC274F", fontSize: "0.8rem" }}>Manage your bookings and schedule</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge style={{ background: "#FFD9DA", color: "#AC274F", border: "1.5px solid #EB638B", fontWeight: 700 }}>
              12 Pending Requests
            </Badge>
            <Button
              style={{
                background: "#EB638B",
                color: "#fff",
                fontWeight: 700,
                borderRadius: "999px",
                boxShadow: "0 0 0 2px #FFD9DA",
                border: "none",
              }}
            >
              <Icon icon="lucide:plus" className="mr-2 h-4 w-4" />
              New Booking
            </Button>
          </div>
        </div>
      </div>
      <div className="flex ">
        <div style={{ width: "66.666%", borderRight: "2px solid #FFD9DA", background: "#FFF", padding: 16 }}>
          <div className="bg-white rounded-lg shadow border border-[#FFD9DA] p-2">
            <Calendar
              localizer={localizer}
              events={events}
              defaultView="week"
              views={["week", "day"]}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 600 }}
              eventPropGetter={eventPropGetter}
              // onEventDrop={onEventDrop} // Enable if using DnD
              // resizable
            />
          </div>
        </div>
        <SlotDetail />
      </div>
    </div>
  )
}
