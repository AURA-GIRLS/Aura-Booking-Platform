"use client";

import MUADashboard from "@/components/manage-artist/dashboard/MUADashboard";

export default function DashboardPage({ params }: { params: { id: string } }) {
  return <MUADashboard muaId={params.id} />;
}