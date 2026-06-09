"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { forgotPassword, resetPassword } from "@/features/auth/services/authService";
import { useLanguage } from "@/context/LanguageContext";

export default function ForgotPasswordClient() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', text: '' }
  const [error, setError] = useState("");
  const { t } = useLanguage();

  // Auto-dismiss toast after 10s
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 10000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await forgotPassword(email);
      setToast({ type: "success", text: "OTP sent to your email. Please check!" });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP. Please check your email and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await resetPassword({ email, otp, newPassword });
      setToast({ type: "success", text: "Password reset successfully! Redirecting to login..." });
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password. Please check your OTP and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100svh] flex flex-col items-center justify-center px-3 py-6 sm:p-6 hero-filter-input-bg relative">

      {/* Toast Popup */}
      {toast && (
        <div className={`fixed top-5 inset-x-0 mx-auto z-[9999] w-[90%] max-w-md px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-2.5 animate-slide-down ${
          toast.type === "success"
            ? "bg-green-50 border-green-200 text-green-700"
            : "bg-red-50 border-red-200 text-red-600"
        }`}>
          <span className="material-symbols-outlined text-lg shrink-0">
            {toast.type === "success" ? "check_circle" : "error"}
          </span>
          <span className="text-xs sm:text-sm font-semibold flex-1">{toast.text}</span>
          <button
            onClick={() => setToast(null)}
            className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
          >
            <span className="material-symbols-outlined text-base opacity-50">close</span>
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-down {
          animation: slideDown 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }
      `}</style>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-5 sm:mb-8 animate-fade-in">
          <h1 className="text-xl sm:text-3xl font-bold rec-section-heading font-[Cormorant_Garamond,serif] tracking-tight">
            {step === 1 ? t('forgot_password.forgot_title') : t('forgot_password.reset_title')}
          </h1>
          <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.4em] rec-section-subtext font-bold mt-1.5 sm:mt-2">
            {step === 1 ? t('forgot_password.forgot_subtitle') : t('forgot_password.reset_subtitle')}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-[2.5rem] px-4 py-5 sm:p-8 md:p-10 shadow-2xl border rec-card-border animate-slide-up">

          {/* Error Message (inline) */}
          {error && (
            <div className="mb-4 sm:mb-5 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-red-50 border border-red-200 text-red-600 text-[11px] sm:text-xs font-semibold text-center flex items-center justify-center gap-1.5 sm:gap-2">
              <span className="material-symbols-outlined text-sm sm:text-base shrink-0">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Email */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-3.5 sm:space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold rec-section-heading opacity-70 ml-1">
                  {t('forgot_password.email_address')}
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#1C3152]/30 text-lg">email</span>
                  <input
                    type="email"
                    required
                    placeholder={t('forgot_password.email_placeholder')}
                    value={email}
                    className="w-full pl-10 pr-3 py-3 sm:py-4 bg-[#1C3152]/5 border-transparent rounded-xl sm:rounded-2xl text-sm focus:ring-2 focus:ring-[#1C3152]/10 transition-all placeholder-[#1C3152]/20 outline-none rec-section-heading font-medium"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 sm:mt-8 py-3 sm:py-4 rec-btn-primary rounded-xl sm:rounded-2xl font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 text-[11px] uppercase tracking-[0.2em] shadow-xl"
              >
                {loading ? (
                  <span className="animate-spin material-symbols-outlined text-lg sm:text-xl">progress_activity</span>
                ) : (
                  <>
                    <span>{t('forgot_password.send_otp')}</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP + New Password */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-3 sm:space-y-5">
              {/* Email (locked) */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold rec-section-heading opacity-70 ml-1">
                  {t('forgot_password.email_locked')}
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#1C3152]/30 text-lg">email</span>
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="w-full pl-10 pr-3 py-2.5 sm:py-4 bg-[#1C3152]/5 border-transparent rounded-xl sm:rounded-2xl text-xs sm:text-sm outline-none rec-section-heading font-medium opacity-60 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* OTP */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold rec-section-heading opacity-70 ml-1">
                  {t('forgot_password.otp_code')}
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#1C3152]/30 text-lg">pin</span>
                  <input
                    type="text"
                    required
                    placeholder={t('forgot_password.otp_placeholder')}
                    value={otp}
                    maxLength={6}
                    inputMode="numeric"
                    className="w-full pl-10 pr-3 py-2.5 sm:py-4 bg-[#1C3152]/5 border-transparent rounded-xl sm:rounded-2xl text-base sm:text-lg focus:ring-2 focus:ring-[#1C3152]/10 transition-all placeholder-[#1C3152]/20 placeholder:text-sm outline-none rec-section-heading font-bold tracking-[0.3em] text-center"
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold rec-section-heading opacity-70 ml-1">
                  {t('forgot_password.new_password')}
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#1C3152]/30 text-lg">lock</span>
                  <input
                    type="password"
                    required
                    placeholder={t('forgot_password.new_password_placeholder')}
                    value={newPassword}
                    className="w-full pl-10 pr-3 py-2.5 sm:py-4 bg-[#1C3152]/5 border-transparent rounded-xl sm:rounded-2xl text-sm focus:ring-2 focus:ring-[#1C3152]/10 transition-all placeholder-[#1C3152]/20 outline-none rec-section-heading font-medium"
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 sm:mt-6 py-3 sm:py-4 rec-btn-primary rounded-xl sm:rounded-2xl font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 text-[11px] uppercase tracking-[0.2em] shadow-xl"
              >
                {loading ? (
                  <span className="animate-spin material-symbols-outlined text-lg sm:text-xl">progress_activity</span>
                ) : (
                  <>
                    <span>{t('forgot_password.reset_password_btn')}</span>
                    <span className="material-symbols-outlined text-sm">check</span>
                  </>
                )}
              </button>

              {/* Resend OTP */}
              <div className="text-center pt-1 sm:pt-2">
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="text-[10px] font-bold uppercase tracking-wider rec-section-heading-accent hover:opacity-80 transition-opacity disabled:opacity-40"
                >
                  {t('forgot_password.resend_otp')}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Back to Login */}
        <div className="mt-5 sm:mt-6 text-center animate-fade-in delay-300">
          <p className="text-xs sm:text-sm rec-section-subtext">
            {t('forgot_password.remember_password')}{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="rec-section-heading-accent font-bold hover:underline ml-1 uppercase tracking-widest text-[10px]"
            >
              {t('forgot_password.signin')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
