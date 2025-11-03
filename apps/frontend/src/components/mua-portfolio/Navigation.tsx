"use client"
import { useState } from "react"
import { Button } from "../lib/ui/button"
import { Calendar } from "lucide-react"
import { useAuthCheck } from "../../utils/auth"
import { useTranslate } from "@/i18n/hooks/useTranslate"

export default function Navigation({ handleBook }: { handleBook: (serviceId?: string) => void }) {
  const [selectedTab, setSelectedTab] = useState<string>("about")
  const { checkAuthAndExecute } = useAuthCheck();
  const { t, loading: i18nLoading } = useTranslate('portfolio');

  const handleBookNow = () => {
    checkAuthAndExecute(() => {
      handleBook();
    });
  };

  if (i18nLoading) {
    return (
      <section className="sticky top-0 z-50 bg-white shadow-sm py-2">
        <div className="flex justify-center py-3">
          <div className="animate-pulse h-6 w-32 bg-gray-200 rounded"></div>
        </div>
      </section>
    );
  }

  const tabs = [
    { id: "about", label: t('navigation.about') },
    { id: "services", label: t('navigation.services') },
    { id: "portfolio", label: t('navigation.portfolio') },
    { id: "reviews", label: t('navigation.reviews') },
    { id: "contact", label: t('navigation.contact') },
  ]

  return (
    <section className="sticky top-0 z-50 bg-white shadow-sm py-2">
      <div className="flex justify-center py-3">
        <nav className="flex gap-8 text-sm">
          {tabs.map((tab) => (
            <a
              key={tab.id}
              href={`#${tab.id}`}
              onClick={() => setSelectedTab(tab.id)}
              className={`transition-colors ${
                selectedTab === tab.id
                  ? "text-rose-600 font-medium"
                  : "text-gray-600 hover:text-rose-600"
              }`}
            >
              {tab.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-50 hover:scale-105 transform transition-transform">
        <Button
          onClick={handleBookNow}
          className="bg-rose-500 hover:bg-rose-600 text-white shadow-lg rounded-full px-6"
        >
          <Calendar className="w-4 h-4 mr-2" />
          {t('navigation.bookNow')}
        </Button>
      </div>
    </section>
  )
}
