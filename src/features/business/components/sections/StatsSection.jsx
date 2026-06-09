import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

const StatsSection = () => {
    const { t, language } = useLanguage();

    const stats = [
        { value: '120k+', labelKey: 'list_business.stats.elite_businesses' },
        { value: '450k+', labelKey: 'list_business.stats.daily_appointments' },
        { value: '1B+', labelKey: 'list_business.stats.customers_served' },
        { value: '120+', labelKey: 'list_business.stats.countries_worldwide' },
    ];

    return (
        <section className="py-8 px-4 sm:px-6 max-w-[1240px] mx-auto" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {stats.map((stat, index) => (
                    <div key={index} className="flex flex-col items-center">
                        <div className="text-3xl md:text-5xl font-bold rec-section-heading-accent font-[Cormorant_Garamond,serif] mb-2 tracking-tight">
                            {stat.value}
                        </div>
                        <div className="w-8 h-[1px] bg-[#C8A951]/40 mb-3" />
                        <div className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] rec-section-subtext">
                            {t(stat.labelKey)}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default StatsSection;
