"use client";

import React, { useState, useRef } from "react";
import { useMyBusiness } from "../hooks/useMyBusiness";
import { useDocuments } from "../hooks/useDocuments";
import { uploadDocument } from "../services/businessService";
import { useRouter } from "next/navigation";
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  X,
  FileCheck,
  ShieldCheck
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const DOCUMENT_TYPES = [
  { id: "TRADE_LICENCE", icon: FileText },
  { id: "SIGNATURE", icon: FileCheck },
  { id: "EMIRATES_ID", icon: ShieldCheck },
  { id: "ESTABLISHMENT_CARD", icon: FileText },
  { id: "VAT_CERTIFICATE", icon: FileText },
  { id: "MUNICIPALITY_APPROVAL", icon: FileText },
  { id: "LOCATION_PROOF", icon: FileText },
  { id: "SERVICE_MENU", icon: FileText },
];

export default function DocumentUploadPage() {
  const { business, loading: businessLoading } = useMyBusiness();
  const { documents, loading: docsLoading, refreshDocuments } = useDocuments(business?.id);
  const router = useRouter();
  const fileInputRefs = useRef({});
  const { t } = useLanguage();

  const [selectedFiles, setSelectedFiles] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [declarationChecked, setDeclarationChecked] = useState(false);
  const [isBulkUploading, setIsBulkUploading] = useState(false);

  const [uploadingForType, setUploadingForType] = useState(null);
  const [messages, setMessages] = useState({});

  const handleFileChange = (typeId, file) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessages(prev => ({ ...prev, [typeId]: { type: "error", text: t("documents.file_size_limit") } }));
        return;
      }
      setSelectedFiles(prev => ({ ...prev, [typeId]: file }));
      setMessages(prev => ({ ...prev, [typeId]: { type: "info", text: `${t("documents.file_ready")}: ${file.name}` } }));
    }
  };

  const handleRemoveFile = (typeId) => {
    setSelectedFiles(prev => {
      const updated = { ...prev };
      delete updated[typeId];
      return updated;
    });
    setMessages(prev => {
      const updated = { ...prev };
      delete updated[typeId];
      return updated;
    });
    if (fileInputRefs.current[typeId]) fileInputRefs.current[typeId].value = "";
  };

  const handleBulkUpload = async () => {
    if (!business?.id) return;
    
    setIsBulkUploading(true);
    const typeIds = Object.keys(selectedFiles);
    
    // Upload documents sequentially, skipping failed ones
    for (const typeId of typeIds) {
      const file = selectedFiles[typeId];
      try {
        setUploadingForType(typeId);
        setMessages(prev => ({ ...prev, [typeId]: { type: "", text: "" } }));
        
        await uploadDocument(business.id, typeId, file);
        
        setMessages(prev => ({ ...prev, [typeId]: { type: "success", text: `${t(`documents.document_types.${typeId}`)} ${t("documents.uploaded_success")}` } }));
        
        // Remove from selected list on success
        setSelectedFiles(prev => {
          const updated = { ...prev };
          delete updated[typeId];
          return updated;
        });
        if (fileInputRefs.current[typeId]) fileInputRefs.current[typeId].value = "";
      } catch (err) {
        console.error(`Upload failed for ${typeId}:`, err);
        setMessages(prev => ({ ...prev, [typeId]: { type: "error", text: err.response?.data?.message || t("documents.upload_failed") } }));
      } finally {
        setUploadingForType(null);
      }
    }
    
    refreshDocuments();
    setIsBulkUploading(false);
    setShowConfirmModal(false);
    setDeclarationChecked(false);
  };

  const getDocStatusText = (status) => {
    if (!status) return "";
    return t(`documents.status.${status.toLowerCase()}`);
  };

  if (businessLoading) {
    return (
      <div className="min-h-screen hero-filter-input-bg flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#1C3152] animate-spin" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen pt-32 pb-24 hero-filter-input-bg text-center px-6">
        <h2 className="font-[Cormorant_Garamond,serif] text-4xl font-bold rec-section-heading mb-6">
          {t("documents.no_business_found")}
        </h2>
        <p className="rec-section-subtext mb-8">{t("documents.register_before_upload")}</p>
        <button
          onClick={() => router.push("/partner")}
          className="px-8 py-3.5 bg-[#1C3152] text-[#C8A951] rounded-lg font-bold tracking-widest uppercase hover:bg-[#2a4570] transition-all"
        >
          {t("documents.btn_register_business")}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 sm:pt-32 pb-12 sm:pb-24 font-[Jost,sans-serif] hero-filter-input-bg">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=Jost:wght@300;400;500;600&display=swap');
      `}</style>

      <div className="w-full px-4 sm:px-6">
        <div className="max-w-[1400px] mx-auto">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-[#1C3152]/60 hover:text-[#1C3152] mb-8 transition-colors font-medium group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>{t("documents.btn_back_to_home")}</span>
          </button>

          {/* Top Verification Details Bar */}
          <div className="bg-[#1C3152] text-white rounded-2xl p-4 mb-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#C8A951]/10 rounded-full -mr-20 -mt-20 blur-3xl" />
            <div className="relative z-10 flex flex-wrap items-center justify-center gap-3">
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5">
                <ShieldCheck size={14} className="text-[#C8A951]" />
                <span className="text-xs font-bold uppercase tracking-wider whitespace-nowrap">{t("documents.document_verifications")}</span>
              </div>
            </div>
          </div>

          {/* Main Two Column Layout */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column: Document Upload (70% width on large screens) */}
            <div className="lg:w-[70%] space-y-6">
              <div className="bg-white rounded-3xl shadow-2xl border rec-card-border overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h2 className="font-[Cormorant_Garamond,serif] text-2xl font-bold rec-section-heading">
                    {t("documents.upload_title")} <em className="italic rec-section-heading-accent font-light">{t("documents.documents_title")}</em>
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">{t("documents.select_files_desc")}</p>
                </div>
                
                <div className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {DOCUMENT_TYPES.map((type) => {
                      const Icon = type.icon;
                      const isUploading = uploadingForType === type.id;
                      const message = messages[type.id];
                      const existingDoc = documents.find(doc => doc.documentType === type.id);
                      const isVerified = existingDoc?.verificationStatus === 'APPROVED';
                      const isRejected = existingDoc?.verificationStatus === 'REJECTED';
                      const isPending = existingDoc?.verificationStatus === 'PENDING';
                      const isSelectedLocally = !!selectedFiles[type.id];
                      
                      return (
                        <div
                          key={type.id}
                          className={`rounded-xl border transition-all ${
                            isVerified ? 'bg-green-50/30 border-green-200' :
                            isRejected ? 'bg-red-50/30 border-red-200' :
                            isPending ? 'bg-yellow-50/30 border-yellow-200' :
                            isSelectedLocally ? 'bg-[#C8A951]/5 border-[#C8A951]/60 shadow-sm' :
                            'bg-white border-[#1C3152]/10 hover:border-[#C8A951]/50'
                          }`}
                        >
                          <div className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                isVerified ? 'bg-green-100 text-green-600' :
                                isRejected ? 'bg-red-100 text-red-500' :
                                isPending ? 'bg-yellow-100 text-yellow-600' :
                                isSelectedLocally ? 'bg-[#C8A951]/10 text-[#C8A951]' :
                                'bg-[#1C3152]/5 text-[#1C3152]'
                              }`}>
                                <Icon size={14} />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-[11px] font-bold text-[#1C3152] uppercase tracking-wide leading-tight">
                                  {t(`documents.document_types.${type.id}`)}
                                </h3>
                                {existingDoc && (
                                  <span className={`text-[8px] font-bold uppercase ${
                                    isVerified ? 'text-green-600' :
                                    isRejected ? 'text-red-600' :
                                    'text-yellow-600'
                                  }`}>
                                    {getDocStatusText(existingDoc.verificationStatus)}
                                  </span>
                                )}
                              </div>
                              {isVerified && <CheckCircle2 size={12} className="text-green-500 shrink-0" />}
                              {isRejected && <AlertCircle size={12} className="text-red-500 shrink-0" />}
                            </div>
                            
                            {/* Local selection tag with X to remove */}
                            {isSelectedLocally && (
                              <div className="mb-2 p-1.5 rounded-lg text-[9px] bg-[#C8A951]/10 text-[#1C3152] flex items-center justify-between gap-1.5 font-bold animate-[scaleIn_0.2s_ease]">
                                <span className="truncate">📎 {t("documents.file_ready")}: {selectedFiles[type.id].name}</span>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveFile(type.id);
                                  }}
                                  className="p-0.5 hover:bg-[#C8A951]/20 rounded text-[#1C3152] transition-colors"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            )}

                            {message && message.type !== "info" && (
                              <div className={`mb-2 p-1.5 rounded-lg text-[9px] flex gap-1.5 ${
                                message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                              }`}>
                                {message.type === "success" ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                                <span className="truncate">{message.text}</span>
                              </div>
                            )}
                            
                            <div
                              onClick={() => !isUploading && fileInputRefs.current[type.id]?.click()}
                              className={`relative border border-dashed rounded-lg p-2 text-center cursor-pointer transition-all ${
                                isUploading ? "opacity-50 cursor-wait" :
                                isVerified ? "border-green-300 bg-green-50/50" :
                                isRejected ? "border-red-300 bg-red-50/50" :
                                isSelectedLocally ? "border-[#C8A951]/50 bg-[#C8A951]/5 hover:bg-[#C8A951]/10" :
                                "border-[#1C3152]/10 hover:border-[#C8A951] hover:bg-gray-50"
                              }`}
                            >
                              <input
                                type="file"
                                ref={el => fileInputRefs.current[type.id] = el}
                                onChange={(e) => handleFileChange(type.id, e.target.files[0])}
                                className="hidden"
                                accept="image/*,application/pdf"
                                disabled={isUploading}
                              />
                              
                              {isUploading ? (
                                <div className="flex flex-col items-center gap-1">
                                  <Loader2 size={16} className="animate-spin text-[#1C3152]" />
                                  <p className="text-[8px] text-gray-500">{t("documents.uploading")}</p>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-1">
                                  <Upload size={14} className={`${isSelectedLocally ? 'text-[#C8A951]' : isVerified ? 'text-green-500' : isRejected ? 'text-red-400' : 'text-[#C8A951]'}`} />
                                  <p className="text-[9px] font-medium text-[#1C3152]">
                                    {isSelectedLocally ? t("documents.btn_change_file") : isVerified ? t("documents.btn_replace") : isRejected ? t("documents.btn_reupload") : t("documents.btn_upload")}
                                  </p>
                                  <p className="text-[7px] text-gray-400">IMG,PDF</p>
                                </div>
                              )}
                            </div>
                            
                            {existingDoc && existingDoc.fileName && (
                              <div className="mt-2 flex items-center justify-between">
                                <span className="text-[7px] text-gray-400 truncate max-w-[100px]">{existingDoc.fileName}</span>
                                <a 
                                  href={existingDoc.fileUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-[7px] font-bold text-[#C8A951] uppercase tracking-wider hover:underline"
                                >
                                  {t("documents.btn_view")}
                                </a>
                              </div>
                            )}
                            
                            {isRejected && existingDoc?.rejectionReason && (
                              <div className="mt-2 p-1.5 rounded-lg bg-red-50/80 border border-red-100">
                                <p className="text-[7px] font-bold text-red-600 uppercase mb-0.5">{t("documents.rejection_reason_label")}</p>
                                <p className="text-[7px] text-red-700 leading-tight truncate">{existingDoc.rejectionReason}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Local selection summary panel */}
                {Object.keys(selectedFiles).length > 0 && (
                  <div className="bg-[#1C3152]/5 border-t border-[#1C3152]/10 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-[slideUp_0.3s_ease]">
                    <div className="text-left">
                      <h4 className="text-xs sm:text-sm font-bold text-[#1C3152] uppercase tracking-wider">
                        {Object.keys(selectedFiles).length} {Object.keys(selectedFiles).length === 1 ? t("documents.doc_selected") : t("documents.docs_selected")}
                      </h4>
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{t("documents.ready_for_upload_desc")}</p>
                    </div>
                    <button
                      onClick={() => setShowConfirmModal(true)}
                      className="w-full sm:w-auto px-6 py-3 bg-[#1C3152] text-[#C8A951] rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#2a4570] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    >
                      <Upload size={14} />
                      <span>{t("documents.btn_upload_selected")}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Uploaded Documents List */}
            <div className="lg:w-[30%] space-y-6">
              <div className="bg-white rounded-3xl shadow-2xl border rec-card-border overflow-hidden sticky top-28">
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h2 className="font-[Cormorant_Garamond,serif] text-xl font-bold rec-section-heading">
                      {t("documents.uploaded_title")} <em className="italic rec-section-heading-accent font-light">{t("documents.files_title")}</em>
                    </h2>
                    <span className="text-[9px] uppercase tracking-widest font-bold rec-section-subtext">
                      {documents.length} {documents.length === 1 ? t("documents.file_suffix") : t("documents.files_suffix")}
                    </span>
                  </div>
                </div>
                
                <div className="p-4 max-h-[500px] overflow-y-auto">
                  {docsLoading ? (
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="h-20 rounded-xl bg-white border rec-card-border animate-pulse mb-2" />
                    ))
                  ) : documents.length > 0 ? (
                    <div className="space-y-2">
                      {documents.map((doc) => (
                        <div key={doc.id} className="bg-white rounded-xl p-2 border rec-card-border shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-[#1C3152]/5 flex items-center justify-center text-[#1C3152]">
                                <FileText size={12} />
                              </div>
                              <div>
                                <h4 className="text-[10px] font-bold text-[#1C3152] uppercase tracking-wide">
                                  {t(`documents.document_types.${doc.documentType}`)}
                                </h4>
                                <p className="text-[8px] text-gray-400">
                                  {new Date(doc.uploadedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                </p>
                              </div>
                            </div>
                            
                            <div className={`px-1.5 py-0.5 rounded-full text-[7px] font-bold tracking-widest uppercase border ${
                              doc.verificationStatus === 'APPROVED' ? 'bg-green-50 text-green-600 border-green-100' :
                              doc.verificationStatus === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-100' :
                              'bg-yellow-50 text-yellow-600 border-yellow-100'
                            }`}>
                              {doc.verificationStatus === 'APPROVED' ? '✓' : doc.verificationStatus === 'REJECTED' ? '✗' : '⋯'}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-1 pt-1 border-t border-gray-50">
                            <span className="text-[7px] font-medium text-gray-400 truncate max-w-[100px]">{doc.fileName}</span>
                            <a 
                              href={doc.fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[8px] font-bold text-[#C8A951] uppercase tracking-wider hover:underline"
                            >
                              {t("documents.btn_view")}
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 text-center">
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-2 text-gray-300">
                        <FileText size={16} />
                      </div>
                      <p className="text-[10px] font-bold text-[#1C3152]/40 uppercase tracking-widest">{t("documents.no_files_uploaded")}</p>
                      <p className="text-[8px] text-gray-400 mt-1">{t("documents.upload_left_panel_desc")}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Declaration & Upload Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isBulkUploading && setShowConfirmModal(false)} />
            <div className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl animate-[slideUp_0.3s_ease] border border-[#E0E0E0] z-10">
              <div className="w-16 h-16 rounded-full bg-[#C8A951]/10 flex items-center justify-center mx-auto mb-5 text-[#C8A951]">
                <ShieldCheck size={32} />
              </div>
              
              <h3 className="font-[Cormorant_Garamond,serif] text-2xl font-bold text-[#1C3152] mb-2">
                {t("documents.confirm_declaration")}
              </h3>
              <p className="text-gray-500 text-xs sm:text-sm mb-6 leading-relaxed">
                {t("documents.review_confirm_desc")}
              </p>

              {/* Declarations Checkbox Box */}
              <label className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100 cursor-pointer hover:bg-gray-100/50 transition-colors text-left select-none mb-6">
                <input
                  type="checkbox"
                  disabled={isBulkUploading}
                  checked={declarationChecked}
                  onChange={(e) => setDeclarationChecked(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-[#1C3152] focus:ring-[#1C3152]/30 border-gray-300 transition-all cursor-pointer"
                />
                <div className="flex flex-col text-left flex-1">
                  <span className="text-[11px] sm:text-xs font-bold text-[#1C3152] leading-relaxed">
                    {t("documents.declaration_statement")}
                  </span>
                </div>
              </label>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                <button
                  type="button"
                  disabled={isBulkUploading}
                  onClick={() => {
                    setShowConfirmModal(false);
                    setDeclarationChecked(false);
                  }}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-500 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {t("documents.btn_cancel")}
                </button>
                <button
                  type="button"
                  onClick={handleBulkUpload}
                  disabled={!declarationChecked || isBulkUploading}
                  className={`w-full sm:flex-1 py-3 px-4 rounded-xl text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md ${
                    (!declarationChecked || isBulkUploading)
                      ? "bg-[#1C3152] opacity-40 cursor-not-allowed"
                      : "bg-[#1C3152] hover:bg-[#2a4570] hover:shadow-lg"
                  }`}
                >
                  {isBulkUploading ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      <span>{t("documents.uploading")}</span>
                    </>
                  ) : (
                    <>
                      <Upload size={12} />
                      <span>{t("documents.btn_confirm_upload")}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}