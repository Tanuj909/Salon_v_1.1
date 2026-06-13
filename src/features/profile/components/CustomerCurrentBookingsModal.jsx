import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, CreditCard, User, Scissors, ChevronRight, ChevronLeft, Loader2, AlertCircle, X, MapPin, ShieldCheck, FileText } from 'lucide-react';
import { getCustomerCurrentBookings } from '../services/bookingService';
import { useLanguage } from '@/context/LanguageContext';

const CustomerCurrentBookingsModal = ({ isOpen, onClose }) => {
  const { t, language } = useLanguage();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const fetchCurrentBookings = useCallback(async (pageNum) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCustomerCurrentBookings(pageNum, 5);
      setBookings(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error("Error fetching current bookings:", err);
      setError(err.response?.data?.message || err.message || "Failed to load current bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setPage(0);
      fetchCurrentBookings(0);
    }
  }, [isOpen, fetchCurrentBookings]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
      fetchCurrentBookings(newPage);
    }
  };

  if (!isOpen) return null;

  const getStatusStyle = (status) => {
    if (!status) return "bg-gray-100 text-gray-800 border-gray-200";
    switch (status.toUpperCase()) {
      case 'PENDING':
      case 'CONFIRMED':
      case 'BROADCASTED':
        return "bg-amber-50 text-amber-700 border-amber-200/50";
      case 'COMPLETED':
        return "bg-emerald-50 text-emerald-700 border-emerald-200/50";
      case 'CANCELLED_BY_CUSTOMER':
      case 'CANCELLED_BY_SALON':
      case 'CANCELLED':
      case 'REJECTED':
        return "bg-rose-50 text-rose-700 border-rose-200/50";
      case 'NO_SHOW':
        return "bg-orange-50 text-orange-700 border-orange-200/50";
      case 'CHECKED_IN':
      case 'IN_PROGRESS':
        return "bg-blue-50 text-blue-700 border-blue-200/50";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getPaymentStatusStyle = (status) => {
    if (!status) return "text-gray-500";
    switch (status.toUpperCase()) {
      case 'PAID':
        return "text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/40";
      case 'PENDING':
        return "text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/40";
      case 'REFUNDED':
        return "text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/40";
      case 'FAILED':
        return "text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200/40";
      default:
        return "text-gray-500";
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(language === 'ar' ? 'ar-AE' : 'en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    try {
      const [hours, minutes] = timeStr.split(':');
      const h = parseInt(hours);
      const ampm = h >= 12 ? (language === 'ar' ? 'م' : 'PM') : (language === 'ar' ? 'ص' : 'AM');
      const hour12 = h % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div 
        className="bg-white/95 w-full max-w-4xl max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl border border-white/20 flex flex-col animate-scale-in"
        style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-[#FDF9F4]/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D98C5F]/10 flex items-center justify-center text-[#D98C5F]">
              <Calendar size={20} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1C3152] font-[Cormorant_Garamond]">
                {t('navbar.current_bookings') || "Current Bookings"}
              </h2>
              <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">
                {totalElements} {totalElements === 1 ? (language === 'ar' ? "حجز" : "Booking") : (language === 'ar' ? "حجوزات" : "Bookings")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FAF6F0]/30">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-10 h-10 text-[#D98C5F] animate-spin" />
              <span className="text-sm font-medium text-gray-500">{t('profile.loading_bookings') || "Loading bookings..."}</span>
            </div>
          ) : error ? (
            <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-8 text-center max-w-md mx-auto my-10">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
              <p className="text-rose-700 font-medium">{error}</p>
              <button 
                onClick={() => fetchCurrentBookings(page)}
                className="mt-4 px-5 py-2 bg-[#D98C5F] hover:bg-[#c4794e] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
              >
                {t('salon_details.retry') || "Retry"}
              </button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16 max-w-md mx-auto">
              <div className="w-16 h-16 bg-[#FAF6F0] rounded-full flex items-center justify-center mx-auto mb-4 text-[#D98C5F]/40 border border-[#D98C5F]/10">
                <Calendar size={32} />
              </div>
              <p className="text-gray-600 font-medium text-base">{t('profile.no_bookings_found') || "No current bookings found."}</p>
              <p className="text-gray-400 text-sm mt-1">{language === 'ar' ? "ستظهر حجوزاتك النشطة والقادمة هنا." : "Your active and upcoming bookings will appear here."}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
                >
                  {/* Top Bar: Booking Number & Status */}
                  <div className="px-5 py-4 bg-[#FDF9F4]/40 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-[#628EB8]/10 text-[#1F355E] border border-[#628EB8]/20 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                        {t('salon_details.booking_number') || "Booking Number"}: <span className="font-extrabold text-[#628EB8]">{booking.bookingNumber}</span>
                      </span>
                      {booking.paymentMethod && (
                        <span className="flex items-center gap-1.5 bg-emerald-50/50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                          <CreditCard size={12} className="shrink-0" />
                          <span>{booking.paymentMethod === 'CASH' ? (t('profile.cash') || "CASH") : booking.paymentMethod}</span>
                        </span>
                      )}
                    </div>
                    <span className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${getStatusStyle(booking.status)}`}>
                      {booking.status ? t(`profile.status.${booking.status.toLowerCase()}`) || booking.status : "Unknown"}
                    </span>
                  </div>

                  {/* Main Grid Details */}
                  <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Salon & Timing details */}
                    <div className="md:col-span-5 space-y-4">
                      {booking.business && (
                        <div>
                          <h3 className="text-lg font-bold text-[#1C3152] font-[Cormorant_Garamond] mb-1">
                            {booking.business.name}
                          </h3>
                          <p className="flex items-start gap-1.5 text-xs text-gray-500">
                            <MapPin size={14} className="shrink-0 text-gray-400 mt-0.5" />
                            <span>{booking.business.address}</span>
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="bg-[#FAF6F0]/50 p-3 rounded-xl border border-gray-50 flex flex-col gap-1">
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{t('salon_details.date_label') || "Date"}</span>
                          <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                            <Calendar size={12} className="text-[#D98C5F]" />
                            {formatDate(booking.bookingDate)}
                          </span>
                        </div>
                        <div className="bg-[#FAF6F0]/50 p-3 rounded-xl border border-gray-50 flex flex-col gap-1">
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{t('salon_details.time_label') || "Time"}</span>
                          <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                            <Clock size={12} className="text-[#D98C5F]" />
                            {formatTime(booking.startTime)}
                          </span>
                        </div>
                      </div>

                      {/* Staff section */}
                      {booking.staff && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                          {booking.staff.profileImageUrl ? (
                            <img
                              src={booking.staff.profileImageUrl}
                              alt={booking.staff.fullName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#1C3152] text-white flex items-center justify-center font-bold text-sm">
                              {booking.staff.fullName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('salon_details.stylist_label') || "Stylist"}</p>
                            <h4 className="text-sm font-bold text-[#1C3152]">{booking.staff.fullName}</h4>
                            {booking.staff.designation && (
                              <p className="text-[10px] text-gray-400">{booking.staff.designation}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Services and Pricing */}
                    <div className="md:col-span-7 space-y-4 border-t md:border-t-0 md:border-l border-gray-100 md:pl-6">
                      <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Scissors size={12} className="text-[#D98C5F]" />
                          <span>{t('salon_details.our_services') || "Services"}</span>
                        </h4>
                        <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                          {booking.services?.map((svc) => (
                            <div key={svc.id} className="flex justify-between items-center text-xs py-1.5 border-b border-gray-50 last:border-0">
                              <div>
                                <span className="font-bold text-gray-700">{svc.name}</span>
                                <span className="text-gray-400 block text-[10px]">{svc.durationMinutes} {t('salon_details.mins') || "mins"} x {svc.quantity || 1}</span>
                              </div>
                              <span className="font-semibold text-gray-700">AED {svc.subtotal?.toFixed(2) || (svc.price * (svc.quantity || 1)).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Pricing totals */}
                      <div className="bg-[#FAF6F0]/30 p-4 rounded-xl space-y-2">
                        {booking.discountAmount > 0 && (
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{t('salon_details.subtotal') || "Subtotal"}</span>
                            <span>AED {booking.totalAmount?.toFixed(2)}</span>
                          </div>
                        )}
                        {booking.discountAmount > 0 && (
                          <div className="flex justify-between text-xs text-emerald-600 font-bold">
                            <span>{t('profile.discount_amount') || "Discount"}</span>
                            <span>-AED {booking.discountAmount?.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-sm pt-1 border-t border-dashed border-gray-200">
                          <span className="font-bold text-[#1C3152]">{t('salon_details.total_amount') || "Total Amount"}</span>
                          <span className="font-extrabold text-base text-[#D98C5F]">
                            AED {(booking.finalAmount || booking.totalAmount)?.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] pt-1.5">
                          <span className="text-gray-400 font-medium uppercase tracking-wider">{language === 'ar' ? "حالة الدفع" : "Payment Status"}</span>
                          <span className={`font-semibold uppercase ${getPaymentStatusStyle(booking.paymentStatus)}`}>
                            {booking.paymentStatus ? t(`profile.payment_status.${booking.paymentStatus.toLowerCase()}`) || booking.paymentStatus : "Pending"}
                          </span>
                        </div>
                      </div>

                      {/* Customer Notes */}
                      {booking.customerNotes && (
                        <div className="p-3 bg-amber-50/20 border border-amber-100/30 rounded-xl">
                          <p className="text-[10px] text-amber-800/80 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                            <FileText size={10} />
                            <span>{language === 'ar' ? "ملاحظاتك" : "Your Notes"}</span>
                          </p>
                          <p className="text-xs text-gray-600 italic">"{booking.customerNotes}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Pagination */}
        {totalPages > 1 && !loading && !error && (
          <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 0}
              className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <ChevronLeft size={14} className={language === 'ar' ? "rotate-180" : ""} />
              <span>{t('profile.previous') || "Previous"}</span>
            </button>
            <span className="text-xs font-bold text-gray-500 tracking-wider">
              {t('profile.page_of') || "Page"} {page + 1} {t('profile.page_of_divider') || "of"} {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages - 1}
              className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <span>{t('profile.next') || "Next"}</span>
              <ChevronRight size={14} className={language === 'ar' ? "rotate-180" : ""} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerCurrentBookingsModal;
