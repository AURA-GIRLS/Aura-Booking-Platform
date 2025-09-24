"use client";

import { useEffect, useState } from 'react';
import { PlusCircle } from 'lucide-react';
import ServiceTable from './ServiceTable';
import ServiceFormModal from './ServiceFormModal';
import type { MuaService } from '@/services/dashboard'; 
import { api } from '@/config/api';

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
      try {
        // GET /api/services/mua/:muaId
        const res = await api.get(`/services/mua/${muaId}`);
        const data = res.data?.data || [];
        // Map backend ServicePackage -> UI MuaService
        const mapped: MuaService[] = data.map((s: any) => ({
          id: s._id,
          name: s.name,
          category: s.category,
          // duration is number (minutes) in DB; keep UI as "90 minutes"
          duration: typeof s.duration === 'number' ? `${s.duration} minutes` : String(s.duration || ''),
          price: String(s.price ?? ''),
          // isAvailable in DB -> isActive in UI
          isActive: Boolean(s.isAvailable ?? true),
        }));
        setServices(mapped);
      } catch (err) {
        console.error('Failed to fetch services', err);
      } finally {
        setLoading(false);
      }
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

  const toBackendPayload = (svc: MuaService) => {
    // Convert UI fields -> backend schema
    const durationNumber = (() => {
      if (typeof svc.duration === 'number') return svc.duration;
      // extract first integer from string like "90 minutes"
      const match = String(svc.duration).match(/\d+/);
      return match ? parseInt(match[0], 10) : undefined;
    })();
    const priceNumber = typeof svc.price === 'string' ? parseInt(svc.price.toString().replace(/[^\d]/g, ''), 10) : Number(svc.price);

    return {
      name: svc.name,
      category: svc.category,
      duration: durationNumber,
      price: priceNumber,
      isAvailable: Boolean(svc.isActive),
    };
  };

  const handleSaveService = async (serviceToSave: MuaService) => {
    try {
      if (editingService) {
        // Update existing service
        const payload = toBackendPayload(serviceToSave);
        const res = await api.put(`/services/${editingService.id}`, payload);
        const updated = res.data?.data;
        // Map back to UI and update state
        setServices((prev) => prev.map((s) =>
          s.id === editingService.id
            ? {
                id: updated?._id || editingService.id,
                name: updated?.name ?? serviceToSave.name,
                category: updated?.category ?? serviceToSave.category,
                duration: typeof updated?.duration === 'number' ? `${updated.duration} minutes` : serviceToSave.duration,
                price: String(updated?.price ?? serviceToSave.price),
                isActive: Boolean(updated?.isAvailable ?? serviceToSave.isActive),
              }
            : s
        ));
      } else {
        // Create new service
        const payload = toBackendPayload(serviceToSave);
        const res = await api.post(`/services/mua/${muaId}`, payload);
        const created = res.data?.data;
        // Append to list
        const newService: MuaService = {
          id: created?._id || `tmp-${Date.now()}`,
          name: created?.name ?? serviceToSave.name,
          category: created?.category ?? serviceToSave.category,
          duration: typeof created?.duration === 'number' ? `${created.duration} minutes` : serviceToSave.duration,
          price: String(created?.price ?? serviceToSave.price),
          isActive: Boolean(created?.isAvailable ?? serviceToSave.isActive),
        };
        setServices((prev) => [...prev, newService]);
      }
    } catch (err) {
      console.error('Failed to save service', err);
      alert('Failed to save service. Please try again.');
    } finally {
      handleCloseModal();
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await api.delete(`/services/${serviceId}`);
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
    } catch (err) {
      console.error('Failed to delete service', err);
      alert('Failed to delete service. Please try again.');
    }
  };

  const handleToggleStatus = async (serviceToToggle: MuaService) => {
    try {
      const nextActive = !serviceToToggle.isActive;
      // Update only isAvailable via PUT
      await api.put(`/services/${serviceToToggle.id}`, { isAvailable: nextActive });
      setServices((prev) => prev.map((s) => (s.id === serviceToToggle.id ? { ...s, isActive: nextActive } : s)));
    } catch (err) {
      console.error('Failed to toggle service status', err);
      alert('Failed to update service status. Please try again.');
    }
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