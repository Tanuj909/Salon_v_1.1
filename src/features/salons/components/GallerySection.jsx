"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function GallerySection({ images }) {
    const { t } = useLanguage();
    const [activeIndex, setActiveIndex] = useState(null);

    if (!images || images.length === 0) return null;

    const handlePrev = () => {
        setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    return (
        <section className="py-8 sm:py-12 px-4 sm:px-8 max-w-7xl mx-auto" id="gallery">
            <div className="text-center mb-8 sm:mb-12">
                <span className="block text-[10px] sm:text-[11px] tracking-[0.3em] sm:tracking-[0.4em] uppercase rec-section-heading-accent font-extrabold mb-3">
                    {t("home.our_gallery") || "Our Gallery"}
                </span>
                <h2 className="text-[26px] sm:text-4xl md:text-5xl rec-section-heading font-bold leading-tight font-[Cormorant_Garamond,Georgia,serif]">
                    {t("home.our_gallery") ? t("home.our_gallery").split(' ')[0] : "Our"} <em className="italic font-light rec-section-heading-accent">{t("home.our_gallery") ? t("home.our_gallery").split(' ').slice(1).join(' ') : "Gallery"}</em>
                </h2>
                <div className="mt-4 w-12 sm:w-16 h-0.5 rec-section-divider mx-auto"></div>
            </div>

            {/* Premium Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {images.map((img, idx) => (
                    <div 
                        key={idx}
                        onClick={() => setActiveIndex(idx)}
                        className="group relative aspect-square rounded-2xl overflow-hidden shadow-md cursor-pointer border-2 border-white hover:border-[#C49B66] hover:shadow-xl transition-all duration-300 animate-in fade-in zoom-in-95 duration-350"
                    >
                        <img 
                            src={img} 
                            alt={`Gallery image ${idx + 1}`}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <span className="text-white bg-black/60 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase">
                                {t("salon_details.view") || "View"}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Lightbox Modal */}
            {activeIndex !== null && (
                <div 
                    className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-md transition-opacity duration-300 animate-in fade-in duration-200"
                    onClick={() => setActiveIndex(null)}
                >
                    {/* Close Button */}
                    <button 
                        onClick={() => setActiveIndex(null)}
                        className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 z-[100000]"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>

                    {/* Previous Button */}
                    {images.length > 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                            className="absolute left-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 z-[100000]"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12" />
                                <polyline points="12 19 5 12 12 5" />
                            </svg>
                        </button>
                    )}

                    {/* Main Image Container */}
                    <div 
                        className="max-w-[90%] max-h-[80%] flex items-center justify-center select-none"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={images[activeIndex]}
                            alt={`Gallery lightbox image ${activeIndex + 1}`}
                            className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl transition-all duration-300 animate-in zoom-in-95 duration-200"
                        />
                    </div>

                    {/* Next Button */}
                    {images.length > 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleNext(); }}
                            className="absolute right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 z-[100000]"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                            </svg>
                        </button>
                    )}

                    {/* Indicators */}
                    <div className="absolute bottom-6 flex flex-col items-center gap-2 text-white">
                        <span className="text-xs tracking-wider opacity-60 font-semibold uppercase">
                            {activeIndex + 1} / {images.length}
                        </span>
                    </div>
                </div>
            )}
        </section>
    );
}
