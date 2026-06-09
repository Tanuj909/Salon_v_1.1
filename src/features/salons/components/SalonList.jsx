"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { MapPin, Navigation, Star, Search, X, SlidersHorizontal, ChevronDown } from "lucide-react";
import Fuse from 'fuse.js';
import { fuseData } from '@/features/home/data/fuseData';
import { enrichSynonyms, fuseOptions } from '@/features/home/utils/searchUtils';
import { fetchDistinctServiceNames } from "@/features/salons/services/salonService";
import { useLanguage } from "@/context/LanguageContext";

// Local badge styles
const badgeStyles = {
  "VERIFIED": {
    bg: "badge-verified-bg",
    text: "badge-verified-text",
    border: "badge-verified-border"
  },
  "New": {
    bg: "badge-new-bg",
    text: "badge-new-text",
    border: "badge-new-border"
  },
  "Trending": {
    bg: "badge-trending-bg",
    text: "badge-trending-text",
    border: "badge-trending-border"
  }
};
import { useNearbySalons } from "@/features/salons/hooks/useNearbySalons";
import { fetchActiveCategories } from "@/features/salons/services/salonService";
import LocationPicker from "./LocationPicker";
import DateTimePickerModal from "@/features/home/components/DateTimePickerModal";


// ─── Star Icon ────────────────────────────────────────────────────────────────
const StarIcon = ({ filled }) => (
  <Star size={13} fill={filled ? "currentColor" : "transparent"} className={filled ? "star-icon-filled" : "star-icon-empty"} />
);

// ─── Salon Card ───────────────────────────────────────────────────────────────
function SalonCard({ salon }) {
  const { t } = useLanguage();
  // Determine image source with fallback
  const imageSrc = salon.bannerImageUrl || (salon.imageUrls && salon.imageUrls.length > 0 ? salon.imageUrls[0] : "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=60");

  // Build location string from available fields
  const locationString = [salon.city, salon.state, salon.country].filter(Boolean).join(", ");

  // Open status badge
  const openBadge = salon.isOpen ? t("salons_list.open_now") : t("salons_list.closed");

  // Verification badge check
  const badge = salon.verificationStatus === "VERIFIED" ? "VERIFIED" : null;
  const bc = badge ? badgeStyles[badge] : null;

  return (
    <Link
      href={`/salons/${salon.id}`}
      className="group block rounded-[20px] overflow-hidden border salon-card-bg cursor-pointer shadow-sm no-underline h-full flex flex-col"
    >
      {/* ── Image ── */}
      <div className="relative h-[210px] overflow-hidden shrink-0">
        <img
          src={imageSrc}
          alt={salon.name}
          className="w-full h-full object-cover transition-transform duration-[800ms] group-hover:scale-[1.08]"
        />
        {/* Subtle Overlay */}
        <div className="absolute inset-0 z-[2] hero-bg-overlay/60" />

        {/* Badge */}
        {badge && (
          <span
            className="
      absolute top-3.5 left-3.5
      px-[11px] py-1
      rounded-full
      text-[0.68rem]
      font-bold
      tracking-[0.06em]
      font-['Manrope',sans-serif]
      rec-badge-top-rated-bg
      border
      shadow-md
    "
          >
            {t("salons_list.top_rated")}
          </span>
        )}

        {/* Open/Closed Badge */}
        <span className={`absolute top-3.5 right-3.5 px-3 py-1 rounded-full text-[0.7rem] font-bold tracking-[0.04em] backdrop-blur-[8px] ${salon.isOpen ? "hero-filter-bar-bg hero-filter-icon" : "bg-red-100 text-red-800"} font-['Manrope',sans-serif]`}>
          {openBadge}
        </span>
      </div>

      {/* ── Body ── */}
      <div className="p-[22px_22px_20px] flex flex-col flex-1">
        <h3 className="text-[1.15rem] font-bold leading-[1.3] mb-1.5 salon-card-title font-[Cormorant_Garamond,Georgia,serif] line-clamp-1">
          {salon.name}
        </h3>

        <div className="flex items-center gap-1.5 text-[0.75rem] mb-3 salon-card-text font-['Manrope',sans-serif] font-medium">
          <MapPin size={12} className="hero-filter-icon" />
          {locationString || salon.address || t("salons_list.location_unavailable")}
        </div>

        {/* Divider */}
        <div className="h-px mb-3 hero-filter-input-bg" />

        {/* Description */}
        {salon.description && (
          <p className="text-[0.8rem] salon-card-text mb-3 font-['Manrope',sans-serif] line-clamp-2 italic leading-relaxed">
            {salon.description}
          </p>
        )}

        {/* Service Count (if available) */}
        {salon.serviceCount !== undefined && salon.serviceCount !== null && (
          <div className="inline-block px-2.5 py-1 bg-[#4b3621]/5 text-[#4b3621] text-[0.68rem] font-bold uppercase tracking-widest rounded-md mb-auto font-['Manrope',sans-serif] self-start">
            {salon.serviceCount} {t("salons_list.services_available")}
          </div>
        )}

        {/* Footer: Rating & Button */}
        <div className="mt-4 pt-4 flex items-center justify-between border-t rec-section-border">
          <div className="flex items-center gap-1.5">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <StarIcon
                  key={i}
                  filled={i <= Math.round(salon.averageRating || 0)}
                />
              ))}
            </div>
            <span className="text-[0.85rem] font-bold salon-card-title font-['Manrope',sans-serif]">
              {(salon.averageRating || 0).toFixed(1)}
            </span>
            <span className="text-[0.75rem] salon-card-text font-['Manrope',sans-serif] ml-0.5">
              ({salon.totalReviews || 0})
            </span>
          </div>

          <span className="py-2 px-[18px] rounded-full border-[1.5px] rec-card-btn text-[0.75rem] font-bold tracking-[0.04em] font-['Manrope',sans-serif] transition-all duration-300 group-hover:rec-btn-primary group-hover:shadow-lg">
            {t("salons_list.explore")}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Main List Component ─────────────────────────────────────────────────────
export default function SalonList() {
  const {
    salons, loading, error, isFallback,
    searchParams, updateParams, saveManualLocation, useCurrentLocation, retry
  } = useNearbySalons();
  const { t } = useLanguage();

  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [draftParams, setDraftParams] = useState({
    lat: searchParams.lat,
    lng: searchParams.lng,
    radius: searchParams.radius,
    address: searchParams.address,
    serviceName: searchParams.serviceName || "",
    categoryId: searchParams.categoryId || "",
    date: searchParams.date || "",
    startTime: searchParams.startTime || "",
    endTime: searchParams.endTime || ""
  });

  const [showTimeoutOptions, setShowTimeoutOptions] = useState(false);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [distinctServices, setDistinctServices] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const serviceSearchRef = useRef(null);
  const mobileServiceSearchRef = useRef(null);

  // ─── Combined Service Data for Search ───
  const combinedServiceData = useMemo(() => {
    const staticServices = fuseData.filter(item => item.type === 'service');
    const seenNames = new Set(staticServices.map(s => s.name.toLowerCase()));
    
    const apiServicesFormatted = distinctServices
      .filter(name => name && !seenNames.has(name.toLowerCase()))
      .map(name => ({
        name: name.trim(),
        synonyms: enrichSynonyms(name),
        type: 'service',
        isFromApi: true
      }));

    return [...staticServices, ...apiServicesFormatted];
  }, [distinctServices]);

  // ─── Initialize Fuse ───
  const fuse = useMemo(() => {
    return new Fuse(combinedServiceData, fuseOptions);
  }, [combinedServiceData]);

  // ─── Dynamic Placeholders ───
  const [salonPlaceholderIndex, setSalonPlaceholderIndex] = useState(0);
  const [servicePlaceholderIndex, setServicePlaceholderIndex] = useState(0);

  const salonPlaceholders = ["Encore Salon", "The Barber Shop", "Zen Spa", "Elite Grooming", "Radiance Beauty"];
  const servicePlaceholders = [
    t("home.placeholder_0"),
    t("home.placeholder_1"),
    t("home.placeholder_2"),
    t("home.placeholder_3"),
    t("home.placeholder_4"),
    t("home.placeholder_5")
  ];

  const [headingIndex, setHeadingIndex] = useState(0);
  const headings = [
    "premium",
    "luxury",
    "Budget",
  ];

  const [placeholderFade, setPlaceholderFade] = useState(true);
  const [headingFade, setHeadingFade] = useState(true);

  // ─── Heading Cycle (5s) ───
  useEffect(() => {
    const headingInterval = setInterval(() => {
      setHeadingFade(false);
      setTimeout(() => {
        setHeadingIndex((prev) => (prev + 1) % headings.length);
        setHeadingFade(true);
      }, 500);
    }, 5000);
    return () => clearInterval(headingInterval);
  }, []);

  // ─── Placeholder Cycle (3.5s) ───
  useEffect(() => {
    const placeholderInterval = setInterval(() => {
      setPlaceholderFade(false);
      setTimeout(() => {
        setSalonPlaceholderIndex((prev) => (prev + 1) % salonPlaceholders.length);
        setServicePlaceholderIndex((prev) => (prev + 1) % servicePlaceholders.length);
        setPlaceholderFade(true);
      }, 500);
    }, 3500);
    return () => clearInterval(placeholderInterval);
  }, []);

  useEffect(() => {
    fetchActiveCategories().then(data => {
      const catList = (Array.isArray(data) ? data : (data.content || []));
      setCategories(catList);
    }).catch(console.error);

    fetchDistinctServiceNames().then(data => {
      setDistinctServices(data || []);
    }).catch(console.error);
  }, []);

  // Handle outside click for suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (serviceSearchRef.current && !serviceSearchRef.current.contains(event.target)) &&
        (mobileServiceSearchRef.current && !mobileServiceSearchRef.current.contains(event.target))
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let timer;
    if (loading && !salons.length) {
      timer = setTimeout(() => {
        setShowTimeoutOptions(true);
      }, 15000);
    } else {
      setShowTimeoutOptions(false);
    }
    return () => clearTimeout(timer);
  }, [loading, salons.length]);

  // Sync draft params with search params only on initial load or browser detection
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (searchParams.lat && !hasInitialized.current) {
      setDraftParams({
        lat: searchParams.lat,
        lng: searchParams.lng,
        radius: searchParams.radius,
        address: searchParams.address,
        serviceName: searchParams.serviceName || "",
        categoryId: searchParams.categoryId || "",
        date: searchParams.date || "",
        startTime: searchParams.startTime || "",
        endTime: searchParams.endTime || ""
      });
      hasInitialized.current = true;
    }
  }, [searchParams.lat, searchParams.lng, searchParams.radius, searchParams.address]);

  const handleFetch = () => {
    const originalVal = draftParams.serviceName;
    const trimmed = originalVal.toLowerCase().trim();
    
    let finalSearchTerm = originalVal.trim();
    
    if (trimmed) {
      const exactMatch = combinedServiceData.find(s => s.name.toLowerCase() === trimmed);
      if (exactMatch) {
        finalSearchTerm = exactMatch.name;
      } else {
        const results = fuse.search(trimmed);
        if (results.length > 0 && results[0].score < 0.3) {
          finalSearchTerm = results[0].item.name;
        }
      }
    }

    setShowSuggestions(false);
    updateParams({ ...draftParams, serviceName: finalSearchTerm });
  };

  const handleServiceChange = (e) => {
    const val = e.target.value;
    setDraftParams(prev => ({ ...prev, serviceName: val }));
    
    const searchVal = val.toLowerCase().trim();
    if (searchVal) {
      const results = fuse.search(searchVal).slice(0, 4);
      setSuggestions(results.map(r => r.item));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (name) => {
    setDraftParams(prev => ({ ...prev, serviceName: name }));
    setShowSuggestions(false);
    updateParams({ ...draftParams, serviceName: name });
  };

  const hasChanges =
    draftParams.lat !== searchParams.lat ||
    draftParams.lng !== searchParams.lng ||
    draftParams.radius !== searchParams.radius ||
    draftParams.address !== searchParams.address ||
    draftParams.serviceName !== searchParams.serviceName ||
    draftParams.categoryId !== searchParams.categoryId;

  if (loading && !salons.length) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-white/30 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-6 text-center max-w-md">
          <div className="w-16 h-16 border-4 border-[#cd6133]/20 border-t-[#cd6133] rounded-full animate-spin" />
          <div className="space-y-2">
            <h2 className="text-xl font-bold salon-list-title-text font-[Cormorant_Garamond]">
              {showTimeoutOptions ? t("salons_list.still_searching_loc") : t("salons_list.finding_best_salons")}
            </h2>
            <p className="footer-link-text font-medium font-[DM_Sans] text-sm opacity-80">
              {showTimeoutOptions
                ? t("salons_list.longer_expected_desc")
                : t("salons_list.locating_premium_spaces")}
            </p>
          </div>

          {showTimeoutOptions && (
            <div className="w-full pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-4 hero-filter-bar-bg rounded-2xl border hero-filter-input-bg shadow-sm">
                <p className="text-[10px] uppercase tracking-widest font-bold hero-filter-icon mb-3">{t("salons_list.enter_manually")}</p>
                <LocationPicker
                  currentAddress={draftParams.address}
                  lat={draftParams.lat}
                  lng={draftParams.lng}
                  onLocationSelect={(loc) => {
                    setDraftParams(prev => ({ ...prev, ...loc }));
                    updateParams({ ...draftParams, ...loc });
                    saveManualLocation(loc.lat, loc.lng, loc.address);
                  }}
                  onDetectLocation={() => {
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        const newLoc = {
                          lat: pos.coords.latitude,
                          lng: pos.coords.longitude,
                          address: "Detected Location"
                        };
                        setDraftParams(prev => ({ ...prev, ...newLoc }));
                        updateParams({ ...draftParams, ...newLoc });
                        saveManualLocation(newLoc.lat, newLoc.lng, newLoc.address);
                      },
                      (err) => {
                        if (err.code === err.PERMISSION_DENIED) {
                          alert(t("salons_list.alert_location_denied"));
                        } else {
                          alert(t("salons_list.alert_location_failed"));
                        }
                      },
                      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
                    );
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const filtered = (salons || []).filter((s) => {
    const salonCategory = s.category || (s.categoryNames && s.categoryNames.length > 0 ? s.categoryNames[0] : "");
    const matchFilter =
      activeFilter === "All" ||
      salonCategory?.toLowerCase().includes(activeFilter.toLowerCase()) ||
      s.tags?.some((t) => t.toLowerCase().includes(activeFilter.toLowerCase()));

    const matchSearch =
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.location?.toLowerCase().includes(search.toLowerCase()) ||
      s.city?.toLowerCase().includes(search.toLowerCase()) ||
      salonCategory?.toLowerCase().includes(search.toLowerCase());

    return matchFilter && matchSearch;
  });

  return (
    <div className="min-h-screen font-[DM_Sans,sans-serif] pt-20 md:pt-28 pb-20">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-12">
        {/* ── Header Section ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 md:gap-6 mb-4 md:mb-8 mt-2 md:mt-0">
          <div className="flex-1 w-full">
            {!showMobileSearch ? (
              <div 
                className="flex items-center justify-between w-full md:w-fit font-bold leading-none salon-list-title-text font-[Cormorant_Garamond,Georgia,serif] text-[1.1rem] xs:text-[1.25rem] sm:text-[2rem] md:text-[2.5rem] md:mb-1.5 md:block md:cursor-default"
              >
                <span 
                  onClick={() => setShowMobileSearch(true)} 
                  className="flex-1 cursor-pointer md:cursor-default whitespace-nowrap"
                >
                  {t("salons_list.discover")}{" "}
                  <span className={`inline-block transition-opacity duration-500 rec-section-heading-accent ${headingFade ? "opacity-100" : "opacity-0"}`}>
                    {t(`salons_list.headings.${headings[headingIndex].toLowerCase()}`)}
                  </span>{" "}
                  {t("salons_list.salons_title")}
                </span>
                <div className="flex items-center gap-2 sm:gap-3 md:hidden shrink-0 ml-2">
                    {!showFilters && (
                      <Search size={18} className="hero-filter-icon cursor-pointer" onClick={() => setShowMobileSearch(true)} />
                    )}

                    <button onClick={() => setShowFilters(!showFilters)} className="relative">
                        <SlidersHorizontal size={18} className="hero-filter-icon cursor-pointer" />
                        {hasChanges && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full hero-filter-btn-bg border-2 border-white" />
                        )}
                    </button>
                </div>
              </div>
            ) : (
                <div className="relative w-full flex items-center md:hidden">
                    {!showFilters && (
                      <>
                        <span className="absolute left-[5%] top-1/2 -translate-y-1/2 pointer-events-none text-[#1C3152]">
                            <Search size={18} strokeWidth={2.5} />
                        </span>
                        <input
                            autoFocus
                            className={`w-full h-[52px] pr-[44px] pl-[48px] rounded-2xl border hero-filter-input-bg hero-filter-bar-bg navbar-logo-subtext text-[0.9rem] outline-none transition-all duration-300 shadow-md focus:border-[#cd6133] focus:ring-4 focus:ring-[#cd6133]/10 font-[DM_Sans] placeholder:text-[#3c143270] placeholder:transition-all placeholder:duration-500 ${placeholderFade ? "placeholder:opacity-100 placeholder:translate-x-0" : "placeholder:opacity-0 placeholder:-translate-x-4"}`}
                            type="text"
                            placeholder={salonPlaceholders[salonPlaceholderIndex]}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onBlur={() => !search && setShowMobileSearch(false)}
                        />
                        <button 
                            onClick={() => {
                                setSearch("");
                                setShowMobileSearch(false);
                            }}
                            className="absolute right-[14px] top-1/2 -translate-y-1/2 p-1.5 footer-link-text hover:hero-filter-icon transition-colors"
                        >
                            <X size={20} />
                        </button>
                      </>
                    )}
                </div>
            )}

            {/* Mobile Service Search Bar */}
            {!showFilters && (
              <div className="md:hidden mt-6 w-full animate-in fade-in slide-in-from-top-3 duration-500 relative z-[100]" ref={mobileServiceSearchRef}>
                <div className="absolute -top-2.5 left-4 z-[2]">
                    <span className="px-2.5 py-1 rounded-md bg-[#1C3152] text-[#C8A951] text-[8px] font-black uppercase tracking-[0.15em] shadow-sm border border-[#C8A951]/20">{t("salons_list.service")}</span>
                </div>
                <div className="relative group flex items-center gap-2.5">
                  <div className="relative flex-1 flex items-center h-[54px] hero-filter-bar-bg backdrop-blur-lg rounded-2xl border hero-filter-input-bg shadow-md focus-within:ring-4 focus-within:ring-[#cd6133]/10 focus-within:border-[#cd6133]/60 transition-all duration-300">
                    <div className="flex items-center pl-[5%] pr-1 text-[#1C3152]/70">
                        <Search size={16} strokeWidth={2.5} />
                    </div>
                    <input
                      className="flex-1 h-full pl-3 pr-10 salon-list-title-text text-[0.9rem] outline-none bg-transparent font-[DM_Sans] placeholder:text-[#3c143240] placeholder:transition-all placeholder:duration-500"
                      type="text"
                      placeholder={servicePlaceholders[servicePlaceholderIndex]}
                      value={draftParams.serviceName}
                      onChange={handleServiceChange}
                      onFocus={() => { if (draftParams.serviceName.trim()) setShowSuggestions(true); }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !loading) {
                          handleFetch();
                        }
                      }}
                    />
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#3c143212] rounded-xl shadow-xl z-[9999] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                        {suggestions.map((s, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick(s.name)}
                            className="w-full text-left px-5 py-3.5 text-sm text-[#2a1020] hover:bg-[#cd6133]/5 transition-colors border-b border-[#3c143205] last:border-0"
                          >
                            {s.name}
                          </button>
                        ))}
                      </div>
                    )}
                    {draftParams.serviceName && (
                      <button 
                        onClick={() => {
                          setDraftParams(prev => ({ ...prev, serviceName: "" }));
                          setTimeout(handleFetch, 100);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#3c143240] hover:text-[#7a2860] transition-colors"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                  <button 
                    onClick={handleFetch}
                    disabled={loading}
                    className="h-[54px] w-[54px] shrink-0 flex items-center justify-center rounded-2xl bg-[#1C3152] text-white shadow-lg active:scale-95 transition-all duration-300 disabled:opacity-50 hover:bg-[#1C3152]/90"
                  >
                     {loading ? (
                        <div className="w-5 h-5 border-[2.5px] border-white/20 border-t-white rounded-full animate-spin" />
                     ) : (
                        <Search size={24} strokeWidth={2.5} />
                     )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Filter Toggle (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`h-11 px-6 flex items-center gap-3 rounded-2xl border transition-all duration-300 font-bold text-[0.85rem] ${showFilters ? 'bg-[#1e0a18] text-white border-[#1e0a18] shadow-md' : 'hero-filter-bar-bg border hero-filter-input-bg salon-card-title hover:bg-white hover:border-[#cd6133]/30 shadow-sm'}`}
            >
              <SlidersHorizontal size={16} className={showFilters ? 'text-[#C8A951]' : 'hero-filter-icon'} />
              <span>{showFilters ? t("salons_list.hide_filters") : t("salons_list.filters")}</span>
              {hasChanges && (
                <span className="w-1.5 h-1.5 rounded-full hero-filter-btn-bg animate-pulse" />
              )}
              <ChevronDown size={14} className={`transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* ── Desktop Dual Search Bar ── */}
        <div className={`hidden md:block transition-all duration-300 relative z-[50] ${!showFilters ? 'max-h-[500px] mb-8 opacity-100 visible' : 'max-h-0 opacity-0 pointer-events-none invisible'}`} ref={serviceSearchRef}>
          <div className="flex items-center gap-4 p-2.5 hero-filter-bar-bg backdrop-blur-md rounded-[1.5rem] border hero-filter-input-bg shadow-sm overflow-visible">
            {/* Salon Name Search */}
            <div className="relative flex-1 group">
              <span className="absolute left-[18px] top-1/2 -translate-y-1/2 pointer-events-none footer-link-text transition-colors group-focus-within:hero-filter-icon">
                <Search size={18} />
              </span>
              <input
                className={`w-full h-12 pr-[16px] pl-[48px] rounded-xl border hero-filter-input-bg hero-filter-bar-bg salon-list-title-text text-[0.9rem] outline-none transition-all duration-200 focus:bg-white focus:border-[#cd6133]/40 focus:ring-4 focus:ring-[#cd6133]/5 font-[DM_Sans] placeholder:text-[#3c143260] placeholder:transition-all placeholder:duration-500 ${placeholderFade ? "placeholder:opacity-100 placeholder:translate-x-0" : "placeholder:opacity-0 placeholder:-translate-x-4"}`}
                type="text"
                placeholder={salonPlaceholders[salonPlaceholderIndex]}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="w-px h-8 bg-[#3c143212]" />

            {/* Service Name Search */}
            <div className="relative flex-1 group">
              <div className="absolute -top-2.5 left-4 z-[2]">
                  <span className="px-2.5 py-1 rounded-md bg-[#1C3152] text-[#C8A951] text-[8px] font-black uppercase tracking-[0.15em] shadow-sm border border-[#C8A951]/20">{t("salons_list.service")}</span>
              </div>
              <span className="absolute left-[18px] top-1/2 -translate-y-1/2 pointer-events-none text-[#1C3152]/60 transition-colors group-focus-within:text-[#1C3152]">
                <Search size={18} strokeWidth={2.5} />
              </span>
              <input
                className={`w-full h-12 pr-[16px] pl-[48px] rounded-xl border border-[#3c143212] bg-white/95 text-[#2a1020] text-[0.9rem] outline-none transition-all duration-200 focus:bg-white focus:border-[#7a2860]/40 focus:ring-4 focus:ring-[#7a2860]/5 font-[DM_Sans] placeholder:text-[#3c143260] placeholder:transition-all placeholder:duration-500 ${placeholderFade ? "placeholder:opacity-100 placeholder:translate-x-0" : "placeholder:opacity-0 placeholder:-translate-x-4"}`}
                type="text"
                placeholder={servicePlaceholders[servicePlaceholderIndex]}
                value={draftParams.serviceName}
                onChange={handleServiceChange}
                onFocus={() => { if (draftParams.serviceName.trim()) setShowSuggestions(true); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !loading) {
                    handleFetch();
                  }
                }}
              />
              {draftParams.serviceName && (
                <button 
                  onClick={() => {
                    setDraftParams(prev => ({ ...prev, serviceName: "" }));
                    setTimeout(handleFetch, 100);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[#3c143240] hover:text-[#7a2860] transition-colors"
                >
                  <X size={16} />
                </button>
              )}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border hero-filter-input-bg rounded-xl shadow-2xl z-[9999] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(s.name)}
                      className="w-full text-left px-5 py-3 text-sm salon-list-title-text hover:bg-[#cd6133]/5 transition-colors border-b hero-filter-input-bg last:border-0"
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Action Button */}
            <button
              onClick={handleFetch}
              disabled={loading}
              className="h-12 px-5 flex items-center justify-center gap-2 rounded-xl rec-btn-primary font-bold text-[0.85rem] tracking-wide transition-all duration-300 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Search size={18} strokeWidth={2.5} />
                  <span>{t("salons_list.search")}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Advanced Filter Control (Collapsible) ── */}
        <div className={`transition-all duration-500 ease-in-out relative z-[100] ${showFilters ? 'max-h-[800px] mb-6 md:mb-10 opacity-100 overflow-visible' : 'max-h-0 opacity-0 pointer-events-none overflow-hidden'}`}>
          <div className="p-4 md:p-6 rounded-[1.2rem] md:rounded-[1.5rem] border border-white/10 hero-filter-bar-bg backdrop-blur-sm shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 items-end mb-4 md:mb-6">
              {/* Location Picker */}
              <div className="lg:col-span-6 space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[9px] font-bold uppercase tracking-[0.2em] footer-link-text">{t("salons_list.near_your_location")}</label>
                </div>
                <LocationPicker
                  currentAddress={draftParams.address}
                  lat={draftParams.lat}
                  lng={draftParams.lng}
                  onLocationSelect={(loc) => {
                    setDraftParams(prev => ({ ...prev, ...loc }));
                    saveManualLocation(loc.lat, loc.lng, loc.address);
                  }}
                  onDetectLocation={() => {
                    // Custom implementation of detect location to update draft state
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        setDraftParams(prev => ({
                          ...prev,
                          lat: pos.coords.latitude,
                          lng: pos.coords.longitude,
                          address: "Detected Location"
                        }));
                        saveManualLocation(pos.coords.latitude, pos.coords.longitude, "Detected Location");
                      },
                      (err) => {
                        if (err.code === err.PERMISSION_DENIED) {
                          alert(t("salons_list.alert_location_denied"));
                        } else {
                          alert(t("salons_list.alert_location_failed"));
                        }
                      },
                      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
                    );
                  }}
                />
              </div>

              {/* Radius Select */}
              <div className="lg:col-span-3 space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[9px] font-bold uppercase tracking-[0.2em] footer-link-text">{t("salons_list.search_radius")}</label>
                  <span className="text-[9px] font-black hero-filter-icon bg-[#7a2860]/5 px-2 py-0.5 rounded-full">{draftParams.radius}km</span>
                </div>
                <div className="flex items-center h-11 px-5 rounded-xl border border-[#3c143212] bg-white group">
                  <input
                    type="range" min="1" max="100"
                    value={draftParams.radius}
                    onChange={(e) => setDraftParams(prev => ({ ...prev, radius: parseInt(e.target.value) }))}
                    className="w-full h-1.5 bg-[#1C3152]/10 rounded-lg appearance-none cursor-pointer accent-[#1C3152] slider-thumb-premium"
                  />
                </div>
              </div>

              {/* Time Select (Modal Trigger) */}
              <div className="lg:col-span-3 space-y-1.5 flex flex-col relative">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[9px] font-bold uppercase tracking-[0.2em] footer-link-text">{t("salons_list.appointment_time")}</label>
                </div>
                <div 
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsTimeModalOpen(true);
                  }}

                  className="flex items-center justify-between gap-1 h-11 px-4 rounded-xl border border-[#3c143212] bg-white cursor-pointer hover:border-[#cd6133]/30 transition-all duration-200"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="material-symbols-outlined text-gray-400 text-sm">calendar_today</span>
                    <span className="text-[10px] font-bold text-[#1C3152] truncate">
                      {draftParams.date ? `${draftParams.date} ${draftParams.startTime ? `@ ${draftParams.startTime}` : ''}` : t("salons_list.choose_datetime")}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-gray-400 text-sm">expand_more</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 items-end">
              {/* Category Select */}
              <div className="lg:col-span-5 space-y-1.5 flex flex-col">
                <label className="text-[9px] font-bold uppercase tracking-[0.2em] footer-link-text ml-1">{t("salons_list.category")}</label>
                <div className="relative">
                  <select
                    className="w-full h-11 px-4 pr-10 rounded-xl border hero-filter-input-bg about-section-bg salon-list-title-text text-[0.85rem] outline-none focus:border-[#cd6133] focus:ring-2 focus:ring-[#cd6133]/5 font-[DM_Sans] appearance-none"
                    value={draftParams.categoryId}
                    onChange={(e) => setDraftParams(prev => ({ ...prev, categoryId: e.target.value }))}
                  >
                    <option value="">{t("salons_list.choose_category")}</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#3c143240]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </span>
                </div>
              </div>

              {/* Service Name Box */}
              <div className="lg:col-span-5 space-y-1.5 flex flex-col">
                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#3c143240] ml-1">{t("salons_list.service_name")}</label>
                <div className="relative overflow-visible">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 footer-link-text">
                    <Search size={14} />
                  </span>
                  <input
                    className="w-full h-11 pl-9 pr-4 rounded-xl border hero-filter-input-bg about-section-bg salon-list-title-text text-[0.85rem] outline-none focus:border-[#cd6133] focus:ring-2 focus:ring-[#cd6133]/5 font-[DM_Sans]"
                    type="text"
                    placeholder={t("salons_list.service_placeholder")}
                    value={draftParams.serviceName}
                    onChange={handleServiceChange}
                    onFocus={() => { if (draftParams.serviceName.trim()) setShowSuggestions(true); }}
                    onKeyDown={(e) => {
                       if (e.key === "Enter" && hasChanges && !loading) {
                         handleFetch();
                       }
                    }}
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#3c143212] rounded-xl shadow-xl z-[9999] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                      {suggestions.map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(s.name)}
                          className="w-full text-left px-4 py-2.5 text-xs text-[#2a1020] hover:bg-[#cd6133]/5 transition-colors border-b border-[#3c143205] last:border-0"
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Fetch Button */}
              <div className="lg:col-span-2">
                <button
                  onClick={handleFetch}
                  disabled={loading || !hasChanges}
                  className={`w-full h-11 rounded-xl font-bold text-[0.7rem] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${loading || !hasChanges ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "rec-btn-primary hover:shadow-lg active:scale-95"}`}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Search size={14} />
                  )}
                  {loading ? t("salons_list.fetching") : t("salons_list.apply")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        {error ? (
          <div className={`text-center py-24 bg-white/50 rounded-[40px] border border-dashed ${error.toLowerCase().includes("location") ? "footer-divider" : "border-red-200"}`}>
            <div className={`w-20 h-20 ${error.toLowerCase().includes("location") ? "bg-[#3c1432]/5" : "bg-red-50"} rounded-full flex items-center justify-center mx-auto mb-6`}>
              {error.toLowerCase().includes("location") ? (
                <svg width={32} height={32} fill="none" stroke="#cd6133" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              ) : (
                <svg width={32} height={32} fill="none" stroke="#ef4444" strokeWidth={1.5} viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              )}
            </div>
            <h3 className="text-xl font-bold salon-list-title-text mb-2 font-[Cormorant_Garamond]">
              {error.toLowerCase().includes("location") ? t("salons_list.location_access_required") : t("salons_list.something_went_wrong")}
            </h3>
            <div className="flex justify-center">
              <p className="footer-link-text font-[DM_Sans] max-w-[400px] mx-auto">{error}</p>
            </div>
            
            <button
              onClick={error.toLowerCase().includes("location") ? () => window.location.reload() : retry}
              className="mt-6 px-8 py-3 hero-filter-btn-bg text-white rounded-xl font-bold hover:hero-filter-btn-hover-bg transition-colors font-[DM_Sans]"
            >
              {error.toLowerCase().includes("location") ? t("salons_list.retry_location_access") : t("salons_list.try_again")}
            </button>
          </div>
        ) : salons.length === 0 ? (
          <div className="text-center py-24 bg-white/50 rounded-[40px] border border-dashed footer-divider">
            <div className="w-20 h-20 bg-[#3c1432]/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg width={32} height={32} fill="none" stroke="#cd6133" strokeWidth={1.5} viewBox="0 0 24 24">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-bold salon-list-title-text mb-2 font-[Cormorant_Garamond]">{t("salons_list.no_salon_found")}</h3>
              <p className="footer-link-text font-[DM_Sans] max-w-[400px] mx-auto mb-6">{t("salons_list.no_salons_in_area_desc")}</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-white/50 rounded-[40px] border border-dashed footer-divider">
            <div className="w-20 h-20 bg-[#3c1432]/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg width={32} height={32} fill="none" stroke="#4b3621" strokeWidth={1.5} viewBox="0 0 24 24" className="opacity-40">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <h3 className="text-xl font-bold salon-list-title-text mb-2 font-[Cormorant_Garamond]">{t("salons_list.no_matches_found")}</h3>
            <p className="footer-link-text font-[DM_Sans]">{t("salons_list.adjust_search_filters_desc")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((salon) => (
              <SalonCard key={salon.id} salon={salon} />
            ))}
          </div>
        )}
      </div>
      <DateTimePickerModal
        isOpen={isTimeModalOpen}
        onClose={() => setIsTimeModalOpen(false)}
        date={draftParams.date}
        startTime={draftParams.startTime}
        endTime={draftParams.endTime}
        onApply={(d, st, et) => {
          setDraftParams(prev => ({ ...prev, date: d, startTime: st, endTime: et }));
        }}
      />
    </div>
  );
}