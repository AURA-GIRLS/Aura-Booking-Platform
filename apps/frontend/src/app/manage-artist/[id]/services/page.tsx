"use client";

import ManageServices from "@/components/manage-artist/services/ManageServices";
import { useParams } from 'next/navigation';

export default function ManageServicesPage() {
  const params = useParams();
  const muaId = params.id as string;

  if (!muaId) {
    return <div>Loading artist information...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <ManageServices muaId={muaId} />
      </div>
    </div>
  );
}
