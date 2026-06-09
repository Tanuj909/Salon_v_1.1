"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginUser } from "@/features/auth/services/authService";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLanguage } from "@/context/LanguageContext";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await loginUser(form);
      await refreshUser();
      router.push(redirect || "/profile");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 hero-filter-input-bg">
      <div className="w-full max-w-md mt-6 sm:mt-0 mb-6 sm:mb-0">
        {/* Logo/Brand Section */}
        <div className="text-center mb-6 sm:mb-8 animate-fade-in">
          <Link href="/" className="inline-flex items-center justify-center mb-6 sm:mb-8">
            <img 
              src="/logo/fastbooking.png" 
              alt="Fast Booking Service Logo" 
              className="w-20 sm:w-28 h-auto object-contain" 
            />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold rec-section-heading font-[Cormorant_Garamond,serif] tracking-tight">
            {t('login.welcome_back')}
          </h1>
          <p className="text-[10px] uppercase tracking-[0.4em] rec-section-subtext font-bold mt-2">
            {t('login.signin_excellence')}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 md:p-10 shadow-2xl border rec-card-border animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold rec-section-heading opacity-70 ml-1">
                {t('login.email_address')}
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[#1C3152]/30 text-lg sm:text-xl">email</span>
                <input
                  type="email"
                  required
                  placeholder={t('login.email_placeholder')}
                  className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-[#1C3152]/5 border-transparent rounded-xl sm:rounded-2xl text-sm focus:ring-2 focus:ring-[#1C3152]/10 transition-all placeholder-[#1C3152]/20 outline-none rec-section-heading font-medium"
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] uppercase tracking-widest font-bold rec-section-heading opacity-70">
                  {t('login.password')}
                </label>
                <Link href="/forgot-password" size="sm" className="text-[10px] font-bold uppercase tracking-wider rec-section-heading-accent hover:opacity-80 transition-opacity">
                  {t('login.forgot_password')}
                </Link>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[#1C3152]/30 text-lg sm:text-xl">lock</span>
                <input
                  type="password"
                  required
                  placeholder={t('login.password_placeholder')}
                  className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-[#1C3152]/5 border-transparent rounded-xl sm:rounded-2xl text-sm focus:ring-2 focus:ring-[#1C3152]/10 transition-all placeholder-[#1C3152]/20 outline-none rec-section-heading font-medium"
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 sm:mt-8 py-3.5 sm:py-4 rec-btn-primary rounded-xl sm:rounded-2xl font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-[11px] uppercase tracking-[0.2em] shadow-xl"
            >
              {loading ? (
                <span className="animate-spin material-symbols-outlined text-xl">progress_activity</span>
              ) : (
                <>
                  <span>{t('login.sign_in_btn')}</span>
                  <span className="material-symbols-outlined text-sm sm:text-base">arrow_forward</span>
                </>
              )}
            </button>
          </form>

        </div>
        <div className="mt-6 text-center animate-fade-in delay-300">
          <p className="text-xs sm:text-sm rec-section-subtext">
            {t('login.no_account')}{" "}
            <button 
              type="button" 
              onClick={() => router.push("/signup")}
              className="rec-section-heading-accent font-bold hover:underline ml-1 uppercase tracking-widest text-[10px]"
            >
              {t('login.register_now')}
            </button>
          </p>
        </div>
      </div>
      

    </div>
  );
}
