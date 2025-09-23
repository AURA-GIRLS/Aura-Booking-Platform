'use client';
import { Badge } from "@/components/lib/ui/badge";
import { Button } from "@/components/lib/ui/button";
import { Icon } from "@iconify/react";
import { Card, CardContent, CardFooter } from "@/components/lib/ui/card";
import { Separator } from "@/components/lib/ui/separator";
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';

interface EventDetailsPopupProps {
  selectedEvent: any;
  loading: boolean;
  onEditEvent: (event: any) => void;
  onDeleteEvent: (event: any) => void;
  onClose: () => void;
  position: { x: number; y: number; } | null;
}

export function EventDetailsPopup({ 
  selectedEvent, 
  loading, 
  onEditEvent, 
  onDeleteEvent, 
  onClose,
  position 
}: EventDetailsPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    if (!position || !popupRef.current) return;

    const popup = popupRef.current;
    const rect = popup.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let newX = position.x;
    let newY = position.y;

    // Điều chỉnh vị trí nếu popup bị cắt bởi viewport
    if (position.x + rect.width > viewportWidth) {
      newX = position.x - rect.width - 20; // Hiển thị bên trái thay vì bên phải
    }

    if (position.y + rect.height > viewportHeight) {
      newY = viewportHeight - rect.height - 20;
    }

    // Đảm bảo popup không bị âm
    newX = Math.max(20, newX);
    newY = Math.max(20, newY);

    setAdjustedPosition({ x: newX, y: newY });
  }, [position]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  if (!selectedEvent || !adjustedPosition) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div className="fixed inset-0 bg-black/20 z-40" />
      
      {/* Popup */}
      <div
        ref={popupRef}
        className="fixed z-50 w-96 max-h-[80vh] overflow-y-auto"
        style={{
          left: `${adjustedPosition.x}px`,
          top: `${adjustedPosition.y}px`,
        }}
      >
        <Card className="border-neutral-200 bg-white shadow-2xl border-2">
          {/* Close button */}
          <div className="absolute top-2 right-2 z-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <Icon icon="lucide:x" className="h-4 w-4" />
            </Button>
          </div>

          <CardContent className="p-0">
            {/* Booking Details - Special Layout */}
            {selectedEvent.type === 'BOOKING' ? (
              <div className="p-4 space-y-4 pr-8">
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
                    let badgeClass = 'bg-green-500 hover:bg-green-600 ';
                    let label = 'Confirmed';
                    if (st === 'COMPLETED') { badgeClass = 'bg-[#111] hover:bg-neutral-700'; label = 'Completed'; }
                    else if (st === 'CONFIRMED') { badgeClass = 'bg-green-700 hover:bg-green-800'; label = 'Confirmed'; }
                    return (
                      <Badge className={`${badgeClass} text-white px-2 py-1 text-xs`}>
                        {label}
                      </Badge>
                    );
                  })()}
                </div>

                {/* Customer Info */}
                {selectedEvent.slotData?.customerName && (
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <Icon icon="lucide:user" className="w-3 h-3 text-neutral-400" />
                      <div>
                        <p className="text-sm font-semibold text-[#111]">{selectedEvent.slotData.customerName}</p>
                      </div>
                    </div>
                    {selectedEvent.slotData.phoneNumber && (
                      <div className="flex items-center gap-1">
                        <Icon icon="lucide:phone" className="w-2.5 h-2.5 text-neutral-400 mr-2" />
                        <p className="text-xs text-neutral-500">{selectedEvent.slotData.phoneNumber}</p>
                      </div>
                    )}
                  </div>
                )}
                
                <Separator className="bg-gray-300"/>
                
                {/* Date & Time */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:calendar-days" className="w-3 h-3 text-neutral-400" />
                    <p className="text-sm font-semibold text-[#111]">{dayjs(selectedEvent.start).format('MMM D, YYYY')}</p>
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
                  <p className="text-sm font-semibold text-[#111]">{selectedEvent.slotData?.address}</p>
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
              <div className="p-4 space-y-4 pr-8">
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
                    let badgeClass = 'bg-gray-500 hover:bg-gray-600 ';
                    let label = 'Blocked Time';
                    if (selectedEvent.type === 'ORIGINAL_WORKING' || selectedEvent.type === 'NEW_WORKING') {
                      badgeClass = 'bg-pink-500 hover:bg-pink-600 ';
                      label = 'Working Time';
                    } else if (selectedEvent.type === 'OVERRIDE' || selectedEvent.type === 'NEW_OVERRIDE') {
                      badgeClass = 'bg-purple-500 hover:bg-purple-600 ';
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
          </CardContent>
          
          <CardFooter className="px-4 pb-4">
            <div className="flex gap-3 w-full">
              {selectedEvent.type === 'BOOKING' ? (
                /* Booking Actions - Reschedule/Cancel */
                <>
                  <Button
                    variant="outline" 
                    disabled={true}
                    className="flex-1 border-neutral-300 text-[#111] hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-neutral-300 transition-all duration-200"
                    onClick={() => onEditEvent(selectedEvent)}
                  >
                    <Icon icon="lucide:calendar" className="mr-2 h-4 w-4" />
                    Reschedule
                  </Button>
                  <Button
                    variant="outline" 
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-300 transition-all duration-200"
                    onClick={() => onDeleteEvent(selectedEvent)}
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
                    onClick={() => onEditEvent(selectedEvent)}
                  >
                    <Icon icon="lucide:edit" className="mr-2 h-4 w-4" />
                    Reschedule
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 bg-[#EC5A86] hover:bg-[#d54e77] text-white border-none focus-visible:ring-2 focus-visible:ring-[#EC5A86]/40 hover:scale-105 transition-all duration-200"
                    onClick={() => onDeleteEvent(selectedEvent)}
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
        </Card>
      </div>
    </>
  );
}