import React from 'react';
import { motion } from 'framer-motion';
import {
    BsCalendarCheck,
    BsCreditCard2Front,
    BsBag,
    BsMegaphone,
    BsBoxSeam,
    BsGraphUp
} from 'react-icons/bs';
import { useLanguage } from '@/context/LanguageContext';

const FeaturesSection = () => {
    const { t, language } = useLanguage();

    const features = [
        {
            icon: <BsCalendarCheck size={20} />,
            titleKey: 'list_business.features.appointment_scheduling',
            descKey: 'list_business.features.appointment_scheduling_desc',
            image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        },
        {
            icon: <BsCreditCard2Front size={20} />,
            titleKey: 'list_business.features.payment_processing',
            descKey: 'list_business.features.payment_processing_desc',
            image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        },
        {
            icon: <BsBag size={20} />,
            titleKey: 'list_business.features.pos',
            descKey: 'list_business.features.pos_desc',
            image: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        },
        {
            icon: <BsMegaphone size={20} />,
            titleKey: 'list_business.features.marketing_promotions',
            descKey: 'list_business.features.marketing_promotions_desc',
            image: 'https://images.unsplash.com/photo-1557838923-2985c318be48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        },
        {
            icon: <BsBoxSeam size={20} />,
            titleKey: 'list_business.features.product_inventory',
            descKey: 'list_business.features.product_inventory_desc',
            image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        },
        {
            icon: <BsGraphUp size={20} />,
            titleKey: 'list_business.features.reporting_analytics',
            descKey: 'list_business.features.reporting_analytics_desc',
            image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
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
        <section style={{ padding: '20px 24px 40px', maxWidth: 1200, margin: '0 auto' }} dir={language === 'ar' ? 'rtl' : 'ltr'}>

            {/* Section header */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                style={{ textAlign: 'center', marginBottom: 64 }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: 12,
                        marginBottom: 20,
                    }}
                >
                    <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: 32 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="h-[1px] bg-[#C8A951]"
                    />
                    <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase rec-section-heading-accent">
                        {t('list_business.features.badge')}
                    </span>
                    <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: 32 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="h-[1px] bg-[#C8A951]"
                    />
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="font-[Cormorant_Garamond,serif] text-3xl sm:text-4xl md:text-5xl font-bold rec-section-heading leading-tight tracking-tight mb-4"
                >
                    {t('list_business.features.headline_1')}{' '}
                    <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="rec-section-heading-accent italic inline-block"
                    >
                        {t('list_business.features.headline_accent')}
                    </motion.span>{' '}
                    {t('list_business.features.headline_2')}
                </motion.h2>
                
                <div className='flex justify-center items-center'>
                    <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="text-sm sm:text-base rec-section-subtext max-w-[540px] mx-auto leading-relaxed font-medium"
                >
                    {t('list_business.features.description')}
                </motion.p>
                </div>

            </motion.div>

            {/* Feature grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: 28,
                }}
            >
                {features.map((feature, index) => (
                    <motion.div
                        key={index}
                        variants={itemVariants}
                        style={{
                            position: 'relative',
                            borderRadius: 20,
                            overflow: 'hidden',
                            cursor: 'default',
                        }}
                    >
                        {/* Image Container - All motion divs */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                            style={{
                                position: 'relative',
                                height: 200,
                                width: '100%',
                                borderRadius: 20,
                                overflow: 'hidden',
                                marginBottom: 16,
                                boxShadow: '0 10px 30px -15px rgba(0,0,0,0.1)',
                            }}
                        >
                            <motion.img
                                src={feature.image}
                                alt={t(feature.titleKey)}
                                whileHover={{ scale: 1.1 }}
                                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    display: 'block',
                                }}
                            />

                            {/* Icon - Inside motion div */}
                             <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                                className="absolute bottom-4 left-4 w-11 h-11 rounded-xl bg-white flex items-center justify-center rec-section-heading shadow-xl z-[2] border rec-card-border"
                            >
                                {feature.icon}
                            </motion.div>
                        </motion.div>

                        {/* Content */}
                        <motion.div
                            whileHover={{ y: -2 }}
                            transition={{ duration: 0.3 }}
                            style={{ padding: '0 4px' }}
                        >
                            <motion.h3
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 + 0.4 }}
                                className="text-lg font-bold rec-section-heading tracking-tight mb-2"
                            >
                                {t(feature.titleKey)}
                            </motion.h3>

                            <motion.p
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 + 0.5 }}
                                className="text-sm rec-section-subtext leading-relaxed font-medium"
                            >
                                {t(feature.descKey)}
                            </motion.p>
                        </motion.div>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
};

export default FeaturesSection;