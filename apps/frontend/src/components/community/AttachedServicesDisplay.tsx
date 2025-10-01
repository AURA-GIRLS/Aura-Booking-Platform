'use client';
import { useState } from 'react';
import { ServiceResponseDTO } from '@/types/service.dtos';
import { Button } from '@/components/lib/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/lib/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/lib/ui/avatar';
import { Badge } from '@/components/lib/ui/badge';
import { Briefcase, Clock, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AttachedServicesDisplayProps {
  services: ServiceResponseDTO[];
  className?: string;
}

export default function AttachedServicesDisplay({
  services,
  className = '',
}: AttachedServicesDisplayProps) {
  const [showModal, setShowModal] = useState(false);
    const router = useRouter();
  if (!services || services.length === 0) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase();
  };
const handleBookService = (artistId: string, serviceId: string) => {
    // Navigate to booking page with artist and service parameters
    router.push(`/user/booking/${artistId}/${serviceId}`);
  };
  return (
    <>
      {/* Services indicator */}
      <div className={`mt-3 ${className}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-rose-50 to-pink-50 border-rose-200 hover:from-rose-100 hover:to-pink-100"
        >
          <Briefcase className="w-4 h-4 text-rose-600" />
          <span className="text-rose-700 font-medium">
            {services.length} attached service{services.length > 1 ? 's' : ''}
          </span>
        </Button>
      </div>

      {/* Services Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-rose-600" />
              <span>Attached Services ({services.length})</span>
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
            {services.map(service => (
              <div key={service._id} className="bg-rose-50 rounded-lg p-3 border border-rose-200">
                <div className="flex gap-3 items-start">
                  {/* Service Image */}
                  <div className="flex-shrink-0">
                    {(service.images && service.images.length > 0) ? (
                      <img 
                        src={service.images[0]} 
                        alt={service.name}
                        className="w-16 h-16 rounded-lg object-cover border border-rose-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRkVGMkY0Ii8+CjxwYXRoIGQ9Ik0yMCAyMEg0NFY0NEgyMFYyMFoiIHN0cm9rZT0iI0Y0M0Y1RSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHA+dGggZD0iTTI4IDI4TDM2IDM2TDI4IDI4WiIgc3Ryb2tlPSIjRjQzRjVFIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K';
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-rose-100 to-pink-100 border border-rose-200 flex items-center justify-center">
                        <span className="text-rose-400 text-xl">💄</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Service Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{service.name}</p>
                        
                        {/* MUA Info */}
                        <div className="flex items-center space-x-2 mt-1">
                          <Avatar className="w-5 h-5">
                            <AvatarImage src={service.muaAvatarUrl} />
                            <AvatarFallback className="text-xs bg-rose-100 text-rose-600">
                              {getInitials(service.muaName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-gray-600 font-medium">by {service.muaName}</span>
                        </div>
                        
                        <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                          {service.description || 'Professional makeup service'}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div>
                            <p className="text-sm text-rose-600 font-medium">
                              {formatPrice(service.price)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {service.duration ? `${service.duration} mins` : '60 mins'}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                            handleBookService(service.muaId, service._id);
                            }}
                            className="px-3 py-1 bg-rose-500 text-white text-xs rounded-md hover:bg-rose-600 transition-colors flex-shrink-0"
                          >
                            Book
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={() => setShowModal(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}