
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

const AboutSection = ({ description, images }) => {
    const { t } = useLanguage();
    const hasImages = images && images.length > 0;
    const displayImages = hasImages ? images.slice(0, 2) : [];

    return (
        <section className="py-8 sm:py-12 px-4 sm:px-8 max-w-7xl mx-auto overflow-hidden" id="about">
            <div className={hasImages ? "grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16" : "max-w-4xl mx-auto text-center"}>
                {/* Left Side - Content */}
                <Reveal>
                    <div className={hasImages ? "text-left lg:mt-[-20px]" : "text-center"}>
                        <span className="block text-[10px] sm:text-[11px] tracking-[0.3em] sm:tracking-[0.4em] uppercase rec-section-heading-accent font-extrabold mb-4 sm:mb-5">
                            {t("salon_details.our_legacy")}
                        </span>
                        <h2 className="text-[26px] sm:text-4xl md:text-5xl rec-section-heading font-bold leading-tight mb-4 sm:mb-5 font-[Cormorant_Garamond,Georgia,serif]">
                            {t("salon_details.about")} <em className="italic font-light rec-section-heading-accent">{t("salon_details.us")}</em>
                        </h2>
                        <p className="rec-section-subtext text-sm sm:text-base md:text-lg leading-relaxed font-medium">
                            {description}
                        </p>
                        
                        {/* Decorative element */}
                        <div className={`mt-5 sm:mt-6 w-12 sm:w-16 h-0.5 rec-section-divider ${hasImages ? "" : "mx-auto"}`}></div>
                    </div>
                </Reveal>

                {/* Right Side - Images with overlap */}
                {hasImages && (
                    <Reveal delay={200}>
                        <div className="relative h-[350px] sm:h-[450px] w-full max-w-[500px] mx-auto lg:mx-0 mt-8 lg:mt-0 px-4">
                            {displayImages.length >= 2 ? (
                                <>
                                    {/* Second Image */}
                                    <div className="absolute top-8 left-0 w-[58%] aspect-[4/5] overflow-hidden rounded-2xl shadow-xl z-10 border-4 border-white">
                                        <img 
                                            src={displayImages[1]} 
                                            alt="Salon ambiance"
                                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-1000"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                                    </div>
            
                                    {/* First Image */}
                                    <div className="absolute top-0 left-[42%] w-[58%] aspect-[4/5] overflow-hidden rounded-2xl shadow-2xl z-20 border-4 border-white">
                                        <img 
                                            src={displayImages[0]} 
                                            alt="Salon service"
                                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-1000"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                                    </div>
                                </>
                            ) : (
                                // Single Image
                                <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-2xl shadow-2xl border-4 border-white">
                                    <img 
                                        src={displayImages[0]} 
                                        alt="Salon service"
                                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-1000"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                                </div>
                            )}

                            {/* Subtle decorative elements */}
                            <div className="absolute -top-4 -right-4 w-24 h-24 badge-verified-bg rounded-full blur-2xl -z-10 opacity-10"></div>
                            <div className="absolute -bottom-4 -left-4 w-24 h-24 rec-section-heading-accent rounded-full blur-2xl -z-10 opacity-5"></div>
                        </div>
                    </Reveal>
                )}
            </div>
        </section>
    );
};

export default AboutSection;