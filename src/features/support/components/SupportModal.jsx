"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { 
  X, Loader2, LifeBuoy, ClipboardList, Send, Phone, Check, 
  MessageSquare, AlertCircle, Clock, CheckCircle2, ChevronRight, HelpCircle 
} from "lucide-react";
import { useSupport } from "../hooks/useSupport";
import { useAuthContext } from "@/features/auth/hooks/useAuth";
import { toast } from "react-toastify";
import { useLanguage } from "@/context/LanguageContext";

const SupportModal = ({ isOpen, onClose }) => {
  const { user } = useAuthContext();
  const { t } = useLanguage();
  const { 
    queries, loading, submitting, hasMore, error, 
    loadQueries, loadMore, submitQuery, resetQueries 
  } = useSupport();

  const [activeMainTab, setActiveMainTab] = useState("submit"); // "submit" or "queries"
  const [activeStatusTab, setActiveStatusTab] = useState("PENDING"); // PENDING, IN_PROGRESS, RESOLVED, CLOSED
  
  // Form fields
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const scrollRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);

  // Set default phone number when user is loaded
  useEffect(() => {
    if (user && user.phoneNumber) {
      setPhoneNumber(user.phoneNumber);
    }
  }, [user]);

  // Load queries when modal opens or user switches tabs
  useEffect(() => {
    if (isOpen) {
      loadQueries(0);
      setIsMounted(true);
    } else {
      setIsMounted(false);
      setSubmitSuccess(false);
    }
  }, [isOpen, loadQueries]);

  // Body lock on open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0", 10) * -1);
      }
    }
    return () => {
      const scrollY = document.body.style.top;
      if (scrollY) {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        window.scrollTo(0, parseInt(scrollY || "0", 10) * -1);
      }
    };
  }, [isOpen]);

  if (!isOpen || !isMounted) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!subject.trim()) {
      toast.error(t("support.err_subject_required"));
      return;
    }
    if (!message.trim()) {
      toast.error(t("support.err_message_required"));
      return;
    }
    if (!phoneNumber.trim()) {
      toast.error(t("support.err_phone_required"));
      return;
    }

    try {
      await submitQuery({
        subject: subject.trim(),
        message: message.trim(),
        suggestion: suggestion.trim() || null,
        phoneNumber: phoneNumber.trim()
      });

      // Clear form
      setSubject("");
      setMessage("");
      setSuggestion("");
      setSubmitSuccess(true);
      toast.success(t("support.success_query_submitted"));
      
      // Dynamic response: Switch to My Queries and highlight PENDING tab
      setTimeout(() => {
        setSubmitSuccess(false);
        setActiveMainTab("queries");
        setActiveStatusTab("PENDING");
      }, 2000);

    } catch (err) {
      console.error(err);
      let errorMsg = err.response?.data?.message || t("support.err_submit_failed");
      if (errorMsg.startsWith("Validation failed: ")) {
        errorMsg = errorMsg.replace("Validation failed: ", "");
      }
      toast.error(errorMsg);
    }
  };

  const getStatusBadgeStyles = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200/80";
      case "IN_PROGRESS":
        return "bg-blue-50 text-blue-700 border-blue-200/80";
      case "RESOLVED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      case "CLOSED":
        return "bg-gray-100 text-gray-600 border-gray-200/80";
      default:
        return "bg-gray-50 text-gray-500 border-gray-200";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "PENDING": return t("support.status_pending");
      case "IN_PROGRESS": return t("support.status_in_progress");
      case "RESOLVED": return t("support.status_resolved");
      case "CLOSED": return t("support.status_closed");
      default: return status;
    }
  };

  // Filter queries based on selected status tab
  const filteredQueries = queries.filter(q => q.status === activeStatusTab);

  const modalContent = (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300 touch-none">
      <div className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[85vh] sm:h-[80vh] border border-[#D98C5F]/20 touch-auto">
        
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#D98C5F]/10 flex items-center justify-center text-[#D98C5F]">
              <LifeBuoy size={24} className="animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">{t("support.title")}</h2>
              <p className="text-xs text-gray-500 font-medium">{t("support.subtitle")}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs (Submit vs My Queries) */}
        <div className="flex border-b border-gray-100 bg-gray-50/50 p-2 gap-2">
          <button
            onClick={() => setActiveMainTab("submit")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
              activeMainTab === "submit"
                ? "bg-white text-[#D98C5F] shadow-sm"
                : "text-gray-600 hover:text-[#D98C5F] hover:bg-white/50"
            }`}
          >
            <Send size={16} />
            {t("support.tab_raise_query")}
          </button>
          <button
            onClick={() => setActiveMainTab("queries")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
              activeMainTab === "queries"
                ? "bg-white text-[#D98C5F] shadow-sm"
                : "text-gray-600 hover:text-[#D98C5F] hover:bg-white/50"
            }`}
          >
            <ClipboardList size={16} />
            {t("support.tab_my_queries")}
            {queries.length > 0 && (
              <span className="ml-1 bg-[#D98C5F]/20 text-[#D98C5F] text-xs font-extrabold px-2 py-0.5 rounded-full">
                {queries.length}
              </span>
            )}
          </button>
        </div>

        {/* Content Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 bg-[#FAF9F6] scrollbar-thin scrollbar-thumb-gray-200 overscroll-contain"
        >
          {activeMainTab === "submit" ? (
            /* Submit Query Form */
            <div className="max-w-xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {submitSuccess ? (
                <div className="flex flex-col items-center justify-center text-center py-10 space-y-4">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-100 shadow-sm animate-bounce">
                    <Check size={32} strokeWidth={3} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{t("support.query_submitted")}</h3>
                    <p className="text-gray-500 text-sm mt-1">{t("support.query_submitted_desc")}</p>
                  </div>
                  <div className="text-xs text-gray-400 font-semibold flex items-center gap-1.5 pt-2 animate-pulse">
                    <span>{t("support.redirecting_tickets")}</span>
                    <ChevronRight size={12} />
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
                  
                  {/* Subject */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block">{t("support.subject_label")}</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder={t("support.subject_placeholder")}
                      className="w-full bg-[#FAF9F6] border border-gray-200 focus:border-[#D98C5F]/30 focus:ring-0 rounded-2xl py-3 px-4 text-sm font-semibold outline-none transition-all"
                      disabled={submitting}
                      required
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block">{t("support.phone_label")}</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Phone size={16} />
                      </span>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder={t("support.phone_placeholder")}
                        className="w-full bg-[#FAF9F6] border border-gray-200 focus:border-[#D98C5F]/30 focus:ring-0 rounded-2xl py-3 pl-11 pr-4 text-sm font-semibold outline-none transition-all"
                        disabled={submitting}
                        required
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block">{t("support.message_label")}</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={t("support.message_placeholder")}
                      rows={4}
                      className="w-full bg-[#FAF9F6] border border-gray-200 focus:border-[#D98C5F]/30 focus:ring-0 rounded-2xl py-3 px-4 text-sm font-semibold outline-none transition-all resize-none"
                      disabled={submitting}
                      required
                    />
                  </div>

                  {/* Suggestion */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block">{t("support.suggestion_label")}</label>
                      <span className="text-[9px] font-bold text-gray-400 uppercase">{t("support.optional_badge")}</span>
                    </div>
                    <textarea
                      value={suggestion}
                      onChange={(e) => setSuggestion(e.target.value)}
                      placeholder={t("support.suggestion_placeholder")}
                      rows={2}
                      className="w-full bg-[#FAF9F6] border border-gray-200 focus:border-[#D98C5F]/30 focus:ring-0 rounded-2xl py-3 px-4 text-sm font-semibold outline-none transition-all resize-none"
                      disabled={submitting}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full py-4.5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95 transition-all text-sm cursor-pointer ${
                      submitting 
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                        : "bg-[#D98C5F] hover:bg-[#c47c51] text-white shadow-[#D98C5F]/20"
                    }`}
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        {t("support.submitting_query")}
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        {t("support.submit_btn")}
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* My Queries Section */
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Filter Tabs by Status */}
              <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
                {["PENDING", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((status) => {
                  const count = queries.filter(q => q.status === status).length;
                  return (
                    <button
                      key={status}
                      onClick={() => setActiveStatusTab(status)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeStatusTab === status
                          ? "bg-[#D98C5F] text-white shadow-sm"
                          : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-100"
                      }`}
                    >
                      {getStatusLabel(status)}
                      {count > 0 && (
                        <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                          activeStatusTab === status
                            ? "bg-white text-[#D98C5F]"
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tickets List */}
              {loading && queries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="animate-spin text-[#D98C5F]" size={32} />
                  <p className="text-sm text-gray-500 font-bold">{t("support.loading_history")}</p>
                </div>
              ) : filteredQueries.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-3xl p-10 text-center flex flex-col items-center justify-center">
                  <div className="w-14 h-14 bg-gray-50 text-gray-300 rounded-2xl flex items-center justify-center mb-4 border border-gray-100">
                    <HelpCircle size={28} />
                  </div>
                  <h3 className="text-gray-900 font-bold text-base">{t("support.no_tickets_title")}</h3>
                  <p className="text-gray-500 text-xs max-w-[280px] mt-1.5 leading-relaxed">
                    {t("support.no_tickets_desc").replace("{status}", getStatusLabel(activeStatusTab))}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredQueries.map((query) => (
                    <div 
                      key={query.id} 
                      className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow"
                    >
                      {/* Card Header */}
                      <div className="flex flex-wrap items-start justify-between gap-2.5">
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-gray-900 text-base">{query.subject}</h4>
                          <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-gray-400 font-semibold">
                            <span>{t("support.ticket_number")} #{query.id}</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <Clock size={10} />
                              {new Date(query.createdAt).toLocaleString([], {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span className={`px-2.5 py-1 text-[10px] font-black border rounded-full uppercase tracking-wider ${getStatusBadgeStyles(query.status)}`}>
                          {getStatusLabel(query.status)}
                        </span>
                      </div>

                      {/* Card Body */}
                      <div className="space-y-2">
                        <div className="bg-[#FAF9F6] rounded-xl p-3.5 border border-gray-100">
                          <p className="text-xs text-gray-700 font-medium whitespace-pre-wrap leading-relaxed">
                            {query.message}
                          </p>
                          
                          {query.suggestion && (
                            <div className="mt-3 pt-3 border-t border-gray-200/50 space-y-0.5">
                              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">{t("support.user_suggestion")}</span>
                              <p className="text-[11px] text-gray-500 font-semibold italic">
                                "{query.suggestion}"
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Metadata details */}
                        <div className="flex flex-wrap gap-x-4 text-[10px] text-gray-400 font-bold px-1.5">
                          <span>{t("support.phone_prefix")} {query.phoneNumber}</span>
                          {query.email && <span>{t("support.email_prefix")} {query.email}</span>}
                        </div>
                      </div>

                      {/* Admin Response Area */}
                      {query.adminReply ? (
                        <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-emerald-700">
                              <CheckCircle2 size={14} />
                              <span className="text-[10px] font-black uppercase tracking-wider">{t("support.admin_response")}</span>
                            </div>
                            {query.repliedAt && (
                              <span className="text-[9px] text-emerald-600/70 font-semibold">
                                {t("support.replied_on")} {new Date(query.repliedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-emerald-800 font-medium leading-relaxed whitespace-pre-wrap">
                            {query.adminReply}
                          </p>
                        </div>
                      ) : (
                        query.status !== "PENDING" && (
                          <div className="bg-gray-50 border border-gray-200/60 rounded-xl p-3 text-center">
                            <p className="text-[11px] text-gray-400 font-semibold flex items-center justify-center gap-1.5">
                              <MessageSquare size={12} />
                              {t("support.investigating_msg")}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  ))}

                  {/* Infinite pagination "Load More" */}
                  {hasMore && (
                    <div className="pt-2 flex justify-center">
                      <button 
                        onClick={loadMore}
                        disabled={loading}
                        className="px-5 py-2.5 text-xs font-bold text-[#D98C5F] hover:bg-[#D98C5F]/10 rounded-full transition-all border border-[#D98C5F]/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <Loader2 size={12} className="animate-spin" />
                            {t("support.loading_more")}
                          </>
                        ) : (
                          t("support.load_older_tickets")
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default SupportModal;
