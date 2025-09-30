import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { MuaService } from '@/services/dashboard';
import { PlusCircle, Pencil } from 'lucide-react';
import { UploadService } from '@/services/upload';

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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (service) {
      setFormData(service);
    } else {
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
  
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, GIF)');
      (e.target as HTMLInputElement).value = '';
      return;
    }
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setUploadError('Image exceeds maximum size (5MB)');
      (e.target as HTMLInputElement).value = '';
      return;
    }
  
    try {
      setUploading(true);
      const res = await UploadService.uploadFile(file, {
        resourceType: 'image',
        folder: 'services',
      });
      const url = res?.data?.url;
      if (!url) throw new Error('Upload failed: No URL returned');
  
      setFormData(prev => ({ ...prev, imageUrl: url }));
    } catch (err: any) {
      console.error('Image upload failed', err);
      setUploadError(err?.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      if (e.target) (e.target as HTMLInputElement).value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.duration) {
      alert('Please fill all required fields.');
      return;
    }
    onSave(formData as MuaService);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {service ? 'Edit Service' : 'Add New Service'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 rounded-full p-1 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Service Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  id="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                >
                  {SERVICE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (e.g., 90 minutes)
                </label>
                <input
                  type="text"
                  name="duration"
                  id="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                  required
                />
              </div>
            </div>

            {/* Enhanced Image Upload Section */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Image
              </label>
              
              {/* URL Input */}
              <div className="flex gap-2">
                <input
                  type="url"
                  name="imageUrl"
                  id="imageUrl"
                  placeholder="Paste image URL here"
                  value={formData.imageUrl || ''}
                  onChange={handleChange}
                  className="flex-1 min-w-0 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-sm"
                />
                <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-r-lg">
                  Paste
                </span>
              </div>

              {/* Divider with "or" */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              {/* File Upload */}
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  id="service-image-file"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploading}
                />
                <label
                  htmlFor="service-image-file"
                  className={`flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                    uploading ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="text-center py-4">
                    <div className="flex justify-center mb-2">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-pink-600 hover:text-pink-500">Upload image</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                  </div>
                </label>
                {uploadError && (
                  <p className="mt-1 text-sm text-red-600">{uploadError}</p>
                )}
              </div>

              {/* Image Preview */}
              {formData.imageUrl && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
                  <div className="relative w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={formData.imageUrl}
                      alt="Service preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price (VND)
              </label>
              <input
                type="number"
                name="price"
                id="price"
                value={formData.price}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                placeholder="e.g., 1500000"
                required
              />
            </div>

            <div className="flex items-center pt-2">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={!!formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
              />
              <label htmlFor="isActive" className="ml-3 block text-sm font-medium text-gray-900">
                Service is currently active
              </label>
            </div>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-pink-600 border border-transparent rounded-lg shadow-sm hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={uploading}
            >
              {service ? 'Save Changes' : 'Create Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}