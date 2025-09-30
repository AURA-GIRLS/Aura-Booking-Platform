'use client';
import { useState, useEffect, useCallback } from 'react';
import { CommunityService } from '@/services/community';
import { ServiceResponseDTO } from '@/types/service.dtos';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/lib/ui/command';
import { Button } from '@/components/lib/ui/button';
import { Badge } from '@/components/lib/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/lib/ui/avatar';
import { Check, Search, X } from 'lucide-react';

interface ServiceSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedServices: ServiceResponseDTO[];
  onServicesChange: (services: ServiceResponseDTO[]) => void;
}

export default function ServiceSearchDialog({
  open,
  onOpenChange,
  selectedServices,
  onServicesChange,
}: ServiceSearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState<ServiceResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const searchServices = useCallback(async (query: string, pageNum: number = 1) => {
    try {
      setLoading(true);
      const res = await CommunityService.searchServices({
        q: query || undefined,
        page: pageNum,
        limit: 20,
      });

      if (res.success && res.data) {
        if (pageNum === 1) {
          setServices(res.data.items);
        } else {
          setServices(prev => [...prev, ...res.data?.items||[]]);
        }
        setHasMore(res.data.page < res.data.pages);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Failed to search services:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Search when dialog opens or query changes
  useEffect(() => {
    if (open) {
      searchServices(searchQuery, 1);
    }
  }, [open, searchQuery, searchServices]);

  const isSelected = useCallback(
    (serviceId: string) => selectedServices.some(s => s._id === serviceId),
    [selectedServices]
  );

  const toggleService = useCallback(
    (service: ServiceResponseDTO) => {
      if (isSelected(service._id)) {
        onServicesChange(selectedServices.filter(s => s._id !== service._id));
      } else {
        onServicesChange([...selectedServices, service]);
      }
    },
    [selectedServices, onServicesChange, isSelected]
  );

  const removeService = useCallback(
    (serviceId: string) => {
      onServicesChange(selectedServices.filter(s => s._id !== serviceId));
    },
    [selectedServices, onServicesChange]
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} className="max-w-4xl w-[85vw] bg-white rounded-lg shadow-lg">
      <div className="p-4 w-full">
        <div className="flex items-center space-x-2 mb-4 w-[30vw]">
          <CommandInput
            placeholder="Search services or MUA name..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="border-none focus:ring-0"
          />
        </div>

        {/* Selected Services */}
        {selectedServices.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Selected ({selectedServices.length}):
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedServices.map(service => (
                <Badge
                  key={service._id}
                  variant="secondary"
                  className="flex items-center space-x-1 pr-1"
                >
                  <span className="text-xs">{service.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeService(service._id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        <CommandList className="max-h-96 w-full overflow-y-auto">
          <CommandEmpty>
            {loading ? 'Searching...' : 'No services found.'}
          </CommandEmpty>

          {services.length > 0 && (
            <CommandGroup>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {services.map(service => (
                  <CommandItem
                    key={service._id}
                    value={service._id}
                    onSelect={() => toggleService(service)}
                    className="bg-rose-50 rounded-lg p-3 border border-rose-200 cursor-pointer hover:bg-rose-100 transition-colors w-full"
                  >
                    <div className="flex gap-3 items-start relative w-full">
                      {/* Service Image */}
                      <div className="flex-shrink-0">
                        {service.images && service.images.length > 0 ? (
                          <img 
                            src={service.images[0]} 
                            alt={service.name}
                            className="w-14 h-14 rounded-lg object-cover border border-rose-200"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRkVGMkY0Ii8+CjxwYXRoIGQ9Ik0yMCAyMEg0NFY0NEgyMFYyMFoiIHN0cm9rZT0iI0Y0M0Y1RSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHA+dGggZD0iTTI4IDI4TDM2IDM2TDI4IDI4WiIgc3Ryb2tlPSIjRjQzRjVFIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K';
                            }}
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-rose-100 to-pink-100 border border-rose-200 flex items-center justify-center">
                            <span className="text-rose-400 text-lg">💄</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Selection indicator */}
                      {isSelected(service._id) && (
                        <div className="absolute -top-1 -right-1">
                          <Check className="w-5 h-5 text-green-600 bg-white rounded-full border-2 border-green-600 p-0.5" />
                        </div>
                      )}
                      
                      {/* Service Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="font-medium text-gray-900 text-sm truncate">{service.name}</p>
                            
                            {/* MUA Info */}
                            <div className="flex items-center space-x-1 mt-1">
                              <Avatar className="w-4 h-4">
                                <AvatarImage src={service.muaAvatarUrl} />
                                <AvatarFallback className="text-xs">
                                  {getInitials(service.muaName)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-gray-600 truncate">by {service.muaName}</span>
                            </div>
                            
                            {service.description && (
                              <p className="text-xs text-gray-600 line-clamp-2 mt-1">{service.description}</p>
                            )}
                            
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex-1">
                                <p className="text-sm text-rose-600 font-medium">
                                  {formatPrice(service.price)}
                                </p>
                                {service.duration && (
                                  <p className="text-xs text-gray-500">
                                    {service.duration} mins
                                  </p>
                                )}
                              </div>
                              {service.category && (
                                <Badge
                                  variant="secondary"
                                  className="bg-white/90 text-gray-700 text-xs ml-2 flex-shrink-0"
                                >
                                  {service.category}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </div>
            </CommandGroup>
          )}

          {hasMore && !loading && services.length > 0 && (
            <div className="p-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => searchServices(searchQuery, page + 1)}
              >
                Load more
              </Button>
            </div>
          )}
        </CommandList>
      </div>
    </CommandDialog>
  );
}