"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { services } from '@/features/home/data/servicesData';
import { useLanguage } from '@/context/LanguageContext';

const ServicesSection = () => {
  const { t } = useLanguage();

  const [visibleCards, setVisibleCards] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);
  const trackRef = useRef(null);
  const autoPlayRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1280) setVisibleCards(4);
      else if (width >= 1024) setVisibleCards(3);
      else if (width >= 768) setVisibleCards(2);
      else setVisibleCards(1);
    };
    
    handleResize();
    setHasMounted(true);
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine how many cards to show based on mounting status
  const currentVisible = hasMounted ? visibleCards : 1;
  const maxIndex = services.length - currentVisible;

  const goTo = (index) => {
    setCurrentIndex(Math.max(0, Math.min(index, maxIndex)));
  };

  const prev = () => goTo(currentIndex - 1);
  const next = () => goTo(currentIndex + 1);

  // Auto-play
  useEffect(() => {
    autoPlayRef.current = setInterval(() => {
      setCurrentIndex(prev => prev >= maxIndex ? 0 : prev + 1);
    }, 4000);
    return () => clearInterval(autoPlayRef.current);
  }, [maxIndex]);

  // Keep index in bounds on resize
  useEffect(() => {
    if (currentIndex > maxIndex && maxIndex >= 0) {
      setCurrentIndex(maxIndex);
    }
  }, [maxIndex, currentIndex]);

  const resetAutoPlay = () => {
    clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      setCurrentIndex(prev => prev >= maxIndex ? 0 : prev + 1);
    }, 4000);
  };

  // Drag handlers
  const onMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setDragOffset(0);
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    setDragOffset(e.clientX - startX);
  };

  const onMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const threshold = 80;
    if (dragOffset < -threshold) { goTo(currentIndex + 1); resetAutoPlay(); }
    else if (dragOffset > threshold) { goTo(currentIndex - 1); resetAutoPlay(); }
    setDragOffset(0);
  };

  const onTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setDragOffset(0);
  };

  const onTouchMove = (e) => {
    setDragOffset(e.touches[0].clientX - startX);
  };

  const onTouchEnd = () => {
    const threshold = 60;
    if (dragOffset < -threshold) { goTo(currentIndex + 1); resetAutoPlay(); }
    else if (dragOffset > threshold) { goTo(currentIndex - 1); resetAutoPlay(); }
    setDragOffset(0);
  };

  const translateX = `calc(-${currentIndex * (100 / currentVisible)}% - ${currentIndex * (24 / currentVisible)}px + ${isDragging ? dragOffset : 0}px)`;

  const sectionTitle = t("home.our_premium_services");
  const titleWords = sectionTitle.split(' ');

  return (
    <section className="py-10 w-full font-[DM_Sans]">
      <div className="px-4 md:px-6 max-w-[1300px] mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-14">
          <p className="rec-section-heading-accent text-[0.7rem] md:text-[0.8rem] tracking-[0.2em] uppercase mb-2 md:mb-3 font-bold">
            {t("home.crafted_with_care")}
          </p>
          <h2 className="text-[clamp(1.5rem,5vw,3rem)] font-extrabold rec-section-heading m-0 leading-tight font-[Cormorant_Garamond,serif]">
            {titleWords.map((word, idx) => {
              const isAccent = idx === 1;
              return (
                <span key={idx}>
                  {isAccent ? (
                    <span className="italic rec-section-heading-accent ml-1 mr-1">{word}</span>
                  ) : (
                    <span>{word}</span>
                  )}
                  {idx < titleWords.length - 1 && ' '}
                </span>
              );
            })}
          </h2>
          <div className="w-12 md:w-16 h-[2.5px] rec-section-divider mx-auto mt-4 rounded-full" />
        </div>

        {/* Carousel */}
        <div className="relative group/carousel">
          {/* Track wrapper */}
          <div
            className={`overflow-hidden rounded-[4px] ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div
              className="flex gap-6 will-change-transform"
              style={{
                transition: isDragging ? 'none' : 'transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                transform: `translateX(${translateX})`,
              }}
            >
              {services.map((service, index) => {
                const serviceTitle = t(`services.${service.searchTerm}.title`, service.title);
                const serviceDesc = t(`services.${service.searchTerm}.desc`, service.description);

                return (
                  <div
                    key={index}
                    className="relative h-[380px] md:h-[420px] lg:h-[480px] rounded-[20px] overflow-hidden shrink-0 select-none shadow-sm border rec-card-border"
                    style={{
                      width: `calc(100% / ${currentVisible} - ${((currentVisible - 1) * 24) / currentVisible}px)`
                    }}
                  >
                    <img
                      src={service.image}
                      alt={serviceTitle}
                      draggable={false}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1C3152]/95 via-[#1C3152]/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6 md:p-7 w-full">
                      <h3 className="text-white text-[1.35rem] font-bold mb-2 font-[Cormorant_Garamond,serif]">
                        {serviceTitle}
                      </h3>
                      <p className="text-white/90 text-[0.85rem] leading-relaxed mb-4 line-clamp-3 md:line-clamp-none font-[DM_Sans]">
                        {serviceDesc}
                      </p>
                      <Link href={`/salons?serviceName=${service.searchTerm}`} className="inline-block rec-btn-primary border border-white/30 px-[22px] py-1.5 rounded-full text-[0.8rem] font-bold tracking-wider no-underline transition-all duration-300 mt-3 font-[DM_Sans]">
                        {t("home.explore_btn")}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            className="hidden md:flex w-12 h-12 rounded-full border-[1.5px] rec-btn-outline bg-white items-center justify-center transition-all duration-200 shadow-md hover:rec-btn-primary hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed group absolute top-1/2 -translate-y-1/2 -left-3 lg:-left-6 z-10"
            onClick={() => { prev(); resetAutoPlay(); }}
            disabled={currentIndex === 0}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="transition-colors duration-200 group-hover:stroke-white">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            className="hidden md:flex w-12 h-12 rounded-full border-[1.5px] rec-btn-outline bg-white items-center justify-center transition-all duration-200 shadow-md hover:rec-btn-primary hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed group absolute top-1/2 -translate-y-1/2 -right-3 lg:-right-6 z-10"
            onClick={() => { next(); resetAutoPlay(); }}
            disabled={currentIndex === maxIndex}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="transition-colors duration-200 group-hover:stroke-white">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Dots for mobile */}
        <div className="flex md:hidden justify-center items-center gap-2 mt-6">
          {services.map((_, i) => (
            <button
              key={i}
              className={`cursor-pointer transition-all duration-300 border-none h-1 rounded-full ${i === currentIndex ? 'bg-[#1C3152] w-6' : 'bg-gray-200 w-1.5'}`}
              onClick={() => { goTo(i); resetAutoPlay(); }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;