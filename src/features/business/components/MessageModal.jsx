"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, Paperclip, Loader2, Download, User, ShieldCheck } from 'lucide-react';
import { useMessages } from '../hooks/useMessages';
import { useAuthContext } from '@/features/auth/hooks/useAuth';
import { useLanguage } from '@/context/LanguageContext';

const MessageModal = ({ isOpen, onClose, businessId }) => {
  const { user } = useAuthContext();
  const { messages, loading, sending, sendMessage, loadMore, hasMore } = useMessages(businessId);
  const { t } = useLanguage();

  const [inputText, setInputText] = useState("");
  const scrollRef = useRef(null);

  const [isMounted, setIsMounted] = useState(false);

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

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current && messages.length > 0) {
      // scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isOpen || !isMounted) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      await sendMessage(inputText);
      setInputText("");
    } catch (err) {
      alert(t("verification_support.alert_send_failed"));
    }
  };


  const modalContent = (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300 touch-none">
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[85vh] sm:h-[80vh] border border-[#D98C5F]/20 touch-auto">
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#D98C5F]/10 flex items-center justify-center text-[#D98C5F]">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">{t("verification_support.title")}</h2>
              <p className="text-xs text-gray-500 font-medium">{t("verification_support.subtitle")}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Message List */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FAF9F6] scrollbar-thin scrollbar-thumb-gray-200 overscroll-contain"
        >
          {loading && messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Loader2 className="animate-spin text-[#D98C5F]" size={32} />
              <p className="text-sm text-gray-500 font-medium">{t("verification_support.loading")}</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-16 h-16 bg-white border border-gray-100 rounded-2xl flex items-center justify-center mb-4 shadow-sm text-gray-300">
                <Send size={32} />
              </div>
              <h3 className="text-gray-900 font-bold text-lg mb-2">{t("verification_support.no_messages_title")}</h3>
              <p className="text-gray-500 text-sm max-w-[240px]">
                {t("verification_support.no_messages_desc")}
              </p>
            </div>
          ) : (
            <div className="flex flex-col-reverse gap-6">
              {messages.map((msg, idx) => {
                const isMe = msg.senderId === user?.id;
                const isFromAdmin = msg.isFromAdmin;
                const alignLeft = isFromAdmin || !isMe;

                return (
                  <div 
                    key={msg.id || idx}
                    className={`flex flex-col ${alignLeft ? 'items-start' : 'items-end'}`}
                  >
                    {!isMe && (
                      <span className="text-[10px] font-bold text-gray-500 mb-1 ml-10">
                        {msg.senderName} {isFromAdmin && <span className="bg-blue-100 text-blue-600 px-1 rounded text-[8px] uppercase ml-1">{t("verification_support.admin_label")}</span>}
                      </span>
                    )}
                    <div className={`flex items-end gap-2 max-w-[85%] ${alignLeft ? 'flex-row' : 'flex-row-reverse'}`}>
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                        alignLeft ? 'bg-gray-200 text-gray-600' : 'bg-[#D98C5F] text-white'
                      }`}>
                        {isFromAdmin ? <ShieldCheck size={14} /> : <User size={14} />}
                      </div>

                      {/* Bubble */}
                      <div className="flex flex-col gap-1">
                        <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm ${
                          alignLeft 
                            ? 'bg-white text-gray-800 rounded-bl-sm border border-gray-100' 
                            : 'bg-[#D98C5F] text-white rounded-br-sm'
                        }`}>
                          {msg.message && <p className="whitespace-pre-wrap">{msg.message}</p>}
                          
                          {msg.attachmentUrl && (
                            <div className={`mt-2 p-2 rounded-xl flex items-center gap-3 border ${
                              alignLeft ? 'bg-gray-50 border-gray-200' : 'bg-white/10 border-white/20'
                            }`}>
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                alignLeft ? 'bg-white' : 'bg-white/20'
                              }`}>
                                <Paperclip size={14} />
                              </div>
                              <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold truncate">{t("verification_support.attachment")}</p>
                                  <p className="text-[10px] opacity-60">{t("verification_support.click_to_download")}</p>
                              </div>
                              <a 
                                href={msg.attachmentUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={`p-1.5 rounded-lg transition-colors ${
                                  alignLeft ? 'hover:bg-gray-200' : 'hover:bg-white/20'
                                }`}
                              >
                                <Download size={16} />
                              </a>
                            </div>
                          )}
                        </div>
                        <span className={`text-[10px] text-gray-400 font-medium ${alignLeft ? 'ml-1' : 'mr-1 text-right'}`}>
                          {msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : t("verification_support.just_now")}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              
              {hasMore && (
                <button 
                  onClick={loadMore}
                  className="mx-auto px-4 py-1.5 text-xs font-bold text-[#D98C5F] hover:bg-[#D98C5F]/10 rounded-full transition-all border border-[#D98C5F]/20"
                >
                  {t("verification_support.load_older")}
                </button>
              )}
            </div>
          )}
        </div>


        {/* Input Area */}
        <form onSubmit={handleSend} className="p-4 sm:p-6 bg-white border-t border-gray-100">
          <div className="flex items-end gap-3 bg-[#FAF9F6] p-2 rounded-[2rem] border border-gray-200 focus-within:border-[#D98C5F]/30 transition-all">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t("verification_support.placeholder")}
              rows={1}
              className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none outline-none py-2.5 text-sm max-h-32 min-h-[40px] resize-none shadow-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={sending || !inputText.trim()}
              className={`p-2.5 rounded-full transition-all flex items-center justify-center shadow-lg active:scale-95 ${
                sending || !inputText.trim()
                  ? 'bg-gray-200 text-white cursor-not-allowed'
                  : 'bg-[#D98C5F] text-white hover:bg-[#c47c51] shadow-[#D98C5F]/20'
              }`}
            >
              {sending ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} className="ml-0.5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default MessageModal;
