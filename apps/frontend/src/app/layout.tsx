import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "../styles/globals.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AURA – Booking Make Up Online",
  description: "Face it, You are Art!",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={poppins.className}>{children}</body>
    </html>
  );
}
