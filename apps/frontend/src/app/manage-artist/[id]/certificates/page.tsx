"use client";

import { useParams } from "next/navigation";
import ManageCertificates from "@/components/manage-artist/certificate/ManageCertificates";

export default function CertificatesPage() {
  const params = useParams();
  const muaId = params.id as string;

  return <ManageCertificates />;
}