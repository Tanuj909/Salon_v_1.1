"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { registerUser, sendOTP } from "@/features/auth/services/authService";
import { useAuthContext } from "@/features/auth/providers/AuthProvider";
import TermsAndCondition from "@/components/TermsAndCondition";
import { useLanguage } from "@/context/LanguageContext";

export default function SignupClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const { refreshUser } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [step, setStep] = useState(1); // 1: Email, 2: OTP + Details
  const [showTerms, setShowTerms] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const { t } = useLanguage();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    otp: "",
    password: "",
  });

  const handleGetOTP = async (e) => {
    e.preventDefault();
    if (!form.email) return;
    
    setSendingOtp(true);
    try {
      await sendOTP({ email: form.email, purpose: "REGISTRATION" });
      setStep(2);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setTermsError(true);
      return;
    }
    setLoading(true);

    try {
      await registerUser(form);
      await refreshUser();
      alert("Registration successful!");
      router.push(redirect || "/");
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 py-12 hero-filter-input-bg">
      <div className="w-full max-w-2xl">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8 animate-fade-in">
          <Link href="/" className="inline-flex items-center justify-center mb-6 sm:mb-8">
            <img 
              src="/logo/fastbooking.png" 
              alt="Fast Booking Service Logo" 
              className="w-20 sm:w-28 h-auto object-contain" 
            />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold rec-section-heading font-[Cormorant_Garamond,serif] tracking-tight">
            {step === 1 ? t('signup.get_started') : t('signup.complete_details')}
          </h1>
          <p className="text-[10px] uppercase tracking-[0.4em] rec-section-subtext font-bold mt-2">
            {step === 1 
              ? t('signup.journey_excellence') 
              : t('signup.refining_account')}
          </p>
        </div>

        {/* Signup Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] p-8 md:p-10 shadow-2xl border rec-card-border animate-slide-up">
          {step === 1 ? (
            <form onSubmit={handleGetOTP} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold rec-section-heading opacity-70 ml-1">
                  {t('signup.email_address')}
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#1C3152]/30 text-xl">mail</span>
                  <input
                    type="email"
                    required
                    placeholder={t('signup.email_placeholder')}
                    value={form.email}
                    className="w-full pl-12 pr-4 py-4 bg-[#1C3152]/5 border-transparent rounded-2xl text-sm focus:ring-2 focus:ring-[#1C3152]/10 transition-all placeholder-[#1C3152]/20 outline-none rec-section-heading font-medium"
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={sendingOtp}
                className="w-full py-4 rec-btn-primary rounded-2xl font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-[11px] uppercase tracking-[0.2em] shadow-xl"
              >
                {sendingOtp ? (
                  <span className="animate-spin material-symbols-outlined">progress_activity</span>
                ) : (
                  <>
                    <span>{t('signup.get_otp')}</span>
                    <span className="material-symbols-outlined text-sm">send</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Full Name */}
                 <div className="space-y-2">
                   <label className="text-[10px] uppercase tracking-widest font-bold rec-section-heading opacity-70 ml-1">
                     {t('signup.full_name')}
                   </label>
                   <div className="relative">
                     <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#1C3152]/30 text-xl">person</span>
                     <input
                       type="text"
                       required
                       placeholder={t('signup.full_name_placeholder')}
                       value={form.fullName}
                       className="w-full pl-12 pr-4 py-4 bg-[#1C3152]/5 border-transparent rounded-2xl text-sm focus:ring-2 focus:ring-[#1C3152]/10 transition-all placeholder-[#1C3152]/20 outline-none rec-section-heading font-medium"
                       onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                     />
                   </div>
                 </div>
 
                 {/* Phone Number */}
                 <div className="space-y-2">
                   <label className="text-[10px] uppercase tracking-widest font-bold rec-section-heading opacity-70 ml-1">
                     {t('signup.phone_number')}
                   </label>
                   <div className="relative">
                     <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#1C3152]/30 text-xl">call</span>
                     <input
                       type="tel"
                       required
                       placeholder={t('signup.phone_number_placeholder')}
                       value={form.phoneNumber}
                       className="w-full pl-12 pr-4 py-4 bg-[#1C3152]/5 border-transparent rounded-2xl text-sm focus:ring-2 focus:ring-[#1C3152]/10 transition-all placeholder-[#1C3152]/20 outline-none rec-section-heading font-medium"
                       onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                     />
                   </div>
                 </div>
 
                 {/* OTP */}
                 <div className="space-y-2">
                   <label className="text-[10px] uppercase tracking-widest font-bold rec-section-heading opacity-70 ml-1">
                     {t('signup.otp')}
                   </label>
                   <div className="relative">
                     <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#1C3152]/30 text-xl">verified_user</span>
                     <input
                       type="text"
                       required
                       placeholder={t('signup.otp_placeholder')}
                       value={form.otp}
                       className="w-full pl-12 pr-4 py-4 bg-[#1C3152]/5 border-transparent rounded-2xl text-sm focus:ring-2 focus:ring-[#1C3152]/10 transition-all placeholder-[#1C3152]/20 outline-none rec-section-heading font-medium"
                       onChange={(e) => setForm({ ...form, otp: e.target.value })}
                     />
                   </div>
                   <p className="text-[11px] text-[#C49B66] font-semibold ml-1 mt-1">
                     * Please check OTP in spam/junk folder as well
                   </p>
                 </div>
  
                  {/* Password */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold rec-section-heading opacity-70 ml-1">
                      {t('signup.password')}
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#1C3152]/30 text-xl">lock</span>
                      <input
                        type="password"
                        required
                        placeholder={t('signup.password_placeholder')}
                        value={form.password}
                        className="w-full pl-12 pr-4 py-4 bg-[#1C3152]/5 border-transparent rounded-2xl text-sm focus:ring-2 focus:ring-[#1C3152]/10 transition-all placeholder-[#1C3152]/20 outline-none rec-section-heading font-medium"
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                      />
                    </div>
                  </div>
               </div>
 
               {/* Terms & Conditions Checkbox */}
               <div className="space-y-3">
                 <div className="flex items-start gap-3 mt-4 px-1">
                   <div className="flex items-center h-5">
                     <input
                       id="terms"
                       type="checkbox"
                       checked={acceptedTerms}
                       onChange={(e) => {
                         setAcceptedTerms(e.target.checked);
                         if (e.target.checked) setTermsError(false);
                       }}
                       className="w-5 h-5 rounded border-gray-300 text-[#1C3152] focus:ring-[#1C3152]/20 cursor-pointer"
                     />
                   </div>
                   <div className="text-xs sm:text-sm">
                     <label htmlFor="terms" className="rec-section-subtext font-medium cursor-pointer">
                       {t('signup.terms_read_agree')}{" "}
                     </label>
                     <button
                       type="button"
                       onClick={() => setShowTerms(true)}
                       className="text-[#1C3152] font-bold hover:underline"
                     >
                       {t('signup.terms_conditions')}
                     </button>
                   </div>
                 </div>
                 {termsError && (
                   <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider ml-1 animate-shake">
                     {t('signup.terms_error')}
                   </p>
                 )}
               </div>
 
               <div className="flex flex-col gap-4">
                 <button
                   type="submit"
                   disabled={loading || !acceptedTerms}
                   className="w-full py-4 rec-btn-primary rounded-2xl font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-[11px] uppercase tracking-[0.2em] shadow-xl"
                 >
                   {loading ? (
                     <span className="animate-spin material-symbols-outlined">progress_activity</span>
                   ) : (
                     <>
                       <span>{t('signup.create_account')}</span>
                       <span className="material-symbols-outlined text-sm">person_add</span>
                     </>
                   )}
                 </button>
                 
                 <button
                   type="button"
                   onClick={() => setStep(1)}
                   className="w-full py-2 rec-section-subtext text-sm font-semibold hover:rec-section-heading transition-colors"
                 >
                   {t('signup.back_email')}
                 </button>
               </div>
            </form>
          )}
 
        </div>
        <div className="mt-8 text-center animate-fade-in delay-300">
          <p className="text-sm rec-section-subtext">
            {t('signup.have_account')}{" "}
            <Link href="/login" className="rec-section-heading-accent font-bold hover:underline ml-1 uppercase tracking-widest text-[10px]">
              {t('signup.signin')}
            </Link>
          </p>
        </div>
      </div>
      {showTerms && <TermsAndCondition onClose={() => setShowTerms(false)} />}
    </div>
  );
}
