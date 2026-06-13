"use client";

import React, { useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

// ─── Icons ────────────────────────────────────────────────────────────────
const CloseIcon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const InstagramIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const FacebookIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const LinkedinIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const YoutubeIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
  </svg>
);

const SnapchatIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3c-3 0-5.5 2-5.5 6 0 2 .5 3 1.5 4.5-.5.5-1.5 1-2.5 1-.8 0-1.5.5-1.5 1.5 0 .5.2.8.5 1a5 5 0 0 0 3 .5c.5 1 1.5 2.5 4.5 2.5s4-1.5 4.5-2.5a5 5 0 0 0 3-.5c.3-.2.5-.5.5-1 0-1-.7-1.5-1.5-1.5-1 0-2-.5-2.5-1 1-1.5 1.5-2.5 1.5-4.5 0-4-2.5-6-5.5-6z"></path>
  </svg>
);

export default function StaffProfileModal({ profile, customPrices = {}, member, loading, error, onClose, onBookService }) {
  const { t } = useLanguage();
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const formatTime = (time) => {
    if (!time) return '';
    const [h, m] = time.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  };

  // We merge profile and member data defensively
  const displayMember = {
    userFullName: profile?.userFullName || member?.userFullName || member?.fullName || "Specialist",
    designation: profile?.designation || member?.designation || "Stylist",
    userProfileImageUrl: profile?.userProfileImageUrl || member?.userProfileImageUrl,
    isAvailable: profile?.isAvailable ?? member?.isAvailable ?? true,
    instagramUrl: profile?.instagramUrl || member?.instagramUrl || "https://instagram.com",
    facebookUrl: profile?.facebookUrl || member?.facebookUrl || "https://facebook.com",
    linkedinUrl: profile?.linkedinUrl || member?.linkedinUrl || "https://linkedin.com",
    snapchatUrl: profile?.snapchatUrl || member?.snapchatUrl || "https://snapchat.com",
    youtubeUrl: profile?.youtubeUrl || member?.youtubeUrl || "https://youtube.com",
    bio: profile?.bio || member?.bio || "Professional stylist dedicated to providing exceptional service.",
    averageRating: profile?.averageRating ?? member?.averageRating ?? 0,
    totalReviews: profile?.totalReviews ?? member?.totalReviews ?? 0,
    totalBookings: profile?.totalBookings ?? member?.totalBookings ?? 0,
    experienceYears: profile?.experienceYears ?? member?.experienceYears ?? null,
    workStartTime: profile?.workStartTime || member?.workStartTime || "09:00:00",
    workEndTime: profile?.workEndTime || member?.workEndTime || "18:00:00",
    weeklyOffDays: profile?.weeklyOffDays || member?.weeklyOffDays || ["SUNDAY"],
    specializedServices: profile?.specializedServices || member?.specializedServices || [],
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-[#1C3152]/85 backdrop-blur-md animate-fadeIn" />
      <div
        className="relative w-full max-w-xl bg-white/95 backdrop-blur-2xl rounded-3xl sm:rounded-[40px] overflow-hidden shadow-2xl animate-slideUp border border-white/20 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Luxury top banner gradient */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#1C3152]/10 to-transparent pointer-events-none" />

        <button onClick={onClose} className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center footer-main-text transition-all cursor-pointer">
          <CloseIcon />
        </button>

        {loading && (
          <div className="absolute top-6 left-6 flex items-center gap-2 z-10 bg-white/80 backdrop-blur px-3 py-1 rounded-full shadow-sm border border-gray-100">
            <div className="w-3.5 h-3.5 border-2 border-muted border-t-accent rounded-full animate-spin" />
            <span className="text-[8px] uppercase tracking-widest text-[#1C3152]/80 font-bold">{t("salon_details.profiling_excellence")}</span>
          </div>
        )}

        {error && !loading && (
          <div className="absolute top-6 left-6 flex items-center gap-1.5 z-10 bg-red-50/90 backdrop-blur px-3 py-1 rounded-full shadow-sm border border-red-100 text-red-500">
            <span className="material-symbols-outlined text-[10px]">error</span>
            <span className="text-[8px] font-bold uppercase tracking-wider">{t("salon_details.error_loading") || "Error loading profile"}</span>
          </div>
        )}

        <div className="overflow-y-auto flex-1 p-6 sm:p-10 md:p-12 relative [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#1C3152]/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#1C3152]/40">
          <div className="flex flex-col items-center text-center mb-6 sm:mb-8 mt-4">
            <div className="relative w-28 h-28 mb-5 group cursor-pointer transition-transform duration-500 hover:scale-105">
              <div className="absolute inset-0 hero-filter-btn-bg rounded-[32px] rotate-6 scale-105 opacity-20 group-hover:rotate-12 transition-transform duration-500 shadow-md" />
              <div className="relative w-full h-full rounded-[32px] overflow-hidden border-2 border-white shadow-xl bg-gray-50">
                <img src={displayMember.userProfileImageUrl || `https://ui-avatars.com/api/?name=${displayMember.userFullName}&background=1C3152&color=ffffff`} alt={displayMember.userFullName} className="w-full h-full object-cover" />
              </div>
            </div>
            <h3 className="text-3xl font-bold footer-main-text mb-1.5 leading-tight">{displayMember.userFullName}</h3>
            
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[9px] uppercase tracking-[0.3em] hero-filter-btn-bg text-white px-3.5 py-1 rounded-full font-bold shadow-sm">{displayMember.designation}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider text-white shadow-sm ${displayMember.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}>
                {displayMember.isAvailable ? t("salon_details.active") : t("salon_details.busy")}
              </span>
            </div>

            {/* Social Media Links with Icon right under the name/designation/status badge in modal */}
            <div className="flex items-center justify-center gap-3.5 mt-1 mb-6">
              <a
                href={displayMember.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#F4F7FB] hover:bg-[#E1306C]/10 text-gray-500 hover:text-[#E1306C] border border-[#E2E8F0] hover:border-[#E1306C]/30 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-sm"
                title="Instagram"
              >
                <InstagramIcon size={14} />
              </a>
              <a
                href={displayMember.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#F4F7FB] hover:bg-[#1877F2]/10 text-gray-500 hover:text-[#1877F2] border border-[#E2E8F0] hover:border-[#1877F2]/30 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-sm"
                title="Facebook"
              >
                <FacebookIcon size={14} />
              </a>
              <a
                href={displayMember.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#F4F7FB] hover:bg-[#0A66C2]/10 text-gray-500 hover:text-[#0A66C2] border border-[#E2E8F0] hover:border-[#0A66C2]/30 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-sm"
                title="LinkedIn"
              >
                <LinkedinIcon size={14} />
              </a>
              <a
                href={displayMember.snapchatUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#F4F7FB] hover:bg-[#FFFC00]/10 text-gray-500 hover:text-[#FFB900] border border-[#E2E8F0] hover:border-[#FFFC00]/30 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-sm"
                title="Snapchat"
              >
                <SnapchatIcon size={14} />
              </a>
              <a
                href={displayMember.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#F4F7FB] hover:bg-[#FF0000]/10 text-gray-500 hover:text-[#FF0000] border border-[#E2E8F0] hover:border-[#FF0000]/30 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-sm"
                title="YouTube"
              >
                <YoutubeIcon size={14} />
              </a>
            </div>

            {/* Profile specifications right alongside the name block */}
            <div className="w-full bg-[#F4F7FB]/50 border border-[#E2E8F0] rounded-3xl p-5 text-left space-y-3.5 shadow-sm max-w-md mx-auto">
              <div className="flex items-start justify-between text-xs sm:text-sm gap-4">
                <span className="font-extrabold text-[#1C3152] uppercase tracking-wider whitespace-nowrap">{t("salon_details.bio_label") || "Bio"}:</span>
                <span className="font-medium text-gray-600 text-right italic leading-relaxed">&quot;{displayMember.bio}&quot;</span>
              </div>
              <div className="h-px bg-gray-200/60" />
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-extrabold text-[#1C3152] uppercase tracking-wider">{t("salon_details.average_rating") || "Average Rating"}:</span>
                <span className="font-black text-[#1C3152] flex items-center gap-1">
                  <span className="text-yellow-500">★</span> {displayMember.averageRating.toFixed(2)}
                </span>
              </div>
              <div className="h-px bg-gray-200/60" />
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-extrabold text-[#1C3152] uppercase tracking-wider">{t("salon_details.experience") || "Experience"}:</span>
                <span className="font-black text-[#1C3152]">{displayMember.experienceYears != null ? `${displayMember.experienceYears} ${t("salon_details.years") || "Years"}` : "—"}</span>
              </div>
              <div className="h-px bg-gray-200/60" />
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-extrabold text-[#1C3152] uppercase tracking-wider">{t("salon_details.total_reviews") || "Total Reviews"}:</span>
                <span className="font-black text-[#1C3152]">{displayMember.totalReviews}</span>
              </div>
              {/* <div className="h-px bg-gray-200/60" />
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-extrabold text-[#1C3152] uppercase tracking-wider">{t("salon_details.total_bookings") || "Total Bookings"}:</span>
                <span className="font-black text-[#1C3152]">{displayMember.totalBookings}</span>
              </div> */}
              <div className="h-px bg-gray-200/60" />
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-extrabold text-[#1C3152] uppercase tracking-wider">{t("salon_details.availability") || "Available"}:</span>
                <span className={`px-3.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider text-white shadow-sm ${displayMember.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}>
                  {displayMember.isAvailable ? t("salon_details.active") : t("salon_details.busy")}
                </span>
              </div>
              <div className="h-px bg-gray-200/60" />
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-extrabold text-[#1C3152] uppercase tracking-wider">{t("salon_details.working_hours") || "Working Hours"}:</span>
                <span className="font-black text-[#1C3152]">{formatTime(displayMember.workStartTime)} - {formatTime(displayMember.workEndTime)}</span>
              </div>
              <div className="h-px bg-gray-200/60" />
              <div className="flex items-start justify-between text-xs sm:text-sm gap-4">
                <span className="font-extrabold text-[#1C3152] uppercase tracking-wider whitespace-nowrap">{t("salon_details.weekly_off_days") || "Weekly Off Days"}:</span>
                <span className="font-black text-[#1C3152] text-right">
                  {displayMember.weeklyOffDays.map(day => t(`salon_details.days.${day}`) || day).join(', ')}
                </span>
              </div>
            </div>
          </div>

          {/* Body content with only specialized services list */}
          <div className="space-y-6">
            {displayMember.specializedServices && displayMember.specializedServices.length > 0 && (
              <div className="border-t border-gray-100 pt-5 text-left">
                <span className="block text-[8px] uppercase tracking-widest badge-verified-text font-bold mb-4 opacity-60">
                  {t("salon_details.specialized_services")}
                </span>
                <div className="space-y-3">
                  {displayMember.specializedServices.map((service) => {
                    const customPrice = customPrices?.[service.id] ?? customPrices?.[String(service.id)];
                    const displayPriceText = customPrice !== undefined ? `AED ${customPrice}` : "None";
                    return (
                      <div
                        key={service.id}
                        onClick={() => onBookService?.(service)}
                        className="flex items-center justify-between p-4 bg-gradient-to-br from-[#F4F7FB] to-white hover:from-[#F4F7FB] hover:to-[#F4F7FB] border border-[#E2E8F0]/80 hover:border-[#1C3152]/30 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                      >
                        <div className="flex flex-col min-w-0 pr-4 text-left">
                          <span className="text-sm font-extrabold text-[#1C3152] truncate">{service.name}</span>
                          {service.description && (
                            <span className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{service.description}</span>
                          )}
                          {service.durationMinutes && (
                            <span className="inline-block self-start mt-2 px-2 py-0.5 bg-[#1C3152]/5 text-[#1C3152] rounded text-[8px] font-bold uppercase tracking-wider">
                              {service.durationMinutes} {t("salon_details.mins")}
                            </span>
                          )}
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <span className="text-sm sm:text-base font-extrabold text-[#1C3152] bg-white border border-[#E2E8F0]/60 px-3 py-1.5 rounded-xl shadow-sm">
                            {displayPriceText}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
