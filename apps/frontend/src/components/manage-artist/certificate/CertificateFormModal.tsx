"use client";

import { useState } from "react";
import { X, Upload, Loader2, Calendar as CalendarIcon } from "lucide-react";
import type {
  Certificate,
  CreateCertificateInput,
  UpdateCertificateInput,
  CertificateImage,
} from "@/types/certificate";
import {
  createCertificate,
  updateCertificate,
  uploadCertificateImage,
} from "@/lib/api/certificate";

interface CertificateFormModalProps {
  certificate: Certificate | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CertificateFormModal({
  certificate,
  onClose,
  onSuccess,
}: CertificateFormModalProps) {
  const isEdit = !!certificate;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    title: string;
    issuer: string;
    description: string;
    issueDate: string;
    expireDate: string;
    imageFile: File | null;
    imagePreview: string;
  }>(() => ({
    title: certificate?.title || "",
    issuer: certificate?.issuer || "",
    description: certificate?.description || "",
    issueDate: certificate?.issueDate
      ? new Date(certificate.issueDate).toISOString().split("T")[0]
      : "",
    expireDate: certificate?.expireDate
      ? new Date(certificate.expireDate).toISOString().split("T")[0]
      : "",
    imageFile: null,
    imagePreview: certificate?.image?.url || "",
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Please enter certificate title");
      return;
    }

    if (!formData.issuer.trim()) {
      alert("Please enter issuer organization");
      return;
    }

    if (!formData.issueDate) {
      alert("Please select issue date");
      return;
    }

    // Need either a newly selected file or an existing image in edit mode
    const hasExistingImage = !!certificate?.image;
    if (!formData.imageFile && !hasExistingImage) {
      alert("Please upload a certificate image");
      return;
    }

    // Validate expireDate is after issueDate
    if (formData.expireDate && formData.issueDate) {
      const issueDate = new Date(formData.issueDate);
      const expireDate = new Date(formData.expireDate);
      if (expireDate <= issueDate) {
        alert("Expiration date must be after issue date");
        return;
      }
    }

    setLoading(true);
    try {
      let uploadedImage: CertificateImage | null = null;
      if (formData.imageFile) {
        uploadedImage = await uploadCertificateImage(formData.imageFile);
      }

      if (isEdit && certificate) {
        const updateData: UpdateCertificateInput = {
          title: formData.title,
          issuer: formData.issuer,
          description: formData.description || undefined,
          issueDate: formData.issueDate,
          expireDate: formData.expireDate || undefined,
          image: uploadedImage || certificate.image,
        };
        await updateCertificate(certificate._id, updateData);
      } else {
        const createData: CreateCertificateInput = {
          title: formData.title,
          issuer: formData.issuer,
          description: formData.description || undefined,
          issueDate: formData.issueDate,
          expireDate: formData.expireDate || undefined,
          image: uploadedImage!,
        };
        if (!createData.image) {
          throw new Error("Image upload failed or no image provided");
        }
        await createCertificate(createData);
      }

      onSuccess();
    } catch (error: any) {
      console.error("Failed to save certificate:", error);
      alert(error?.message || "Failed to save certificate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEdit ? "Edit Certificate" : "Add New Certificate"}
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Certificate Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Advanced Bridal Makeup Certification"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              required
            />
          </div>

          {/* Issuer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issuing Organization <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.issuer}
              onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
              placeholder="e.g., International Makeup Academy"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the certification..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Issue Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issue Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                max={new Date().toISOString().split("T")[0]}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Expire Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiration Date <span className="text-gray-500 text-xs">(Optional)</span>
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={formData.expireDate}
                onChange={(e) => setFormData({ ...formData, expireDate: e.target.value })}
                min={formData.issueDate || undefined}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Leave blank if the certificate doesn't expire
            </p>
          </div>

          {/* Certificate Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Certificate Image <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <Upload className="w-4 h-4 mr-2" />
                <span>Choose image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    const preview = file
                      ? URL.createObjectURL(file)
                      : formData.imagePreview;
                    setFormData({ ...formData, imageFile: file, imagePreview: preview });
                  }}
                />
              </label>
              {formData.imageFile && (
                <span className="text-sm text-gray-600">{formData.imageFile.name}</span>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Upload a clear image of your certificate (PNG/JPEG/WebP, max 5MB)
            </p>

            {/* Image Preview */}
            {formData.imagePreview && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={formData.imagePreview}
                    alt="Certificate preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? "Saving..." : isEdit ? "Update Certificate" : "Add Certificate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}