import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    GiScissors,
    GiSparkles,
    GiNails,
    GiRazor,
    GiSpineArrow,
    GiLipstick,
    GiPencilBrush,
    GiHealthNormal,
    GiWeightScale,
    GiFlowerTwirl,
    GiMeditation
} from 'react-icons/gi';
import { PiFlowerTulip } from 'react-icons/pi';

const MotionLink = motion(Link);

const BusinessTypesSection = () => {
    const businessTypes = [
        { label: 'Hair Salon', icon: <GiScissors size={16} /> },
        { label: 'Waxing Studio', icon: <PiFlowerTulip size={16} /> },
        { label: 'Nail Boutique', icon: <GiNails size={16} /> },
        { label: 'Premium Barbershop', icon: <GiRazor size={16} /> },
        { label: 'Massage Therapy', icon: <GiSpineArrow size={16} /> },
        { label: 'Beauty Lounge', icon: <GiLipstick size={16} /> },
        { label: 'Tattoo & Piercing', icon: <GiPencilBrush size={16} /> },
        { label: 'Aesthetic Clinic', icon: <GiHealthNormal size={16} /> },
        { label: 'Weight Loss Center', icon: <GiWeightScale size={16} /> },
        { label: 'Luxury Spa', icon: <GiSparkles size={16} /> },
        { label: 'Wellness Retreat', icon: <GiFlowerTwirl size={16} /> },
        { label: 'Yoga & Fitness', icon: <GiMeditation size={16} /> },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.03,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.9, y: 10 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: [0.25, 0.1, 0.25, 1],
            },
        },
    };

    return (
        <section style={{
            padding: '40px 24px',
            maxWidth: 1100,
            margin: '0 auto',
            textAlign: 'center',
            position: 'relative',
        }}>

            {/* Background decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(200,169,81,0.05)_0%,transparent_70%)] pointer-events-none z-0" />

            <div style={{ position: 'relative', zIndex: 1 }}>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    style={{ marginBottom: 40 }}
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
                            Built for Your Industry
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
                        className="font-[Cormorant_Garamond,serif] text-4xl sm:text-5xl font-bold rec-section-heading leading-tight tracking-tight mb-4"
                    >
                        Tailored for{' '}
                        <motion.span
                            initial={{ opacity: 0, x: -5 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            className="rec-section-heading-accent italic inline-block relative"
                        >
                            your
                            <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: '100%' }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: 0.7 }}
                                className="absolute bottom-1.5 left-0 h-2 bg-[#C8A951]/20 rounded-full -z-[1]"
                            />
                        </motion.span>{' '}
                        business
                    </motion.h2>
                    
                    <div className='flex justify-center items-center'>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="text-base sm:text-lg rec-section-subtext leading-relaxed max-w-xl mx-auto font-medium"
                    >
                        Elite software purpose-built for beauty & wellness professionals
                    </motion.p>
                    </div>
                </motion.div>

                {/* Tags Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: 10,
                    }}
                >
                    {businessTypes.map((type, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            whileHover={{
                                scale: 1.05,
                                y: -3,
                                transition: { duration: 0.2 }
                            }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '10px 24px',
                                borderRadius: 40,
                                border: '1px solid rgba(200,169,81,0.2)',
                                background: 'white',
                                color: '#1C3152',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                cursor: 'default',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, #1C3152, #2A4570)';
                                e.currentTarget.style.color = '#fff';
                                e.currentTarget.style.borderColor = 'transparent';
                                e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(28,49,82,0.3)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'white';
                                e.currentTarget.style.color = '#1C3152';
                                e.currentTarget.style.borderColor = 'rgba(200,169,81,0.2)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.03)';
                            }}
                        >
                            <motion.span
                                whileHover={{ rotate: 5 }}
                                transition={{ duration: 0.2 }}
                                style={{
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'inherit',
                                }}
                            >
                                {type.icon}
                            </motion.span>
                            {type.label}
                        </motion.div>
                    ))}
                </motion.div>

                {/* Bottom CTA hint */}
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="mt-10 p-5 text-sm rec-section-subtext font-medium"
                >
                    Don't see your category?{' '}
                    <MotionLink
                        href="/partner"
                        whileHover={{ x: 3 }}
                        transition={{ duration: 0.2 }}
                        className="rec-section-heading-accent font-bold hover:underline decoration-dashed transition-all"
                    >
                        Get in touch →
                    </MotionLink>
                </motion.p>
            </div>
        </section>
    );
};

export default BusinessTypesSection;