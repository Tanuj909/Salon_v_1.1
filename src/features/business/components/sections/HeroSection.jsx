import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

const HeroSection = () => {
    const { t, language } = useLanguage();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1,
            },
        },
    };

    const contentVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
            },
        },
    };

    const centerImageVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.9,
                ease: [0.22, 1, 0.36, 1],
            },
        },
    };

    const leftImageVariants = {
        hidden: { opacity: 0, x: -60 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.8,
                delay: 0.3,
                ease: [0.22, 1, 0.36, 1],
            },
        },
    };

    const chipVariants = {
        hidden: { opacity: 0, scale: 0.88, y: 8 },
        visible: (delay) => ({
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                duration: 0.7,
                delay: delay,
                ease: [0.22, 1, 0.36, 1],
            },
        }),
        float: {
            y: [0, -7, 0],
            transition: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
            },
        },
    };

    return (
        <motion.section
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="relative min-h-[60vh] md:min-h-[70vh] flex flex-col items-center px-4 sm:px-6 pt-10 md:pt-12 overflow-hidden"
            dir={language === 'ar' ? 'rtl' : 'ltr'}
            style={{
                background: 'transparent',
            }}
        >
            <div className="max-w-[1200px] mx-auto relative z-10 w-full flex flex-col items-center">

                {/* Badge - Reduced top margin */}
                <motion.div
                    variants={contentVariants}
                    className="rec-badge-top-rated-bg inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 shadow-sm border border-[#C8A951]/20"
                >
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.2 }}
                        className="w-5 h-5 bg-[#C8A951] rounded-full grid place-items-center flex-shrink-0"
                    >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M5 1L6.5 4H9.5L7 6L8 9L5 7.5L2 9L3 6L0.5 4H3.5L5 1Z" fill="#1C3152" />
                        </svg>
                    </motion.span>
                    <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-white">
                        {t('list_business.hero.badge')}
                    </span>
                </motion.div>

                {/* Headline - Improved for mobile wrapping */}
                <motion.div variants={contentVariants} className="mb-3 text-center w-full">
                    <h1 className="font-[Cormorant_Garamond,serif] text-4xl sm:text-5xl md:text-6xl font-bold rec-section-heading leading-tight tracking-tight">
                        {t('list_business.hero.headline_1')} <em className="italic font-light rec-section-heading-accent">{t('list_business.hero.headline_accent')}</em> {t('list_business.hero.headline_2')}
                    </h1>
                </motion.div>

                {/* Description - Responsive wrapping */}
                <motion.p
                    variants={contentVariants}
                    className="text-sm sm:text-base rec-section-subtext mb-8 text-center max-w-[600px] mx-auto font-medium"
                >
                    {t('list_business.hero.description')}
                </motion.p>

                {/* CTA Button - Reduced margin */}
                <motion.div
                    variants={contentVariants}
                    className="flex justify-center mb-10"
                >
                    <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Link
                            href="/partner"
                            className="inline-flex items-center gap-2 px-10 py-4 rounded-full rec-btn-primary font-bold text-[10px] tracking-[0.2em] uppercase transition-all shadow-xl"
                        >
                            {t('list_business.hero.cta')}
                        </Link>
                    </motion.div>
                </motion.div>
            </div>

            {/* Images Section - Responsive Stack */}
            <div className="relative z-10 w-full max-w-[1100px] mx-auto mt-8 md:mt-4 px-4 sm:px-6 pb-4">
                <div className="relative w-full flex flex-col md:flex-row items-center md:items-start justify-center gap-6 md:gap-0 min-h-auto md:min-h-[480px]">

                    {/* Left Secondary Image - Analytics Dashboard */}
                    <motion.div
                        variants={leftImageVariants}
                        whileHover={{ y: -5 }}
                        transition={{ duration: 0.3 }}
                        className="w-full md:w-[48%] relative md:absolute order-2 md:order-1 md:left-0 md:top-[30px]"
                        style={{
                            zIndex: 1,
                        }}
                    >
                        <div className="rounded-2xl overflow-hidden bg-white shadow-2xl border rec-card-border">
                            <Image
                                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                alt="Analytics Dashboard"
                                width={700}
                                height={450}
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    display: 'block',
                                }}
                                unoptimized
                            />
                        </div>
                    </motion.div>

                    {/* Right Main Image - Booking Dashboard */}
                    <motion.div
                        variants={centerImageVariants}
                        whileHover={{ y: -8 }}
                        transition={{ duration: 0.3 }}
                        className="w-full md:w-[58%] relative md:ml-[28%] order-1 md:order-2"
                        style={{
                            zIndex: 2,
                        }}
                    >
                        {/* Floating Chips - Hidden/Optimized for mobile */}
                        <motion.div
                            custom={1.1}
                            variants={chipVariants}
                            animate="visible"
                            whileHover="float"
                            className="absolute -top-4 -right-2 md:top-[-18px] md:right-[28px] p-3 md:p-4 bg-white rounded-2xl shadow-2xl border rec-card-border z-20"
                        >
                            <div className="text-[9px] font-bold tracking-widest uppercase rec-section-subtext mb-1">
                                {t('list_business.hero.todays_revenue')}
                            </div>
                            <div className="font-[Cormorant_Garamond,serif] text-xl font-bold rec-section-heading leading-none">
                                AED 2,500
                            </div>
                        </motion.div>

                        <motion.div
                            custom={1.3}
                            variants={chipVariants}
                            animate="visible"
                            whileHover="float"
                            className="absolute -bottom-4 -left-2 md:bottom-[28px] md:left-[-24px] p-3 md:p-4 bg-white rounded-2xl shadow-2xl border rec-card-border z-20"
                        >
                            <div className="text-[9px] font-bold tracking-widest uppercase rec-section-subtext mb-1">
                                {t('list_business.hero.up_next')}
                            </div>
                            <div className="font-[Cormorant_Garamond,serif] text-lg font-bold rec-section-heading-accent leading-none">
                                Sarah M.
                            </div>
                        </motion.div>

                        <div className="rounded-[2.5rem] overflow-hidden bg-white shadow-2xl border rec-card-border">
                            <Image
                                src="/images/business/banner.png"
                                alt="Salon booking platform preview"
                                width={800}
                                height={500}
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    display: 'block',
                                }}
                                priority
                                unoptimized
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.section>
    );
};

export default HeroSection;