import { BookingType, BOOKING_TYPES } from "@/constants/index";
import { useState } from "react";

interface BookingLocationProps {
  currentType?: BookingType;
  address?: string;
  onSelect: (type: BookingType, address: string, distanceKm?: number) => void;
  onBack: () => void;
}

export function BookingLocation({ currentType, address, onSelect, onBack }: Readonly<BookingLocationProps>) {
  const [type, setType] = useState<BookingType>(currentType || BOOKING_TYPES.STUDIO);
  const [homeAddress, setHomeAddress] = useState(address || "");
  const [distance, setDistance] = useState<number | undefined>(undefined);

  const canContinue = type === BOOKING_TYPES.STUDIO || (type === BOOKING_TYPES.HOME && homeAddress.trim() && distance !== undefined);

  const handleContinue = () => {
    if (!canContinue) return;
    if (type === BOOKING_TYPES.STUDIO) {
      onSelect(BOOKING_TYPES.STUDIO, "Studio", 0);
    } else {
      onSelect(BOOKING_TYPES.HOME, homeAddress.trim(), distance);
    }
  };

  const feeEstimate = (() => {
    if (distance === undefined) return undefined;
    if (!distance || distance <= 3) return "10.000₫";
    if (distance <= 5) return "15.000₫";
    return "20.000₫";
  })();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <h3 className="text-lg font-semibold text-pink-600">Choose location</h3>
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setType(BOOKING_TYPES.STUDIO)}
          className={`border rounded-xl p-4 text-left space-y-1 transition ${type === BOOKING_TYPES.STUDIO ? 'border-pink-500 bg-pink-50 shadow-sm' : 'hover:border-pink-400'}`}
        >
          <div className="flex items-center gap-2 text-sm font-semibold tracking-wide">🏢 <span>STUDIO</span></div>
          <p className="text-[11px] text-neutral-500 leading-snug">Professional studio experience.</p>
          <p className="text-[11px] text-pink-600 font-medium">No travel fee</p>
        </button>
        <button
          type="button"
          onClick={() => setType(BOOKING_TYPES.HOME)}
          className={`border rounded-xl p-4 text-left space-y-1 transition ${type === BOOKING_TYPES.HOME ? 'border-pink-500 bg-pink-50 shadow-sm' : 'hover:border-pink-400'}`}
        >
          <div className="flex items-center gap-2 text-sm font-semibold tracking-wide">🏠 <span>HOME</span></div>
          <p className="text-[11px] text-neutral-500 leading-snug">Comfort & convenience at yours.</p>
          <p className="text-[11px] text-neutral-400">{type === BOOKING_TYPES.HOME ? 'Enter address below' : 'Select to enter address'}</p>
        </button>
      </div>

      {type === BOOKING_TYPES.HOME && (
        <div className="space-y-4 border rounded-xl p-4 bg-white shadow-sm">
          <div className="space-y-1">
            <label htmlFor="home-address" className="text-[11px] font-medium text-neutral-600">Address *</label>
            <input
              id="home-address"
              value={homeAddress}
              onChange={e => setHomeAddress(e.target.value)}
              placeholder="Street, district..."
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/60 focus:border-pink-400"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="distance-km" className="text-[11px] font-medium text-neutral-600">Distance (km) *</label>
            <input
              id="distance-km"
              type="number"
              min={0}
              value={distance ?? ''}
              onChange={e => setDistance(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Ex: 3"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/60 focus:border-pink-400"
            />
            <p className="text-[10px] text-neutral-500">Fee: ≤3km 10k, ≤5km 15k, &gt;5km 20k</p>
            {feeEstimate && <p className="text-[10px] text-pink-600 font-medium">Estimated fee: {feeEstimate}</p>}
          </div>
        </div>
      )}

      <div className="flex justify-between gap-3">
        <button onClick={onBack} type="button" className="px-4 py-2 border rounded-md text-sm bg-neutral-50 hover:bg-neutral-100">Back</button>
        <button
          disabled={!canContinue}
          onClick={handleContinue}
          type="button"
          className="px-4 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >Continue</button>
      </div>
    </div>
  );
}
