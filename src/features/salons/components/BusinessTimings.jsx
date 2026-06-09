"use client";

import React, { useRef, useEffect, useState } from "react";
import { Clock } from "lucide-react";
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

const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hoursStr, minutesStr] = timeString.split(":");
    let hours = parseInt(hoursStr, 10);
    const minutes = minutesStr;
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
};

const BusinessTimings = ({ timings, compact = false }) => {
    const { t } = useLanguage();
    if (!timings || timings.length === 0) return null;

    const daysOfWeek = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
    const currentDay = new Date().toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();

    return (
        <section className={compact ? "h-full" : "py-40"} id="timings">
            <div className={compact ? "h-full" : "max-w-7xl mx-auto px-4 sm:px-8"}>
                {!compact && (
                    <Reveal>
                        <div className="text-center mb-24">
                            <span className="block text-[11px] tracking-[0.4em] uppercase rec-section-heading-accent font-extrabold mb-8">{t("salon_details.plan_your_visit")}</span>
                            <h2 className="text-6xl rec-section-heading font-bold leading-tight font-[Cormorant_Garamond,serif]">
                                {t("salon_details.opening")} <em className="italic font-light rec-section-heading-accent">{t("salon_details.hours")}</em>
                            </h2>
                        </div>
                    </Reveal>
                )}

                <div className={`${compact ? 'p-3 sm:p-8 md:p-12 rounded-2xl sm:rounded-[48px] h-full flex flex-col justify-center' : 'max-w-3xl mx-auto rounded-3xl sm:rounded-[64px] p-6 sm:p-12 md:p-20'} bg-white border hero-filter-input-bg shadow-lg relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 sm:w-48 h-32 sm:h-48 badge-verified-bg opacity-5 rounded-full -translate-y-1/2 translate-x-1/2" />

                    <div className={compact ? "space-y-3" : "space-y-6"}>
                        {daysOfWeek.map((day) => {
                            const timing = timings.find(t => t.dayOfWeek === day);
                            const isSelected = day === currentDay;
                            
                            // Map DAY English string to key in translations.js
                            const dayTranslationKey = `salon_details.days.${day}`;

                            return (
                                <div
                                    key={day}
                                    className={`flex items-center justify-between transition-all duration-500 ${compact ? 'p-2 sm:p-5 rounded-xl sm:rounded-[24px]' : 'p-4 sm:p-8 rounded-2xl sm:rounded-[32px]'
                                        } ${isSelected
                                            ? "rec-btn-primary shadow-xl sm:shadow-2xl scale-[1.02] sm:scale-[1.05] z-10 relative"
                                            : "hover:bg-[#1C3152]/5 rec-section-heading"
                                        }`}
                                >
                                    <div className="flex items-center gap-1.5 sm:gap-4 truncate mr-1.5 min-w-0">
                                        <span className={`${compact ? 'text-[10px] sm:text-sm' : 'text-xs sm:text-lg'} font-bold tracking-wider sm:tracking-widest uppercase truncate ${isSelected ? "text-white" : "rec-section-heading"}`}>
                                            {t(dayTranslationKey)}
                                        </span>
                                        {isSelected && (
                                            <span className={`${compact ? 'text-[7.5px] sm:text-[10px]' : 'text-[9px] sm:text-[11px]'} bg-white/20 px-2 py-0.5 rounded-full uppercase font-extrabold tracking-wider sm:tracking-widest animate-pulse text-white`}>
                                                {t("salon_details.today")}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {!timing || timing.isClosed ? (
                                            <span className={`${compact ? 'text-[10px] sm:text-xs' : 'text-xs sm:text-sm'} font-extrabold uppercase tracking-wider sm:tracking-widest ${isSelected ? "text-[#fef9f3]/70" : "salon-list-title-accent"}`}>
                                                {t("salon_details.closed")}
                                            </span>
                                        ) : (
                                            <div className={`flex items-center ${compact ? 'gap-1 sm:gap-4' : 'gap-3 sm:gap-8'} shrink-0`}>
                                                <span className={`${compact ? 'text-[9px] min-[360px]:text-xs sm:text-sm' : 'text-xs sm:text-base'} font-bold whitespace-nowrap ${isSelected ? "text-white" : "rec-section-heading"}`}>
                                                    {formatTime(timing.openTime)} - {formatTime(timing.closeTime)}
                                                </span>
                                                <div className={`${compact ? 'hidden min-[380px]:flex w-6 h-6 sm:w-8 sm:h-8' : 'w-8 h-8 sm:w-10 sm:h-10'} rounded-full flex items-center justify-center shrink-0 ${isSelected ? "bg-white/20" : "rec-badge-top-rated-bg opacity-20"}`}>
                                                    <Clock className={compact ? "w-3 h-3 sm:w-4 sm:h-4" : "w-4 h-4 sm:w-5 sm:h-5"} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BusinessTimings;
