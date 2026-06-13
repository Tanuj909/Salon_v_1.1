"use client";

import React, { useRef, useEffect, useState } from 'react';
import { useStaffProfile } from '../hooks/useStaffProfile';
import { useLanguage } from '@/context/LanguageContext';
import StaffProfileModal from './StaffProfileModal';

// ─── Reveal Animation Hook ────────────────────────────────────────────────
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.05, rootMargin: "50px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({ children, delay = 0, className = "" }) {
  const { ref, visible } = useReveal();
  const safeDelay = Math.min(delay, 300);
  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} ${className}`}
      style={{ transitionDelay: `${safeDelay}ms` }}
    >
      {children}
    </div>
  );
}


// ─── Staff Card ───────────────────────────────────────────────────────────────
function StaffCard({ member, index, onBook, onView }) {
  const { t } = useLanguage();
  const name = member.userFullName || member.fullName || "Specialist";
  return (
    <Reveal delay={index * 100}>
      <div className="group relative bg-white p-4 sm:p-5 rounded-2xl sm:rounded-[48px] border hero-filter-input-bg shadow-md hover:border-accent/40 transition-all duration-700 hover:shadow-xl flex flex-col items-center text-center h-full">
        <div className="relative mb-5 mt-2 w-full flex justify-center">
          <div className="w-28 h-28 rounded-full overflow-hidden border-[3px] hero-filter-input-bg shadow-md relative z-10 bg-[#f7ede2] group-hover:border-accent/40 transition-colors duration-500">
            <img
              src={member.userProfileImageUrl || `https://ui-avatars.com/api/?name=${name}&background=1C3152&color=ffffff`}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              style={{ objectPosition: "top" }}
            />
          </div>
        </div>

        <h3 className="text-lg salon-list-title-text font-bold mb-1 group-hover:salon-list-title-accent transition-colors truncate w-full px-2">{name}</h3>
        <p className="text-[8px] uppercase tracking-[0.2em] salon-card-text opacity-50 font-extrabold mb-3 truncate w-full px-2">{member.designation}</p>



        <div className="flex items-center justify-between gap-2 mb-5 w-full border-t hero-filter-input-bg pt-5 px-1">
          <div className="flex flex-col items-center flex-1">
            <span className="text-[13px] font-bold salon-list-title-text">{(member.averageRating || 0).toFixed(1)}</span>
            <span className="text-[7px] uppercase tracking-widest salon-card-text opacity-40 font-bold">{t("salon_details.grade")}</span>
          </div>
          <div className="w-px h-6 hero-filter-input-bg" />
          <div className="flex flex-col items-center flex-1">
            <span className="text-[13px] font-bold salon-list-title-text">{member.totalReviews || 0}</span>
            <span className="text-[7px] uppercase tracking-widest salon-card-text opacity-40 font-bold">{t("salon_details.reviews")}</span>
          </div>
          <div className="w-px h-6 hero-filter-input-bg" />
          <div className="flex flex-col items-center flex-1">
            <span className="text-[13px] font-bold salon-list-title-text">{member.totalBookings || 0}</span>
            <span className="text-[7px] uppercase tracking-widest salon-card-text opacity-40 font-bold">{t("salon_details.bookings")}</span>
          </div>
        </div>

        <div className="flex gap-2.5 w-full mt-auto">
          <button
            onClick={onView}
            className="flex-1 py-3 bg-transparent hover:bg-[#1C3152] text-[#1C3152] hover:text-white border border-[#1C3152]/30 hover:border-transparent rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all duration-300 active:scale-95 cursor-pointer"
          >
            {t("salon_details.view_bio")}
          </button>
          <button
            onClick={onBook}
            className="flex-1 py-3 rounded-xl border-0 rec-btn-primary text-white text-[9px] font-bold uppercase tracking-wider hover:shadow-xl transition-all duration-300 active:scale-95 cursor-pointer"
          >
            {t("salon_details.book_now")}
          </button>
        </div>
      </div>
    </Reveal>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────
const SalonStaff = ({ staff: allStaff, onBookStaff, onBookStaffService }) => {
  const { t } = useLanguage();
  const { profile, customPrices, loading: profileLoading, error: profileError, fetchProfile, clearProfile } = useStaffProfile();
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const staff = React.useMemo(() => {
    if (!allStaff) return [];
    return allStaff.filter(
      (member) =>
        !member.designation?.toLowerCase().includes("receptionist") &&
        !member.designation?.toLowerCase().includes("front desk")
    );
  }, [allStaff]);

  const handleCardClick = (staffMember) => {
    onBookStaff?.(staffMember);
  };

  const handleViewProfile = (staffMember) => {
    setSelectedMember(staffMember);
    setShowModal(true);
    fetchProfile(staffMember.id);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMember(null);
    clearProfile();
  };

  return (
    <>
      <section className="py-8 sm:py-12" id="staff">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
                <Reveal>
                    <div className="text-center mb-16 sm:mb-24">
                        <span className="block text-[10px] sm:text-[11px] tracking-[0.3em] sm:tracking-[0.4em] uppercase rec-section-heading-accent font-extrabold mb-4 sm:mb-6">{t("salon_details.master_artisans")}</span>
                        <h2 className="text-[24px] sm:text-5xl md:text-6xl rec-section-heading font-bold leading-tight font-[Cormorant_Garamond,serif]">
                            {t("salon_details.meet_our_experts").split(' ')[0]} {t("salon_details.meet_our_experts").split(' ')[1]} <em className="italic font-light rec-section-heading-accent">{t("salon_details.meet_our_experts").split(' ').slice(2).join(' ')}</em>
                        </h2>
                    </div>
                </Reveal>

          {(!staff || staff.length === 0) ? (
            <div className="bg-white/30 rounded-2xl sm:rounded-[48px] p-8 sm:p-24 text-center border hero-filter-input-bg italic footer-link-text opacity-60">
              {t("salon_details.no_staff_profiles")}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-12">
              {staff.map((member, index) => (
                <StaffCard
                  key={member.id || index}
                  member={member}
                  index={index}
                  onBook={() => handleCardClick(member)}
                  onView={() => handleViewProfile(member)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {showModal && (
        <StaffProfileModal
          profile={profile}
          customPrices={customPrices}
          member={selectedMember}
          loading={profileLoading}
          error={profileError}
          onClose={handleCloseModal}
          onBookService={(service) => {
            handleCloseModal();
            // Pass custom price to the book service action if present!
            const customPrice = customPrices?.[service.id] ?? customPrices?.[String(service.id)];
            const serviceWithPrice = { ...service, price: customPrice };
            onBookStaffService?.(selectedMember, serviceWithPrice);
          }}
        />
      )}
    </>
  );
};

export default SalonStaff;