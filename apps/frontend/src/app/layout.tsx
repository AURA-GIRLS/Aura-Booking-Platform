import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
import Script from "next/script";
import I18nProviderWrapper from "@/components/providers/I18nProviderWrapper";

const inter = Inter({
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AURA – Booking Make Up Online",
  description: "Face it, You are Art!",
  icons: {
    icon: [
      { url: "/images/LOGO_icon.png", type: "image/png" }, // favicon dạng png
    ],
    apple: "/images/LOGO_icon.png", // icon khi add to homescreen trên iOS
  },
};

// Client component for Vercel analytics
function VercelAnalytics() {
  return (
    <>
      {process.env.NODE_ENV === 'production' && (
        <>
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-XXXXXXXXXX');
            `}
          </Script>
        </>
      )}
    </>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>  
      <head>
          {/* Load Google Identity Services SDK */}
          <Script
            src="https://accounts.google.com/gsi/client"
              strategy="beforeInteractive"
          />
        </head>
        <body className={`${inter.className} font-sans`}>
          <I18nProviderWrapper>
            {children} 
          </I18nProviderWrapper>
          <VercelAnalytics />
        </body>
      </html>
  );
}
