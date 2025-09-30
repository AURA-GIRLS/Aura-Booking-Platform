import { Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import type { MuaService } from '@/services/dashboard';

interface ServiceTableProps {
  services: MuaService[];
  onEdit: (service: MuaService) => void;
  onDelete: (serviceId: string) => void;
  onToggleStatus: (service: MuaService) => void;
}

export default function ServiceTable({ services, onEdit, onDelete, onToggleStatus }: ServiceTableProps) {
  const formatPrice = (price: string | number) => {
    const numericPrice = typeof price === 'string' ? parseFloat(price.replace(/[^\d]/g, '')) : price;
    if (isNaN(numericPrice)) return price;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(numericPrice);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-700 table-fixed">
          <thead className="bg-gray-50 text-xs text-gray-700 uppercase tracking-wider">
            <tr>
              <th scope="col" className="px-6 py-3 w-[10%]">Image</th>
              <th scope="col" className="px-6 py-3 w-[28%]">Service Name</th>
              <th scope="col" className="px-6 py-3 w-[16%]">Category</th>
              <th scope="col" className="px-6 py-3 w-[16%]">Duration</th>
              <th scope="col" className="px-6 py-3 w-[16%]">Price</th>
              <th scope="col" className="px-6 py-3 w-[12%]">Status</th>
              <th scope="col" className="px-6 py-3 text-center w-[12%]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4">
                  {service.imageUrl ? (
                    <img
                      src={service.imageUrl}
                      alt={service.name}
                      className="h-12 w-16 object-cover rounded-md border border-gray-200"
                    />
                  ) : (
                    <div className="h-12 w-16 bg-gray-100 rounded-md border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400">
                      No image
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
                  {service.name}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-medium text-purple-800 bg-purple-100 rounded-full">
                    {service.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis">{service.duration}</td>
                <td className="px-6 py-4 font-semibold text-pink-600 whitespace-nowrap">{formatPrice(service.price)}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center justify-center w-24 px-2.5 py-0.5 rounded-full text-xs font-medium ${service.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                    {service.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => onToggleStatus(service)}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                      title={service.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {service.isActive ? <ToggleRight size={20} className="text-green-500" /> : <ToggleLeft size={20} />}
                    </button>
                    <button 
                      onClick={() => onEdit(service)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="Edit Service"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => onDelete(service.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Delete Service"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {services.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="font-semibold">No services found.</p>
          <p className="mt-1 text-sm">Click 'Add New Service' to get started.</p>
        </div>
      )}
    </div>
  );
}
