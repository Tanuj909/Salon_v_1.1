"use client";

import React, { useRef, useEffect, useState } from "react";
import { getBusinessCategoriesWithDetails, getServicesByCategoryForBusiness } from "../services/salonService";
import { useLanguage } from "@/context/LanguageContext";
import ImageSliderModal from "./ImageSliderModal";

// ─── Reveal Animation ──────────────────────────────────────────────────────────
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

// ─── Icons ─────────────────────────────────────────────────────────────────────
function ScissorsIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><line x1="20" y1="4" x2="8.12" y2="15.88" /><line x1="14.47" y1="14.48" x2="20" y2="20" /><line x1="8.12" y1="8.12" x2="12" y2="12" />
        </svg>
    );
}

// ─── Service Image Mapper ──────────────────────────────────────────────────────
const SERVICE_IMAGE_MAP = [
    // ── Salon / Beauty Services ──
    { keywords: ["beard", "trim"],          image: "/services/beardtrim.png" },
    { keywords: ["shav"],                   image: "/services/shaving.png" },
    { keywords: ["haircut", "hair cut", "cutting", "hair cutting"], image: "/services/haircut.png" },
    { keywords: ["hair color", "colour", "coloring", "colouring", "dye"], image: "/services/haircoloring.png" },
    { keywords: ["hair spa", "hairspa"],     image: "/services/hairspa.png" },
    { keywords: ["straighten", "straight", "rebond", "keratin", "smoothen"], image: "/services/hairstraighting.png" },
    { keywords: ["hair styl", "hairstyl", "blow dry", "blowdry", "blow-dry"], image: "/services/hairstyling.png" },
    { keywords: ["hair treat", "hairtreat", "botox", "protein"], image: "/services/hairtreatment.jpg" },
    { keywords: ["hair wash", "hairwash", "shampoo"], image: "/services/hairwash.png" },
    { keywords: ["head massage", "scalp"],  image: "/services/headmassage.png" },
    { keywords: ["facial", "face", "cleanup", "clean up", "clean-up"], image: "/services/facial.png" },
    { keywords: ["bleach"],                  image: "/services/bleach.png" },
    { keywords: ["detan", "de-tan", "de tan"], image: "/services/detan.png" },
    { keywords: ["manicur"],                 image: "/services/manicure.png" },
    { keywords: ["pedicur"],                 image: "/services/pedicure.png" },
    { keywords: ["nail art", "nailart"],     image: "/services/nailart.png" },
    { keywords: ["nail ext", "nailext", "acrylic nail", "gel nail"], image: "/services/nailextension.png" },
    { keywords: ["massage", "body mass"],    image: "/services/massage.png" },
    { keywords: ["threading", "thread", "eyebrow", "brow"], image: "/services/threading.png" },
    { keywords: ["wax"],                     image: "/services/waxing.png" },
    { keywords: ["makeup", "make up", "make-up", "bridal", "brdal"], image: "/services/hairstyling.png" },

    // ── Pet Services ──
    { keywords: ["pet groom", "dog groom", "cat groom", "pet haircut", "pet cut", "fur trim", "fur cut"], image: "/services/pet_grooming.jfif" },
    { keywords: ["pet bath", "pet spa", "dog bath", "cat bath", "dog spa", "cat spa", "pet wash", "dog wash"], image: "/services/pet_bath_Spa.jfif" },
    { keywords: ["pet board", "pet daycare", "dog board", "dog daycare", "cat board", "pet hostel", "pet sitting", "dog sitting"], image: "/services/pet_boarding_daycare.jfif" },
    { keywords: ["pet train", "dog train", "puppy train", "obedience", "pet behav"], image: "/services/pet_training.jfif" },
    { keywords: ["vet", "veterinar", "pet health", "pet check", "pet vaccin", "pet medical", "deworming", "tick", "flea"], image: "/services/vet_health_services.jfif" },
    { keywords: ["nail hygiene", "pet nail", "dog nail", "cat nail", "paw care", "nail care"], image: "/services/nail_hygiene_care.jfif" },

    // ── Generic fallbacks (keep last) ──
    { keywords: ["spa"],                     image: "/services/hairspa.png" },
    { keywords: ["hair"],                    image: "/services/haircut.png" },
    { keywords: ["nail"],                    image: "/services/nailart.png" },
];

function getServiceImage(serviceName) {
    if (!serviceName) return null;
    const name = serviceName.toLowerCase();
    for (const entry of SERVICE_IMAGE_MAP) {
        if (entry.keywords.some((kw) => name.includes(kw))) {
            return entry.image;
        }
    }
    return null;
}

// ─── Skeletons ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div className="w-full max-w-[340px] mx-auto bg-white border border-[#E2E8F0] rounded-[18px] p-6 h-64 flex flex-col justify-between animate-pulse">
            <div>
                <div className="flex justify-between items-center mb-4">
                    <div className="h-3 bg-[#E2E8F0] rounded w-1/4" />
                    <div className="h-4 bg-[#E2E8F0] rounded-full w-12" />
                </div>
                <div className="h-6 bg-[#E2E8F0] rounded w-3/4 mb-3" />
                <div className="h-3 bg-[#E2E8F0] rounded w-5/6 mb-2" />
                <div className="h-3 bg-[#E2E8F0] rounded w-2/3" />
            </div>
            <div className="h-10 bg-[#E2E8F0] rounded-xl w-full mt-6" />
        </div>
    );
}

// ─── Category Card ─────────────────────────────────────────────────────────────
function CategoryCard({ category, index, onClick }) {
    const { t } = useLanguage();
    return (
        <Reveal delay={index * 80}>
            <div 
                onClick={onClick}
                className="group w-full max-w-[340px] mx-auto bg-white rounded-[18px] border border-[#E2E8F0] overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col cursor-pointer relative"
            >
                {/* Visual Top Highlight */}
                <div className="h-2 bg-[#1C3152] w-full" />
                
                <div className="p-6 flex flex-col flex-1">
                    <div className="mb-4">
                        <div className="flex justify-between items-start gap-2 mb-2">
                            <span className="text-[10px] tracking-[0.18em] uppercase font-bold text-[#C49B66]">
                                {t("salon_details.category")}
                            </span>
                            <span className="bg-[#1C3152]/10 text-[#1C3152] text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                {category.serviceCount} {category.serviceCount === 1 ? t("salon_details.service_count") : t("salon_details.services_count")}
                            </span>
                        </div>
                        <h3 className="text-[24px] font-bold text-[#1C3152] tracking-[-0.3px] leading-tight font-[Cormorant_Garamond,serif] group-hover:text-[#C49B66] transition-colors duration-200">
                            {category.name}
                        </h3>
                    </div>

                    <p className="text-[13px] text-[#6B6B6B] leading-relaxed mb-6 line-clamp-2">
                        {category.description || t("salon_details.no_description_available")}
                    </p>

                    <div className="mt-auto pt-4 border-t border-[#E2E8F0]">
                        <div className="flex justify-between items-center text-[12px]">
                            <span className="text-[#6B6B6B]">{t("salon_details.price_range")}</span>
                            <span className="font-bold text-[#1C3152]">
                                AED {category.minPrice} - {category.maxPrice}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-[12px] mt-1">
                            <span className="text-[#6B6B6B]">{t("salon_details.avg_price")}</span>
                            <span className="font-semibold text-[#C49B66]">
                                AED {category.avgPrice}
                            </span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <button
                            onClick={(e) => { e.stopPropagation(); onClick(); }}
                            className="rec-btn-primary w-full py-3 rounded-xl border-0 text-xs font-bold cursor-pointer tracking-[0.06em] uppercase flex items-center justify-center gap-2 group-hover:bg-[#16263F] transition-all duration-300"
                        >
                            {t("salon_details.view_services_btn")}
                            <svg className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </Reveal>
    );
}

// ─── Service Card ──────────────────────────────────────────────────────────────
function ServiceCard({ service, index, onBookNow, salon, onOpenSlider, onOpenDescription }) {
    const { t } = useLanguage();
    const salonName = salon?.name || "Glamour Studio";
    const salonCategory = salon?.category?.name || "Premium Salon";
    
    // Choose service image using priority: imageUrls[0] -> imageUrl -> helper mapped fallback
    const serviceImage = (service.imageUrls && service.imageUrls.length > 0)
        ? service.imageUrls[0]
        : (service.imageUrl || getServiceImage(service.name));
    
    // Fallback list of slider images if imageUrls is null
    const sliderImages = (service.imageUrls && service.imageUrls.length > 0)
        ? service.imageUrls
        : (service.imageUrl ? [service.imageUrl] : (serviceImage ? [serviceImage] : []));

    return (
        <Reveal delay={index * 80}>
            <div className="group w-full max-w-[340px] mx-auto service-card-bg rounded-[18px] border border-[#E2E8F0] overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col relative">

                {/* Header */}
                <div className="service-card-header-bg p-4 sm:p-[0.9rem_1.25rem] shrink-0">
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-[9px] min-w-0">
                            <div className="w-7 h-7 rounded-lg service-card-logo-bg flex items-center justify-center shrink-0">
                                <ScissorsIcon />
                            </div>
                            <div className="min-w-0">
                                <p className="service-card-salon-name text-[13px] font-medium m-0 leading-tight truncate">{salonName}</p>
                                <p className="service-card-salon-sub text-[10px] m-0 tracking-[0.05em] truncate uppercase">{salonCategory}</p>
                            </div>
                        </div>
                        {service.durationMinutes && (
                            <div className="shrink-0 flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-lg px-2 py-1">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                                <p className="text-[10px] font-bold text-white m-0">{service.durationMinutes}m</p>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 min-h-[22px]">
                        {service.isPopular && (
                            <span className="service-card-badge-popular text-[10px] px-[9px] py-[3px] rounded-full font-medium whitespace-nowrap">★ Popular</span>
                        )}
                    </div>
                </div>

                {/* Body */}
                <div className="p-[1.25rem_1.25rem_1.4rem] flex flex-col flex-1">

                    {/* Service Label + Title + Image */}
                    <div className="pb-4 mb-4 flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                            <p className="rec-section-heading-accent text-[10px] tracking-[0.18em] uppercase font-bold mb-[5px]">{t("salon_details.category")}</p>
                            <h2 className="rec-section-heading text-[24px] font-bold m-0 tracking-[-0.3px] leading-tight line-clamp-2 font-[Cormorant_Garamond,serif]">
                                {service.name}
                            </h2>
                        </div>
                        {serviceImage && (
                            <div
                                className="w-[72px] h-[72px] rounded-2xl overflow-hidden shrink-0 shadow-lg border border-[#E2E8F0] cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95 relative group/img"
                                onClick={() => {
                                    if (sliderImages.length > 0) {
                                        onOpenSlider(sliderImages, 0);
                                    }
                                }}
                                title={t("salon_details.view")}
                            >
                                <img
                                    src={serviceImage}
                                    alt={service.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    loading="lazy"
                                />
                                {sliderImages.length > 1 && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity duration-200">
                                        <span className="text-[10px] text-white font-bold bg-black/60 px-1.5 py-0.5 rounded-md">
                                            +{sliderImages.length - 1}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Description Section */}
                    {service.description && (
                        <div className="flex items-center gap-1.5 mb-4 text-[12px] sm:text-[13px] text-[#6B6B6B] w-full min-w-0 font-[DM_Sans]">
                            <span className="truncate flex-1">
                                {service.description}
                            </span>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenDescription(service);
                                }}
                                className="text-[#C49B66] font-bold hover:underline text-[12px] bg-transparent border-0 p-0 cursor-pointer shrink-0"
                            >
                                {t("salon_details.view")}
                            </button>
                        </div>
                    )}

                    {/* Price Section */}
                    <div className="mb-6 flex items-center justify-between border-t border-[#E2E8F0] pt-4 mt-auto">
                        <span className="text-[12px] font-bold rec-section-heading font-[Cormorant_Garamond,serif] uppercase tracking-wider">
                            {t("salon_details.price")}
                        </span>
                        <div>
                            <span className="text-[16px] font-bold text-[#C49B66] font-[Cormorant_Garamond,serif]">
                                {service.startPrice && service.endPrice && service.startPrice !== service.endPrice ? (
                                    `AED (${service.startPrice} - ${service.endPrice})`
                                ) : (
                                    `AED ${service.price || service.startPrice}`
                                )}
                            </span>
                        </div>
                    </div>

                    {/* CTA Button & Footer */}
                    <div className="mt-auto">
                        <button
                            onClick={() => onBookNow?.(service)}
                            className="rec-btn-primary w-full p-[14px] rounded-xl border-0 text-sm font-bold cursor-pointer tracking-[0.04em] transition-all duration-300 hover:shadow-xl active:scale-[0.98]"
                        >
                            {t("salon_details.book_service")}
                        </button>
                    </div>
                </div>
            </div>
        </Reveal>
    );
}


// ─── Description Preview Modal ──────────────────────────────────────────────────
function DescriptionModal({ service, onClose }) {
    const { t } = useLanguage();
    if (!service) return null;

    return (
        <div 
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity duration-300"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl relative border border-[#E2E8F0] animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 flex items-center justify-center cursor-pointer transition-all"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                <div className="space-y-4">
                    <span className="text-[10px] tracking-[0.18em] uppercase font-bold text-[#C49B66]">
                        {t("salons_list.service")}
                    </span>
                    <h3 className="text-[24px] font-bold text-[#1C3152] tracking-[-0.3px] leading-tight font-[Cormorant_Garamond,serif] pr-6">
                        {service.name}
                    </h3>
                    <div className="h-px bg-gray-100 w-full" />
                    <p className="text-[14px] text-[#4A4A4A] leading-relaxed font-[DM_Sans]">
                        {service.description}
                    </p>
                    <div className="pt-2 flex justify-end">
                        <button
                            onClick={onClose}
                            className="rec-btn-primary px-6 py-2.5 rounded-xl border-0 text-xs font-bold cursor-pointer tracking-[0.04em] uppercase"
                        >
                            {t("salon_details.close")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────
const SalonServices = ({ salon, onBookService }) => {
    const { t, currentLanguage } = useLanguage();
    // Categories States
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [categoriesError, setCategoriesError] = useState(null);

    // Selected Category Services States
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categoryServices, setCategoryServices] = useState([]);
    const [loadingServices, setLoadingServices] = useState(false);
    const [servicesError, setServicesError] = useState(null);

    // Image Slider Lightbox States
    const [sliderImages, setSliderImages] = useState(null);
    const [currentSliderIndex, setCurrentSliderIndex] = useState(0);

    // Description Modal States
    const [descModalService, setDescModalService] = useState(null);

    // Initial load: fetch business categories
    useEffect(() => {
        if (!salon?.id) {
            setLoadingCategories(false);
            return;
        }

        const fetchCategories = async () => {
            setLoadingCategories(true);
            setCategoriesError(null);
            try {
                const data = await getBusinessCategoriesWithDetails(salon.id);
                setCategories(data || []);
            } catch (err) {
                console.error("Error fetching categories:", err);
                setCategoriesError("Failed to fetch service categories.");
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchCategories();
    }, [salon?.id]);

    // Handle Category Card Click: fetch category-specific services
    const handleSelectCategory = async (category) => {
        setSelectedCategory(category);
        setLoadingServices(true);
        setServicesError(null);
        try {
            const data = await getServicesByCategoryForBusiness(salon.id, category.id);
            setCategoryServices(data || []);
        } catch (err) {
            console.error("Error fetching category services:", err);
            setServicesError("Failed to fetch services for this category.");
        } finally {
            setLoadingServices(false);
        }
    };

    // Return to Categories Directory
    const handleBackToCategories = () => {
        setSelectedCategory(null);
        setCategoryServices([]);
        setServicesError(null);
    };

    // Image Slider handlers
    const openSlider = (images, index) => {
        setSliderImages(images);
        setCurrentSliderIndex(index);
    };

    const handlePrevSlider = () => {
        if (!sliderImages) return;
        setCurrentSliderIndex((prev) => (prev === 0 ? sliderImages.length - 1 : prev - 1));
    };

    const handleNextSlider = () => {
        if (!sliderImages) return;
        setCurrentSliderIndex((prev) => (prev === sliderImages.length - 1 ? 0 : prev + 1));
    };

    const handleSelectSliderIndex = (idx) => {
        setCurrentSliderIndex(idx);
    };

    // Determine content if API is completely empty
    const hasCategories = categories.length > 0;

    if (!loadingCategories && !hasCategories) {
        return null; // hide if completely empty
    }

    return (
        <section className="py-6 sm:py-8 relative overflow-hidden" id="services">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
                <Reveal>
                    <div className="text-center mb-16 sm:mb-20 relative">
                        <span className="rec-badge-top-rated-bg inline-block px-5 py-2 rounded-full text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-bold mb-5 shadow-sm">
                            {t("salon_details.pricing_rituals")}
                        </span>
                        <h2 className="rec-section-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight font-[Cormorant_Garamond,serif]">
                            {t("salon_details.our_services").split(' ')[0]} <em className="italic font-light rec-section-heading-accent">{t("salon_details.our_services").split(' ').slice(1).join(' ')}</em>
                        </h2>
                        <div className="flex items-center justify-center gap-3">
                            <div className="rec-section-divider w-16 h-[1.5px] rounded-full opacity-40" />
                            <div className="w-2 h-2 rounded-full rec-badge-top-rated-bg" />
                            <div className="rec-section-divider w-16 h-[1.5px] rounded-full opacity-40" />
                        </div>
                    </div>
                </Reveal>

                {/* Loader State for Categories */}
                {loadingCategories && (
                    <div className="grid grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                )}

                {/* Categories Grid (Selected Category is NULL) */}
                {!loadingCategories && !categoriesError && !selectedCategory && hasCategories && (
                    <div className="grid grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {categories.map((category, i) => (
                            <CategoryCard
                                key={category.id || i}
                                category={category}
                                index={i}
                                onClick={() => handleSelectCategory(category)}
                            />
                        ))}
                    </div>
                )}

                {/* Services Grid for Selected Category */}
                {!loadingCategories && selectedCategory && (
                    <div className="space-y-6">
                        {/* Header controls for selected category */}
                        <Reveal>
                            <div className="flex flex-col gap-6 mb-10 pb-6 border-b border-[#E2E8F0]">
                                <button
                                    onClick={handleBackToCategories}
                                    className="inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-widest text-[#1C3152] hover:text-[#C49B66] bg-white border border-[#E2E8F0] shadow-sm hover:shadow px-4 py-2.5 rounded-full transition-all duration-300 cursor-pointer self-start group/back"
                                >
                                    <svg 
                                        width="14" 
                                        height="14" 
                                        viewBox="0 0 24 24" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        strokeWidth="3" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                        className="transform group-hover/back:-translate-x-0.5 transition-transform duration-200"
                                    >
                                        <line x1="19" y1="12" x2="5" y2="12" />
                                        <polyline points="12 19 5 12 12 5" />
                                    </svg>
                                    {t("salon_details.back_to_categories")}
                                </button>
                                <div className="text-left space-y-2">
                                    <div className="inline-flex items-center gap-2">
                                        <span className="h-[1px] w-6 bg-[#C49B66] opacity-60" />
                                        <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#C49B66]">
                                            {t("salon_details.selected_category")}
                                        </span>
                                    </div>
                                    <h3 className="text-3xl sm:text-4xl font-bold text-[#1C3152] tracking-tight font-[Cormorant_Garamond,serif] leading-tight">
                                        {selectedCategory.name}
                                    </h3>
                                    {selectedCategory.description && (
                                        <p className="text-[13px] sm:text-sm text-[#6B6B6B] max-w-2xl leading-relaxed font-medium italic">
                                            {selectedCategory.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Reveal>

                        {/* Loader State for Services */}
                        {loadingServices && (
                            <div className="grid grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <SkeletonCard key={i} />
                                ))}
                            </div>
                        )}

                        {/* Services Content */}
                        {!loadingServices && !servicesError && (
                            <div className="grid grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                                {categoryServices.map((service, i) => (
                                    <ServiceCard
                                        key={service.id || i}
                                        service={service}
                                        index={i}
                                        onBookNow={onBookService}
                                        salon={salon}
                                        onOpenSlider={openSlider}
                                        onOpenDescription={setDescModalService}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Services Error */}
                        {servicesError && (
                            <div className="text-center py-12">
                                <p className="text-red-500 font-medium mb-3">{t("salon_details.no_services_category")}</p>
                                <button onClick={() => handleSelectCategory(selectedCategory)} className="rec-btn-primary px-4 py-2 rounded-xl text-xs font-bold">
                                    {t("salon_details.retry")}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Categories Error */}
                {categoriesError && (
                    <div className="text-center py-12">
                        <p className="text-red-500 font-medium mb-3">{t("salon_details.no_categories")}</p>
                        <button
                            onClick={() => {
                                setCategoriesError(null);
                                setLoadingCategories(true);
                                getBusinessCategoriesWithDetails(salon.id)
                                    .then((data) => setCategories(data || []))
                                    .catch(() => setCategoriesError(t("salon_details.no_categories")))
                                    .finally(() => setLoadingCategories(false));
                            }}
                            className="rec-btn-primary px-4 py-2 rounded-xl text-xs font-bold"
                        >
                            {t("salon_details.retry")}
                        </button>
                    </div>
                )}
            </div>

            {/* Slider Fullscreen Lightbox */}
            {sliderImages && (
                <ImageSliderModal
                    images={sliderImages}
                    currentIndex={currentSliderIndex}
                    onClose={() => setSliderImages(null)}
                    onPrev={handlePrevSlider}
                    onNext={handleNextSlider}
                    onIndexSelect={handleSelectSliderIndex}
                />
            )}

            {/* Description Details Modal */}
            {descModalService && (
                <DescriptionModal
                    service={descModalService}
                    onClose={() => setDescModalService(null)}
                />
            )}
        </section>
    );
};

export default SalonServices;