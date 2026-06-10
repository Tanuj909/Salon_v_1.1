"use client";

import React, { useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function ImageSliderModal({ images, currentIndex, onClose, onPrev, onNext, onIndexSelect }) {
    const { t } = useLanguage();
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") onPrev();
            if (e.key === "ArrowRight") onNext();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose, onPrev, onNext]);

    if (!images || images.length === 0) return null;

    return (
        <div 
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-md transition-opacity duration-300"
            onClick={onClose}
        >
            {/* Close Button */}
            <button 
                onClick={onClose}
                className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 z-[100000]"
                aria-label={t("salon_details.close_slider_aria")}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>

            {/* Previous Button */}
            {images.length > 1 && (
                <button
                    onClick={(e) => { e.stopPropagation(); onPrev(); }}
                    className="absolute left-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 z-[100000]"
                    aria-label={t("salon_details.prev_image_aria")}
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
                    src={images[currentIndex]}
                    alt={`Slider image ${currentIndex + 1}`}
                    className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl transition-all duration-300"
                    style={{ animation: "servicePreviewScaleIn 0.25s ease-out" }}
                />
            </div>

            {/* Next Button */}
            {images.length > 1 && (
                <button
                    onClick={(e) => { e.stopPropagation(); onNext(); }}
                    className="absolute right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 z-[100000]"
                    aria-label={t("salon_details.next_image_aria")}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                    </svg>
                </button>
            )}

            {/* Indicators */}
            <div className="absolute bottom-6 flex flex-col items-center gap-2 text-white">
                {images.length > 1 && (
                    <div className="flex gap-2">
                        {images.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={(e) => { e.stopPropagation(); onIndexSelect(idx); }}
                                className={`w-2 h-2 rounded-full transition-all duration-200 ${idx === currentIndex ? "bg-[#C49B66] w-4" : "bg-white/30"}`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                )}
                <span className="text-xs tracking-wider opacity-60 font-semibold uppercase">
                    {currentIndex + 1} / {images.length}
                </span>
            </div>
        </div>
    );
}
