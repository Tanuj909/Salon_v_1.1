"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { fetchCategories, fetchNearbyByCategory } from "@/features/salons/services/salonService";
import { useUserLocation } from "@/features/salons/hooks/useUserLocation";
import dynamic from "next/dynamic";
import { useLanguage } from "@/context/LanguageContext";

const MapPickerModal = dynamic(
  () => import("@/features/salons/components/MapPickerModal"),
  { ssr: false }
);


// ─── Category fallback images (keyed by name) ──────────────────────────────
const CATEGORY_IMAGES = {
  MEN: "https://images.unsplash.com/photo-1647140655214-e4a2d914971f?w=600&auto=format&fit=crop&q=70",
  WOMEN: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&auto=format&fit=crop&q=70",
  PETS: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&auto=format&fit=crop&q=70",
  PEATS: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&auto=format&fit=crop&q=70",
  KIDS: "https://media.istockphoto.com/id/680907176/photo/little-boy-getting-haircut-by-barber-while-sitting-in-chair-at-barbershop.webp?a=1&b=1&s=612x612&w=0&k=20&c=TnERWxLL7zG9s8He2TEDZD7yhHy42LiJpj3xE33Q7ls=",
  DEFAULT: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=70",
};

function getCategoryImage(category) {
  if (category.iconUrl && !category.iconUrl.includes("example.com")) {
    return category.iconUrl;
  }
  const key = (category.name || "").toUpperCase();
  return CATEGORY_IMAGES[key] || CATEGORY_IMAGES.DEFAULT;
}

// ─── Star icon (Using theme colors) ──────────────────────────────────────────
const StarIcon = ({ filled }) => (
  <svg width={13} height={13} viewBox="0 0 20 20" fill={filled ? "#C49B66" : "#E2E8F0"}>
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

// ─── Salon card (Using rec-* classes from blue-gold-theme.css) ──────────────
function SalonCard({ salon }) {
  const { t } = useLanguage();
  const img =
    salon.imageUrls?.[0] ||
    salon.bannerImageUrl ||
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=60";
  const rating = salon.averageRating || 0;
  const badge = salon.verificationStatus === "VERIFIED" ? t("home.top_rated") : null;

  return (
    <Link
      href={`/salons/${salon.id}`}
      className="group block bg-white rounded-[20px] overflow-hidden border rec-card-border cursor-pointer no-underline w-[280px] flex-shrink-0 h-full"
    >
      {/* Image */}
      <div className="relative h-[200px] overflow-hidden">
        <img
          src={img}
          alt={salon.name}
          className="w-full h-full object-cover transition-transform duration-[600ms] group-hover:scale-[1.06]"
          loading="lazy"
        />
        {/* Overlay */}
        <div className="absolute inset-0 rec-card-overlay" />

        {/* Badge */}
        {badge && (
          <span className="absolute top-3.5 left-3.5 px-[11px] py-1 rounded-full text-[0.68rem] font-semibold tracking-[0.06em] backdrop-blur-[8px] border rec-badge-top-rated-bg font-[DM_Sans]">
            {badge}
          </span>
        )}

        {/* Open Status */}
        <span
          className={`absolute top-3.5 right-3.5 px-2.5 py-1 rounded-full text-[0.72rem] font-semibold tracking-[0.04em] backdrop-blur-[8px] font-[DM_Sans] ${salon.isOpen
            ? "rec-status-open"
            : "rec-status-closed"
            }`}
        >
          {salon.isOpen ? t("home.open") : t("home.closed")}
        </span>
      </div>

      {/* Body */}
      <div className="p-[20px_20px_18px] flex flex-col justify-between h-[calc(100%-200px)]">
        <div>
          <h4 className="text-[1.18rem] font-bold leading-[1.2] mb-1 rec-card-title font-[Cormorant_Garamond,Georgia,serif] line-clamp-1">
            {salon.name}
          </h4>

          <div className="flex items-center gap-1 text-[0.76rem] mb-3 rec-card-meta font-[DM_Sans]">
            <svg width={11} height={11} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {[salon.city, salon.country].filter(Boolean).join(", ") || "—"}
          </div>

          {/* Divider */}
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
                <StarIcon key={i} filled={i <= Math.round(rating)} />
              ))}
            </div>
            <span className="text-[0.8rem] font-semibold rec-card-title font-[DM_Sans]">
              {rating.toFixed(1)}
            </span>
          </div>
          <span className="py-[7px] px-[16px] rounded-full rec-btn-primary text-[0.73rem] font-semibold tracking-[0.04em] font-[DM_Sans]">
            {t("home.view_btn")}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Skeleton card ───────────────────────────────────────────────────────────
function SalonCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-[280px] rounded-[20px] overflow-hidden border rec-card-border bg-white shadow-sm animate-pulse">
      <div className="h-[200px] bg-gray-100" />
      <div className="p-[20px_20px_18px] space-y-2">
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
      </div>
    </div>
  );
}

// ─── Single category row ─────────────────────────────────────────────────────
function CategoryRow({ category, lat, lng }) {
  const { t } = useLanguage();
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchNearbyByCategory(category.id, lat, lng, 50, 4)
      .then((data) => { if (!cancelled) setSalons(data || []); })
      .catch(() => { if (!cancelled) setSalons([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [category.id, lat, lng]);

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  const catKey = "home.cat_" + category.name.toLowerCase();
  const translatedCategoryName = t(catKey, category.name);

  return (
    <div className="mb-16 last:mb-0">
      {/* Row header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Eyebrow with divider line */}
          <div className="flex items-center gap-2">
            <span className="w-6 h-px inline-block rec-section-divider" />
            <span className="text-[0.72rem] font-semibold tracking-[0.12em] uppercase rec-section-eyebrow font-[DM_Sans]">
              {translatedCategoryName.charAt(0) + translatedCategoryName.slice(1).toLowerCase()}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Circle category badge */}
            <div className="relative w-[50px] h-[50px] rounded-full overflow-hidden border-[3px] border-white shadow-md flex-shrink-0">
              <img
                src={getCategoryImage(category)}
                alt={category.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-black/10 to-black/40" />
            </div>
            <div>
              <h3 className="font-bold leading-[1.1] rec-section-heading font-[Cormorant_Garamond,Georgia,serif] text-[clamp(1.1rem,2vw,1.6rem)] capitalize">
                {translatedCategoryName} <span className="rec-section-heading-accent italic">{t("home.salons_title_suffix")}</span>
              </h3>
              <p className="text-[0.85rem] leading-[1.65] mt-1 max-w-[380px] rec-section-subtext font-[DM_Sans] line-clamp-1">
                {category.description || t("home.salons_available_count").replace("{count}", category.businessCount || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Arrow scroll btns */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll(-1)}
              className="w-8 h-8 rounded-full border rec-btn-outline flex items-center justify-center transition-colors duration-200"
              aria-label="Scroll left"
            >
              <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              onClick={() => scroll(1)}
              className="w-8 h-8 rounded-full border rec-btn-outline flex items-center justify-center transition-colors duration-200"
              aria-label="Scroll right"
            >
              <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
          <Link
            href={`/salons?categoryId=${category.id}`}
            className="flex items-center gap-2 py-[9px] px-5 rounded-full border-[1.5px] rec-btn-outline text-[0.75rem] font-semibold tracking-[0.04em] cursor-pointer no-underline font-[DM_Sans] transition-all"
          >
            {t("home.see_all")}
            <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px mb-10 rec-section-divider-line" />

      {/* Horizontal scroll row */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 scroll-smooth px-2 -mx-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {loading
          ? [1, 2, 3, 4].map((i) => <SalonCardSkeleton key={i} />)
          : salons.length > 0
            ? salons.map((salon) => <SalonCard key={salon.id} salon={salon} />)
            : (
              <div className="flex-1 py-10 text-center rec-section-subtext text-sm font-[DM_Sans] bg-white/40 rounded-2xl border border-dashed rec-card-border">
                {t("home.no_salons_found_cat")}
              </div>
            )}
      </div>

      {/* Bottom Row Divider */}
      <div className="h-px mt-10 rec-section-divider-line opacity-50" />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
export default function Categories() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const { location, error, loading: locationLoading, saveManualLocation } = useUserLocation();
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  const handleRetryLocation = () => {
    window.location.reload();
  };

  // ── Fetch categories ────────────────────────────────────────────────────────
  useEffect(() => {
    fetchCategories()
      .then((cats) => setCategories((cats || []).filter((c) => c.isActive)))
      .catch(() => setCategories([]))
      .finally(() => setLoadingCats(false));
  }, []);

  return (
    <section className="w-full py-10 relative font-[DM_Sans]">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12">

        {/* ── Section header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-px inline-block rec-section-divider" />
              <span className="text-[0.72rem] font-semibold tracking-[0.12em] uppercase rec-section-eyebrow">
                {t("home.tailored_for_you")}
              </span>
            </div>
            <h2 className="font-bold leading-[1.1] rec-section-heading font-[Cormorant_Garamond,Georgia,serif] text-[clamp(1.75rem,3vw,2.6rem)]">
              {t("home.browse_by_category").split(' ').slice(0, -1).join(' ')}
              <span className="italic rec-section-heading-accent ml-2">{t("home.browse_by_category").split(' ').slice(-1)[0]}</span>
            </h2>
            <p className="text-[0.85rem] leading-[1.65] mt-2 max-w-[380px] rec-section-subtext">
              {t("home.browse_category_desc")}
            </p>
          </div>

          <Link
            href="/salons"
            className="flex items-center gap-2 py-[11px] px-6 rounded-full border-[1.5px] rec-btn-outline text-[0.8rem] font-semibold tracking-[0.04em] cursor-pointer transition-all no-underline"
          >
            {t("home.view_all_categories")}
            <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>

        {/* Divider */}
        <div className="h-px mb-10 rec-section-divider-line" />

        {/* ── Category rows ── */}
        {loadingCats || (!location && locationLoading) ? (
          <div className="space-y-14">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-[50px] h-[50px] rounded-full bg-gray-100" />
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-100 rounded w-36" />
                    <div className="h-3 bg-gray-100 rounded w-52" />
                  </div>
                </div>
                <div className="flex gap-4">
                  {[1, 2, 3, 4].map((j) => <SalonCardSkeleton key={j} />)}
                </div>
              </div>
            ))}
          </div>
        ) : (!location && error) ? (
          <div className="text-center py-16 bg-white/50 rounded-2xl border border-dashed rec-empty-border">
            <div className="w-16 h-16 rec-empty-icon-bg rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width={24} height={24} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="icon-primary">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <h3 className="text-lg font-bold rec-empty-heading mb-2 font-[Cormorant_Garamond]">{t("home.loc_access_required")}</h3>
            <div className="flex justify-center">
              <p className="rec-section-subtext text-sm max-w-[350px] mx-auto mb-6">
                {t("home.allow_loc_desc")}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
              <button
                onClick={handleRetryLocation}
                className="w-full sm:w-auto py-2.5 px-8 rounded-full rec-btn-primary text-[0.8rem] font-bold tracking-widest shadow-md"
              >
                {t("home.retry_location")}
              </button>
              <button
                onClick={() => setIsMapModalOpen(true)}
                className="w-full sm:w-auto py-2.5 px-8 rounded-full border rec-btn-gold-outline text-[0.8rem] font-bold tracking-widest shadow-sm"
              >
                {t("home.choose_location_manually")}
              </button>
            </div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16">
            <p className="rec-section-subtext font-[DM_Sans]">
              {t("home.no_categories")}
            </p>
          </div>
        ) : (
          categories.map((cat) => (
            <CategoryRow
              key={cat.id}
              category={cat}
              lat={location?.latitude}
              lng={location?.longitude}
            />
          ))
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