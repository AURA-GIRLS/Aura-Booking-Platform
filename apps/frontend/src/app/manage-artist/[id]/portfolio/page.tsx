"use client";

import { useParams } from "next/navigation";
import PortfolioManagement from "@/components/portfolio/PortfolioManagement";

export default function PortfolioPage() {
  const params = useParams();
  const muaId = params.id as string;

  return <PortfolioManagement />;
}
