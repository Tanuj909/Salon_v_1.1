"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchBusinesses } from '../../services/businessService';
import { useLanguage } from '@/context/LanguageContext';

const SalonsSection = () => {
    const { t, language } = useLanguage();
    const [salons, setSalons] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getSalons = async () => {
            try {
                // Fetch enough salons to show in marquee
                const data = await fetchBusinesses(0, 15);
                setSalons(data.content || []);
            } catch (error) {
                console.error("Error fetching salons for marquee:", error);
            } finally {
                setLoading(false);
            }
        };
        getSalons();
    }, []);

    if (loading || salons.length === 0) return null;

    // Duplicate salons array for a seamless loop
    const doubledSalons = [...salons, ...salons];

    return (
        <section className="py-8 md:py-12 overflow-hidden">
            <div className="max-w-[1240px] mx-auto px-6 mb-12 text-center" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full hero-filter-input-bg border rec-card-border shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C8A951] animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] rec-section-heading-accent">{t('list_business.salons.badge')}</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold rec-section-heading font-[Cormorant_Garamond,serif] leading-tight tracking-tight">
                    {t('list_business.salons.headline_1')} <span className="italic rec-section-heading-accent font-light">{t('list_business.salons.headline_accent')}</span>
                </h2>
                <div className='flex justify-center item-center'>
                <p className="text-sm sm:text-base rec-section-subtext mt-4 max-w-xl mx-auto font-medium">
                    {t('list_business.salons.description')}
                </p>
                </div>

            </div>

            <div className="flex relative overflow-hidden group">
                {/* Marquee Animation Container */}
                <motion.div
                    className="flex gap-6 pr-6 py-4"
                    animate={{ x: [0, "-50%"] }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: salons.length * 4, // Dynamic speed based on count
                            ease: "linear",
                        },
                    }}
                    style={{ width: "fit-content" }}
                >
                    {doubledSalons.map((salon, index) => (
                        <div
                            key={`${salon.id}-${index}`}
                            className="relative flex-shrink-0 w-[280px] md:w-[350px] aspect-[16/10] rounded-[2rem] overflow-hidden shadow-2xl border rec-card-border group/card"
                        >
                            <img
                                src={salon.bannerImageUrl || (salon.imageUrls && salon.imageUrls[0]) || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800'}
                                alt={salon.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                            />
                            {/* Sophisticated Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1C3152]/90 via-[#1C3152]/20 to-transparent opacity-80 group-hover/card:opacity-95 transition-opacity duration-500" />

                            <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover/card:translate-y-0 transition-transform">
                                <span className="inline-block px-3 py-0.5 rounded-full bg-[#C8A951]/20 border border-[#C8A951]/30 text-[9px] text-[#C8A951] font-bold uppercase tracking-[0.2em] mb-3 backdrop-blur-md">
                                    {salon.city || t('list_business.salons.premium')}
                                </span>
                                <h3 className="text-white text-xl md:text-2xl font-bold font-[Cormorant_Garamond,serif] leading-tight drop-shadow-2xl">
                                    {salon.name}
                                </h3>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Side Fades for depth - Fading to hero-filter-input-bg color #F5F1E9 */}
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#F5F1E9] via-[#F5F1E9]/80 to-transparent z-10" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#F5F1E9] via-[#F5F1E9]/80 to-transparent z-10" />
            </div>
        </section>
    );
};

export default SalonsSection;
