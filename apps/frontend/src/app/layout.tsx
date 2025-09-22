import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "../styles/globals.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next"
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AURA – Booking Make Up Online",
  description: "Face it, You are Art!",icons: {
    icon: [
      { url: "/images/LOGO_icon.png", type: "image/png" }, // favicon dạng png
    ],
    apple: "/images/LOGO_icon.png", // icon khi add to homescreen trên iOS
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">  
    <head>
        {/* Load Google Identity Services SDK */}
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="beforeInteractive"
        />
      </head>
      <body className={poppins.className}>{children}</body>
    </html>
  );
}
