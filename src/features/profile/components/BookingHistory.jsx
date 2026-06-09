import React, { useState } from 'react';
import { Calendar, Clock, CreditCard, User, Scissors, ChevronRight, ChevronLeft, Loader2, AlertCircle, Receipt, MapPin, Star } from 'lucide-react';
import { useBookingHistory } from '../hooks/useBookingHistory';
import { useLanguage } from '@/context/LanguageContext';

const BookingHistory = ({ businessId }) => {
    const { bookings, loading, error, pagination, nextPage, prevPage, cancelBooking, isCanceling, submitReview, isSubmittingReview } = useBookingHistory(businessId);
    const { t } = useLanguage();

    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [newReview, setNewReview] = useState({
        rating: 5,
        comment: "",
        isAnonymous: false
    });

    const handleCancel = async (bookingId) => {
        if (isCanceling) return;
        const reason = window.prompt(t("profile.prompt_cancel_reason"));
        if (reason === null) return;

        const success = await cancelBooking(bookingId, reason.trim() || "Client not available");
        if (!success) {
            alert(t("profile.alert_cancel_failed"));
        }
    };

    const handleOpenReviewModal = (booking) => {
        setSelectedBooking(booking);
        setNewReview({ rating: 5, comment: "", isAnonymous: false });
        setShowReviewModal(true);
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!selectedBooking) return;

        const success = await submitReview({
            ...newReview,
            businessId: selectedBooking.business?.id || businessId,
            bookingId: selectedBooking.id
        });

        if (success) {
            setShowReviewModal(false);
            setSelectedBooking(null);
            alert(t("profile.alert_review_success"));
        } else {
            alert(t("profile.alert_review_failed"));
        }
    };

    const getStatusStyle = (status) => {
        if (!status) return "bg-muted text-muted border-muted";
        switch (status.toUpperCase()) {
            case 'PENDING':
            case 'CONFIRMED':
            case 'BROADCASTED':
                return "bg-accent/10 text-accent border-accent/20";
            case 'COMPLETED':
                return "bg-success/10 text-success border-success/20";
            case 'CANCELLED_BY_CUSTOMER':
            case 'CANCELLED_BY_SALON':
            case 'CANCELLED':
            case 'REJECTED':
                return "bg-danger/10 text-danger border-danger/20";
            case 'NO_SHOW':
                return "bg-warning/10 text-warning border-warning/20";
            case 'CHECKED_IN':
            case 'IN_PROGRESS':
                return "bg-info/10 text-info border-info/20";
            default:
                return "bg-muted text-muted border-muted";
        }
    };

    const getStatusText = (status) => {
        if (!status) return t("profile.status.unknown");
        return t(`profile.status.${status.toLowerCase()}`);
    };

    const getPaymentStatusStyle = (status) => {
        if (!status) return "text-muted";
        switch (status.toUpperCase()) {
            case 'PAID':
                return "text-success";
            case 'PENDING':
                return "text-warning";
            case 'REFUNDED':
                return "text-info";
            case 'FAILED':
                return "text-danger";
            default:
                return "text-muted";
        }
    };

    const getPaymentStatusText = (status) => {
        if (!status) return '';
        return t(`profile.payment_status.${status.toLowerCase()}`);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-IN', {
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
            const ampm = h >= 12 ? 'PM' : 'AM';
            const hour12 = h % 12 || 12;
            return `${hour12}:${minutes} ${ampm}`;
        } catch {
            return timeStr;
        }
    };

    const getServiceNames = (services) => {
        if (!services || services.length === 0) return t("profile.service");
        return services.map(s => s.name).join(', ');
    };

    const getTotalDuration = (services) => {
        if (!services || services.length === 0) return null;
        const total = services.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
        if (total === 0) return null;
        if (total >= 60) {
            const hrs = Math.floor(total / 60);
            const mins = total % 60;
            return mins > 0 ? `${hrs}${t("profile.hour_abbr")} ${mins}${t("profile.minute_abbr")}` : `${hrs}${t("profile.hour_abbr")}`;
        }
        return `${total}${t("profile.minute_abbr")}`;
    };

    // Loading state
    if (loading) {
        return (
            <div className="px-4 sm:px-8 mt-12 sm:mt-16">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold profile-name-text font-[Cormorant_Garamond]">{t("profile.recent_appointments")}</h2>
                </div>
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 salon-list-title-accent animate-spin" />
                    <span className="ml-3 profile-meta-text opacity-50 font-medium">{t("profile.loading_bookings")}</span>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="px-4 sm:px-8 mt-12 sm:mt-16">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold profile-name-text font-[Cormorant_Garamond]">{t("profile.recent_appointments")}</h2>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
                    <AlertCircle className="w-10 h-10 text-primary mx-auto mb-3" />
                    <p className="text-primary font-medium">{error}</p>
                    <p className="text-primary text-sm mt-1">{t("profile.try_again_later")}</p>
                </div>
            </div>
        );
    }
    
    // Empty state
    if (!bookings || bookings.length === 0) {
        return (
            <div className="px-4 sm:px-8 mt-12 sm:mt-16">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold profile-name-text font-[Cormorant_Garamond]">{t("profile.recent_appointments")}</h2>
                </div>
                <div className="bg-white p-12 rounded-xl border border-dashed border-border text-center">
                    <div className="w-16 h-16 bg-background-light rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <Calendar size={32} />
                    </div>
                    <p className="text-muted font-medium">{t("profile.no_bookings_found")}</p>
                    <p className="text-muted text-sm mt-1">{t("profile.appointments_appear_here")}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="px-3 sm:px-8 mt-10 sm:mt-16">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold profile-name-text font-[Cormorant_Garamond]">{t("profile.recent_appointments")}</h2>
                    <p className="profile-meta-text opacity-50 text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-1">
                        {pagination.totalElements} {pagination.totalElements === 1 ? t("profile.booking_found") : t("profile.bookings_found")}
                    </p>
                </div>
                {pagination.totalPages > 1 && (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={prevPage}
                            disabled={pagination.isFirst}
                            className="w-9 h-9 rounded-xl border hero-filter-input-bg flex items-center justify-center profile-name-text disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/[0.05] transition-all"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="profile-meta-text opacity-60 text-xs font-bold tracking-wider">
                            {pagination.currentPage + 1} / {pagination.totalPages}
                        </span>
                        <button
                            onClick={nextPage}
                            disabled={pagination.isLast}
                            className="w-9 h-9 rounded-xl border hero-filter-input-bg flex items-center justify-center profile-name-text disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/[0.05] transition-all"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* Booking Cards */}
            <div className="space-y-4">
                {bookings.map((booking) => (
                    <div
                        key={booking.id}
                        className="bg-white p-4 sm:p-6 rounded-2xl border hero-filter-input-bg shadow-sm hover:shadow-md transition-all group"
                    >
                        {/* Top Row: Booking Number + Status */}
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="bg-[#628EB8]/10 text-[#1F355E] border border-[#628EB8]/20 px-2.5 py-1 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                                    {t("profile.booking_number_label")}<span className="font-extrabold text-[#628EB8]">{booking.bookingNumber}</span>
                                </span>
                                {booking.paymentMethod && (
                                    <span className="flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200/50 px-2.5 py-1 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                                        <CreditCard size={11} className="shrink-0 text-green-600" />
                                        {t("profile.payment_method_label")}<span className="font-extrabold">{booking.paymentMethod === "CASH" ? t("profile.cash") : booking.paymentMethod}</span>
                                    </span>
                                )}
                            </div>
                            <span className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] ${getStatusStyle(booking.status)} whitespace-nowrap`}>
                                {getStatusText(booking.status)}
                            </span>
                        </div>

                        {/* Main Content */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                            {/* Left: Service + Date Info */}
                            <div className="flex items-start gap-5">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#fdfaf8] flex items-center justify-center salon-list-title-accent opacity-40 border hero-filter-input-bg shrink-0">
                                    <Scissors size={20} className="sm:w-[22px] sm:h-[22px]" strokeWidth={1.5} />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-base sm:text-lg profile-name-text group-hover:salon-list-title-accent transition-colors font-[Cormorant_Garamond] leading-tight">
                                        {getServiceNames(booking.services)}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2">
                                        <span className="flex items-center gap-1.5 profile-meta-text opacity-60 text-[10px] sm:text-xs font-medium">
                                            <Calendar size={12} />
                                            {formatDate(booking.bookingDate)}
                                        </span>
                                        <span className="flex items-center gap-1.5 profile-meta-text opacity-40 text-[10px] sm:text-xs font-medium">
                                            <Clock size={12} />
                                            {formatTime(booking.startTime)} — {formatTime(booking.endTime)}
                                        </span>
                                        {getTotalDuration(booking.services) && (
                                            <span className="profile-meta-text opacity-30 text-[10px] sm:text-xs font-medium">
                                                ({getTotalDuration(booking.services)})
                                            </span>
                                        )}
                                    </div>

                                    {/* Staff & Customer Info */}
                                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-2.5">
                                        {booking.staff && (
                                            <span className="flex items-center gap-1.5 profile-meta-text opacity-50 text-[0.7rem] font-medium">
                                                <User size={11} />
                                                {booking.staff.fullName}
                                                {booking.staff.designation && (
                                                    <span className="profile-meta-text opacity-25">• {booking.staff.designation}</span>
                                                )}
                                            </span>
                                        )}
                                        {booking.customer && (
                                            <span className="flex items-center gap-1.5 profile-meta-text opacity-50 text-[0.7rem] font-medium">
                                                <User size={11} />
                                                {booking.customer.fullName}
                                            </span>
                                        )}
                                    </div>

                                    {/* Customer Notes */}
                                    {booking.customerNotes && (
                                        <p className="mt-2 text-muted text-xs italic border-l-2 border-accent rounded-sm pl-3">
                                            "{booking.customerNotes}"
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Right: Pricing & Actions */}
                            <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4 md:gap-3 md:min-w-[180px] pt-4 md:pt-0 border-t md:border-t-0 border-muted">
                                <div className="text-left md:text-right">
                                    <p className="profile-meta-text opacity-30 text-[0.5rem] sm:text-[0.55rem] uppercase font-black tracking-widest mb-0.5">{t("profile.amount_label")}</p>
                                    <div className="flex flex-col md:items-end">
                                        {booking.discountAmount > 0 ? (
                                            <>
                                                <div className="flex items-center gap-2 md:flex-row-reverse">
                                                    <p className="profile-meta-text opacity-30 text-[10px] sm:text-xs line-through">
                                                        AED{booking.totalAmount?.toFixed(2)}
                                                    </p>
                                                    <p className="font-bold text-base sm:text-lg profile-name-text tracking-tight">
                                                        AED{booking.finalAmount?.toFixed(2)}
                                                    </p>
                                                </div>
                                                <p className="text-success text-[0.55rem] sm:text-[0.6rem] font-bold">
                                                    −AED{booking.discountAmount?.toFixed(2)} {t("profile.off_suffix")}
                                                </p>
                                            </>
                                        ) : (
                                            <p className="font-bold text-base sm:text-lg profile-name-text tracking-tight">
                                                AED{booking.finalAmount?.toFixed(2) || booking.totalAmount?.toFixed(2) || t("profile.na")}
                                            </p>
                                        )}
                                        <p className={`text-[0.55rem] sm:text-[0.6rem] font-bold uppercase tracking-wider mt-0.5 ${getPaymentStatusStyle(booking.paymentStatus)}`}>
                                            {getPaymentStatusText(booking.paymentStatus)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 w-1/2 md:w-auto">
                                    {['PENDING', 'CONFIRMED'].includes(booking.status?.toUpperCase()) && (
                                        <button
                                            onClick={() => handleCancel(booking.id)}
                                            disabled={isCanceling}
                                            className="px-3 sm:px-4 py-2 sm:py-1.5 rounded-lg border border-danger/20 text-danger text-[0.6rem] sm:text-[0.65rem] font-bold uppercase tracking-wider hover:bg-danger/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full text-center"
                                        >
                                            {t("profile.btn_cancel")}
                                        </button>
                                    )}

                                    {booking.status?.toUpperCase() === 'COMPLETED' && (
                                        <button
                                            onClick={() => handleOpenReviewModal(booking)}
                                            className="px-3 sm:px-4 py-2 sm:py-1.5 rounded-lg border border-success/20 text-success text-[0.6rem] sm:text-[0.65rem] font-bold uppercase tracking-wider hover:bg-success/10 transition-colors w-full text-center flex items-center justify-center gap-1.5"
                                        >
                                            <Star size={10} className="sm:w-3 sm:h-3" />
                                            <span>{t("profile.btn_review")}</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                    <button
                        onClick={prevPage}
                        disabled={pagination.isFirst}
                        className="px-4 py-2 rounded-xl border hero-filter-input-bg text-xs font-bold uppercase tracking-wider profile-name-text disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/[0.05] transition-all"
                    >
                        {t("profile.previous")}
                    </button>
                    <span className="profile-meta-text opacity-50 text-xs font-bold">
                        {t("profile.page_of")} {pagination.currentPage + 1} {t("profile.page_of_divider")} {pagination.totalPages}
                    </span>
                    <button
                        onClick={nextPage}
                        disabled={pagination.isLast}
                        className="px-4 py-2 rounded-xl border hero-filter-input-bg text-xs font-bold uppercase tracking-wider profile-name-text disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/[0.05] transition-all"
                    >
                        {t("profile.next")}
                    </button>
                </div>
            )}

            {/* Review Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && setShowReviewModal(false)}>
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
                        <button
                            onClick={() => setShowReviewModal(false)}
                            className="absolute top-6 right-6 profile-meta-text opacity-60 hover:profile-name-text transition-colors"
                            type="button"
                        >
                            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
 
                        <h3 className="font-[Cormorant_Garamond] text-3xl font-bold profile-name-text mb-2">{t("profile.share_experience")}</h3>
                        <p className="profile-meta-text opacity-60 text-sm mb-6">{t("profile.feedback_luxury")}</p>

                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest profile-meta-text opacity-80 font-black mb-2">{t("profile.rating_label")}</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setNewReview({ ...newReview, rating: star })}
                                            className={`text-3xl transition-colors focus:outline-none ${star <= newReview.rating ? 'text-accent' : 'text-muted'}`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="review-comment" className="block text-[10px] uppercase tracking-widest profile-meta-text opacity-80 font-black mb-2">{t("profile.comments_label")}</label>
                                <textarea
                                    id="review-comment"
                                    required
                                    rows={4}
                                    value={newReview.comment}
                                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border hero-filter-input-bg bg-[#fdfaf8] focus:outline-none focus:border-accent/40 transition-colors text-sm resize-none"
                                    placeholder={t("profile.tell_us_about_service")}
                                />
                            </div>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center justify-center w-5 h-5 border hero-filter-input-bg rounded group-hover:border-accent transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={newReview.isAnonymous}
                                        onChange={(e) => setNewReview({ ...newReview, isAnonymous: e.target.checked })}
                                        className="appearance-none absolute w-full h-full cursor-pointer peer"
                                    />
                                    <svg className="w-3 h-3 text-accent opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <span className="profile-meta-text opacity-60 text-sm select-none">{t("profile.submit_anonymously")}</span>
                            </label>

                            <button
                                type="submit"
                                disabled={isSubmittingReview}
                                className="w-full mt-6 py-4 rounded-xl footer-bg text-white text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmittingReview ? t("profile.submitting") : t("profile.post_review")}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingHistory;
