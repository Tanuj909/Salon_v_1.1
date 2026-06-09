import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlineStar, HiStar } from 'react-icons/hi';
import { BsChatQuote } from 'react-icons/bs';
import { useLanguage } from '@/context/LanguageContext';

const TestimonialSection = () => {
    const { t, language } = useLanguage();

    const testimonials = [
        {
            quoteKey: 'list_business.testimonials.quote_1',
            nameKey: 'list_business.testimonials.name_1',
            businessKey: 'list_business.testimonials.business_1',
            locationKey: 'list_business.testimonials.location_1',
            rating: 5,
            image: 'https://images.unsplash.com/photo-1494790108777-8fd4f2a24a6d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
        },
        {
            quoteKey: 'list_business.testimonials.quote_2',
            nameKey: 'list_business.testimonials.name_2',
            businessKey: 'list_business.testimonials.business_2',
            locationKey: 'list_business.testimonials.location_2',
            rating: 5,
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
        },
        {
            quoteKey: 'list_business.testimonials.quote_3',
            nameKey: 'list_business.testimonials.name_3',
            businessKey: 'list_business.testimonials.business_3',
            locationKey: 'list_business.testimonials.location_3',
            rating: 5,
            image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
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

    const headerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.25, 0.1, 0.25, 1],
            },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.7,
                ease: [0.25, 0.1, 0.25, 1],
            },
        },
    };

    return (
        <section style={{
            padding: '60px 24px',
            maxWidth: 1200,
            margin: '0 auto',
            position: 'relative',
        }} dir={language === 'ar' ? 'rtl' : 'ltr'}>

            {/* Background decoration */}
            <div className="absolute top-[20%] left-[5%] w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(200,169,81,0.04)_0%,transparent_70%)] pointer-events-none z-0" />
            <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(28,49,82,0.03)_0%,transparent_70%)] pointer-events-none z-0" />

            <div style={{ position: 'relative', zIndex: 2 }}>

                {/* Header */}
                <motion.div
                    variants={headerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    style={{ textAlign: 'center', marginBottom: 60 }}
                >
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: 50 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="h-[1px] bg-gradient-to-r from-transparent to-[#C8A951]"
                        />
                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase rec-section-heading-accent hero-filter-input-bg px-4 py-1.5 rounded-full border rec-card-border shadow-sm">
                            {t('list_business.testimonials.badge')}
                        </span>
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: 50 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="h-[1px] bg-gradient-to-r from-[#C8A951] to-transparent"
                        />
                    </div>

                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="font-[Cormorant_Garamond,serif] text-3xl sm:text-5xl md:text-6xl font-bold rec-section-heading leading-tight tracking-tight mb-4"
                    >
                        {t('list_business.testimonials.headline_1')}{' '}
                        <motion.span
                            initial={{ opacity: 0, x: -5 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            className="rec-section-heading-accent italic inline-block relative"
                        >
                            {t('list_business.testimonials.headline_accent')}
                            <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: '100%' }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: 0.7 }}
                                className="absolute bottom-1.5 left-0 h-2 bg-[#C8A951]/20 rounded-full -z-[1]"
                            />
                        </motion.span>{' '}
                        {t('list_business.testimonials.headline_2')}
                    </motion.h2>
                    
                    <div className="flex items-center justify-center gap-4 mb-6">
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="text-base sm:text-lg rec-section-subtext leading-relaxed max-w-lg mx-auto font-medium"
                    >
                        {t('list_business.testimonials.description')}
                    </motion.p>
                    </div>
                </motion.div>

                {/* Testimonials Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: 30,
                    }}
                >
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            variants={cardVariants}
                            whileHover={{
                                y: -8,
                                transition: { duration: 0.3 }
                            }}
                            className="relative bg-white rounded-[2rem] border rec-card-border p-8 overflow-hidden shadow-xl transition-shadow duration-300 hover:shadow-2xl hover:shadow-[#1C3152]/10"
                        >
                            {/* Quote icon background */}
                            <div className="absolute top-4 right-6 text-8xl font-[Cormorant_Garamond,serif] text-[#C8A951]/10 font-bold pointer-events-none select-none">
                                "
                            </div>

                            {/* Rating */}
                            <div className="flex gap-1 mb-5">
                                {[...Array(5)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 0 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{
                                            duration: 0.3,
                                            delay: 0.5 + (i * 0.05)
                                        }}
                                    >
                                        <HiStar
                                            size={18}
                                            className={i < testimonial.rating ? "text-[#C8A951]" : "text-[#1C3152]/10"}
                                        />
                                    </motion.div>
                                ))}
                            </div>

                            {/* Quote */}
                            <motion.p
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className="text-base rec-section-heading leading-relaxed mb-8 relative z-[2] font-medium"
                            >
                                "{t(testimonial.quoteKey)}"
                            </motion.p>

                            {/* Author */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                                className="flex items-center gap-4 border-t rec-card-border/50 pt-6"
                            >
                                {/* Avatar with image */}
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{ duration: 0.2 }}
                                    className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg flex-shrink-0"
                                >
                                    <img
                                        src={testimonial.image}
                                        alt={t(testimonial.nameKey)}
                                        className="w-full h-full object-cover"
                                    />
                                </motion.div>

                                <div>
                                    <div className="text-base font-bold rec-section-heading mb-0.5">
                                        {t(testimonial.nameKey)}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#C8A951]">
                                        <span>{t(testimonial.businessKey)}</span>
                                        <span className="w-1 h-1 bg-[#1C3152]/30 rounded-full" />
                                        <span className="rec-section-subtext normal-case tracking-normal font-medium">
                                            {t(testimonial.locationKey)}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Decorative corner */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.6 }}
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    width: 60,
                                    height: 60,
                                    background: 'linear-gradient(135deg, transparent 50%, rgba(196,149,106,0.03) 50%)',
                                    borderBottomRightRadius: 28,
                                }}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default TestimonialSection;