'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { BookingResponseDTO, CreateBookingDTO } from "@/types/booking.dtos";
import { UserResponseDTO } from "@/types/user.dtos";
import { BookingService } from "@/services/booking";
import { usePayOS, PayOSConfig } from "@payos/payos-checkout";
import { TransactionService } from "@/services/transaction";
import { PayOSCreateLinkInput } from "@/types/transaction.dto";
import { CheckCircle, QrCode } from "lucide-react";
import { useNotification } from "@/hooks/useNotification";
import { convertStringToLocalDate } from "src/utils/TimeUtils";

// moved into component with useMemo so changes propagate correctly

interface BookingCheckoutProps {
  customer?:UserResponseDTO;
  onPrev: () => void;
  bookingData: BookingResponseDTO;
}

export function BookingCheckout({customer, onPrev, bookingData }: Readonly<BookingCheckoutProps>) {
  const [done, setDone] = useState(false);
  const [customerName, setCustomerName] = useState(customer?.fullName || "");
  const [note, setNote] = useState(bookingData.note || "");
  const [phone, setPhone] = useState(customer?.phoneNumber);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // removed unused 'created' state
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [orderCode, setOrderCode] = useState(0);
  const [locked, setLocked] = useState(false);
 const [paymentMethod, setPaymentMethod] = useState('qr'); // only QR for now
  const { notification, showError, closeNotification } = useNotification();
  // Helper: update localStorage user profile with latest contact info
  const updateLocalProfile = useCallback((full?: string, phoneNum?: string) => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem('currentUser');
      if (!raw) return;
      const obj = JSON.parse(raw);
      if (full) {
        obj.fullName = full;
        window.localStorage.setItem('currentUserFullName', full);
      }
      if (phoneNum) {
        obj.phoneNumber = phoneNum;
      }
      window.localStorage.setItem('currentUser', JSON.stringify(obj));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Failed to update localStorage profile', e);
    }
  }, []);
  const payOSConfig = useMemo<PayOSConfig>(() => ({
    RETURN_URL: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
    ELEMENT_ID: "payos_embedded",
    CHECKOUT_URL: checkoutUrl,
    embedded: true,
    onSuccess: (event: any) => {
      console.log("Payment successful:", event);
      setDone(true);
    },
    onCancel: (event: any) => {
      console.log("Payment cancelled:", event);
    },
    onExit: (event: any) => {
      console.log("Payment popup closed:", event);
    },
  }), [checkoutUrl]);

  const { open, exit } = usePayOS(payOSConfig);
  const autoStartRef = useRef(false);

  let formattedDate: string | undefined = bookingData.bookingDate;
  try {
    if (bookingData.bookingDate) {
      const d = new Date(bookingData.bookingDate);
      formattedDate = d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
  } catch {/* ignore */}

  const fetchTransactionLink = useCallback(async (oc?: number) => {
    try {
      const effectiveOrderCode = typeof oc === 'number' && oc > 0 ? oc : orderCode;
      const payload: PayOSCreateLinkInput = {
        amount: bookingData.totalPrice,
        description: `${bookingData.customerId}`,
        returnUrl: window.location.origin,
        cancelUrl: window.location.origin,
        orderCode: effectiveOrderCode || 0,
      };
      const res = await TransactionService.getTransactionLink(payload);
      if (res.success && res.data?.checkoutUrl) {
        setCheckoutUrl(res.data.checkoutUrl);       
      }
    } catch (e) {
      console.error(e);
    }
  }, [bookingData._id, bookingData.totalPrice, orderCode]);

  const createPendingBooking = useCallback((async (): Promise<number | null> => {
    const localBookingDate = convertStringToLocalDate(bookingData.bookingDate, bookingData.startTime); 
        const payload: CreateBookingDTO = {
          customerId: bookingData.customerId,
          serviceId: bookingData.serviceId,
          customerPhone: phone || '',
          muaId: bookingData.artistId,
          bookingDate: new Date(localBookingDate),
          duration: bookingData.duration,
          locationType: bookingData.locationType,
          address: bookingData.address,
          transportFee: bookingData.transportFee,
          totalPrice: bookingData.totalPrice,
          payed: false,
          note: note || undefined,
        };
        try {
          const res = await BookingService.createRedisPendingBooking(payload);
          if (res.success && res.data?.orderCode) {
            setOrderCode(res.data.orderCode);
            return res.data.orderCode;
          }
        } catch (e) {
          console.error(e);
        }
        return null;
      }), [bookingData, note, phone]);

  // Generate QR flow: lock, create pending, then fetch link and open
  const handleGenerateQR = useCallback(async () => {
    setSubmitError(null);
    if (!customerName || !phone) {
      const msg = "Please enter required contact information.";
      setSubmitError(msg);
      showError(msg);
      return;
    }
    try {
      setSubmitting(true);
      setLocked(true);
      let code = orderCode;
      if (!code) {
        const createdCode = await createPendingBooking();
        if (!createdCode) throw new Error('Could not create pending booking');
        code = createdCode;
      }
      await fetchTransactionLink(code);
      // Opening is handled by the locked+checkoutUrl effect
    } catch (e: any) {
      const msg = e?.message || 'Failed to generate QR';
      setSubmitError(msg);
      showError(msg);
    } finally {
      setSubmitting(false);
    }
  }, [customerName, phone, createPendingBooking, fetchTransactionLink, orderCode]);

  // Cleanup embedded UI on unmount only
  useEffect(() => {
    return () => {
      try { exit(); } catch {}
    };
  }, []);

  // Open after URL is ready and we are locked (user initiated)
  useEffect(() => {
    if (locked && checkoutUrl) {
      console.log('Opening PayOS checkout:', checkoutUrl);
      open();
    }
  }, [locked, checkoutUrl]);

  // Auto start payment step if user already has full name and phone
  useEffect(() => {
    if (!autoStartRef.current && !locked && customerName && phone) {
      autoStartRef.current = true;
      // This will validate again and lock + fetch QR
      handleGenerateQR();
    }
  }, [customerName, phone, locked, handleGenerateQR]);

  // Auto-hide notification after a short delay
  useEffect(() => {
    if (notification?.isVisible) {
      const t = setTimeout(() => closeNotification(), 3000);
      return () => clearTimeout(t);
    }
  }, [notification?.isVisible, closeNotification]);

  // After successful booking, ensure localStorage profile reflects latest contact info
  useEffect(() => {
    if (done) {
      updateLocalProfile(customerName, phone);
    }
  }, [done, customerName, phone, updateLocalProfile]);

  // removed unused handleCreateBooking

  if (done) {
    return (
      <div className="space-y-8 text-center animate-in fade-in">
        <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-pink-600 to-pink-500 flex items-center justify-center text-4xl text-white shadow-lg">✨</div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-pink-600">Booking confirmed!</h3>
          <p className="text-sm text-neutral-500 leading-relaxed">Thank you. We'll reach out shortly to reconfirm your appointment.</p>
          {orderCode ? (
            <p className="text-[11px] text-neutral-400">Ref: {orderCode}</p>
          ) : null}
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
      {notification.isVisible && (
        <div className={`fixed top-4 right-4 z-50 rounded-md border px-4 py-3 text-sm shadow-lg ${notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          <div className="flex items-start gap-2">
            <span className="font-semibold">{notification.type === 'success' ? 'Success' : 'Error'}</span>
            <span className="flex-1">{notification.message}</span>
            <button className="text-xs opacity-70 hover:opacity-100" onClick={closeNotification}>Close</button>
          </div>
        </div>
      )}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-semibold text-pink-600">Complete your booking</h3>
        <p className="text-sm text-neutral-500">Fill your contact information and complete payment. Follow the guide below.</p>
      </div>
      {/* Moved checkout guide to the top so users can follow easily */}
      <div id="checkout_guide" className="flex justify-content rounded-xl border border-pink-100 bg-pink-50 p-4 text-[11px] leading-relaxed text-neutral-700 animate-in fade-in slide-in-from-bottom-1" aria-label="Checkout guide">
        <div className="w-full space-y-2">
          <div className="text-xs font-semibold text-pink-600 uppercase tracking-wide">Checkout guide</div>
          <p>Follow these steps to finish and confirm your booking:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Review your booking summary below to ensure everything is correct.</li>
            <li>If needed, fill or update your contact details.</li>
            <li>In the payment section, click <span className="font-semibold">Generate QR payment</span>.</li>
            <li>Scan the QR code with your banking app and complete the payment.</li>
            <li>Keep this page open; we’ll confirm automatically once the payment succeeds.</li>
            <li>If the artist declines or you cancel in time, you’ll receive a full refund.</li>
            <li>Need to update contact details later? Click <span className="font-semibold">Change contact info</span>.</li>
          </ol>
        </div>
      </div>
      <div className="space-y-6">
        <div className="rounded-xl border bg-white p-5 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-1">
          {locked ? (
            <div className="space-y-2 text-sm">
              <span className="text-sm font-medium text-pink-600">Contact information</span>
              <div className="flex justify-between">
                <span className="text-neutral-500 w-28">Full name</span>
                <span className="text-neutral-800 font-medium truncate max-w-[220px]">{customerName || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 w-28">Phone</span>
                <span className="text-neutral-800 font-medium truncate max-w-[220px]">{phone || '-'}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-neutral-500 w-28">Note</span>
                <span className="text-neutral-800 truncate max-w-[220px]">{note || '-'}</span>
              </div>
              <div className="pt-2 text-right">
                <button
                  type="button"
                  className="text-xs text-pink-600 hover:underline"
                  onClick={() => {
                    try { exit(); } catch {}
                    // prevent auto-start after user edits; require explicit Continue
                    autoStartRef.current = true;
                    setLocked(false);
                    setCheckoutUrl('');
                    setOrderCode(0);
                  }}
                >Change contact info</button>
              </div>
            </div>
          ) : (
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
          )}
        </div>
        {/* Continue to payment button (show whenever contact info is editable/unlocked) */}
        {!locked && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (!customerName || !phone) {
                  const msg = "Please enter required contact information.";
                  setSubmitError(msg);
                  showError(msg);
                  return;
                }
                setSubmitError(null);
                // Sync latest contact info to localStorage on proceed
                updateLocalProfile(customerName, phone);
                setLocked(true);
                if (paymentMethod === 'qr') {
                  // Auto-start QR flow when proceeding
                  handleGenerateQR();
                }
              }}
              className="px-4 h-10 rounded-md text-sm bg-pink-600 text-white hover:bg-pink-500 disabled:opacity-50"
              disabled={submitting}
            >
              Continue to payment
            </button>
          </div>
        )}

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
                <div className="flex justify-between"><span className="font-medium text-neutral-500 w-20">Time</span><span className="text-neutral-700">{bookingData.startTime} - {bookingData.endTime}</span></div>
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

        {locked && (
            <div  className="flex flex-col w-full h-[25rem] overflow-hidden rounded-xl border border-pink-100 p-4 text-[11px] leading-relaxed text-neutral-700 animate-in fade-in slide-in-from-bottom-1">
              <span className="text-sm font-medium text-pink-600">Payment method</span>
              <div className="flex-1 flex justify-content items-center gap-5">
                <button
                  className={`p-4 border rounded-lg cursor-pointer transition-colors w-[22rem] ${
                    paymentMethod === "qr" ? "border-pink-500 bg-pink/5" : "border-border"
                  }`}
                  onClick={() => {
                    setPaymentMethod("qr");
                    handleGenerateQR();
                  }}
                  disabled={submitting}
                >
                  <div className="flex items-center text-left gap-3">
                    <QrCode className="h-5 w-5 text-pink-400" />
                    <div className="flex-1">
                      <p className="font-xs">QR Code</p>
                      <p className="text-xs text-muted-foreground ">{submitting ? 'Generating QR…' : 'Generate QR payment'}</p>
                    </div>
                    {paymentMethod === "qr" && <CheckCircle className="h-5 w-5 text-pink-600" />}
                  </div>
                </button>
                <div  className="w-full h-[22rem] py-2 rounded-xs border border-gray-200" id="payos_embedded"></div>
              </div>
            </div>
        )}

        {submitError && (
          <div className="text-xs text-red-500">{submitError}</div>
        )}
      </div>
      <div className="flex justify-start gap-4 ">
        <button onClick={onPrev} type="button" className="w-fit px-4 h-11 border rounded-md text-sm bg-neutral-50 hover:bg-neutral-100">Back</button>
       </div>
    </div>
  );
}

