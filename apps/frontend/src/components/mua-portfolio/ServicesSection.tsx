import { Camera, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../lib/ui/card"
import { Button } from "../lib/ui/button"
import { Badge } from "../lib/ui/badge"
import { services } from "./data"
import { ServiceDetail } from "@/types/artist.dto"
import { useAuthCheck } from "../../utils/auth"
import { useTranslate } from "@/i18n/hooks/useTranslate"

export default function ServicesSection({services,handleBook}:Readonly<{services: ServiceDetail[], handleBook?: (serviceId?: string) => void}>) {
  const { checkAuthAndExecute } = useAuthCheck();
  const { t, loading: i18nLoading } = useTranslate('portfolio');

  function formatPrice(price?: number) {
    return typeof price === "number" ? `${price.toLocaleString("vi-VN")} VND` : "Contact";
  }

  function formatDuration(duration?: number) {
    if (typeof duration !== "number") return "Contact";

    const hours = Math.floor(duration / 60); // số giờ
    const minutes = duration % 60;           // số phút còn lại

    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  }

  const handleBookService = (serviceId?: string) => {
    checkAuthAndExecute(() => {
      if (handleBook) {
        handleBook(serviceId);
      }
    });
  };

  if (i18nLoading) {
    return (
      <section id="services" className="py-16 bg-white min-h-[45rem]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mx-auto mb-4"></div>
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-2 border-gray-200 rounded-lg p-6">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="h-3 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

    return (
    <section id="services" className="py-16 bg-white min-h-[45rem]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">{t('services.title')}</h2>
            <p className="text-gray-600 text-lg">{t('services.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card
                key={index}
                className={`relative border-2 border-gray-200 hover:shadow-lg transition-shadow`}
                // className={`relative border-2 ${service.popular ? "border-rose-300 bg-rose-50" : "border-gray-200"} hover:shadow-lg transition-shadow`}
              >
                {/* {service.popular && ( */}
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-rose-500 text-white">{t('services.mostPopular')}</Badge>
                  </div>
                {/* )} */}
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-lg flex items-center justify-center">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                    <CardTitle className="text-black">{service.name}</CardTitle>
                  </div>
                  <p className="text-gray-600">{service.description}</p>
                </CardHeader>
                <CardContent>
                  {/* <ul className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-rose-500" />
                        {feature}
                      </li>
                    ))}
                  </ul> */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-2xl font-bold text-black">{formatPrice(service.price)}</span>
                      <span className="text-gray-500 text-sm ml-1">{formatDuration(service.duration)}</span>
                    </div>
                    <Button 
                    onClick={() => handleBookService(service._id)}
                    size="sm" className="bg-rose-500 hover:bg-rose-600 text-white">
                      {t('services.bookNow')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
  )
}
