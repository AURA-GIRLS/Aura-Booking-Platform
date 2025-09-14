// BookingService component - lists available services for selection
// This is a simple mock list; replace with real fetch when backend API is ready.

import { useEffect, useState } from "react";
import type { ServiceResponseDTO } from "@/types/service.dtos";
import { ArtistService } from "@/services/artist";

interface BookingServiceProps {
    muaId?: string;
  selectedServiceId?: string;
  onSelect: (service: ServiceResponseDTO) => void;
  onContinue?: () => void; // proceed to next step if already selected
  onBack?: () => void;
  autoAdvance?: boolean; // if true, selecting a service immediately continues
}

export function BookingService({ muaId, selectedServiceId, onSelect, onBack, onContinue, autoAdvance }: Readonly<BookingServiceProps>) {
  const [services, setServices] = useState<ServiceResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localSelected, setLocalSelected] = useState<string | undefined>(selectedServiceId);

  useEffect(() => {
    let aborted = false;
    (async () => {
      if (!muaId) {
        setServices([]);
        setError("Missing artist ID");
        return;
      }
      setLoading(true);
      setError(null);
      try {
  const apiRes = await ArtistService.getArtistServices(muaId);
  if (aborted) return;
  // apiRes expected shape: { status?, success?, message?, data: ServiceResponseDTO[] }
  const list = Array.isArray((apiRes as any).data) ? (apiRes as any).data : [];
  setServices(list.filter((s: ServiceResponseDTO) => s.isActive !== false));
      } catch (e: any) {
        if (!aborted) setError(e.message || "Failed to load services");
      } finally {
        if (!aborted) setLoading(false);
      }
    })();
    return () => { aborted = true; };
  }, [muaId]);

  // Keep local selection in sync if parent changes it (e.g., preselected via URL)
  useEffect(() => {
    if (selectedServiceId) setLocalSelected(selectedServiceId);
  }, [selectedServiceId]);

  const handleChoose = (svc: ServiceResponseDTO) => {
    setLocalSelected(svc._id);
    onSelect(svc);
    if (autoAdvance && onContinue) onContinue();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-semibold text-pink-600">Select a service</h3>
        <p className="text-sm text-muted-foreground">Choose the service before picking a time</p>
      </div>

      {onBack && (
        <button type="button" onClick={onBack} className="text-sm text-pink-600 hover:underline">← Back</button>
      )}

  {loading && <div className="text-sm text-neutral-500">Loading services...</div>}
      {error && <div className="text-sm text-red-500">{error}</div>}

      <div className="grid gap-4">
        {services.map(svc => {
          const active = svc._id === localSelected;
          return (
            <button
              key={svc._id}
              type="button"
              onClick={() => handleChoose(svc)}
              className={`text-left rounded-xl p-4 transition flex gap-4 group border bg-white hover:shadow ${active ? 'border-pink-500 shadow-lg shadow-pink-100 ring-2 ring-pink-400/60' : 'border-neutral-200 hover:border-pink-300'}`}
            >
              <div className="w-16 h-16 rounded-lg bg-pink-100 flex items-center justify-center text-pink-500 text-xl shrink-0">💄</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="font-semibold text-foreground/90 truncate">{svc.name}</div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-3 flex-wrap">
                      <span>{svc.duration} mins</span>
                      <span className="font-medium text-pink-600">{svc.price.toLocaleString('vi-VN')}₫</span>
                    </div>
                    {svc.description && <p className="text-[11px] text-neutral-600 line-clamp-2">{svc.description}</p>}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-md border ${active ? 'bg-pink-600 border-pink-600 text-white shadow-sm' : 'bg-pink-50 text-pink-600 group-hover:bg-pink-100'}`}>{active ? 'Selected' : 'Choose'}</span>
                </div>
                {active && (
                  <div className="mt-2 text-[11px] font-medium text-pink-600 flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-pink-500 animate-pulse" /> Preselected
                  </div>
                )}
              </div>
            </button>
          );
        })}
        {!loading && services.length === 0 && !error && (
          <div className="text-sm text-neutral-500">No services available.</div>
        )}
      </div>
      <div className="flex justify-end gap-3 pt-2">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 border rounded-md text-sm bg-neutral-50 hover:bg-neutral-100"
          >Back</button>
        )}
        {onContinue && (
          <button
            type="button"
            disabled={!localSelected}
            onClick={() => localSelected && onContinue()}
            className="px-4 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >Continue</button>
        )}
      </div>
    </div>
  );
}
