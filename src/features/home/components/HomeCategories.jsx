"use client";

import React from "react";
import Link from "next/link";
import useActiveCategories from '../../../features/salons/hooks/useActiveServices';
import { useLanguage } from '@/context/LanguageContext';

const CATEGORIES = [
  {
    name: "Men",
    langKey: "home.cat_men",
    href: "/salons?category=MEN",
    imgKey: "category_men_1773427934952.png",
    price: "30"
  },
  {
    name: "Women",
    langKey: "home.cat_women",
    href: "/salons?category=WOMEN",
    imgKey: "category_women_1773427951840.png",
    price: "80"
  },
  {
    name: "Unisex",
    langKey: "home.cat_unisex",
    href: "/salons?category=UNISEX",
    imgKey: "category_unisex.png",
    price: "40"
  },
  {
    name: "Kids",
    langKey: "home.cat_kids",
    href: "/salons?category=KIDS",
    imgKey: "category_kids_1773427988583.png",
    price: "50"
  },
  {
    name: "Pets",
    langKey: "home.cat_pets",
    href: "/salons?category=PETS",
    imgKey: "category_pets_1773428004915.png",
    price: "70"
  }
];

export default function HomeCategories() {
  const { t } = useLanguage();
  const { categories, loading } = useActiveCategories();

  const dynamicCategories = CATEGORIES.map(cat => {
    const backendMatch = categories?.find(c => c.name.toLowerCase() === cat.name.toLowerCase());
    return {
      ...cat,
      href: backendMatch ? `/salons?categoryId=${backendMatch.id}` : cat.href
    };
  });

  const browseTitle = t("home.browse_by_category_alt");
  const browseWords = browseTitle.split(' ');
  const mainTitlePart = browseWords.slice(0, -1).join(' ');
  const accentTitlePart = browseWords.slice(-1)[0];

  return (
    <section className="pt-12 pb-0 md:py-24 relative overflow-hidden">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 md:px-12 w-full">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-20">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
            <span className="w-8 sm:w-12 h-px service-section-divider" />
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.5em] cat-section-label font-bold">{t("home.quick_selection")}</span>
            <span className="w-8 sm:w-12 h-px service-section-divider" />
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold cat-section-heading font-[Cormorant_Garamond,serif] leading-tight">
            {mainTitlePart} <em className="italic font-light rec-section-heading-accent ml-2">{accentTitlePart}</em>
          </h2>
        </div>

        <div 
          className="flex overflow-x-auto lg:grid lg:grid-cols-5 gap-3 sm:gap-6 lg:gap-4 xl:gap-8 justify-start lg:justify-items-center pt-2 pb-2 lg:py-2 px-1 w-full no-scrollbar"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* Spacer to prevent left clipping on mobile */}
          <div className="w-2 lg:hidden flex-shrink-0" />

          {dynamicCategories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="group flex flex-col items-center no-underline flex-shrink-0 w-[125px] sm:w-[144px] md:w-[176px] lg:w-auto"
            >
              {/* Circle image with navy hover */}
              <div
                className="relative w-[125px] h-[125px] sm:w-[144px] sm:h-[144px] md:w-[176px] md:h-[176px] lg:w-[150px] lg:h-[150px] xl:w-[190px] xl:h-[190px] 2xl:w-[230px] 2xl:h-[230px] rounded-full border-[6px] md:border-[8px] border-white/80 transition-all duration-1000 ease-out group-hover:scale-105 cat-circle-shadow group-hover:shadow-[0_30px_80px_rgba(28,49,82,0.3)] cat-circle-ring"
                style={{ borderColor: undefined }}
              >
                <div className="absolute inset-0 rounded-full overflow-hidden">
                  <img
                    src={`/${cat.imgKey}`}
                    alt={t(cat.langKey)}
                    className="w-full h-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-125"
                  />
                  {/* Default dark overlay, navy on hover */}
                  <div className="absolute inset-x-0 bottom-0 h-1/4 bg-black/80 backdrop-blur-[2px] transition-colors duration-700 group-hover:bg-[#1C3152]/90" />
                </div>

                {/* Category name over image */}
                <div className="absolute inset-x-0 bottom-0 h-1/4 flex items-center justify-center pb-2">
                  <div className="flex flex-col items-center">
                    <span className="text-white text-base sm:text-lg md:text-xl font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase transition-transform duration-700 group-hover:-translate-y-1 drop-shadow-md">
                      {t(cat.langKey)}
                    </span>
                    <div className="w-0 h-0.5 bg-white transition-all duration-700 group-hover:w-full mt-1.5 opacity-80 shadow-sm" />
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="mt-4 sm:mt-5 flex flex-col items-center justify-center transition-opacity duration-500 opacity-90 group-hover:opacity-100">
                <span className="text-xs sm:text-sm text-gray-400 font-medium tracking-wide uppercase">{t("home.starting_from")}</span>
                <span className="text-base sm:text-lg font-bold cat-price-text mt-0.5">AED {cat.price}</span>
              </div>
            </Link>
          ))}

          {/* Spacer to prevent right clipping on mobile */}
          <div className="w-2 lg:hidden flex-shrink-0" />
        </div>
      </div>
    </section>
  );
}