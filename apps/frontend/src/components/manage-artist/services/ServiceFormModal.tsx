import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { MuaService } from '@/services/dashboard';

// In a real app, this would come from a shared constants file
const SERVICE_CATEGORIES = ['BRIDAL', 'PARTY', 'PHOTOSHOOT', 'DAILY', 'GRADUATION', 'PROM', 'WEDDING_GUEST', 'SPECIAL_EVENT'];

interface ServiceFormModalProps {
  service: MuaService | null;
  onClose: () => void;
  onSave: (service: MuaService) => void;
}

export default function ServiceFormModal({ service, onClose, onSave }: ServiceFormModalProps) {
  const [formData, setFormData] = useState<Partial<MuaService>>({
    name: '',
    category: 'BRIDAL',
    duration: '',
    price: '',
    isActive: true,
    imageUrl: '',
  });

  useEffect(() => {
    if (service) {
      // When editing, populate form with existing service data
      setFormData(service);
    } else {
      // When adding, reset to default values
      setFormData({
        name: '',
        category: 'BRIDAL',
        duration: '',
        price: '',
        isActive: true,
        imageUrl: '',
      });
    }
  }, [service]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.duration) {
      // Simple validation
      alert('Please fill all required fields.');
      return;
    }
    onSave(formData as MuaService);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-center items-center p-4"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal panel */}
      <div 
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl"
      >
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {service ? 'Edit Service' : 'Add New Service'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 rounded-full p-1 transition-colors">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select name="category" id="category" value={formData.category} onChange={handleChange} className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm">
                  {SERVICE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">Duration (e.g., 90 minutes)</label>
                <input type="text" name="duration" id="duration" value={formData.duration} onChange={handleChange} className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm" required />
              </div>
            </div>

            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
              <input
                type="url"
                name="imageUrl"
                id="imageUrl"
                placeholder="https://..."
                value={formData.imageUrl || ''}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
              />
              {formData.imageUrl ? (
                <div className="mt-2">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="h-24 w-24 object-cover rounded-lg border border-gray-200"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              ) : null}
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price (VND)</label>
              <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm" placeholder="e.g., 1500000" required />
            </div>

            <div className="flex items-center pt-2">
              <input type="checkbox" name="isActive" id="isActive" checked={!!formData.isActive} onChange={handleChange} className="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500" />
              <label htmlFor="isActive" className="ml-3 block text-sm font-medium text-gray-900">Service is currently active</label>
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-pink-600 border border-transparent rounded-lg shadow-sm hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all">
              {service ? 'Save Changes' : 'Create Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
