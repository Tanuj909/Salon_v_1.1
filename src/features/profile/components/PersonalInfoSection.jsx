import React from 'react';
import Link from 'next/link';
import {
    Edit3, Award, CalendarDays, Star,
    CheckCircle2, XCircle, Timer, Wallet,
    History, UserCheck, Mail, Phone, Calendar
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const PersonalInfoSection = ({ user }) => {
    const stats = user?.stats || {};
    const isCustomer = user?.user?.role === 'CUSTOMER';
    const { t } = useLanguage();

    const formatDate = (dateString) => {
        if (!dateString) return t("profile.na");
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="px-3 sm:px-8 mt-6 sm:mt-12 space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
                {/* Left Column: Primary Profile Card */}
                <div className={`${isCustomer ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-6 sm:space-y-8`}>
                    <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] shadow-sm border hero-filter-input-bg">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0 sm:items-start mb-6 sm:mb-10">
                            <div>
                                <h2 className="text-[0.55rem] sm:text-[0.6rem] font-black salon-list-title-accent uppercase tracking-[0.2em] mb-2">
                                    {isCustomer ? t("profile.member_profile") : t("profile.staff_profile")}
                                </h2>
                                <h1 className="text-xl sm:text-4xl font-bold tracking-tight profile-name-text font-[Cormorant_Garamond] break-words">
                                    {user?.user?.fullName || t("profile.user_name")}
                                </h1>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3 sm:mt-4">
                                    <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-white/[0.05] border hero-filter-input-bg rounded-full profile-meta-text opacity-50 text-[8px] sm:text-[10px] font-black uppercase tracking-wider">
                                        <UserCheck size={10} className="sm:w-3 sm:h-3" />
                                        {user?.user?.role || "CUSTOMER"}
                                    </div>
                                    <span className="profile-meta-text opacity-20 hidden sm:inline">•</span>
                                    <span className="profile-meta-text opacity-40 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                                        {t("profile.joined")} {formatDate(stats?.memberSince || user?.user?.createdAt)}
                                    </span>
                                </div>
                            </div>

                            <Link
                                href="/profile/edit"
                                className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-400 text-white rounded-xl font-bold hover:bg-gray-600 transition-all shadow-md active:scale-95 text-xs sm:text-sm w-full sm:w-auto justify-center"
                            >
                                <Edit3 size={14} className="sm:w-4 sm:h-4" />
                                <span>{t("profile.modify_details")}</span>
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-y-7 sm:gap-x-10 pt-6 sm:pt-8 border-t hero-filter-input-bg">
                            <div className="flex items-start gap-3 sm:gap-4">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#fdfaf8] border hero-filter-input-bg flex items-center justify-center salon-list-title-accent opacity-50 flex-shrink-0">
                                    <Mail size={14} className="sm:w-4 sm:h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[0.55rem] sm:text-[0.6rem] uppercase tracking-widest profile-meta-text opacity-40 font-black mb-1">{t("profile.email")}</p>
                                    <p className="text-xs sm:text-sm profile-name-text font-bold truncate">{user?.user?.email || t("profile.not_provided")}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 sm:gap-4">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#fdfaf8] border hero-filter-input-bg flex items-center justify-center salon-list-title-accent opacity-50 flex-shrink-0">
                                    <Phone size={14} className="sm:w-4 sm:h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[0.55rem] sm:text-[0.6rem] uppercase tracking-widest profile-meta-text opacity-40 font-black mb-1">{t("profile.phone")}</p>
                                    <p className="text-xs sm:text-sm profile-name-text font-bold truncate">{user?.user?.phoneNumber || t("profile.not_provided")}</p>
                                </div>
                            </div>
                            {isCustomer && (
                                <>
                                    <div className="flex items-start gap-3 sm:gap-4">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#fdfaf8] border hero-filter-input-bg flex items-center justify-center salon-list-title-accent opacity-50 flex-shrink-0">
                                            <Calendar size={14} className="sm:w-4 sm:h-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[0.55rem] sm:text-[0.6rem] uppercase tracking-widest profile-meta-text opacity-40 font-black mb-1">{t("profile.birth_date")}</p>
                                            <p className="text-xs sm:text-sm profile-name-text font-bold truncate">{formatDate(user?.dateOfBirth)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 sm:gap-4">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#fdfaf8] border hero-filter-input-bg flex items-center justify-center salon-list-title-accent opacity-50 flex-shrink-0">
                                            <Award size={14} className="sm:w-4 sm:h-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[0.55rem] sm:text-[0.6rem] uppercase tracking-widest profile-meta-text opacity-40 font-black mb-1">{t("profile.gender")}</p>
                                            <p className="text-xs sm:text-sm profile-name-text font-bold capitalize truncate">{user?.gender || t("profile.not_specified")}</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Booking Stats Grid - Only for Customers */}
                    {isCustomer && (
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                            <div className="bg-white p-4 sm:p-5 rounded-xl sm:rounded-[1.8rem] border hero-filter-input-bg shadow-sm">
                                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-white/[0.08] salon-list-title-accent flex items-center justify-center mb-3 sm:mb-4">
                                    <CalendarDays size={14} className="sm:w-[18px] sm:h-[18px]" />
                                </div>
                                <p className="text-[0.5rem] sm:text-[0.55rem] uppercase tracking-widest profile-meta-text opacity-40 font-black mb-1">{t("profile.total")}</p>
                                <h3 className="text-base sm:text-xl font-bold profile-name-text">{stats?.totalBookings || 0}</h3>
                            </div>
                            <div className="bg-white p-4 sm:p-5 rounded-xl sm:rounded-[1.8rem] border hero-filter-input-bg shadow-sm">
                                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-success/10 text-success flex items-center justify-center mb-3 sm:mb-4">
                                    <CheckCircle2 size={14} className="sm:w-[18px] sm:h-[18px]" />
                                </div>
                                <p className="text-[0.5rem] sm:text-[0.55rem] uppercase tracking-widest profile-meta-text opacity-40 font-black mb-1">{t("profile.done")}</p>
                                <h3 className="text-base sm:text-xl font-bold profile-name-text">{stats?.completedBookings || 0}</h3>
                            </div>
                            <div className="bg-white p-4 sm:p-5 rounded-xl sm:rounded-[1.8rem] border hero-filter-input-bg shadow-sm">
                                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-warning/10 text-warning flex items-center justify-center mb-3 sm:mb-4">
                                    <Timer size={14} className="sm:w-[18px] sm:h-[18px]" />
                                </div>
                                <p className="text-[0.5rem] sm:text-[0.55rem] uppercase tracking-widest profile-meta-text opacity-40 font-black mb-1">{t("profile.active")}</p>
                                <h3 className="text-base sm:text-xl font-bold profile-name-text">{stats?.pendingBookings || 0}</h3>
                            </div>
                            <div className="bg-white p-4 sm:p-5 rounded-xl sm:rounded-[1.8rem] border hero-filter-input-bg shadow-sm">
                                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-danger/10 text-danger flex items-center justify-center mb-3 sm:mb-4">
                                    <XCircle size={14} className="sm:w-[18px] sm:h-[18px]" />
                                </div>
                                <p className="text-[0.5rem] sm:text-[0.55rem] uppercase tracking-widest profile-meta-text opacity-40 font-black mb-1">{t("profile.cancel")}</p>
                                <h3 className="text-base sm:text-xl font-bold profile-name-text">{stats?.cancelledBookings || 0}</h3>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Premium Rewards & Status - Only for Customers */}
                {isCustomer && (
                    <div className="lg:col-span-4 space-y-6">
                        <div className="footer-bg p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] shadow-xl text-white relative overflow-hidden border border-white/5">
                            <Award size={120} className="absolute -top-5 -right-5 sm:-top-10 sm:-right-10 opacity-10 stroke-[0.5] rotate-12" />

                            <div>
                                <div className="flex items-center gap-2 mb-5 sm:mb-8">
                                    <div className="p-1.5 sm:p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/10">
                                        <Star size={12} className="sm:w-4 sm:h-4" fill="#c4956a" color="#c4956a" />
                                    </div>
                                    <span className="text-[0.55rem] sm:text-[0.6rem] uppercase tracking-[0.2em] font-black opacity-80">{t("profile.elite_rewards")}</span>
                                </div>

                                <div className="space-y-5 sm:space-y-7">
                                    <div>
                                        <p className="text-[0.55rem] sm:text-[0.6rem] uppercase tracking-[0.2em] font-black opacity-50 mb-1">{t("profile.points")}</p>
                                        <h3 className="text-3xl sm:text-5xl font-black flex items-baseline gap-2 font-[Cormorant_Garamond]">
                                            {stats?.loyaltyPoints || 0}
                                            <span className="text-[0.6rem] sm:text-[0.7rem] font-black tracking-widest opacity-60">{t("profile.pts")}</span>
                                        </h3>
                                    </div>

                                    <div className="pt-2 sm:pt-4 space-y-3 sm:space-y-4">
                                        <div className="flex items-center justify-between text-[0.6rem] sm:text-[0.65rem] py-2 sm:py-2.5 border-b border-white/5">
                                            <span className="opacity-50 font-black uppercase tracking-widest">{t("profile.tier")}</span>
                                            <span className="font-bold salon-list-title-accent capitalize tracking-wider">{stats?.membershipLevel || t("profile.bronze")}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[0.6rem] sm:text-[0.65rem] py-2 sm:py-2.5 border-b border-white/5">
                                            <span className="opacity-50 font-black uppercase tracking-widest">{t("profile.rating")}</span>
                                            <span className="font-bold tracking-wider">{stats?.averageRating?.toFixed(1) || "0.0"} / 5.0</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[0.6rem] sm:text-[0.65rem] py-2 sm:py-2.5 border-b border-white/5">
                                            <span className="opacity-50 font-black uppercase tracking-widest">{t("profile.reviews")}</span>
                                            <span className="font-bold tracking-wider">{stats?.totalReviews || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 sm:mt-10 pt-6 sm:pt-8 border-t border-white/5">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="w-9 h-9 sm:w-11 sm:h-11 bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/10 flex items-center justify-center salon-list-title-accent flex-shrink-0">
                                        <Wallet size={16} className="sm:w-5 sm:h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[0.5rem] sm:text-[0.55rem] uppercase tracking-widest font-black opacity-50 mb-0.5">{t("profile.total_spent")}</p>
                                        <p className="text-base sm:text-xl font-bold tracking-tight truncate">${stats?.totalSpent?.toFixed(2) || "0.00"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Monthly Recap Row - Only for Customers */}
            {isCustomer && (
                <div className="bg-white/[0.04] rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-8 border hero-filter-input-bg">
                    <div className="flex items-center gap-3 sm:gap-6 w-full sm:w-auto">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white shadow-sm border hero-filter-input-bg flex items-center justify-center salon-list-title-accent flex-shrink-0">
                            <History size={18} className="sm:w-[22px] sm:h-[22px]" />
                        </div>
                        <div className="min-w-0 flex-1 sm:flex-none">
                            <h4 className="text-sm sm:text-base profile-name-text font-bold">{t("profile.monthly_recap")}</h4>
                            <p className="text-[0.65rem] sm:text-xs profile-meta-text opacity-60 font-medium tracking-wide truncate">
                                {new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 sm:flex sm:items-center sm:gap-12 w-full sm:w-auto">
                        <div className="text-center">
                            <p className="text-[0.5rem] sm:text-[0.6rem] uppercase tracking-widest profile-meta-text opacity-40 font-black mb-1">{t("profile.bookings")}</p>
                            <p className="text-sm sm:text-lg font-bold profile-name-text">{stats?.currentMonthBookings || 0}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[0.5rem] sm:text-[0.6rem] uppercase tracking-widest profile-meta-text opacity-40 font-black mb-1">{t("profile.spent")}</p>
                            <p className="text-sm sm:text-lg font-bold profile-name-text tracking-tight">${stats?.currentMonthSpent?.toFixed(2) || "0.00"}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[0.5rem] sm:text-[0.6rem] uppercase tracking-widest profile-meta-text opacity-40 font-black mb-1">{t("profile.last")}</p>
                            <p className="text-[0.6rem] sm:text-[0.75rem] font-bold profile-name-text tracking-wide">
                                {stats?.lastBookingAt ? new Date(stats.lastBookingAt).toLocaleDateString() : t("profile.na")}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PersonalInfoSection;