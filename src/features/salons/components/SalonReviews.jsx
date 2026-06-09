"use client";

import React, { useRef, useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

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

// ─── Main Component ────────────────────────────────────────────────────────────
const SalonReviews = ({ reviews }) => {
    const { t } = useLanguage();
    if (!reviews) return null;

    return (
        <section className="py-8 sm:py-12" id="reviews">
            <div className="max-w-7xl mx-auto px-4 sm:px-8">
                <Reveal>
                    <div className="text-center mb-16 sm:mb-24 relative">
                        <span className="rec-badge-top-rated-bg inline-block px-5 py-2 rounded-full text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-bold mb-5 shadow-sm">
                            {t("salon_details.testimonials")}
                        </span>
                        <h2 className="text-[22px] sm:text-4xl md:text-6xl rec-section-heading font-bold leading-tight tracking-tight font-[Cormorant_Garamond,serif]">
                            {t("salon_details.what_clients_say").split(' ').slice(0, 3).join(' ')} <em className="italic font-light rec-section-heading-accent">{t("salon_details.what_clients_say").split(' ').slice(3).join(' ')}</em>
                        </h2>
                        <div className="flex items-center justify-center gap-3">
                            <div className="rec-section-divider w-16 h-[1.5px] rounded-full opacity-40" />
                            <div className="w-2 h-2 rounded-full rec-badge-top-rated-bg" />
                            <div className="rec-section-divider w-16 h-[1.5px] rounded-full opacity-40" />
                        </div>
                    </div>
                </Reveal>

                {reviews.length === 0 ? (
                    <div className="text-center py-16 sm:py-24 px-4 bg-white/30 rounded-[32px] sm:rounded-[40px] border hero-filter-input-bg">
                        <p className="footer-link-text opacity-70 italic text-lg sm:text-xl">{t("salon_details.no_reviews_yet")}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
                        {reviews.map((review, i) => (
                            <Reveal key={review.id || i} delay={i * 100}>
                                <div className="bg-white p-6 sm:p-10 rounded-3xl sm:rounded-[48px] border hero-filter-input-bg shadow-md hover:shadow-xl transition-all duration-500 h-full flex flex-col group">
                                    <div className="flex items-center gap-4 sm:gap-5 mb-6">
                                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 hero-filter-input-bg shrink-0">
                                            <img
                                                src={review.customer?.profileImageUrl || "https://ui-avatars.com/api/?name=" + (review.customer?.fullName || "User") + "&background=1C3152&color=ffffff"}
                                                alt={review.customer?.fullName}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                                <h4 className="font-bold salon-list-title-text text-lg leading-tight">{review.customer?.fullName}</h4>
                                                <div className="flex items-center gap-0.5">
                                                    {Array.from({ length: 5 }).map((_, starI) => (
                                                        <svg key={starI} width={14} height={14} viewBox="0 0 24 24" fill={starI < review.rating ? "currentColor" : "rgba(0,0,0,0.1)"} className={starI < review.rating ? "rec-section-heading-accent" : "text-gray-200"}>
                                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                                        </svg>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] uppercase tracking-wider font-bold rec-section-heading-accent opacity-80">
                                                <span>{review.business?.name}</span>
                                                {review.staff && (
                                                    <span className="flex items-center gap-1">
                                                        <span className="w-1 h-1 rounded-full rec-section-divider" />
                                                        {t("salon_details.staff_label")}{review.staff.fullName}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <p className="salon-list-title-text text-sm sm:text-base leading-relaxed mb-6 italic flex-1 opacity-80 break-words line-clamp-4">
                                        "{review.comment}"
                                    </p>
                                    
                                    <div className="flex items-center justify-between pt-6 border-t hero-filter-input-bg text-[9px] sm:text-[10px] font-bold uppercase tracking-widest footer-link-text opacity-40">
                                        <span className="flex items-center gap-1.5">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-green-600/60">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                            {t("salon_details.verified_experience")}
                                        </span>
                                        <span>{new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                )}


            </div>
        </section>
    );
};

export default SalonReviews;