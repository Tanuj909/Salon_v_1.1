"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, FileText, Download, Eye, Loader2, Calendar, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import { useAgreements } from '../hooks/useAgreements';
import { useAuthContext } from '@/features/auth/hooks/useAuth';
import { acceptAgreement } from '../services/agreementService';
import { useToast } from '@/context/ToastContext';
import { useLanguage } from '@/context/LanguageContext';

const AgreementsModal = ({ isOpen, onClose, businessId }) => {
  const { user } = useAuthContext();
  const { agreements, loading, loadMore, hasMore, refreshAgreements } = useAgreements(businessId);
  const { showToast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [acceptingId, setAcceptingId] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      setIsMounted(true);
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
      }
      setIsMounted(false);
    }
    return () => {
      const scrollY = document.body.style.top;
      if (scrollY) {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
      }
    };
  }, [isOpen]);

  if (!isOpen || !isMounted) return null;

  const handlePreview = (url) => {
    setPreviewUrl(url);
  };

  const closePreview = () => {
    setPreviewUrl(null);
  };

  const handleAccept = async (agreement) => {
    try {
      setAcceptingId(agreement.id);
      
      const payload = {
        agreementType: agreement.agreementType || "VENDOR",
        signerName: user?.fullName || user?.name || "Business Owner",
        signerEmail: user?.email || "",
        signerPhone: user?.phone || "",
        signatureImageUrl: "https://images.unsplash.com/photo-1650619112959-7e1340365ce2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8c2lnbmF0dXJlfGVufDB8fDB8fHww",
        extraData: {
          ipAddress: "127.0.0.1",
          device: typeof window !== 'undefined' ? window.navigator.userAgent : "Web Browser",
          acceptedTermsVersion: "v1.0"
        }
      };

      await acceptAgreement(agreement.id, payload);
      showToast(t("agreements.toast_success"), "success");
      refreshAgreements();
    } catch (err) {
      console.error("Failed to accept agreement:", err);
      showToast(err.response?.data?.message || t("agreements.toast_failed"), "error");
    } finally {
      setAcceptingId(null);
    }
  };

  const getAgreementStatusText = (status) => {
    if (!status) return "";
    return t(`agreements.status.${status.toLowerCase()}`);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300 touch-none">
      <div className={`bg-white w-full ${previewUrl ? 'max-w-6xl' : 'max-w-3xl'} rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[85vh] sm:h-[80vh] border border-[#D98C5F]/20 transition-all duration-300 touch-auto`}>
        
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#D98C5F]/10 flex items-center justify-center text-[#D98C5F]">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">{t("agreements.title")}</h2>
              <p className="text-xs text-gray-500 font-medium">{t("agreements.subtitle")}</p>
            </div>
          </div>
          <button 
            onClick={previewUrl ? closePreview : onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* List Section */}
          <div className={`flex-1 overflow-y-auto p-6 space-y-4 bg-[#FAF9F6] scrollbar-thin scrollbar-thumb-gray-200 overscroll-contain ${previewUrl ? 'hidden md:block md:max-w-sm border-r border-gray-100' : ''}`}>
            {loading && agreements.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <Loader2 className="animate-spin text-[#D98C5F]" size={32} />
                <p className="text-sm text-gray-500 font-medium">{t("agreements.loading")}</p>
              </div>
            ) : agreements.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-16 h-16 bg-white border border-gray-100 rounded-2xl flex items-center justify-center mb-4 shadow-sm text-gray-300">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-gray-900 font-bold text-lg mb-2">{t("agreements.no_agreements_title")}</h3>
                <p className="text-gray-500 text-sm max-w-[240px]">
                  {t("agreements.no_agreements_desc")}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {agreements.map((agreement) => (
                  <div 
                    key={agreement.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      previewUrl === agreement.agreementFileUrl 
                        ? 'bg-[#D98C5F]/5 border-[#D98C5F]/30 shadow-sm' 
                        : 'bg-white border-gray-100 hover:border-[#D98C5F]/20 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 truncate">
                          {agreement.agreementType} {t("agreements.agreement_suffix")}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar size={12} className="text-gray-400" />
                          <span className="text-[10px] text-gray-500 font-medium">
                            {new Date(agreement.signedAt).toLocaleDateString(undefined, { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        agreement.status === 'APPROVED' 
                          ? 'bg-green-100 text-green-600' 
                          : agreement.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {getAgreementStatusText(agreement.status)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePreview(agreement.agreementFileUrl)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all bg-gray-50 text-gray-600 hover:bg-[#D98C5F]/10 hover:text-[#D98C5F]"
                      >
                        <Eye size={14} />
                        {t("agreements.btn_view")}
                      </button>
                      <a
                        href={agreement.agreementFileUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all bg-gray-100 text-gray-600 hover:bg-[#D98C5F]/10 hover:text-[#D98C5F]"
                      >
                        <Download size={14} />
                        {t("agreements.btn_download")}
                      </a>
                    </div>

                    {/* Acceptance Logic */}
                    <div className="mt-4 pt-4 border-t border-gray-50">
                      {agreement.status === 'REJECTED' && (
                        <div className="flex flex-col gap-1.5">
                           <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                              <X size={14} className="bg-red-100 rounded-full" />
                              <p className="text-[11px] font-bold">{t("agreements.status_rejected_msg")}</p>
                            </div>
                        </div>
                      )}

                      {agreement.status !== 'REJECTED' && (
                        <>
                          {agreement.isAcpt ? (
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle2 size={16} />
                                <span className="text-sm font-bold">{t("agreements.status_accepted_msg")}</span>
                              </div>
                              {agreement.status === 'PENDING' && (
                                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                                  <Clock size={14} />
                                  <p className="text-[11px] font-bold">{t("agreements.status_pending_msg")}</p>
                                </div>
                              )}
                              {agreement.status === 'APPROVED' && (
                                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                                  <ShieldCheck size={14} />
                                  <p className="text-[11px] font-bold">{t("agreements.status_approved_msg")}</p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAccept(agreement)}
                              disabled={acceptingId === agreement.id}
                              className="w-full py-2.5 rounded-xl text-sm font-bold transition-all bg-[#D98C5F] text-white hover:bg-[#c47c51] shadow-lg shadow-[#D98C5F]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              {acceptingId === agreement.id ? (
                                <Loader2 size={18} className="animate-spin" />
                              ) : (
                                <ShieldCheck size={18} />
                              )}
                              {t("agreements.btn_accept")}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}

                {hasMore && (
                  <button 
                    onClick={loadMore}
                    className="w-full py-2.5 text-xs font-bold text-[#D98C5F] hover:bg-[#D98C5F]/10 rounded-xl transition-all border border-[#D98C5F]/20"
                  >
                    {t("agreements.btn_load_older")}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Preview Section */}
          {previewUrl && (
            <div className="flex-1 bg-gray-50 relative flex flex-col">
              <div className="absolute top-4 right-4 z-20 flex gap-2">
                <a
                  href={previewUrl}
                  download
                  className="p-2 bg-white/90 backdrop-blur shadow-md rounded-full text-[#D98C5F] hover:bg-white transition-all"
                  title="Download File"
                >
                  <Download size={20} />
                </a>
                <button 
                  onClick={closePreview}
                  className="p-2 bg-white/90 backdrop-blur shadow-md rounded-full text-gray-600 hover:bg-white transition-all"
                  title="Close Preview"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 w-full h-full relative">
                <iframe 
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(previewUrl)}&embedded=true`}
                  className="w-full h-full border-none"
                  title="Agreement Preview"
                  loading="lazy"
                />
                
                {/* Fallback overlay if iframe fails to load or takes time */}
                <div className="absolute inset-0 -z-10 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                  <Loader2 className="animate-spin mb-2" size={32} />
                  <p className="text-xs font-medium">{t("agreements.preview_preparing")}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default AgreementsModal;
