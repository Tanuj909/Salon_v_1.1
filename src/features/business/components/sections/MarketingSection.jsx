import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlineMail, HiOutlineUserGroup, HiOutlineBell } from 'react-icons/hi';
import { BsMegaphone, BsChatDots, BsGift, BsGraphUp } from 'react-icons/bs';
import { FiCheckCircle } from 'react-icons/fi';
import { useLanguage } from '@/context/LanguageContext';

const MarketingSection = () => {
    const { t, language } = useLanguage();

    const points = [
        {
            labelKey: 'list_business.marketing.point_1_label',
            icon: <BsMegaphone size={16} />,
            color: '#C8A951',
            descKey: 'list_business.marketing.point_1_desc'
        },
        {
            labelKey: 'list_business.marketing.point_2_label',
            icon: <HiOutlineUserGroup size={16} />,
            color: '#1C3152',
            descKey: 'list_business.marketing.point_2_desc'
        },
        {
            labelKey: 'list_business.marketing.point_3_label',
            icon: <HiOutlineBell size={16} />,
            color: '#C8A951',
            descKey: 'list_business.marketing.point_3_desc'
        },
    ];


    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: [0.25, 0.1, 0.25, 1],
            },
        },
    };

    return (
        <section style={{
            padding: '40px 24px',
            maxWidth: 1200,
            margin: '0 auto',
            position: 'relative',
        }} dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {/* Background decoration */}
            <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(200,169,81,0.05)_0%,transparent_70%)] pointer-events-none z-0" />

            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={containerVariants}
                style={{
                    position: 'relative',
                    zIndex: 2,
                }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-[60px] items-center relative z-[2]"
            >
                {/* Content - Left Side */}
                <motion.div variants={itemVariants}>
                    {/* Badge */}
                    <motion.div
                        variants={itemVariants}
                        className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full hero-filter-input-bg border rec-card-border shadow-sm mb-6"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.3 }}
                            className="w-6 h-6 rounded-lg bg-[#C8A951] flex items-center justify-center text-[#1C3152] shadow-md"
                        >
                            <BsChatDots size={14} />
                        </motion.div>
                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase rec-section-heading-accent">
                            {t('list_business.marketing.badge')}
                        </span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h2
                        variants={itemVariants}
                        className="font-[Cormorant_Garamond,serif] text-4xl sm:text-5xl md:text-6xl font-bold rec-section-heading leading-tight tracking-tight mb-5"
                    >
                        {t('list_business.marketing.headline_1')}{' '}
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            className="rec-section-heading-accent italic inline-block relative"
                        >
                            {t('list_business.marketing.headline_accent')}
                            <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: '100%' }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: 0.8 }}
                                className="absolute bottom-1 left-0 h-2 bg-[#C8A951]/20 rounded-full -z-[1]"
                            />
                        </motion.span>{' '}
                        {t('list_business.marketing.headline_2')}
                    </motion.h2>

                    {/* Description */}
                    <motion.p
                        variants={itemVariants}
                        className="text-base sm:text-lg rec-section-subtext leading-relaxed mb-10 max-w-lg font-medium"
                    >
                        {t('list_business.marketing.description')}
                    </motion.p>

                    {/* Feature List */}
                    <motion.div
                        variants={containerVariants}
                        className="flex flex-col gap-6 mb-8"
                    >
                        {points.map((item, i) => (
                            <motion.div
                                key={i}
                                variants={itemVariants}
                                whileHover={{ x: language === 'ar' ? -5 : 5 }}
                                transition={{ duration: 0.2 }}
                                className="flex gap-4"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{ duration: 0.2 }}
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg border rec-card-border"
                                    style={{
                                        background: `linear-gradient(135deg, ${item.color}15, ${item.color}05)`,
                                        color: item.color,
                                    }}
                                >
                                    {item.icon}
                                </motion.div>
                                <div>
                                    <span className="text-lg font-bold rec-section-heading tracking-tight mb-1 block">
                                        {t(item.labelKey)}
                                    </span>
                                    <span className="text-sm rec-section-subtext leading-relaxed font-medium">
                                        {t(item.descKey)}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                </motion.div>

                {/* Image - Right Side */}
                <motion.div
                    variants={itemVariants}
                    style={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {/* Decorative elements */}
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        style={{
                            position: 'absolute',
                            top: -20,
                            right: -20,
                            width: 300,
                            height: 300,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(196,149,106,0.08) 0%, transparent 70%)',
                            zIndex: 0,
                        }}
                    />
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        style={{
                            position: 'absolute',
                            bottom: -20,
                            left: -20,
                            width: 250,
                            height: 250,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(122,40,96,0.06) 0%, transparent 70%)',
                            zIndex: 0,
                        }}
                    />

                    {/* Main Image Card */}
                    <motion.div
                        whileHover={{ y: -8 }}
                        transition={{ duration: 0.3 }}
                        className="relative w-full max-w-[480px] rounded-[2.5rem] overflow-hidden shadow-2xl border rec-card-border z-[2]"
                    >
                        <motion.div
                            whileHover={{ scale: 1.03 }}
                            transition={{ duration: 0.4 }}
                            style={{
                                borderRadius: 32,
                                overflow: 'hidden',
                            }}
                        >
                            <img
                                src="https://placehold.co/600x400/7a2860/c4956a?text=Marketing+Dashboard&font=montserrat"
                                alt="Marketing Campaign Dashboard"
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    display: 'block',
                                }}
                            />
                        </motion.div>

                        {/* Gradient Overlay */}
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '40%',
                            background: 'linear-gradient(to top, rgba(0,0,0,0.02), transparent)',
                            pointerEvents: 'none',
                        }} />
                    </motion.div>

                    {/* Auto-Pilot Status Overlay - Centered below image */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                        className="bg-[#1C3152] rounded-full px-8 py-3.5 shadow-2xl z-[4] flex items-center gap-3 border border-[#C8A951]/30 mt-8"
                    >
                        <div className="w-2.5 h-2.5 rounded-full bg-[#C8A951] shadow-[0_0_15px_#C8A951] animate-pulse" />
                        <span className="text-[10px] font-bold text-white tracking-[0.2em] uppercase">
                            {t('list_business.marketing.auto_pilot')}
                        </span>
                    </motion.div>
                </motion.div>
            </motion.div>
        </section>
    );
};

export default MarketingSection;