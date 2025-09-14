import { useState } from "react";
import type { BookingResponseDTO } from "@/types/booking.dtos";

interface BookingCheckoutProps {
  onPrev: () => void;
  bookingData: BookingResponseDTO;
}

export function BookingCheckout({ onPrev, bookingData }: Readonly<BookingCheckoutProps>) {
  const [done, setDone] = useState(false);
  const [customerName, setCustomerName] = useState(bookingData.customerName || "");
  const [note, setNote] = useState(bookingData.note || "");
  const [phone, setPhone] = useState("");

  let formattedDate: string | undefined = bookingData.bookingDate;
  try {
    if (bookingData.bookingDate) {
      const d = new Date(bookingData.bookingDate);
      formattedDate = d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
  } catch {/* ignore */}

  if (done) {
    return (
      <div className="space-y-8 text-center animate-in fade-in">
        <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-pink-600 to-pink-500 flex items-center justify-center text-4xl text-white shadow-lg">✨</div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-pink-600">Booking confirmed!</h3>
          <p className="text-sm text-neutral-500 leading-relaxed">Thank you. We'll reach out shortly to reconfirm your appointment.</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="w-full h-11 rounded-md text-sm font-medium bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow hover:shadow-md transition"
        >Book another</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-semibold text-pink-600">Contact information</h3>
        <p className="text-sm text-neutral-500">Please provide details to finish booking</p>
      </div>
      <div className="space-y-6">
        <div className="rounded-xl border bg-white p-5 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-1">
          <div className="grid gap-4">
            <label className="flex flex-col gap-1 text-xs font-medium" htmlFor="customerName">
              <span>Full name *</span>
              <input
                id="customerName"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/60 focus:border-pink-400"
                placeholder="Enter your full name"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium" htmlFor="phone">
              <span>Phone number *</span>
              <input
                id="phone"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/60 focus:border-pink-400"
                placeholder="Enter phone number"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium" htmlFor="note">
              <span>Note (optional)</span>
              <textarea
                id="note"
                value={note}
                onChange={e => setNote(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/60 focus:border-pink-400"
                rows={3}
                placeholder="Special requests or extra notes..."
              />
            </label>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm text-sm space-y-4 animate-in fade-in slide-in-from-bottom-1">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-lg bg-pink-100 flex items-center justify-center text-pink-500 text-lg overflow-hidden">
              <span>💄</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-pink-600">Booking summary</div>
                  <div className="text-base font-semibold text-foreground/90 truncate">{bookingData.serviceName}</div>
                  <div className="flex items-center gap-4 text-[11px] text-neutral-500 flex-wrap">
                    {!!bookingData.duration && <span className="flex items-center gap-1">⏱ <span>{bookingData.duration} mins</span></span>}
                  </div>
                </div>
                <div className="text-right text-sm font-semibold text-pink-600">{(bookingData.totalPrice - (bookingData.transportFee || 0)).toLocaleString('vi-VN')}₫</div>
              </div>
              <div className="mt-4 border-t pt-3 grid gap-1 text-[11px] text-neutral-600">
                <div className="flex justify-between"><span className="font-medium text-neutral-500 w-20">Date</span><span className="text-neutral-700">{formattedDate}</span></div>
                <div className="flex justify-between"><span className="font-medium text-neutral-500 w-20">Time</span><span className="text-neutral-700">{bookingData.startTime}</span></div>
                <div className="flex justify-between"><span className="font-medium text-neutral-500 w-20">Location</span><span className="text-neutral-700 truncate max-w-[200px]">{bookingData.address}</span></div>
              </div>
               <div className="mt-4 border-t pt-3 grid gap-1 text-[11px] text-neutral-600">
                <div className="flex justify-between"><span className="font-medium text-neutral-500 w-20">Service price</span><span className="text-neutral-700 truncate max-w-[200px]">{bookingData.servicePrice?.toLocaleString('vi-VN') ?? 0}₫</span></div>
                {bookingData.transportFee ? (
                  <div className="flex justify-between"><span className="font-medium text-neutral-500 w-20">Travel fee</span><span className="text-neutral-700">{bookingData.transportFee.toLocaleString('vi-VN')}₫</span></div>
                ) : null}
              </div>
              <div className="mt-3 border-t pt-3 flex justify-between text-base font-semibold">
                <span>Total</span>
                <span className="text-pink-600">{bookingData.totalPrice.toLocaleString('vi-VN')}₫</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-pink-100 bg-pink-50 p-4 text-[11px] leading-relaxed text-neutral-700 animate-in fade-in slide-in-from-bottom-1">
          You can pay in cash or bank transfer after the service is completed. No pre-payment required.
        </div>
      </div>
      <div className="flex justify-between gap-4 pt-2">
        <button onClick={onPrev} type="button" className="px-4 h-11 flex-1 border rounded-md text-sm bg-neutral-50 hover:bg-neutral-100">Back</button>
        <button onClick={() => setDone(true)} type="button" className="px-4 h-11 flex-1 rounded-md text-sm font-medium bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow hover:shadow-md">Complete booking</button>
      </div>
    </div>
  );
}
