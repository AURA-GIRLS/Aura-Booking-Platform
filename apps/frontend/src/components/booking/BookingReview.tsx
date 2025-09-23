// BookingReview component - pink themed, segmented cards with optional edit handlers

import { BOOKING_TYPES } from "@/constants/index";
import { BookingDraftLite } from "@/types/booking.dtos";

interface BookingReviewProps {
  draft: BookingDraftLite;
  onBack: () => void;
  onConfirm: () => void;
  onEditSection?: (section: "datetime" | "location" | "checkout" | "service") => void;
}

export function BookingReview({ draft, onBack, onConfirm, onEditSection }: Readonly<BookingReviewProps>) {
  const locLabel = draft.locationType === BOOKING_TYPES.HOME ? (draft.address || "At home") : "At salon";
  const timeLabel = draft.startTime && draft.endTime ? `${draft.startTime} - ${draft.endTime}` : draft.startTime;
  const servicePrice = draft.servicePrice?.toLocaleString('vi-VN');
  const transportFee = draft.transportFee ? draft.transportFee.toLocaleString('vi-VN') : undefined;
  const total = draft.totalPrice?.toLocaleString('vi-VN');
  // Format date with weekday (locale Vietnamese to mirror screenshot style if available)
  let formattedDate: string | undefined = draft.bookingDate;
  try {
    if (draft.bookingDate) {
      const d = new Date(draft.bookingDate);
      // Use en-US with long weekday, then manual replace if needed
      formattedDate = d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
  } catch {
    // ignore
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-semibold text-pink-600">Review booking</h3>
        <p className="text-sm text-muted-foreground">Please verify your information before confirming</p>
      </div>

      <div className="space-y-6">
        {/* Service Card */}
        <div className="rounded-xl border bg-white p-5 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="text-sm font-medium text-pink-600">Selected service</div>

           <div className="flex items-start gap-4"> 
             <div className="w-16 h-16 rounded-lg overflow-hidden bg-pink-100 flex items-center justify-center text-pink-500 text-xl shrink-0">
              {draft.serviceImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={draft.serviceImageUrl} alt={draft.serviceName || 'service'} className="w-full h-full object-cover" />
              ) : (
                <span>💄</span>
              )}
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-base font-semibold text-foreground/90 truncate">{draft.serviceName}</div>
                  <div className="text-xs font-normal text-foreground/90 truncate">{draft.serviceName}</div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-4 flex-wrap">
                    {draft.duration && <span className="flex items-center gap-1">⏱ <span>{draft.duration} mins</span></span>}
                    <span className="flex items-center gap-1">⭐ <span className="opacity-80">4.6 (45)</span></span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-pink-600">{servicePrice}₫</div>
                  {onEditSection && (
                    <button
                      onClick={() => onEditSection("service")}
                      className="mt-2 px-2 py-1 rounded-md border text-[11px] hover:bg-pink-50"
                      type="button"
                    >Change</button>
                  )}
                </div>
              </div>
              {draft.serviceDescription && (
                <p className="text-[11px] text-neutral-600 leading-relaxed line-clamp-2">{draft.serviceDescription}</p>
              )}
              {draft.note && <p className="text-[11px] text-muted-foreground italic">“{draft.note}”</p>}
            </div>
            </div>
          </div>
        </div>

        {/* Time Card */}
        <div className="rounded-xl border bg-white p-5 shadow-sm flex items-start justify-between">
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2 font-medium text-pink-600">🗓 <span>Time</span></div>
            <div className="text-neutral-700">{formattedDate}</div>
            <div className="text-neutral-700">{timeLabel}</div>
          </div>
          {onEditSection && (
            <button onClick={() => onEditSection("datetime")} className="h-7 px-3 text-[11px] rounded-md border hover:bg-pink-50" type="button">Change</button>
          )}
        </div>

        {/* Location Card */}
        <div className="rounded-xl border bg-white p-5 shadow-sm flex items-start justify-between">
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2 font-medium text-pink-600">📍 <span>Location</span></div>
            <div className="text-neutral-700 max-w-[260px] whitespace-pre-wrap">{locLabel}</div>
          </div>
          {onEditSection && (
            <button onClick={() => onEditSection("location")} className="h-7 px-3 text-[11px] rounded-md border hover:bg-pink-50" type="button">Change</button>
          )}
        </div>

        {/* Payment Card */}
        <div className="rounded-xl border bg-white p-5 shadow-sm space-y-2 text-sm">
          <div className="flex items-center gap-2 font-medium text-pink-600 mb-1">💰 <span>Payment details</span></div>
          <div className="flex justify-between"><span className="text-neutral-600">Service price</span><span className="font-medium">{servicePrice}₫</span></div>
          {transportFee && <div className="flex justify-between"><span className="text-neutral-600">Travel fee</span><span className="font-medium">{transportFee}₫</span></div>}
          <div className="border-t pt-3 mt-1 flex justify-between text-base font-semibold">
            <span>Total</span>
            <span className="text-pink-600">{total}₫</span>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">You can pay in cash or bank transfer after the service. No deposit required.</p>
        </div>
      </div>

      <div className="flex justify-between gap-4 pt-2">
        <button onClick={onBack} type="button" className="px-4 h-11 flex-1 border rounded-md text-sm bg-neutral-50 hover:bg-neutral-100">Back</button>
        <button onClick={onConfirm} type="button" className="px-4 h-11 flex-1 rounded-md text-sm font-medium bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow hover:shadow-md">Confirm booking</button>
      </div>
    </div>
  );
}
