"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { BookingStep, BookingSlot, BookingResponseDTO, BookingDraft } from "@/types/booking.dtos";
import { BOOKING_TYPES, type BookingType } from "@/constants/index";
import { BookingProgress } from "@/components/booking/BookingProgress";
import { BookingService } from "@/components/booking/BookingService";
import { BookingCheckout } from "@/components/booking/BookingCheckout";
import { BookingReview } from "@/components/booking/BookingReview";
import { BookingLocation } from "@/components/booking/BookingLocation";
import { BookingTime } from "@/components/booking/BookingTime";
import type { ServiceResponseDTO } from "@/types/service.dtos";
import { useParams, useRouter } from "next/navigation";

// Draft shape for building a booking before submission


const STEPS: BookingStep[] = ["service", "datetime", "location", "review", "checkout"]; // align with BookingProgress

export default function BookingWizardPage() {
  const params = useParams();
  const serviceId = (params?.serviceId as string) || ""; // route param (preselected service)
  const muaId = (params?.muaId as string) || ""; // route param (preselected service)
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<BookingStep>("service");
  const [draft, setDraft] = useState<BookingDraft>({ serviceId });
  const [slots, setSlots] = useState<BookingSlot[]>([]); // monthly slots for service
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulated service fetch (replace with real API call)
  // If route already contains service id we could prefetch details here (future enhancement)
  useEffect(() => {
    if (!serviceId) return;
    // If arriving with a serviceId, we could fetch its detail to populate name/price
    // Simulate quick fetch (replace with real API)
    let aborted = false;
    (async () => {
      await new Promise(r => setTimeout(r, 120));
      if (aborted) return;
      setDraft(prev => ({
        ...prev,
        serviceId: serviceId,
        serviceName: prev.serviceName || "Preselected service",
        servicePrice: prev.servicePrice || 0,
      }));
    })();
    return () => { aborted = true; };
  }, [serviceId]);

  // Simulated monthly slots fetch
  const fetchSlotsForMonth = useCallback(async (year: number, month: number) => {
    setLoadingSlots(true);
    setError(null);
    try {
      await new Promise(r => setTimeout(r, 400));
      // Generate mock slots for example: each day 3 slots unless weekend = full
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const mock: BookingSlot[] = [];
      for (let d = 1; d <= daysInMonth; d++) {
        const dayDate = new Date(year, month, d);
        const isoDay = dayDate.toISOString().split("T")[0];
        const dayOfWeek = dayDate.getDay(); // 0 Sun ... 6 Sat
        if (dayOfWeek === 0) continue; // Sunday off
        // Random full days (simulate) if Saturday
        if (dayOfWeek === 6) {
          // mark as full by adding zero slots -> consumer will treat as full
          continue;
        }
        mock.push({ serviceId, day: isoDay, startTime: "08:00", endTime: "10:00" });
        mock.push({ serviceId, day: isoDay, startTime: "11:00", endTime: "13:00" });
        mock.push({ serviceId, day: isoDay, startTime: "14:00", endTime: "16:00" });
      }
      setSlots(mock);
    } catch (e: any) {
  setError(e.message || "Failed to load schedule");
    } finally {
      setLoadingSlots(false);
    }
  }, [serviceId]);

  // initial month load
  useEffect(() => {
    const now = new Date();
    fetchSlotsForMonth(now.getFullYear(), now.getMonth());
  }, [fetchSlotsForMonth]);

  // Recalculate total whenever servicePrice or transportFee changes
  useEffect(() => {
    setDraft(prev => ({
      ...prev,
      totalPrice: (prev.servicePrice || 0) + (prev.transportFee || 0),
    }));
  }, [draft.servicePrice, draft.transportFee]);

  const goNext = () => {
    const idx = STEPS.indexOf(currentStep);
    if (idx < STEPS.length - 1) setCurrentStep(STEPS[idx + 1]);
  };
  const goPrev = () => {
    const idx = STEPS.indexOf(currentStep);
    if (idx > 0) setCurrentStep(STEPS[idx - 1]);
  };

  const updateDraft = (patch: Partial<BookingDraft>) => setDraft(prev => ({ ...prev, ...patch }));

  // Handlers for child components
  const handleSelectDateTime = (dateISO: string, startTime: string, endTime?: string) => {
    updateDraft({ bookingDate: dateISO, startTime, endTime });
    goNext();
  };

  const handleLocationSelection = (locationType: BookingType, address: string, distanceKm?: number) => {
    // Pricing rule: base transport fee only for home visits; sample: 0-3km = 10k, 3-5km = 15k, >5km = 20k (placeholder logic)
    let transportFee = 0;
    if (locationType === BOOKING_TYPES.HOME) {
      if (!distanceKm || distanceKm <= 3) transportFee = 10000;
      else if (distanceKm <= 5) transportFee = 15000;
      else transportFee = 20000;
    }
    updateDraft({ locationType, address, transportFee });
    goNext();
  };

  const handleConfirmReview = () => { goNext(); };

  const handleEditSection = (section: "service" | "datetime" | "location" | "checkout") => {
    if (section === "service") setCurrentStep("service");
    else if (section === "datetime") setCurrentStep("datetime");
    else if (section === "location") setCurrentStep("location");
  };

  const handleSelectService = (svc: ServiceResponseDTO) => {
    setDraft(prev => ({
      ...prev,
      serviceId: svc._id,
      muaId: svc.muaId,
      serviceName: svc.name,
      servicePrice: svc.price,
      duration: svc.duration,
      serviceDescription: svc.description,
      // reset downstream selections when changing service
      bookingDate: undefined,
      startTime: undefined,
      endTime: undefined,
      totalPrice: svc.price + (prev.transportFee || 0),
    }));
  };

  const stepContent = useMemo(() => {
    switch (currentStep) {
      case "service":
        return (
          <BookingService
            muaId={muaId}
            selectedServiceId={draft.serviceId}
            onSelect={handleSelectService}
            onContinue={() => setCurrentStep("datetime")}
            autoAdvance={false}
          />
        );
      case "datetime":
        return (
          <BookingTime
            slots={slots}
            loading={loadingSlots}
            error={error || undefined}
            selectedDate={draft.bookingDate}
            selectedTime={draft.startTime}
            onChangeMonth={(y, m) => fetchSlotsForMonth(y, m)}
            onSelectSlot={(day, start, end) => handleSelectDateTime(day, start, end)}
            onBack={goPrev}
          />
        );
      case "location":
        return (
          <BookingLocation
            currentType={draft.locationType}
            address={draft.address}
            onSelect={(type, addr, distanceKm) => handleLocationSelection(type, addr, distanceKm)}
            onBack={goPrev}
          />
        );
      case "review":
        return (
          <BookingReview
            draft={draft}
            onBack={goPrev}
            onConfirm={handleConfirmReview}
            onEditSection={handleEditSection}
          />
        );
      case "checkout":
        return (
          <BookingCheckout
            onPrev={goPrev}
            bookingData={{
              customerId: draft.customerId || "temp-customer",
              artistId: draft.muaId || "temp-artist",
              serviceId: draft.serviceId,
              customerName: draft.customerName || "Guest user",
              serviceName: draft.serviceName || "Service",
              servicePrice: draft.servicePrice || 0,
              bookingDate: draft.bookingDate || new Date().toISOString().split("T")[0],
              startTime: draft.startTime || "08:00",
              endTime: draft.endTime || "10:00",
              duration: draft.duration || 120,
              locationType: (draft.locationType as BookingType) || BOOKING_TYPES.STUDIO,
              address: draft.address || "Studio",
              status: "PENDING" as any,
              transportFee: draft.transportFee,
              totalPrice: draft.totalPrice || 0,
              note: draft.note,
              createdAt: new Date(),
              updatedAt: new Date(),
            } as BookingResponseDTO}
          />
        );
    }
  }, [currentStep, slots, loadingSlots, error, draft]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => router.push(`/user/artists/portfolio/${muaId}` as any)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-md border bg-white text-sm font-medium hover:bg-pink-50 transition"
          >
            ← Back to services
          </button>
          <span className="text-xs text-neutral-400 uppercase tracking-wide">Booking wizard</span>
        </div>
        <BookingProgress currentStep={currentStep} serviceSelected={!!draft.serviceId} />

        <div className="mt-8">
          {stepContent}
          <div className="mt-6" />
        </div>
      </div>
    </div>
  );
}
