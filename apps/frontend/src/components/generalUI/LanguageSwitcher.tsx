"use client";

import { motion } from "framer-motion";
import { useAllTranslations } from "../../i18n/hooks/useTranslate";

const locales = [
  { code: "vn", name: "VN", locale: "vi" },
  { code: "en", name: "EN", locale: "en" }
] as const;

type LocaleCode = typeof locales[number]["code"];

export default function LanguageSwitcher() {
  const { locale, setLocale } = useAllTranslations();
  const activeIndex = locale === "vi" ? 0 : 1;

  const handleLanguageChange = (index: number) => {
    setLocale(locales[index].locale);
  };

  return (
    <div className="relative">
      <div 
        className="relative inline-flex items-center justify-between w-[120px] h-9 rounded-full p-0.5 
                   bg-gradient-to-r from-pink-50 to-white/80 backdrop-blur-sm
                   border border-pink-100 shadow-sm overflow-hidden
                   hover:shadow transition-all duration-300"
        role="tablist"
        aria-label="Language switch"
      >
        <motion.div
          className="absolute top-0.5 left-0.5 h-8 w-[58px] rounded-full 
                     bg-gradient-to-br from-pink-500 to-rose-500
                     shadow-md shadow-pink-200"
          initial={false}
          animate={{ x: activeIndex * 60 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />

        {locales.map((item, index) => (
          <button
            key={item.code}
            role="tab"
            aria-selected={index === activeIndex}
            onClick={() => handleLanguageChange(index)}
            className={`relative z-10 w-[58px] h-8 rounded-full
                       text-xs font-medium flex items-center justify-center
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300
                       transition-all duration-300 ${
                         index === activeIndex 
                           ? "text-white font-semibold" 
                           : "text-pink-500/80 hover:text-pink-600 bg-white/60"
                       }`}
          >
            <span className="relative z-10">{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}