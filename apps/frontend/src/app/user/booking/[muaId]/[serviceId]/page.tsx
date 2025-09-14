"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { BookingStep, BookingSlot, BookingResponseDTO, BookingDraft } from "@/types/booking.dtos";
import { BOOKING_TYPES, type BookingType } from "@/constants/index";
import { BookingProgress } from "@/components/booking/BookingProgress";
import { BookingService as BookingServiceComponent } from "@/components/booking/BookingService";
import { BookingCheckout } from "@/components/booking/BookingCheckout";
import { BookingReview } from "@/components/booking/BookingReview";
import { BookingLocation } from "@/components/booking/BookingLocation";
import { BookingTime } from "@/components/booking/BookingTime";
import { ArtistService } from "@/services/artist";
import { BookingService as BookingApi } from "@/services/booking";
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
  // Services state
  const [services, setServices] = useState<ServiceResponseDTO[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);

  // Slots (monthly) state (flattened BookingSlot[] for current viewed month)
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [viewYear, setViewYear] = useState<number>(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(new Date().getMonth()); // 0-based

  const currentUser = localStorage.getItem("currentUser") ? JSON.parse(localStorage.getItem("currentUser") as string) : null;

  // Simulated service fetch (replace with real API call)
  // If route already contains service id we could prefetch details here (future enhancement)
  // Fetch services for artist
  useEffect(() => {
    let aborted = false;
    (async () => {
      if (!muaId) return;
      setLoadingServices(true);
      setServicesError(null);
      try {
        const res = await ArtistService.getArtistServices(muaId);
        if (aborted) return;
        const list = Array.isArray((res as any).data) ? (res as any).data : [];
        const active = list.filter((s: ServiceResponseDTO) => s.isActive !== false);
        setServices(active);
        // If route param preselects a service, ensure draft populated
        if (serviceId) {
          const found = active.find((s: ServiceResponseDTO) => s._id === serviceId);
          if (found) {
            setDraft(prev => ({
              ...prev,
              serviceId: found._id,
              muaId: found.muaId,
              serviceName: found.name,
              servicePrice: found.price,
              duration: found.duration,
              serviceDescription: found.description,
            }));
          }
        }
      } catch(e: any) {
        if (!aborted) setServicesError(e?.message || "Failed to load services");
      } finally {
        if (!aborted) setLoadingServices(false);
      }
    })();
    return () => { aborted = true; };
  }, [muaId, serviceId]);

  // Fetch monthly availability whenever (muaId, selected service duration) or view month changes
  const fetchMonthlySlots = useCallback(async (year: number, month0: number,durationOverride?: number) => {
      const duration = durationOverride ?? draft.duration;
      console.log("Service selected, duration", muaId,duration);
    if (!muaId || !duration) return;
    setLoadingSlots(true);
    setSlotsError(null);
    try {
       console.log("Seffff");
      const res = await BookingApi.getMonthlyAvailable({
        muaId,
        year,
        month: month0 + 1, // API expects 1-12
        duration: duration!
      });
      console.log("Monthly slots raw", res);
      if (res.success && res.data) {
        const transformed: BookingSlot[] = [];
        Object.entries(res.data).forEach(([dayKey, arr]) => {
          arr.forEach(tuple => {
            const [day, start, end] = tuple;
            transformed.push({
              serviceId: draft.serviceId || "",
              day,
              startTime: start,
              endTime: end
            });
          });
        });
        setSlots(transformed);
      } else {
        setSlots([]);
      }
    } catch(e: any) {
      setSlotsError(e?.message || "Failed to load availability");
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [muaId, draft.duration, draft.serviceId]);

  // Trigger fetch for current view month
  useEffect(() => { fetchMonthlySlots(viewYear, viewMonth); }, [fetchMonthlySlots, viewYear, viewMonth]);

  // Simulated monthly slots fetch
  const handleMonthChange = (y: number, m0: number) => {
    setViewYear(y);
    setViewMonth(m0);
  };

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
    
    // Refresh slots for the currently viewed month (duration changed)
  setTimeout(() =>fetchMonthlySlots(viewYear, viewMonth, svc.duration), 0);
  };

  const stepContent = useMemo(() => {
    switch (currentStep) {
      case "service":
        return (
          <BookingServiceComponent
            services={services}
            loading={loadingServices}
            loadingSlots={loadingSlots}
            error={servicesError}
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
            error={slotsError || undefined}
            selectedDate={draft.bookingDate}
            selectedTime={draft.startTime}
            onChangeMonth={handleMonthChange}
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
            customer={currentUser}
            onPrev={goPrev}
            bookingData={{
              customerId: currentUser._id || "",
              artistId: draft.muaId || "",
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
  }, [currentStep, slots, loadingSlots, slotsError, draft, services, loadingServices, servicesError]);

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
