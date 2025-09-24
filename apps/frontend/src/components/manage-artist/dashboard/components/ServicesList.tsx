import { ToggleLeft, ToggleRight } from 'lucide-react';
import type { MuaService } from '@/services/dashboard';

interface ServicesListProps {
  services: MuaService[];
  linkId: string;
  onServiceAvailabilityChange: (serviceId: string, isAvailable: boolean) => Promise<void>;
}

export default function ServicesList({ services, linkId, onServiceAvailabilityChange }: ServicesListProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">Services</h2>
        <button 
          onClick={() => window.location.href = `/manage-artist/${linkId}/services`}
          className="text-pink-500 hover:text-pink-600 text-sm font-medium"
        >
          View All →
        </button>
      </div>

      <div className="space-y-4">
        {services.slice(0, 4).map(service => (
          <div key={service.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
            <div>
              <h4 className="font-semibold text-gray-900">{service.name}</h4>
              <p className="text-sm text-gray-600">{service.category} • {service.duration} • {service.price}</p>
            </div>
            <button
              className="p-2"
              onClick={() => onServiceAvailabilityChange(service.id, !service.isActive)}
            >
              {service.isActive ? (
                <ToggleRight className="text-pink-500" size={24} />
              ) : (
                <ToggleLeft className="text-gray-300" size={24} />
              )}
            </button>
          </div>
        ))}
        {services.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No services found. Add your first service to get started.
          </div>
        )}
      </div>
    </div>
  );
}
