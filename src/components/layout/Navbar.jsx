"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthContext } from '@/features/auth/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import NotificationBell from "@/components/layout/NotificationBell";
import { useMyBusiness } from '@/features/business/hooks/useMyBusiness';
import MessageModal from '@/features/business/components/MessageModal';
import AgreementsModal from '@/features/business/components/AgreementsModal';
import SupportModal from '@/features/support/components/SupportModal';
import CustomerCurrentBookingsModal from '@/features/profile/components/CustomerCurrentBookingsModal';
import { useLanguage } from '@/context/LanguageContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isAgreementsOpen, setIsAgreementsOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isCurrentBookingsOpen, setIsCurrentBookingsOpen] = useState(false);

  const [isScrolled, setIsScrolled] = useState(false);
  const { user, loading, logout } = useAuthContext();
  const { business, loading: businessLoading } = useMyBusiness();
  const router = useRouter();
  const pathname = usePathname();
  const { language, toggleLanguage, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    router.push('/login');
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[1000] w-full transition-all duration-300 ${isScrolled
        ? 'bg-white shadow-md py-3 md:py-4'
        : 'navbar-bg-transparent py-5 md:py-6'
        }`}
    >
      <div className="w-full px-4 sm:px-6 md:px-10 lg:px-16 xl:px-8 2xl:px-24 mx-auto">
        <div className="flex items-center justify-between gap-2 flex-nowrap">
          {/* Left Side: Logo & Primary Links */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-6 xl:gap-3 2xl:gap-6 min-w-0 flex-shrink">
            <Link
              href="/"
              className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-3 group transition-all flex-shrink-0"
            >
              <img
                src="/logo/fastbooking.png"
                alt="Fast Booking Service Logo"
                className="w-12 sm:w-14 lg:w-20 xl:w-16 2xl:w-20 h-auto object-contain transition-transform group-hover:scale-110 flex-shrink-0"
              />
              <div className="flex flex-col leading-tight items-start px-2 py-1 md:px-3 lg:px-4 xl:px-2.5 2xl:px-4 md:py-1.5 lg:py-2 xl:py-1 2xl:py-2 rounded-xl lg:rounded-2xl navbar-link-bg border border-white/80 shadow-sm group-hover:bg-white/90 transition-all">
                <span className="text-sm sm:text-lg lg:text-xl xl:text-base 2xl:text-xl font-black navbar-logo-text tracking-tighter whitespace-nowrap leading-[1.1] pb-0.5">
                  {t('navbar.logo_text')}
                </span>
                <span className="text-[8px] sm:text-[10px] lg:text-[12px] xl:text-[9px] 2xl:text-[12px] font-bold uppercase tracking-[0.2em] navbar-logo-subtext -mt-0.5">
                  {t('navbar.logo_subtext')}
                </span>
              </div>
            </Link>

            <div className="hidden xl:flex items-center gap-1.5 2xl:gap-3">
              <Link
                href="/"
                className={`px-3 xl:px-3.5 2xl:px-5 py-2 md:py-2.5 rounded-full text-xs 2xl:text-sm font-medium transition-all shadow-sm ${isScrolled
                  ? 'navbar-link-bg-scrolled navbar-link-text hover:navbar-link-hover-bg hover:navbar-link-hover-text'
                  : 'navbar-link-bg navbar-link-text hover:navbar-link-hover-bg-alt hover:navbar-link-hover-text'
                  }`}
              >
                {t('navbar.home')}
              </Link>
              <Link
                href="/salons"
                className={`px-3 xl:px-3.5 2xl:px-5 py-2 md:py-2.5 rounded-full text-xs 2xl:text-sm font-medium transition-all shadow-sm ${isScrolled
                  ? 'navbar-link-bg-scrolled navbar-link-text hover:navbar-link-hover-bg hover:navbar-link-hover-text'
                  : 'navbar-link-bg navbar-link-text hover:navbar-link-hover-bg-alt hover:navbar-link-hover-text'
                  }`}
              >
                {t('navbar.salons')}
              </Link>
              {business && (
                <Link
                  href="/partner/documents"
                  className={`px-3 xl:px-3.5 2xl:px-5 py-2 md:py-2.5 rounded-full text-xs 2xl:text-sm font-medium transition-all shadow-sm ${isScrolled
                    ? 'navbar-link-bg-scrolled navbar-link-text hover:navbar-link-hover-bg hover:navbar-link-hover-text'
                    : 'navbar-link-bg navbar-link-text hover:navbar-link-hover-bg-alt hover:navbar-link-hover-text'
                    }`}
                >
                  {t('navbar.documents')}
                </Link>
              )}
              {business && (
                <button
                  onClick={() => setIsMessagesOpen(true)}
                  className={`px-3 xl:px-3.5 2xl:px-5 py-2 md:py-2.5 rounded-full text-xs 2xl:text-sm font-medium transition-all shadow-sm ${isScrolled
                    ? 'navbar-link-bg-scrolled navbar-link-text hover:navbar-link-hover-bg hover:navbar-link-hover-text'
                    : 'navbar-link-bg navbar-link-text hover:navbar-link-hover-bg-alt hover:navbar-link-hover-text'
                    }`}
                >
                  {t('navbar.messages')}
                </button>
              )}
              {business && (
                <button
                  onClick={() => setIsAgreementsOpen(true)}
                  className={`px-3 xl:px-3.5 2xl:px-5 py-2 md:py-2.5 rounded-full text-xs 2xl:text-sm font-medium transition-all shadow-sm ${isScrolled
                    ? 'navbar-link-bg-scrolled navbar-link-text hover:navbar-link-hover-bg hover:navbar-link-hover-text'
                    : 'navbar-link-bg navbar-link-text hover:navbar-link-hover-bg-alt hover:navbar-link-hover-text'
                    }`}
                >
                  {t('navbar.agreement')}
                </button>
              )}

            </div>
          </div>

          {/* Right Side: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 lg:gap-4 xl:gap-2 2xl:gap-4 ml-auto">


            <Link
              href="/contact"
              className={`hidden sm:flex px-4 xl:px-4 2xl:px-6 py-2.5 xl:py-2.5 2xl:py-3 rounded-full text-xs xl:text-xs 2xl:text-sm font-semibold transition-all shadow-md active:scale-95 whitespace-nowrap ${isScrolled
                ? 'navbar-btn-primary-bg navbar-btn-primary-text hover:navbar-btn-primary-hover-bg'
                : 'navbar-btn-outline-bg navbar-btn-outline-text hover:navbar-btn-primary-hover-bg hover:navbar-btn-primary-text navbar-btn-outline-border'
                }`}
            >
              {t('navbar.list_business')}
            </Link>

            {/* // Navbar ke andar, user logged in ho to: */}
            <div className=''>
              {!loading && user && <NotificationBell isScrolled={isScrolled} />}
            </div>


            {/* Auth / Profile */}
            <div className="relative flex items-center">
              {loading ? (
                // Skeleton loader to prevent popping
                <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-gray-200/40 animate-pulse border border-white/20"></div>
              ) : user ? (
                <>
                  <button
                    onClick={() => {
                      setIsProfileOpen(!isProfileOpen);
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center justify-center w-9 h-9 md:w-11 md:h-11 rounded-full transition-all shadow-md border-2 ${isScrolled
                      ? 'navbar-btn-primary-bg navbar-btn-primary-text hover:navbar-btn-primary-hover-bg border-white/30'
                      : 'navbar-btn-outline-bg navbar-btn-outline-text hover:navbar-btn-primary-bg hover:navbar-btn-primary-text border-white/50'
                      }`}
                    aria-label="User profile"
                  >
                    <span className="material-symbols-outlined text-xl md:text-2xl">person</span>
                  </button>

                  {isProfileOpen && (
                    <div className="fixed 
  left-1/2 -translate-x-1/2   /* perfect center */
  md:absolute md:left-1/2 md:-translate-x-1/2 md:right-auto   /* desktop centered */
  top-12 
  w-[calc(100vw-2rem)] sm:w-64 md:w-48 
  max-w-[calc(100vw-2rem)] 
  bg-white/95 backdrop-blur-md 
  rounded-xl overflow-hidden py-2 
  shadow-xl border border-gray-200 
  animate-in fade-in slide-in-from-top-2 duration-200 
  z-50 mt-5">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium navbar-link-text hover:bg-[#D98C5F]/10 hover:text-[#D98C5F] transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <span className="material-symbols-outlined text-lg">account_circle</span>
                        {t('navbar.profile')}
                      </Link>
                      {user?.role === 'CUSTOMER' && (
                        <button
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium navbar-link-text hover:bg-[#D98C5F]/10 hover:text-[#D98C5F] transition-colors text-left cursor-pointer"
                          onClick={() => {
                            setIsCurrentBookingsOpen(true);
                            setIsProfileOpen(false);
                          }}
                        >
                          <span className="material-symbols-outlined text-lg">calendar_today</span>
                          {t('navbar.current_bookings') || "Current Bookings"}
                        </button>
                      )}
                      {['ADMIN', 'SUPER_ADMIN', 'STAFF', 'RECEPTIONIST'].includes(user?.role) && (
                        <Link
                          href="https://fastbookingservice.com/admin"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium navbar-link-text hover:bg-[#D98C5F]/10 hover:text-[#D98C5F] transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                          {t('navbar.console')}
                        </Link>
                      )}
                      {business && (
                        <Link
                          href="/partner/documents"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium navbar-link-text hover:bg-[#D98C5F]/10 hover:text-[#D98C5F] transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <span className="material-symbols-outlined text-lg">description</span>
                          {t('navbar.documents')}
                        </Link>
                      )}
                      {business && (
                        <button
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium navbar-link-text hover:bg-[#D98C5F]/10 hover:text-[#D98C5F] transition-colors text-left"
                          onClick={() => {
                            setIsMessagesOpen(true);
                            setIsProfileOpen(false);
                          }}
                        >
                          <span className="material-symbols-outlined text-lg">chat</span>
                          {t('navbar.messages')}
                        </button>
                      )}
                      {business && (
                        <button
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium navbar-link-text hover:bg-[#D98C5F]/10 hover:text-[#D98C5F] transition-colors text-left"
                          onClick={() => {
                            setIsAgreementsOpen(true);
                            setIsProfileOpen(false);
                          }}
                        >
                          <span className="material-symbols-outlined text-lg">description</span>
                          {t('navbar.agreement')}
                        </button>
                      )}

                      <button
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium navbar-link-text hover:bg-[#D98C5F]/10 hover:text-[#D98C5F] transition-colors text-left cursor-pointer"
                        onClick={() => {
                          setIsSupportOpen(true);
                          setIsProfileOpen(false);
                        }}
                      >
                        <span className="material-symbols-outlined text-lg">contact_support</span>
                        {t('navbar.support')}
                      </button>

                      <button
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium navbar-link-text hover:bg-[#D98C5F]/10 hover:text-[#D98C5F] transition-colors text-left"
                        onClick={handleLogout}
                      >
                        <span className="material-symbols-outlined text-lg">logout</span>
                        {t('navbar.logout')}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={`/login?redirect=${encodeURIComponent(pathname)}`}
                  className={`py-2 md:py-3 rounded-full font-semibold transition-all shadow-md active:scale-95 whitespace-nowrap ${
                    language === 'ar'
                      ? 'px-2.5 text-[10px] sm:px-5 sm:text-xs'
                      : 'px-3 sm:px-5 text-xs md:text-sm'
                  } ${isScrolled
                    ? 'navbar-btn-primary-bg navbar-btn-primary-text hover:navbar-btn-primary-hover-bg'
                    : 'navbar-btn-outline-bg navbar-btn-outline-text hover:navbar-btn-primary-bg hover:navbar-btn-primary-text border border-white/30'
                    }`}
                >
                  {t('navbar.login')}
                </Link>
              )}
            </div>

            {/* Language Switcher */}
            <div
              onClick={toggleLanguage}
              className={`hidden xl:flex items-center relative cursor-pointer select-none bg-[#FDF9F4] border border-[#EFE5D3] rounded-full p-0.5 w-[78px] h-[30px] transition-all shadow-sm active:scale-95 ${
                isScrolled ? 'mr-1' : 'mr-1'
              }`}
            >
              {/* Sliding Background Pill */}
              <div
                className={`absolute top-0.5 bottom-0.5 left-0.5 w-[35px] rounded-full bg-[#1C3152] transition-transform duration-300 ease-out ${
                  language === 'en' ? 'translate-x-0' : 'translate-x-[37px]'
                }`}
              />

              {/* Text labels */}
              <div className="flex w-full justify-between items-center text-[11px] font-bold z-10">
                <span
                  className={`w-[35px] text-center transition-colors duration-300 ${
                    language === 'en' ? 'text-[#C49B66] font-bold' : 'text-[#8C8375]'
                  }`}
                >
                  EN
                </span>
                <span
                  className={`w-[35px] text-center transition-colors duration-300 ${
                    language === 'ar' ? 'text-[#C49B66] font-bold' : 'text-[#8C8375]'
                  }`}
                >
                  AR
                </span>
              </div>
            </div>

            {/* Hamburger (Mobile) */}
            <button
              className={`flex items-center justify-center xl:hidden p-1.5 md:p-2.5 rounded-lg transition-all ${isScrolled
                ? 'navbar-link-bg-scrolled text-black hover:navbar-link-hover-bg hover:navbar-link-hover-text'
                : 'navbar-btn-outline-bg text-black hover:navbar-link-hover-bg hover:navbar-link-hover-text'
                }`}
              onClick={() => {
                setIsMenuOpen(!isMenuOpen);
                setIsProfileOpen(false);
              }}
            >
              <span className="material-symbols-outlined text-[21px] sm:text-2xl">{isMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="absolute top-full inset-x-4 mt-2 p-4 xl:hidden flex flex-col gap-3 shadow-2xl border border-[#D98C5F]/10 bg-white/95 backdrop-blur-2xl animate-in slide-in-from-top-4 duration-300 rounded-3xl">
          <div className="flex flex-col gap-2 p-2">
            <Link
              href="/"
              className="flex items-center gap-3 navbar-link-text font-medium hover:text-[#D98C5F] transition-all px-4 py-3.5 rounded-2xl hover:bg-[#D98C5F]/10 text-base"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="material-symbols-outlined text-xl">home</span>
              {t('navbar.home')}
            </Link>
            <Link
              href="/salons"
              className="flex items-center gap-3 navbar-link-text font-medium hover:text-[#D98C5F] transition-all px-4 py-3.5 rounded-2xl hover:bg-[#D98C5F]/10 text-base"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="material-symbols-outlined text-xl">storefront</span>
              {t('navbar.salons')}
            </Link>

            {business && (
              <Link
                href="/partner/documents"
                className="flex items-center gap-3 navbar-link-text font-medium hover:text-[#D98C5F] transition-all px-4 py-3.5 rounded-2xl hover:bg-[#D98C5F]/10 text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="material-symbols-outlined text-xl">description</span>
                {t('navbar.documents')}
              </Link>
            )}
            
            {business && (
              <button
                className="flex items-center gap-3 navbar-link-text font-medium hover:text-[#D98C5F] transition-all px-4 py-3.5 rounded-2xl hover:bg-[#D98C5F]/10 text-base w-full text-left"
                onClick={() => {
                  setIsMessagesOpen(true);
                  setIsMenuOpen(false);
                }}
              >
                <span className="material-symbols-outlined text-xl">chat</span>
                {t('navbar.messages')}
              </button>
            )}

            {business && (
              <button
                className="flex items-center gap-3 navbar-link-text font-medium hover:text-[#D98C5F] transition-all px-4 py-3.5 rounded-2xl hover:bg-[#D98C5F]/10 text-base w-full text-left"
                onClick={() => {
                  setIsAgreementsOpen(true);
                  setIsMenuOpen(false);
                }}
              >
                <span className="material-symbols-outlined text-xl">description</span>
                {t('navbar.agreement')}
              </button>
            )}

            {user && (
              <button
                className="flex items-center gap-3 navbar-link-text font-medium hover:text-[#D98C5F] transition-all px-4 py-3.5 rounded-2xl hover:bg-[#D98C5F]/10 text-base w-full text-left cursor-pointer"
                onClick={() => {
                  setIsSupportOpen(true);
                  setIsMenuOpen(false);
                }}
              >
                <span className="material-symbols-outlined text-xl">contact_support</span>
                {t('navbar.support')}
              </button>
            )}

            {user && user.role === 'CUSTOMER' && (
              <button
                className="flex items-center gap-3 navbar-link-text font-medium hover:text-[#D98C5F] transition-all px-4 py-3.5 rounded-2xl hover:bg-[#D98C5F]/10 text-base w-full text-left cursor-pointer animate-in fade-in duration-200"
                onClick={() => {
                  setIsCurrentBookingsOpen(true);
                  setIsMenuOpen(false);
                }}
              >
                <span className="material-symbols-outlined text-xl">calendar_today</span>
                {t('navbar.current_bookings') || "Current Bookings"}
              </button>
            )}

            <div className="h-px w-full bg-gray-100 my-2" />

            <Link
              href="/contact"
              className="flex items-center gap-3 navbar-link-text font-medium hover:text-[#D98C5F] transition-all px-4 py-3.5 rounded-2xl hover:bg-[#D98C5F]/10 text-base"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="material-symbols-outlined text-xl">business_center</span>
              {t('navbar.list_business')}
            </Link>

            {/* Mobile Language Switcher */}
            <button
              onClick={() => {
                toggleLanguage();
                setIsMenuOpen(false);
              }}
              className="mt-2 flex items-center justify-center gap-2 py-3 px-4 border border-[#D98C5F]/20 hover:bg-[#D98C5F]/5 text-[#D98C5F] rounded-2xl font-semibold active:scale-[0.98] transition-all text-base text-center w-full cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">language</span>
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </button>

            {!loading && !user && (
              <Link
                href={`/login?redirect=${encodeURIComponent(pathname)}`}
                className="mt-3 flex items-center justify-center gap-2 py-3.5 navbar-btn-primary-bg hover:navbar-btn-primary-hover-bg navbar-btn-primary-text rounded-2xl font-semibold shadow-lg shadow-[#D98C5F]/30 active:scale-[0.98] transition-all text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="material-symbols-outlined text-xl">login</span>
                {t('navbar.login')}
              </Link>
            )}
          </div>
        </div>
      )}

      {business && (
        <MessageModal
          isOpen={isMessagesOpen}
          onClose={() => setIsMessagesOpen(false)}
          businessId={business.id}
        />
      )}

      {business && (
        <AgreementsModal
          isOpen={isAgreementsOpen}
          onClose={() => setIsAgreementsOpen(false)}
          businessId={business.id}
        />
      )}

      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />

      <CustomerCurrentBookingsModal
        isOpen={isCurrentBookingsOpen}
        onClose={() => setIsCurrentBookingsOpen(false)}
      />

    </nav>
  );
}