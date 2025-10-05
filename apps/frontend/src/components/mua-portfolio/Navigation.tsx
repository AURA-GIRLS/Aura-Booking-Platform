"use client"
import { useState } from "react"
import { Button } from "../lib/ui/button"
import { Calendar } from "lucide-react"
import { useAuthCheck } from "../../utils/auth"

const tabs = [
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "portfolio", label: "Portfolio" },
  { id: "reviews", label: "Reviews" },
  { id: "contact", label: "Contact" },
]

export default function Navigation({ handleBook }: { handleBook: (serviceId?: string) => void }) {
  const [selectedTab, setSelectedTab] = useState<string>("about")
  const { checkAuthAndExecute } = useAuthCheck();

  const handleBookNow = () => {
    checkAuthAndExecute(() => {
      handleBook();
    });
  };

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
          Book Now
        </Button>
      </div>
    </section>
  )
}
