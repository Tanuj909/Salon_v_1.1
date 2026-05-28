"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useUserLocation } from "@/features/salons/hooks/useUserLocation";
import SalonStaff from "./SalonStaff";
import SalonServices from "./SalonServices";
import BookAppointmentModal from "./BookAppointmentModal";
import SalonReviews from "./SalonReviews";
import HeroSection from "./HeroSection";
import AboutSection from "./AboutSection";
import BusinessTimings from "./BusinessTimings";

// ─── Custom Hooks ────────────────────────────────────────────────────────────

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.05, rootMargin: "50px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({ children, delay = 0, className = "" }) {
  const { ref, visible } = useReveal();
  const safeDelay = Math.min(delay, 300);
  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} ${className}`}
      style={{ transitionDelay: `${safeDelay}ms` }}
    >
      {children}
    </div>
  );
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function SalonDetailsPage({ salon, staff, reviews, timings, id }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { location } = useUserLocation();
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [preSelectedService, setPreSelectedService] = useState(null);
  const [preSelectedStaff, setPreSelectedStaff] = useState(null);
  const today = DAY_NAMES[new Date().getDay()];

  const handleBookService = (service) => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    setPreSelectedService(service);
    setIsBookingOpen(true);
  };
  
  const handleBookStaff = (staff) => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    setPreSelectedStaff(staff);
    setIsBookingOpen(true);
  };

  const handleBookButtonClick = () => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
    setPreSelectedService(null);
    setPreSelectedStaff(null);
  };

  if (!salon) {
    return (
      <div className="min-h-screen about-section-bg flex flex-col items-center justify-center gap-4 font-[Jost,sans-serif]">
        <p className="salon-card-text text-lg">Salon not found.</p>
        <Link href="/salons" className="icon-secondary underline text-sm">
          ← Back to all salons
        </Link>
      </div>
    );
  }

  // Create a combined object for UI compatibility
  const salonImg = salon.bannerImageUrl || (salon.imageUrls && salon.imageUrls.length > 0 ? salon.imageUrls[0] : null);
  const locationText = [salon.address, salon.city, salon.state, salon.postalCode, salon.country]
    .filter(Boolean)
    .filter(str => !str.includes("Coordinates:")) // Filter out placeholder coordinates string if full details exist
    .join(", ") || salon.address;

  return (
    <div className="min-h-screen font-['Manrope',sans-serif]">
      {/* ═══════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════ */}
      <HeroSection
        salonImg={salonImg}
        salon={salon}
        handleBookButtonClick={handleBookButtonClick}
      />

      {/* ═══════════════════════════════════════════
          ABOUT SECTION
      ═══════════════════════════════════════════ */}
      <AboutSection description={salon.description} images={salon.imageUrls} />

      {/* ═══════════════════════════════════════════
          SERVICES SECTION (PAGINATED API)
      ═══════════════════════════════════════════ */}
      <SalonServices salon={salon} onBookService={handleBookService} />

      {/* ═══════════════════════════════════════════
          SALON STAFF SECTION
      ═══════════════════════════════════════════ */}
      <SalonStaff staff={staff} onBookStaff={handleBookStaff} />



      {/* ═══════════════════════════════════════════
          LOCATION & TIMINGS SECTION (SIDE BY SIDE)
      ═══════════════════════════════════════════ */}
      <section className="py-8 sm:py-12" id="visit">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-stretch mb-12 sm:mb-16">
            {/* Left: Business Timings */}
            <Reveal className="h-full">
              <div className="h-full flex flex-col">
                <BusinessTimings timings={timings} compact={true} />
              </div>
            </Reveal>

            {/* Right: Map Area + Address Row */}
            <Reveal delay={200} className="h-full">
              <div className="flex flex-col gap-6 h-full">
                {salon.latitude && salon.longitude ? (
                  <div className="flex-1 rounded-[40px] overflow-hidden shadow-2xl border-4 border-white relative group min-h-[350px]">
                    <iframe
                      src={`https://maps.google.com/maps?q=${salon.latitude},${salon.longitude}&z=15&output=embed`}
                      className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-1000"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                    <div className="absolute top-0 right-0 w-32 h-32 rec-badge-top-rated-bg -translate-y-1/2 translate-x-1/2 rotate-45 pointer-events-none group-hover:scale-110 transition-transform duration-500 opacity-20" />
                  </div>
                ) : <div className="flex-1 rounded-[40px] bg-gray-100 flex items-center justify-center min-h-[350px]"><span className="rec-section-subtext font-bold tracking-widest uppercase text-xs">Map Unavailable</span></div>}

                {/* Address Row Below Map */}
                <div className="bg-[#1C3152]/5 border rec-card-border rounded-3xl sm:rounded-[32px] p-6 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shrink-0 mt-auto">
                  <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl rec-badge-top-rated-bg flex items-center justify-center flex-shrink-0 shadow-lg">
                      <svg width={18} height={18} className="sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}>
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="rec-section-heading-accent text-[10px] uppercase tracking-[0.4em] font-bold mb-1.5">The Location</h4>
                      <p className="rec-section-heading text-sm sm:text-base font-bold leading-relaxed line-clamp-2 font-[Cormorant_Garamond,serif] tracking-wide">{locationText}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start sm:items-end sm:border-l rec-card-border sm:pl-8 w-full sm:w-auto">
                    <h4 className="rec-section-heading-accent text-[9px] sm:text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.4em] font-bold mb-1.5">Connect</h4>
                    <p className="rec-section-heading text-sm sm:text-base font-bold mb-4">{salon.phoneNumber}</p>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1${location?.latitude && location?.longitude ? `&origin=${location.latitude},${location.longitude}` : ''}&destination=${salon.latitude},${salon.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rec-btn-primary px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shadow-md border-0 cursor-pointer text-center w-full sm:w-auto"
                    >
                      Navigate
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

              {/* ═══════════════════════════════════════════
          REVIEWS SECTION
      ═══════════════════════════════════════════ */}
      <SalonReviews reviews={reviews} />
      </section>



      {/* Booking Modal */}
      <BookAppointmentModal
        isOpen={isBookingOpen}
        onClose={handleCloseBooking}
        salonId={id}
        salonName={salon.name}
        preSelectedService={preSelectedService}
        preSelectedStaff={preSelectedStaff}
      />
    </div>
  );
}
