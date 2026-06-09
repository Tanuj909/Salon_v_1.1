import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "../styles/globals.css";
import { AuthProvider } from "@/features/auth/providers/AuthProvider";
import { LocationProvider } from "@/features/salons/context/LocationContext";
import { ToastProvider } from "@/context/ToastContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { LanguageProvider } from "@/context/LanguageContext";

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata = {
  title: {
    default: "Fast Booking Service",
    template: "%s | Fast Booking Service",
  },
  description: "Salon and Wellness Booking Platform",
  icons: {
    icon: "/logo/fastbooking.png", // Path to your logo in the public folder
    shortcut: "/logo/fastbooking.png",
    apple: "/logo/fastbooking.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="text-earthy-brown">
        <LanguageProvider>
          <ToastProvider>
            <LocationProvider>
              <AuthProvider>
                <Navbar />
                {children}
                <ToastContainer position="top-right" autoClose={5000} style={{ zIndex: 100000 }} />
                <Footer />
              </AuthProvider>
            </LocationProvider>
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}


