"use client";

import { useState } from "react";
import Image from "next/image";
import { Award, Calendar, Building2, Edit, Trash2, Clock } from "lucide-react";
import type { Certificate } from "@/types/certificate";
import DeleteConfirmModal from '@/components/portfolio/DeleteConfirmModal';
interface CertificateCardProps {
  certificate: Certificate;
  onEdit: (certificate: Certificate) => void;
  onDelete: (id: string) => void;
}

export default function CertificateCard({
  certificate,
  onEdit,
  onDelete,
}: CertificateCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const certificateImage = certificate.image?.url || "/placeholder-certificate.jpg";

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Check if expired
  const isExpired = certificate.expireDate
    ? new Date(certificate.expireDate) < new Date()
    : false;

  // Handle delete
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(certificate._id);
    } catch (error) {
      console.error("Delete failed:", error);
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <div
        className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Certificate Image */}
        <div className="relative aspect-[4/3] bg-gray-100">
          <Image
            src={certificateImage}
            alt={certificate.title}
            fill
            className="object-contain"
          />

          {/* Expired Badge */}
          {isExpired && (
            <div className="absolute top-3 left-3">
              <span className="bg-red-500 text-white text-xs font-medium px-3 py-1 rounded">
                Expired
              </span>
            </div>
          )}

          {/* Actions - Show on hover */}
          {showActions && (
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                onClick={() => onEdit(certificate)}
                className="bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-colors"
                title="Edit"
              >
                <Edit className="w-4 h-4 text-gray-700" />
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                disabled={isDeleting}
                className="bg-white p-2 rounded-full shadow-md hover:bg-red-50 transition-colors disabled:opacity-50"
                title="Delete"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2 flex items-start gap-2">
            <Award className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            {certificate.title}
          </h3>

          {/* Issuer */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <Building2 className="w-4 h-4" />
            <span className="line-clamp-1">{certificate.issuer}</span>
          </div>

          {/* Description */}
          {certificate.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {certificate.description}
            </p>
          )}

          {/* Dates */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Issued: {formatDate(certificate.issueDate)}</span>
            </div>
            {certificate.expireDate && (
              <div className={`flex items-center gap-2 ${isExpired ? "text-red-600" : "text-gray-600"}`}>
                <Clock className="w-4 h-4" />
                <span>Expires: {formatDate(certificate.expireDate)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title={certificate.title}
        isDeleting={isDeleting}
      />
    </>
  );
}