"use client";

import { useEffect, useState } from 'react';
import { PlusCircle } from 'lucide-react';
import ServiceTable from './ServiceTable';
import ServiceFormModal from './ServiceFormModal';
import type { MuaService } from '@/services/dashboard'; // Re-using this type for now

interface Props {
  muaId: string;
}

export default function ManageServices({ muaId }: Props) {
  const [services, setServices] = useState<MuaService[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<MuaService | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      // TODO: Replace with actual service call
      // const response = await servicesService.getServicesByMua(muaId);
      // if (response.success) {
      //   setServices(response.data);
      // }
      // Mock data for now:
      const mockServices: MuaService[] = [
        { id: '1', name: 'Bridal Makeup', category: 'BRIDAL', duration: '120 minutes', price: '3000000', isActive: true },
        { id: '2', name: 'Party Makeup', category: 'PARTY', duration: '60 minutes', price: '1500000', isActive: true },
        { id: '3', name: 'Photoshoot Makeup', category: 'PHOTOSHOOT', duration: '90 minutes', price: '2000000', isActive: false },
      ];
      setServices(mockServices);
      setLoading(false);
    };
    fetchServices();
  }, [muaId]);

  const handleOpenModal = (service: MuaService | null = null) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleSaveService = (serviceToSave: MuaService) => {
    // TODO: Add create/update logic with API call
    if (editingService) {
      // Update existing service in the UI
      setServices(services.map(s => s.id === editingService.id ? { ...s, ...serviceToSave } : s));
      console.log('Updating service:', { ...editingService, ...serviceToSave });
    } else {
      // Add new service in the UI (with a temporary ID)
      const newService = { ...serviceToSave, id: `new-${Date.now()}` };
      setServices([...services, newService]);
      console.log('Creating new service:', newService);
    }
    handleCloseModal();
  };

  const handleDeleteService = (serviceId: string) => {
    // TODO: Add delete logic with API call
    if (window.confirm('Are you sure you want to delete this service?')) {
      setServices(services.filter(s => s.id !== serviceId));
      console.log('Deleting service:', serviceId);
    }
  };

  const handleToggleStatus = (serviceToToggle: MuaService) => {
    // TODO: Add status toggle logic with API call
    setServices(services.map(s => s.id === serviceToToggle.id ? { ...s, isActive: !s.isActive } : s));
    console.log('Toggling status for service:', serviceToToggle.id);
  };


  if (loading) {
    return <div className="text-center py-10">Loading services...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Your Services</h1>
          <p className="text-sm text-gray-600 mt-1">Add, edit, or remove the services you offer to clients.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors shadow-sm"
        >
          <PlusCircle size={18} />
          Add New Service
        </button>
      </div>

      <ServiceTable
        services={services}
        onEdit={handleOpenModal}
        onDelete={handleDeleteService}
        onToggleStatus={handleToggleStatus}
      />

      {isModalOpen && (
        <ServiceFormModal
          service={editingService}
          onClose={handleCloseModal}
          onSave={handleSaveService}
        />
      )}
    </div>
  );
}