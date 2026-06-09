"use client";

import React from 'react';
import { Star, MessageSquare, Calendar } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const RecentReviews = ({ reviews }) => {
    const displayReviews = reviews || [];
    const { t } = useLanguage();

    if (displayReviews.length === 0) {
        return (
            <div className="px-4 sm:px-8 mt-12 sm:mt-16">
                <h2 className="text-2xl font-bold profile-name-text mb-8">{t("profile.recent_reviews")}</h2>
                <div className="bg-white p-12 rounded-xl border border-dashed border-border text-center">
                    <div className="w-16 h-16 bg-background-light rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <MessageSquare size={32} />
                    </div>
                    <p className="text-muted font-medium">{t("profile.no_reviews_yet_user")}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 sm:px-8 mt-12 sm:mt-16">
            <h2 className="text-xl sm:text-2xl font-bold profile-name-text mb-8 font-[Cormorant_Garamond]">{t("profile.share_feedback")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayReviews.map((review) => (
                    <div key={review.id} className="bg-white p-5 sm:p-6 rounded-2xl border hero-filter-input-bg shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-black/[0.03] border hero-filter-input-bg flex items-center justify-center salon-list-title-accent font-black text-xs">
                                    {review.salonName?.charAt(0) || 'S'}
                                </div>
                                <div>
                                    <h4 className="font-bold profile-name-text leading-tight font-[Cormorant_Garamond] text-md">{review.salonName || t("profile.premium_salon")}</h4>
                                    <p className="text-[0.6rem] uppercase tracking-widest profile-meta-text opacity-40 font-black">{review.serviceName || t("profile.service")}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 bg-accent/5 border border-accent/10 text-accent rounded-lg text-[10px] font-black">
                                <Star size={10} fill="currentColor" />
                                {review.rating?.toFixed(1) || '0.0'}
                            </div>
                        </div>
                        <p className="profile-meta-text opacity-80 text-[0.85rem] italic mb-5 leading-relaxed">
                            "{review.comment || review.content}"
                        </p>
                        <div className="flex items-center gap-2 profile-meta-text opacity-30 text-[0.55rem] uppercase font-black tracking-[0.15em] pt-4 border-t border-muted">
                            <Calendar size={10} />
                            {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentReviews;
