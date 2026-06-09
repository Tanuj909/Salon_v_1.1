"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchNearbySalons } from "@/features/salons/services/salonService";
import dynamic from "next/dynamic";
import { useLanguage } from "@/context/LanguageContext";

const MapPickerModal = dynamic(
  () => import("@/features/salons/components/MapPickerModal"),
  { ssr: false }
);

// Badge classes from blue-gold-theme.css
const badgeClass = {
  "Top Rated": "rec-badge-top-rated-bg",
  "New": "rec-badge-new-bg",
  "Trending": "rec-badge-trending-bg",
};

const StarIcon = ({ filled }) => (
  <svg width={13} height={13} viewBox="0 0 20 20" fill={filled ? "#C49B66" : "#E2E8F0"}>
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

import { useUserLocation } from "@/features/salons/hooks/useUserLocation";

export default function RecomendedSallon() {
  const { t } = useLanguage();
  const [salons, setSalons] = useState([]);
  const [salonsLoading, setSalonsLoading] = useState(false);
  const { location, error: locationError, loading: locationLoading, isTimeout, saveManualLocation } = useUserLocation();
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  const fetchSalons = async (lat, lng) => {
    if (!lat || !lng) return;
    setSalonsLoading(true);
    try {
      const data = await fetchNearbySalons(lat, lng, 50);
      setSalons(data || []);
    } catch (error) {
      console.error("Failed to fetch recommended salons:", error);
    } finally {
      setSalonsLoading(false);
    }
  };

  useEffect(() => {
    if (location?.latitude && location?.longitude) {
      fetchSalons(location.latitude, location.longitude);
    } else {
      setSalons([]);
    }
  }, [location?.latitude, location?.longitude]);

  const handleRetryLocation = () => {
    window.location.reload();
  };

  const isLoading = locationLoading || salonsLoading;
  const isLocationError = !!locationError || isTimeout;

  // Loading state
  if (isLoading) {
    return (
      <section className="py-10">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          {/* SectionHeader removed */}
          <div className="h-px mb-10 rec-section-divider-line" />
          <div className="text-center py-12">
            <p className="rec-section-subtext">
              {locationLoading ? t('home.getting_location') : t('home.finding_salons')}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const recommendedSalons = salons.slice(0, 20);

  return (
    <section className="py-10">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12">

        {/* ── Section Header Removed as per user request ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-10 gap-4">
          <div className="max-w-[500px]">
            {/* Heading and subtext removed */}
          </div>

          {/* Actions - View All Salons Button removed */}
          <div className="flex items-center gap-4 flex-wrap">
            {isLocationError && (
              <button
                onClick={handleRetryLocation}
                className="flex items-center gap-2 py-[11px] px-6 rounded-full border-[1.5px] rec-btn-gold-outline text-[0.8rem] font-semibold tracking-[0.04em] cursor-pointer transition-all duration-[220ms] font-[DM_Sans]"
              >
                <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {t("home.retry_location")}
              </button>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px mb-10 rec-section-divider-line" />

        {isLocationError ? (
          <div className="text-center py-12 bg-white/50 rounded-2xl border border-dashed rec-empty-border">
            <div className="w-16 h-16 rec-empty-icon-bg rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width={24} height={24} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="icon-primary">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <h3 className="text-lg font-bold rec-empty-heading mb-2 font-[Cormorant_Garamond]">{t("home.loc_access_required")}</h3>
            <div className="flex justify-center">
              <p className="rec-section-subtext font-[DM_Sans] text-sm max-w-[300px] mx-auto mb-6">
                {t("home.allow_loc_desc_alt")}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
              <button
                onClick={handleRetryLocation}
                className="w-full sm:w-auto py-2.5 px-8 rounded-full rec-btn-primary text-[0.8rem] font-bold tracking-widest transition-all shadow-md"
              >
                {t("home.allow_location")}
              </button>
              <button
                onClick={() => setIsMapModalOpen(true)}
                className="w-full sm:w-auto py-2.5 px-8 rounded-full border rec-btn-gold-outline text-[0.8rem] font-bold tracking-widest transition-all shadow-sm"
              >
                {t("home.choose_location_manually")}
              </button>
            </div>
          </div>
        ) : recommendedSalons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedSalons.map((salon) => {
              const badge = salon.verificationStatus === "VERIFIED" ? "Top Rated" : null;
              const bc = badge ? badgeClass[badge] : null;
              const salonImg = salon.imageUrls?.[0] || salon.bannerImageUrl || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=60";

              return (
                <Link
                  key={salon.id}
                  href={`/salons/${salon.id}`}
                  className="group block rounded-[20px] overflow-hidden border rec-card-border cursor-pointer no-underline h-full"
                >
                  {/* Image */}
                  <div className="relative h-[200px] overflow-hidden">
                    <img
                      src={salonImg}
                      alt={salon.name}
                      className="w-full h-full object-cover transition-transform duration-[600ms] group-hover:scale-[1.06]"
                    />
                    <div className="absolute inset-0 rec-card-overlay" />

                    {/* Badge */}
                    {badge && bc && (
                      <span className={`absolute top-3.5 left-3.5 px-[11px] py-1 rounded-full text-[0.68rem] font-semibold tracking-[0.06em] backdrop-blur-[8px] border font-[DM_Sans] ${bc}`}>
                        {t("home.top_rated")}
                      </span>
                    )}

                    {/* Open Status */}
                    <span className={`absolute top-3.5 right-3.5 px-2.5 py-1 rounded-full text-[0.72rem] font-semibold tracking-[0.04em] backdrop-blur-[8px] font-[DM_Sans] ${salon.isOpen ? 'rec-status-open' : 'rec-status-closed'}`}>
                      {salon.isOpen ? t("home.open") : t("home.closed")}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-[20px_20px_18px] flex flex-col justify-between h-[calc(100%-200px)] bg-white">
                    <div>
                      <h3 className="text-[1.18rem] font-bold leading-[1.2] mb-1 rec-card-title font-[Cormorant_Garamond,Georgia,serif] line-clamp-1">
                        {salon.name}
                      </h3>
                      <div className="flex items-center gap-1 text-[0.76rem] mb-3 rec-card-meta font-[DM_Sans]">
                        <svg width={11} height={11} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        {salon.city}, {salon.country}
                      </div>
                      <div className="h-px mb-3 rec-card-inner-divider" />
                      <p className="text-[0.76rem] font-normal mb-3 rec-card-desc font-[DM_Sans] line-clamp-2 italic">
                        {salon.description || t("home.allow_loc_desc_alt")}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <div className="flex items-center gap-[5px]">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <StarIcon key={i} filled={i <= Math.round(salon.averageRating || 0)} />
                          ))}
                        </div>
                        <span className="text-[0.8rem] font-semibold rec-card-title font-[DM_Sans]">
                          {(salon.averageRating || 0.0).toFixed(1)}
                        </span>
                      </div>
                      <span className="py-[7px] px-[16px] rounded-full rec-btn-primary text-[0.73rem] font-semibold tracking-[0.04em] font-[DM_Sans]">
                        {t("home.view_btn")}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/50 rounded-2xl border border-dashed rec-empty-border">
            <p className="rec-section-subtext mb-4">{t("home.no_salons_found")}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0">
              <button
                onClick={() => setIsMapModalOpen(true)}
                className="w-full sm:w-auto py-2 px-6 rounded-full border rec-btn-gold-outline text-[0.8rem] font-bold tracking-widest transition-all shadow-sm"
              >
                {t("home.choose_location_manually")}
              </button>
              <Link
                href="/salons"
                className="w-full sm:w-auto text-center py-2 px-6 rounded-full rec-btn-primary text-[0.8rem] font-bold tracking-widest transition-all shadow-md no-underline"
              >
                {t("home.browse_salons")}
              </Link>
            </div>
          </div>
        )}

        <MapPickerModal
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          onSelect={(loc) => {
            setIsMapModalOpen(false);
            saveManualLocation(loc.lat, loc.lng, loc.address);
          }}
        />
      </div>
    </section>
  );
}