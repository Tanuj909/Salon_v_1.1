"use client";

import React, { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

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

function useParallax() {
    const ref = useRef(null);
    useEffect(() => {
        const handleScroll = () => {
            if (ref.current) {
                const scrollY = window.scrollY;
                const element = ref.current;
                const speed = 0.3;
                element.style.transform = `translateY(${scrollY * speed}px)`;
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    return ref;
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

function Badge({ children, variant = "gold" }) {
    const variants = {
        gold: "rec-badge-top-rated-bg",
        outline: "bg-transparent border rec-card-btn rec-card-btn-text",
        glass: "backdrop-blur-md bg-white/10 text-white border border-white/20",
        plum: "rec-btn-primary",
    };

    return (
        <span
            className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[8.5px] sm:text-[9.5px] font-bold tracking-widest uppercase ${variants[variant]}`}
        >
            {children}
        </span>
    );
}

const HeroSection = ({ salonImg, salon, handleBookButtonClick }) => {
    const heroRef = useParallax();
    const { t } = useLanguage();

    const toTitleCase = (str) => {
        if (!str) return "";
        return str.toLowerCase().split(' ').map(word => {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');
    };

    return (
        <section className="relative min-h-[60vh] md:h-[50vh] md:min-h-[450px] overflow-hidden flex flex-col pt-28 sm:pt-24 md:pt-[7%] pb-12">
            <div ref={heroRef} className="absolute inset-0">
                {salonImg && <img src={salonImg} alt={salon.name} className="w-full h-full object-cover" />}
                {/* More prominent dark plum gradient overlay for better navbar contrast */}
                <div className="absolute inset-0 salon-detail-hero-overlay" />
            </div>

            <div className="relative z-10 flex items-center px-4 sm:px-10 md:px-16 lg:px-24">
                <div className="max-w-5xl text-[#fef9f3] w-full">

                    <Reveal delay={200}>
                        <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-4 md:mb-2 text-white">
                            {salon.verificationStatus === "VERIFIED" && (
                                <Badge variant="gold">
                                    <svg width={12} height={12} viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                    </svg>
                                    {t("salon_details.verified_studio")}
                                </Badge>
                            )}
                            <Badge variant="gold">
                                {salon.isOpen ? t("salon_details.open_now") : t("salon_details.closed")}
                            </Badge>
                        </div>
                    </Reveal>

                    <Reveal delay={300}>
                        <div className="inline-block rec-badge-top-rated-bg px-6 py-1.5 rounded-[2rem] border-2 mb-4">
                            <h1 className="font-bold leading-[1.1] tracking-tight font-[Cormorant_Garamond,Georgia,serif] m-0"
                                style={{ fontSize: "clamp(20px,4.5vw,48px)", color: "#C49B66" }}>
                                {toTitleCase(salon.name)}
                            </h1>
                        </div>
                    </Reveal>

                    <Reveal delay={400}>
                        <div className="flex flex-col gap-4 md:gap-6 mb-6 md:mb-8">
                            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-10">
                                {/* Premium Rating with Background */}
                                <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 w-fit">
                                    <div className="flex items-center gap-1 text-[#C49B66]">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <svg key={i} width={14} height={14} className="md:w-[16px] md:h-[16px]" viewBox="0 0 24 24" fill={i < Math.round(salon.averageRating || 0) ? "currentColor" : "rgba(255,255,255,0.2)"}>
                                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <span className="text-[9px] md:text-[11px] font-bold uppercase tracking-widest text-white">
                                        {salon.totalReviews > 0 ? `${salon.averageRating.toFixed(1)} / ${salon.totalReviews} ${t("salon_details.reviews")}` : t("salon_details.new_experience")}
                                    </span>
                                </div>
                            </div>

                            {/* Location & Categories Row */}
                            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                                {/* Compact Location Tag */}
                                {salon.city && (
                                    <div className="flex items-center gap-2.5 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 group hover:bg-black/60 transition-all">
                                        <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
                                            <svg className="w-2.5 h-2.5 text-[#C49B66]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                <circle cx="12" cy="10" r="3" />
                                            </svg>
                                        </div>
                                        <span className="text-[9px] sm:text-[10px] md:text-[12px] font-bold uppercase tracking-widest text-white whitespace-nowrap">
                                            {salon.city}, {salon.country}
                                        </span>
                                    </div>
                                )}

                                {/* Inline Categories */}
                                {salon.categories && salon.categories.length > 0 && (
                                    <div className="flex flex-wrap gap-2 md:gap-3">
                                        {salon.categories
                                            .map((cat, i) => (
                                                <div key={cat.id || i} className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#C49B66]" />
                                                    <span className="text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-white">{cat.name}</span>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Reveal>

                    <Reveal delay={500}>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 mt-0">
                            <button
                                onClick={handleBookButtonClick}
                                className="w-full sm:w-auto group relative px-10 py-4 rounded-full rec-btn-primary text-[#C49B66] text-[13px] sm:text-[16px] font-black tracking-[0.2em] uppercase overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 border-0 cursor-pointer text-center"
                            >
                                <span className="relative z-10">{t("salon_details.book_appointment")}</span>
                                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                <div className="glow-line" />
                            </button>
                            <a
                                href="#services"
                                className="w-full sm:w-auto relative flex items-center justify-center group px-8 py-3.5 rounded-full border border-white/40 text-white text-[11px] sm:text-[13px] font-black tracking-[0.2em] uppercase transition-all duration-500 hover:bg-white text-center overflow-hidden"
                            >
                                <span className="relative z-10 transition-colors duration-300 group-hover:text-black">{t("salon_details.view_services")}</span>
                                <div className="glow-line" />
                            </a>
                        </div>
                    </Reveal>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 hidden md:block">
                <div className="w-px h-24 bg-gradient-to-b from-white/40 to-transparent relative">
                    <div className="absolute top-0 left-0 w-full h-full hero-filter-btn-bg origin-top animate-[scroll_2s_infinite]" />
                </div>
            </div>

            <style jsx>{`
        @keyframes scroll {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(300%); }
        }
        @keyframes glow-sweep {
          0% { left: -100%; }
          50% { left: 100%; }
          100% { left: 100%; }
        }
        .glow-line {
          position: absolute;
          top: 0;
          left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(
            to right,
            transparent,
            rgba(255, 255, 255, 0.2),
            rgba(255, 255, 255, 0.4),
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transform: skewX(-25deg);
          animation: glow-sweep 3s infinite ease-in-out;
          pointer-events: none;
        }
      `}</style>
        </section>
    );
};

export default HeroSection;