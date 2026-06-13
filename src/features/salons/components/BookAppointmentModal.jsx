"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, Calendar, Clock, User, Scissors, CreditCard, MessageSquare, CheckCircle, AlertCircle, Loader2, ChevronRight, Sparkles } from "lucide-react";
import { useCreateBooking } from "../../profile/hooks/useCreateBooking";
import { useSalonStaff } from "../hooks/useSalonStaff";
import { useSalonTimings } from "../hooks/useSalonTimings";
import { useStaffSlots } from "../hooks/useStaffSlots";
import { getBusinessCategoriesWithDetails, getServicesByCategoryForBusiness } from "../services/salonService";
import { useLanguage } from "@/context/LanguageContext";
import { useStaffProfile } from "../hooks/useStaffProfile";
import StaffProfileModal from "./StaffProfileModal";
import ImageSliderModal from "./ImageSliderModal";

const PAYMENT_METHODS = [
    { value: "CASH", labelKey: "pay_after_service", icon: "💶" },
];

const BookAppointmentModal = ({ isOpen, onClose, salonId, salonName, preSelectedService, preSelectedStaff }) => {
    const { t, language: currentLanguage } = useLanguage();
    const { submitBooking, loading: submitting, error: submitError, success, bookingResult, reset } = useCreateBooking();
    
    // Category & Service states
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [categoriesError, setCategoriesError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [infoCategory, setInfoCategory] = useState(null);
    
    const [categoryServices, setCategoryServices] = useState([]);
    const [loadingCategoryServices, setLoadingCategoryServices] = useState(false);
    const [categoryServicesError, setCategoryServicesError] = useState(null);
    
    // Description info popup modal state
    const [infoService, setInfoService] = useState(null);

    // Staff Profile modal states
    const { profile, loading: profileLoading, error: profileError, fetchProfile, clearProfile } = useStaffProfile();
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [selectedStaffMember, setSelectedStaffMember] = useState(null);

    const handleViewProfile = (staffMember) => {
        setSelectedStaffMember(staffMember);
        setShowStaffModal(true);
        fetchProfile(staffMember.id);
    };

    const handleCloseStaffModal = () => {
        setShowStaffModal(false);
        setSelectedStaffMember(null);
        clearProfile();
    };

    // Image Slider Lightbox States
    const [sliderImages, setSliderImages] = useState(null);
    const [currentSliderIndex, setCurrentSliderIndex] = useState(0);

    const openSlider = (images, index) => {
        setSliderImages(images);
        setCurrentSliderIndex(index);
    };

    const handlePrevSlider = () => {
        if (!sliderImages) return;
        setCurrentSliderIndex((prev) => (prev === 0 ? sliderImages.length - 1 : prev - 1));
    };

    const handleNextSlider = () => {
        if (!sliderImages) return;
        setCurrentSliderIndex((prev) => (prev === sliderImages.length - 1 ? 0 : prev + 1));
    };

    const handleSelectSliderIndex = (idx) => {
        setCurrentSliderIndex(idx);
    };

    const [selectedServices, setSelectedServices] = useState([]);
    const { staff: allStaff, loading: staffLoading } = useSalonStaff({
        id: salonId,
        serviceId: null // Force fetching all staff
    });

    // Filter out Receptionist/Front Desk
    const staff = useMemo(() => {
        if (!allStaff) return [];
        return allStaff.filter(
            (member) => !member.designation?.toLowerCase().includes("receptionist") &&
                !member.designation?.toLowerCase().includes("front desk")
        );
    }, [allStaff]);
    const { timings, loading: timingsLoading } = useSalonTimings({ id: salonId });

    // Date calculations for 4-day window (using local time)
    const todayStr = useMemo(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }, []);

    const endDateStr = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() + 3);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }, []);

    // Form state
    const [selectedStaff, setSelectedStaff] = useState(preSelectedStaff || null);
    const [bookingDate, setBookingDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");
    const [customerNotes, setCustomerNotes] = useState("");
    const [validationError, setValidationError] = useState("");
    const [validationTimeout, setValidationTimeout] = useState(null);

    // Clean up validation timeout on unmount
    useEffect(() => {
        return () => {
            if (validationTimeout) clearTimeout(validationTimeout);
        };
    }, [validationTimeout]);

    // Step logic: If we have a pre-selected service, jump directly to step 3 (Schedule). Otherwise start at 1.
    const [step, setStep] = useState(preSelectedService ? 3 : 1); // 1: Categories, 2: Services, 3: Schedule, 4: Review
    const [activeDate, setActiveDate] = useState(todayStr);

    // Initial load: fetch business categories
    useEffect(() => {
        if (!isOpen || !salonId) return;

        const fetchCategories = async () => {
            setLoadingCategories(true);
            setCategoriesError(null);
            try {
                const data = await getBusinessCategoriesWithDetails(salonId);
                setCategories(data || []);
            } catch (err) {
                console.error("Error fetching categories for modal:", err);
                setCategoriesError(t("salon_details.no_categories"));
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchCategories();
    }, [isOpen, salonId, t]);

    // Pre-select category if preSelectedService changes and categories are loaded
    useEffect(() => {
        if (preSelectedService && categories.length > 0) {
            const matchedCat = categories.find(
                (c) => c.name?.toLowerCase() === preSelectedService.categoryName?.toLowerCase() ||
                       c.id === preSelectedService.categoryId ||
                       c.id === preSelectedService.category?.id ||
                       c.name?.toLowerCase() === preSelectedService.category?.name?.toLowerCase()
            );
            if (matchedCat) {
                setSelectedCategory(matchedCat);
            } else if (!selectedCategory) {
                // Fallback: search all categories to find the one containing this service
                const findAndSetCategory = async () => {
                    try {
                        const promises = categories.map(async (cat) => {
                            const services = await getServicesByCategoryForBusiness(salonId, cat.id).catch(() => []);
                            return { cat, services };
                        });
                        const results = await Promise.all(promises);
                        const match = results.find(r => r.services.some(s => s.id === preSelectedService.id));
                        if (match) {
                            setSelectedCategory(match.cat);
                        }
                    } catch (e) {
                        console.error("Error finding category for preSelectedService:", e);
                    }
                };
                findAndSetCategory();
            }
        }
    }, [preSelectedService, categories, salonId]);

    // Initialize services
    useEffect(() => {
        if (preSelectedService) {
            setSelectedServices([preSelectedService]);
            setStep(3); // Direct to Schedule
        }
    }, [preSelectedService]);

    // Update staff if prop changes
    useEffect(() => {
        if (preSelectedStaff) {
            setSelectedStaff(preSelectedStaff);
        }
    }, [preSelectedStaff]);

    // Fetch services automatically whenever selectedCategory is set or changed
    useEffect(() => {
        if (!isOpen || !salonId) return;
        if (!selectedCategory) {
            setCategoryServices([]);
            return;
        }

        const fetchServices = async () => {
            setLoadingCategoryServices(true);
            setCategoryServicesError(null);
            try {
                const data = await getServicesByCategoryForBusiness(salonId, selectedCategory.id);
                setCategoryServices(data || []);
            } catch (err) {
                console.error("Error fetching services for category:", err);
                setCategoryServicesError("Failed to fetch services.");
            } finally {
                setLoadingCategoryServices(false);
            }
        };

        fetchServices();
    }, [isOpen, salonId, selectedCategory]);

    // Slots fetching
    const { slots: staffSlots, loading: slotsLoading, error: slotsError } = useStaffSlots({
        staffId: selectedStaff?.id,
        businessId: !selectedStaff ? salonId : null,
        startDate: todayStr,
        endDate: endDateStr
    });

    // Reset form when modal closes, not when it opens (to preserve initialization)
    useEffect(() => {
        if (!isOpen) {
            setBookingDate("");
            setStartTime("");
            setPaymentMethod("");
            setCustomerNotes("");
            setValidationError("");
            if (validationTimeout) {
                clearTimeout(validationTimeout);
                setValidationTimeout(null);
            }
            setActiveDate(todayStr);
            setStep(preSelectedService ? 3 : 1);
            if (!preSelectedStaff) setSelectedStaff(null);
            if (!preSelectedService) {
                setSelectedServices([]);
                setSelectedCategory(null);
                setCategoryServices([]);
            }
            reset();
        }
    }, [isOpen, todayStr, reset, preSelectedService, preSelectedStaff, validationTimeout]);

    // Close on escape
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [isOpen, onClose]);

    // Prevent body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    // Reset active date when staff changes
    useEffect(() => {
        if (selectedStaff) {
            setActiveDate(todayStr);
        }
    }, [selectedStaff, todayStr]);

    // Calculate totals
    const totals = useMemo(() => {
        const totalStart = selectedServices.reduce((sum, s) => sum + (s.startPrice || s.price || 0), 0);
        const totalEnd = selectedServices.reduce((sum, s) => sum + (s.endPrice || s.price || 0), 0);
        const duration = selectedServices.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
        return { totalStart, totalEnd, duration };
    }, [selectedServices]);

    // Format individual service price depending on step and chosen staff
    const getServicePriceString = (service) => {
        const start = service.startPrice || service.price || 0;
        const end = service.endPrice || service.price || 0;
        
        if (step <= 2) {
            if (start === end) {
                return `AED ${start}`;
            }
            return `AED (${start} - ${end})`;
        }
        
        if (!selectedStaff) {
            // "Any" staff selected - show start pricing only
            return `AED ${start}`;
        } else {
            // Specific stylist selected - show average pricing
            const avg = Math.round((start + end) / 2);
            return `AED ${avg}`;
        }
    };

    // Format totals/subtotals depending on step and chosen staff
    const getTotalsPriceString = () => {
        if (step <= 2) {
            if (totals.totalStart === totals.totalEnd) {
                return `AED ${totals.totalStart}`;
            }
            return `AED (${totals.totalStart} - ${totals.totalEnd})`;
        }
        
        if (!selectedStaff) {
            // "Any" staff selected - show start pricing only
            return `AED ${totals.totalStart}`;
        } else {
            // Specific stylist selected - show average pricing
            const avg = Math.round((totals.totalStart + totals.totalEnd) / 2);
            return `AED ${avg}`;
        }
    };

    const toggleService = (service) => {
        setSelectedServices((prev) => {
            const exists = prev.find((s) => s.id === service.id);
            if (exists) return prev.filter((s) => s.id !== service.id);
            return [...prev, service];
        });
    };

    // Handle Category selection
    const handleSelectCategory = (category) => {
        setSelectedCategory(category);
        setStep(2); // Move to Services step
    };

    const canProceedStep1 = selectedCategory !== null;
    const canProceedStep2 = selectedServices.length > 0;
    const canProceedStep3 = (selectedStaff || !selectedStaff) && bookingDate && startTime;
    const canSubmit = canProceedStep2 && canProceedStep3;

    // --- Timings Validation ---
    const getSelectedDayLabel = (dateStr) => {
        if (!dateStr) return null;
        const d = new Date(dateStr + "T00:00:00");
        return d.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
    };

    const isDateValid = useMemo(() => {
        if (!activeDate || !timings || timings.length === 0) return true;
        const dayLabel = getSelectedDayLabel(activeDate);
        const dayData = timings.find((t) => t.dayOfWeek === dayLabel);
        return dayData ? !dayData.isClosed : true;
    }, [activeDate, timings]);

    const availableTimeSlots = useMemo(() => {
        if (!staffSlots) return [];
        const grouped = staffSlots.reduce((acc, slot) => {
            if (!acc[slot.date]) acc[slot.date] = [];
            acc[slot.date].push({
                time: slot.startTime.substring(0, 5),
                status: slot.status,
                id: slot.id
            });
            return acc;
        }, {});
        return grouped[activeDate] || [];
    }, [selectedStaff, staffSlots, activeDate]);

    const availableDates = useMemo(() => {
        const dates = [];
        for (let i = 0; i < 4; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            const dateStr = d.toLocaleDateString('en-CA');
            dates.push({
                date: dateStr,
                label: i === 0 ? t("salon_details.today") : d.toLocaleDateString(currentLanguage === "ar" ? "ar-AE" : "en-IN", { weekday: "short", day: "numeric", month: "short" })
            });
        }
        return dates;
    }, [currentLanguage, t]);

    const handleSubmit = async () => {
        if (paymentMethod !== "CASH") {
            setValidationError(t("salon_details.choose_payment_method_error"));
            
            if (validationTimeout) clearTimeout(validationTimeout);
            
            const timer = setTimeout(() => {
                setValidationError("");
            }, 5000);
            setValidationTimeout(timer);
            return;
        }
        setValidationError("");
        if (validationTimeout) {
            clearTimeout(validationTimeout);
            setValidationTimeout(null);
        }

        if (!canSubmit) return;

        const bookingData = {
            businessId: Number(salonId),
            staffId: selectedStaff ? Number(selectedStaff.id) : null,
            bookingDate,
            startTime,
            serviceIds: selectedServices.map((s) => s.id),
            customerNotes: customerNotes.trim() || null,
            paymentMethod,
        };

        if (!bookingData.staffId) delete bookingData.staffId;

        try {
            await submitBooking(bookingData);
        } catch {
            // error handled by hook
        }
    };

    if (!isOpen) return null;

    // ─── Success Screen ──────────────────────────────────────────────────
    if (success) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" dir="ltr">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
                <div className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-10 text-center shadow-2xl animate-[slideUp_0.4s_ease] border border-[#E0E0E0]">
                    <div className="w-20 h-20 rounded-full bg-[#10b981]/10 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-[#10b981]" />
                    </div>
                    <h3 className="font-[Cormorant_Garamond,Georgia,serif] text-2xl sm:text-3xl font-bold text-[#1F355E] mb-3 whitespace-nowrap">
                        {t("salon_details.booking_confirmed")}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">
                        {t("salon_details.booking_success_msg")}
                    </p>
                    <div className="bg-[#628EB8]/5 border border-[#628EB8]/20 rounded-2xl p-4 my-4 text-[#1F355E] text-xs sm:text-sm font-semibold leading-relaxed">
                         {currentLanguage === "ar" ? (
                             <>
                                 يرجى الوصول <strong className="font-extrabold text-[#628EB8]">قبل 5 دقائق</strong> وعرض <strong className="font-extrabold text-[#628EB8]">رمز الخدمة</strong> للحلاق.
                             </>
                         ) : (
                             <>
                                 Please arrive <strong className="font-extrabold text-[#628EB8]">5 minutes early</strong> and show your <strong className="font-extrabold text-[#628EB8]">service code</strong> to the barber.
                             </>
                         )}
                     </div>
                    {bookingResult?.bookingNumber && (
                        <div className="bg-[#F8FAFC] rounded-2xl p-4 my-6 border border-[#E0E0E0]">
                            <span className="text-[10px] uppercase tracking-[0.3em] text-[#628EB8] font-bold block mb-1">{t("salon_details.booking_number")}</span>
                            <span className="text-xl font-bold text-[#1F355E] tracking-wider">{bookingResult.bookingNumber}</span>
                        </div>
                    )}
                    <button
                        onClick={onClose}
                        className="w-full py-4 rounded-xl bg-[#1F355E] text-white text-[11px] font-bold tracking-[0.2em] uppercase transition-all hover:bg-[#628EB8] shadow-md"
                    >
                        {t("salon_details.done")}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4" dir="ltr">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-[slideUp_0.3s_ease]">
                {/* Header */}
                <div className="bg-[#1F355E] px-4 py-4 sm:px-8 sm:py-6 flex items-center justify-between shrink-0">
                    <div className="flex-1 pr-2 text-start">
                        <span className="text-[10px] tracking-[0.4em] uppercase text-[#C5A566] font-bold block mb-1">
                            {t("salon_details.new_appointment")}
                        </span>
                        <h2 className="font-[Cormorant_Garamond,Georgia,serif] text-xl sm:text-2xl text-[#C5A566] font-semibold truncate leading-tight">
                            {salonName || t("salon_details.book_appointment")}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/15 flex items-center justify-center shrink-0 text-white/70 hover:bg-white/20 hover:text-white transition-all border border-white/10"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Step Indicators */}
                <div className="px-3 py-3 sm:px-8 sm:py-4 bg-white border-b border-[#E0E0E0] flex items-center gap-1 sm:gap-3 shrink-0 overflow-x-auto no-scrollbar">
                    {[
                        { num: 1, label: t("salon_details.select_category_title") },
                        { num: 2, label: t("salon_details.our_services") },
                        { num: 3, label: t("salon_details.choose_datetime") },
                        { num: 4, label: t("salon_details.final_review") },
                    ].map((s, i) => (
                        <React.Fragment key={s.num}>
                            <button
                                onClick={() => {
                                    if (s.num < step) setStep(s.num);
                                    if (s.num === 2 && selectedCategory) setStep(2);
                                    if (s.num === 3 && selectedServices.length > 0) setStep(3);
                                    if (s.num === 4 && selectedServices.length > 0 && bookingDate && startTime) setStep(4);
                                }}
                                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] transition-all whitespace-nowrap ${step === s.num ? "bg-[#628EB8] text-white" : step > s.num ? "bg-[#1F355E] text-white" : "bg-white text-[#9babb8] border border-[#E0E0E0]"}`}
                            >
                                <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white/20 flex items-center justify-center text-[8px] sm:text-[9px]">
                                    {step > s.num ? "✓" : s.num}
                                </span>
                                {s.label}
                            </button>
                            {i < 3 && <ChevronRight size={14} className={`text-[#628EB8]/30 shrink-0 ${currentLanguage === "ar" ? "rotate-180" : ""}`} />}
                        </React.Fragment>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-8">
                    {/* ─── STEP 1: Select Category ───────────────────── */}
                    {step === 1 && (
                        <div>
                            <div className="mb-4 sm:mb-6 text-start">
                                <h3 className="font-[Cormorant_Garamond,Georgia,serif] text-xl sm:text-2xl text-[#1F355E] mb-1 leading-tight">
                                    {t("salon_details.select_category_title")}
                                </h3>
                                <p className="text-[#628EB8] text-xs sm:text-sm">{t("salon_details.select_category_desc")}</p>
                            </div>

                            {loadingCategories ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-6 h-6 text-[#1F355E] animate-spin" />
                                    <span className="ml-3 text-[#628EB8] text-sm">{t("salon_details.loading_categories")}</span>
                                </div>
                            ) : categoriesError ? (
                                <div className="text-center py-12">
                                    <p className="text-red-500 text-sm mb-3">{categoriesError}</p>
                                    <button 
                                        onClick={() => {
                                            setCategoriesError(null);
                                            setLoadingCategories(true);
                                            getBusinessCategoriesWithDetails(salonId)
                                                .then(data => setCategories(data || []))
                                                .catch(() => setCategoriesError(t("salon_details.no_categories")))
                                                .finally(() => setLoadingCategories(false));
                                        }}
                                        className="px-4 py-2 bg-[#1F355E] text-white text-xs font-bold rounded-xl"
                                    >
                                        {t("salon_details.retry")}
                                    </button>
                                </div>
                            ) : categories.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-[#628EB8] text-sm">{t("salon_details.no_categories")}</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {categories.map((category) => {
                                        const isSelected = selectedCategory?.id === category.id;
                                        return (
                                            <div
                                                key={category.id}
                                                onClick={() => handleSelectCategory(category)}
                                                className={`w-full text-start p-4 rounded-xl border-2 transition-all duration-300 group flex items-center justify-between gap-4 cursor-pointer ${isSelected ? "border-[#628EB8] bg-[#628EB8]/5 shadow-sm" : "border-[#E0E0E0] bg-white hover:border-[#628EB8]/30 hover:bg-[#F8FAFC]"}`}
                                            >
                                                <div className="flex-1 min-w-0 text-start">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="text-[9px] tracking-widest uppercase font-bold text-[#C5A566]">
                                                            {category.serviceCount} {category.serviceCount === 1 ? t("salon_details.service_count") : t("salon_details.services_count")}
                                                        </span>
                                                        {isSelected && <CheckCircle size={14} className="text-[#628EB8]" />}
                                                    </div>
                                                    <h4 className="font-[Cormorant_Garamond,Georgia,serif] text-base sm:text-lg font-bold text-[#1F355E] group-hover:text-[#C5A566] transition-colors leading-tight truncate">
                                                        {category.name}
                                                    </h4>
                                                </div>

                                                <div className="flex flex-col items-end gap-1.5 shrink-0 text-end">
                                                    <span className="text-[11px] sm:text-[12px] text-[#1F355E] font-bold">
                                                        AED {category.minPrice} - {category.maxPrice}
                                                    </span>
                                                    <span 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setInfoCategory(category);
                                                        }}
                                                        className="flex items-center gap-0.5 text-[10px] sm:text-[11px] text-[#628EB8] hover:text-[#1F355E] font-bold group-hover:translate-x-0.5 transition-transform cursor-pointer"
                                                    >
                                                        {t("salon_details.view")} <ChevronRight size={12} className={currentLanguage === "ar" ? "rotate-180" : ""} />
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ─── STEP 2: Select Services ───────────────────── */}
                    {step === 2 && (
                        <div>
                            <div className="mb-4 sm:mb-6 flex justify-between items-end gap-4 pb-4 border-b border-[#E0E0E0]/30">
                                <div className="text-start">
                                    <h3 className="font-[Cormorant_Garamond,Georgia,serif] text-xl sm:text-2xl text-[#1F355E] mb-1 leading-tight font-bold">
                                        {t("salon_details.select_services_title")}
                                    </h3>
                                    <p className="text-[#628EB8] text-xs sm:text-sm">
                                        {t("salon_details.category")}: <span className="font-bold text-[#1F355E]">{selectedCategory?.name}</span>
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setStep(1)}
                                    className="text-xs font-bold text-[#628EB8] hover:text-[#1F355E] bg-white border border-[#E0E0E0] shadow-sm hover:shadow px-3.5 py-2 rounded-full transition-all duration-300 flex items-center gap-1 cursor-pointer"
                                >
                                    {t("salon_details.change_category")}
                                </button>
                            </div>

                            {loadingCategoryServices ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-6 h-6 text-[#1F355E] animate-spin" />
                                    <span className="ml-3 text-[#628EB8] text-sm">{t("salon_details.loading_services")}</span>
                                </div>
                            ) : categoryServicesError ? (
                                <div className="text-center py-12">
                                    <p className="text-red-500 text-sm mb-3">{categoryServicesError}</p>
                                    <button 
                                        onClick={() => handleSelectCategory(selectedCategory)}
                                        className="px-4 py-2 bg-[#1F355E] text-white text-xs font-bold rounded-xl"
                                    >
                                        {t("salon_details.retry")}
                                    </button>
                                </div>
                            ) : categoryServices.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-[#628EB8] text-sm">{t("salon_details.no_services_category")}</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {categoryServices.map((service) => {
                                        const isSelected = selectedServices.some((s) => s.id === service.id);
                                        const sliderImages = (service.imageUrls && service.imageUrls.length > 0)
                                            ? service.imageUrls
                                            : (service.imageUrl ? [service.imageUrl] : []);
                                        return (
                                            <div
                                                key={service.id}
                                                onClick={() => toggleService(service)}
                                                className={`w-full text-start p-3.5 sm:p-5 rounded-xl border-2 transition-all duration-300 group cursor-pointer ${isSelected ? "border-[#628EB8] bg-[#628EB8]/5 shadow-sm" : "border-[#E0E0E0] bg-white hover:border-[#628EB8]/30 hover:bg-[#F8FAFC]"}`}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" || e.key === " ") {
                                                        toggleService(service);
                                                    }
                                                }}
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 w-full">
                                                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                                        {/* Tick Box UI */}
                                                        <div className={`w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-all duration-300 ${isSelected ? "bg-[#628EB8] border-[#628EB8]" : "border-[#E0E0E0] bg-white group-hover:border-[#628EB8]/50"}`}>
                                                            {isSelected && <CheckCircle size={14} className="text-white" strokeWidth={3} />}
                                                        </div>

                                                        <div className="min-w-0 text-start">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <h4 className="font-semibold text-[#1F355E] text-xs sm:text-sm leading-snug break-words">{service.name}</h4>
                                                                {sliderImages.length > 0 && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            openSlider(sliderImages, 0);
                                                                        }}
                                                                        className="px-2 py-0.5 rounded bg-[#628EB8]/10 hover:bg-[#628EB8]/20 text-[#628EB8] text-[8px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                                                                    >
                                                                        <span>{t("salon_details.view")}</span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                            {service.durationMinutes && (
                                                                <span className="text-[#628EB8] text-[10px] sm:text-xs flex items-center gap-0.5 sm:gap-1 mt-0.5">
                                                                    <Clock size={10} /> {service.durationMinutes} {currentLanguage === "ar" ? "دقيقة" : "min"}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-start sm:text-end ps-8 sm:ps-0 shrink-0">
                                                        <span className="font-[Cormorant_Garamond] text-sm sm:text-base font-bold text-[#1F355E] block leading-none">
                                                            {getServicePriceString(service)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ─── STEP 3: Staff, Date & Time ───────────────── */}
                    {step === 3 && (
                        <div className="space-y-6 sm:space-y-8">
                            {/* Staff Selection (Optional) */}
                            <div className="text-start">
                                <h3 className="font-[Cormorant_Garamond,Georgia,serif] text-xl sm:text-2xl text-[#1F355E] mb-1">
                                    {t("salon_details.choose_stylist")}
                                </h3>
                                <p className="text-[#628EB8] text-xs sm:text-sm mb-3 sm:mb-4">
                                    {currentLanguage === "ar" ? "اختياري — اختر المصفف المفضل لديك" : "Optional — select your preferred stylist"}
                                </p>

                                {staffLoading ? (
                                    <div className="flex items-center gap-3 py-4">
                                        <Loader2 className="w-5 h-5 text-[#1F355E] animate-spin" />
                                        <span className="text-[#628EB8] text-sm">{t("salon_details.profiling_excellence")}</span>
                                    </div>
                                ) : !staff || staff.length === 0 ? (
                                    <p className="text-[#628EB8] text-sm py-4">
                                        {currentLanguage === "ar" ? "لا يوجد موظفون مدرجون - سيتم تعيين موظف." : "No staff listed — one will be assigned."}
                                    </p>
                                ) : (
                                    <div className="flex gap-3 overflow-x-auto pb-2">
                                        {/* "Any" option */}
                                        <button
                                            onClick={() => setSelectedStaff(null)}
                                            className={`flex-shrink-0 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all min-w-[100px] ${!selectedStaff ? "border-[#628EB8] bg-[#628EB8]/5 shadow-sm" : "border-[#E0E0E0] bg-white hover:border-[#628EB8]/20"}`}
                                        >
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${!selectedStaff ? "bg-[#628EB8] text-white" : "bg-[#F8FAFC] text-[#1F355E] border border-[#E0E0E0]"}`}>
                                                <Sparkles size={18} />
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1F355E]">{t("salon_details.any")}</span>
                                        </button>

                                        {staff.map((member) => {
                                            const isSelected = selectedStaff?.id === member.id;
                                            return (
                                                <div
                                                    key={member.id}
                                                    onClick={() => setSelectedStaff(member)}
                                                    className={`flex-shrink-0 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all min-w-[100px] cursor-pointer ${isSelected ? "border-[#628EB8] bg-[#628EB8]/5 shadow-sm" : "border-[#E0E0E0] bg-white hover:border-[#628EB8]/20"}`}
                                                    role="button"
                                                    tabIndex={0}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter" || e.key === " ") {
                                                            setSelectedStaff(member);
                                                        }
                                                    }}
                                                >
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden ${isSelected ? "ring-2 ring-[#628EB8] ring-offset-2" : ""}`}>
                                                        {(member.userProfileImageUrl || member.profileImageUrl) ? (
                                                            <img src={member.userProfileImageUrl || member.profileImageUrl} alt={member.userFullName || member.fullName} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full bg-[#F8FAFC] flex items-center justify-center text-[#1F355E] font-bold text-sm">
                                                                {(member.userFullName || member.fullName)?.substring(0, 2).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] font-bold text-[#1F355E] text-center leading-tight max-w-[80px] truncate">
                                                        {member.userFullName || member.fullName}
                                                    </span>
                                                    {member.designation && (
                                                        <span className="text-[8px] text-[#628EB8] truncate max-w-[80px] text-center">{member.designation}</span>
                                                    )}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleViewProfile(member);
                                                        }}
                                                        className="mt-1 px-2.5 py-1 bg-transparent hover:bg-[#1F355E] text-[#1F355E] hover:text-white border border-[#1F355E]/30 rounded-lg text-[8px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer"
                                                    >
                                                        {t("salon_details.view_bio")}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Date Selection Pills */}
                            <div className="text-start">
                                <h3 className="font-[Cormorant_Garamond,Georgia,serif] text-xl text-[#1F355E] mb-1 flex items-center gap-2">
                                    <Calendar size={18} className="text-[#628EB8]" />
                                    {t("salon_details.select_date")}
                                </h3>
                                <div className="flex gap-2 overflow-x-auto pb-2 mt-3 no-scrollbar">
                                    {availableDates.map((d) => (
                                        <button
                                            key={d.date}
                                            onClick={() => {
                                                setActiveDate(d.date);
                                                setStartTime("");
                                                setBookingDate("");
                                            }}
                                            className={`flex-shrink-0 px-5 py-3 rounded-xl border-2 text-[10px] font-bold uppercase tracking-wider transition-all ${activeDate === d.date ? "border-[#628EB8] bg-[#628EB8] text-white shadow-md" : "border-[#E0E0E0] bg-white text-[#1F355E] hover:border-[#628EB8]/20"}`}
                                        >
                                            {d.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Time Selection */}
                            <div className="text-start">
                                <h3 className="font-[Cormorant_Garamond,Georgia,serif] text-xl text-[#1F355E] mb-1 flex items-center gap-2">
                                    <Clock size={18} className="text-[#628EB8]" />
                                    {t("salon_details.available_times")} {(timingsLoading || slotsLoading) && <Loader2 className="w-3 h-3 text-[#1F355E] animate-spin inline ml-2" />}
                                </h3>
                                {slotsLoading ? (
                                    <div className="flex items-center gap-3 py-4">
                                        <Loader2 className="w-5 h-5 text-[#1F355E] animate-spin" />
                                        <span className="text-[#628EB8] text-sm">{t("salon_details.loading_slots")}</span>
                                    </div>
                                ) : slotsError ? (
                                    <p className="text-sm text-red-500 mt-3">{slotsError}</p>
                                ) : !isDateValid ? (
                                    <p className="text-sm text-red-500 mt-3">{t("salon_details.salon_closed_day")}</p>
                                ) : availableTimeSlots.length === 0 ? (
                                    <p className="text-sm text-[#628EB8] mt-3">{t("salon_details.no_slots_date")}</p>
                                ) : (
                                    <div className="grid grid-cols-2 min-[420px]:grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 mt-4">
                                        {availableTimeSlots.map((slot) => {
                                            const isSelected = startTime === slot.time && bookingDate === activeDate;

                                            // Check if slot is in the past for today
                                            const now = new Date();
                                            const isToday = activeDate === todayStr;
                                            let isPast = false;
                                            if (isToday) {
                                                const [slotH, slotM] = slot.time.split(':').map(Number);
                                                const currentH = now.getHours();
                                                const currentM = now.getMinutes();
                                                if (slotH < currentH || (slotH === currentH && slotM <= currentM)) {
                                                    isPast = true;
                                                }
                                            }

                                            const isAvailable = slot.status === "AVAILABLE" && !isPast;

                                            // Format for display (e.g. 09:00 AM)
                                            const [h, m] = slot.time.split(':');
                                            const hours = parseInt(h, 10);
                                            const ampm = hours >= 12 ? (currentLanguage === "ar" ? "م" : "PM") : (currentLanguage === "ar" ? "ص" : "AM");
                                            const displayHours = hours % 12 || 12;
                                            const displayTime = `${displayHours}:${m.padStart(2, '0')} ${ampm}`;

                                            return (
                                                <button
                                                    key={slot.id}
                                                    disabled={!isAvailable}
                                                    onClick={() => {
                                                        setStartTime(slot.time);
                                                        setBookingDate(activeDate);
                                                    }}
                                                    className={`py-3 px-2 rounded-xl border-2 text-sm font-semibold transition-all ${isSelected
                                                        ? "border-[#628EB8] bg-[#628EB8] text-white shadow-md"
                                                        : isAvailable
                                                            ? "border-[#E0E0E0] bg-white text-[#1F355E] hover:border-[#628EB8]/40"
                                                            : "border-[#E0E0E0] bg-gray-50 text-gray-400 cursor-not-allowed line-through"
                                                        }`}
                                                >
                                                    {displayTime}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ─── STEP 4: Review & Confirm ────────────────── */}
                    {step === 4 && (
                        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="text-start">
                                <h3 className="font-[Cormorant_Garamond,Georgia,serif] text-xl sm:text-2xl text-[#1F355E] mb-1 leading-tight">
                                    {t("salon_details.final_review")}
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Side: Details & Notes */}
                                <div className="space-y-6">
                                    {/* Appointment Details Grid */}
                                    <div className="grid grid-cols-2 gap-4 text-start">
                                        <div className="bg-[#F8FAFC] border border-[#E0E0E0] p-4 rounded-2xl">
                                            <span className="text-[9px] uppercase tracking-widest text-[#628EB8] font-bold block mb-2 flex items-center gap-1.5">
                                                <Calendar size={10} /> {t("salon_details.date_label")}
                                            </span>
                                            <p className="text-sm text-[#1F355E] font-semibold">
                                                {bookingDate ? new Date(bookingDate + "T00:00:00").toLocaleDateString(currentLanguage === "ar" ? "ar-AE" : "en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                                            </p>
                                        </div>
                                        <div className="bg-[#F8FAFC] border border-[#E0E0E0] p-4 rounded-2xl">
                                            <span className="text-[9px] uppercase tracking-widest text-[#628EB8] font-bold block mb-2 flex items-center gap-1.5">
                                                <Clock size={10} /> {t("salon_details.time_label")}
                                            </span>
                                            <p className="text-sm text-[#1F355E] font-semibold">
                                                {startTime ? (() => {
                                                    const [h, m] = startTime.split(':');
                                                    const hours = parseInt(h, 10);
                                                    const ampm = hours >= 12 ? (currentLanguage === "ar" ? "م" : "PM") : (currentLanguage === "ar" ? "ص" : "AM");
                                                    const displayHours = hours % 12 || 12;
                                                    return `${displayHours}:${m.padStart(2, '0')} ${ampm}`;
                                                })() : "—"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-[#F8FAFC] border border-[#E0E0E0] p-4 rounded-2xl text-start">
                                        <span className="text-[9px] uppercase tracking-widest text-[#628EB8] font-bold block mb-2 flex items-center gap-1.5">
                                            <User size={10} /> {t("salon_details.stylist_label")}
                                        </span>
                                        <div className="flex items-center gap-3">
                                            {(selectedStaff?.userProfileImageUrl || selectedStaff?.profileImageUrl) ? (
                                                <img src={selectedStaff.userProfileImageUrl || selectedStaff.profileImageUrl} alt="" className="w-8 h-8 rounded-full object-cover border border-[#628EB8]/20" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-[#1F355E] text-white flex items-center justify-center text-[10px] font-bold">
                                                    {selectedStaff ? (selectedStaff.userFullName || selectedStaff.fullName)?.substring(0, 2).toUpperCase() : <Sparkles size={12} />}
                                                </div>
                                            )}
                                            <p className="text-sm text-[#1F355E] font-semibold">
                                                {selectedStaff ? (selectedStaff.userFullName || selectedStaff.fullName) : t("salon_details.any_available_stylist")}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Payment Selection */}
                                    <div className="text-start">
                                        <span className="text-[10px] uppercase tracking-[0.2em] text-[#628EB8] font-bold block mb-2 sm:mb-3">
                                            {t("salon_details.payment_method")}
                                        </span>
                                        <div className="flex gap-2 sm:gap-3 flex-wrap">
                                            {PAYMENT_METHODS.map((pm) => {
                                                const isSelected = paymentMethod === pm.value;
                                                return (
                                                    <button
                                                        key={pm.value}
                                                        onClick={() => {
                                                            if (isSelected) {
                                                                setPaymentMethod("");
                                                            } else {
                                                                setPaymentMethod(pm.value);
                                                                setValidationError("");
                                                                if (validationTimeout) {
                                                                    clearTimeout(validationTimeout);
                                                                    setValidationTimeout(null);
                                                                }
                                                            }
                                                        }}
                                                        className={`w-full sm:flex-1 flex items-center justify-start gap-4 p-4 rounded-2xl border-2 transition-all group ${isSelected ? "border-[#1F355E] bg-[#1F355E] text-white shadow-md" : "border-[#E0E0E0] bg-white text-[#1F355E] hover:border-[#628EB8]/30"}`}
                                                    >
                                                        <div className={`w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-all duration-300 ${isSelected ? "bg-white border-white" : "border-[#E0E0E0] bg-white group-hover:border-[#628EB8]/50"}`}>
                                                            {isSelected && <CheckCircle size={14} className="text-[#1F355E]" strokeWidth={3} />}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg sm:text-xl">{pm.icon}</span>
                                                            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">{pm.labelKey ? t("salon_details." + pm.labelKey) : pm.label}</span>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Customer Notes */}
                                    <div className="text-start">
                                        <span className="text-[10px] uppercase tracking-[0.2em] text-[#628EB8] font-bold block mb-3 flex items-center gap-2">
                                            <MessageSquare size={12} /> {t("salon_details.notes_for_salon")}
                                        </span>
                                        <textarea
                                            value={customerNotes}
                                            onChange={(e) => setCustomerNotes(e.target.value)}
                                            placeholder={t("salon_details.notes_placeholder")}
                                            rows={2}
                                            className="w-full px-4 py-3 rounded-2xl bg-white border border-[#E0E0E0] focus:border-[#628EB8] focus:ring-4 focus:ring-[#628EB8]/5 focus:outline-none text-[#1F355E] text-sm resize-none transition-all placeholder:text-gray-300 shadow-sm"
                                        />
                                    </div>
                                </div>

                                {/* Right Side: Service Receipt Summary */}
                                <div className="bg-white border-2 border-[#1F355E]/5 rounded-3xl p-6 relative overflow-hidden shadow-xl flex flex-col text-start">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-[#1F355E]" />

                                    <div className="flex items-center justify-between mb-6">
                                        <h4 className="font-bold text-[#1F355E] text-sm uppercase tracking-widest">{t("salon_details.order_summary")}</h4>
                                        <Sparkles size={16} className="text-[#628EB8]" />
                                    </div>

                                    <div className="flex-1 space-y-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                        {selectedServices.map((s) => {
                                            const start = s.startPrice || s.price || 0;
                                            const end = s.endPrice || s.price || 0;
                                            const actualPrice = !selectedStaff ? start : Math.round((start + end) / 2);
                                            const saveAmount = end - actualPrice;
                                            return (
                                                <div key={s.id} className="flex items-start justify-between group">
                                                    <div className="flex gap-3 min-w-0 flex-1">
                                                        <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#E0E0E0] flex items-center justify-center shrink-0 group-hover:bg-[#628EB8]/10 transition-colors">
                                                            <Scissors size={14} className="text-[#628EB8]" />
                                                        </div>
                                                        <div className="min-w-0 flex-1 text-start">
                                                            <p className="text-sm text-[#1F355E] font-semibold leading-tight truncate">{s.name}</p>
                                                            <div className="flex items-center gap-2 mt-0.5 min-w-0">
                                                                <span className="text-[10px] text-[#628EB8] font-medium shrink-0">{s.durationMinutes} {currentLanguage === "ar" ? "دقيقة" : "min"}</span>
                                                                {s.description && (
                                                                    <>
                                                                        <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                                                                        <span className="text-[10px] text-[#6B6B6B] truncate flex-1 min-w-0">{s.description}</span>
                                                                        <button 
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setInfoService(s);
                                                                            }}
                                                                            className="text-[#C5A566] font-bold hover:underline text-[9px] bg-transparent border-0 p-0 cursor-pointer shrink-0"
                                                                        >
                                                                            {t("salon_details.view")}
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                            {saveAmount > 0 && (
                                                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                                    <span className="text-[11px] text-gray-400 line-through">AED {end}</span>
                                                                    <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded">
                                                                        {t("salon_details.save_label")} AED {saveAmount}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-sm font-bold text-[#1F355E] ml-4 shrink-0">{getServicePriceString(s)}</p>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-6 pt-6 border-t-2 border-dashed border-[#E0E0E0]">
                                        <div className="flex items-center justify-between mb-2 text-[#628EB8]">
                                            <span className="text-xs font-semibold">{t("salon_details.subtotal")}</span>
                                            <span className="text-sm font-bold">{getTotalsPriceString()}</span>
                                        </div>
                                        {(() => {
                                            const totalPayable = !selectedStaff 
                                                ? totals.totalStart 
                                                : Math.round((totals.totalStart + totals.totalEnd) / 2);
                                            const totalSavings = totals.totalEnd - totalPayable;
                                            if (totalSavings > 0) {
                                                return (
                                                    <div className="flex items-center justify-between mb-2 text-green-600 font-semibold text-xs">
                                                        <span>{t("salon_details.total_savings")}</span>
                                                        <span className="bg-green-50 px-2 py-0.5 rounded font-bold">{t("salon_details.save_label")} AED {totalSavings}</span>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}
                                        <div className="flex items-center justify-between mb-4 text-[#1F355E]">
                                            <span className="text-sm font-black uppercase tracking-widest">{t("salon_details.total_amount")}</span>
                                            <span className="text-xl sm:text-2xl font-black font-[Cormorant_Garamond]">{getTotalsPriceString()}</span>
                                        </div>

                                        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-100">
                                            <CheckCircle size={14} className="text-green-600" />
                                            <p className="text-[10px] text-green-700 font-semibold uppercase tracking-wider">{t("salon_details.secure_booking_guaranteed")}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Error Message */}
                            {submitError && (
                                <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 animate-shake">
                                    <AlertCircle size={16} className="text-red-500 shrink-0" />
                                    <p className="text-red-600 text-xs font-semibold">{submitError}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-3.5 py-4 sm:px-8 sm:py-5 bg-white border-t border-[#E0E0E0] flex items-center justify-between gap-3 shrink-0">
                    {/* Total Pill */}
                    {selectedServices.length > 0 && (
                        <div className="flex items-center gap-1.5 sm:gap-3 whitespace-nowrap min-w-0">
                            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-[#628EB8] font-bold hidden sm:inline">
                                {selectedServices.length} {selectedServices.length === 1 ? t("salon_details.service_count") : t("salon_details.services_count")}
                            </span>
                            <span className="text-[9px] sm:hidden uppercase tracking-[0.1em] text-[#628EB8] font-bold">
                                {currentLanguage === "ar" ? "الإجمالي:" : "Total:"}
                            </span>
                            <span className="font-[Cormorant_Garamond] text-[13px] sm:text-xl font-bold text-[#1F355E] whitespace-nowrap">
                                {getTotalsPriceString()}
                            </span>
                        </div>
                    )}
                    {selectedServices.length === 0 && <span />}

                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                        {step > 1 && (
                            <button
                                onClick={() => setStep((s) => s - 1)}
                                className="px-2.5 sm:px-6 py-2 sm:py-3 rounded-xl border border-[#E0E0E0] text-[#1F355E] text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-gray-50 transition-all cursor-pointer"
                            >
                                {t("salon_details.back")}
                            </button>
                        )}

                        {step < 4 ? (
                            <button
                                onClick={() => setStep((s) => s + 1)}
                                disabled={
                                    (step === 1 && !canProceedStep1) ||
                                    (step === 2 && !canProceedStep2) ||
                                    (step === 3 && !canProceedStep3)
                                }
                                className="px-4 sm:px-8 py-2 sm:py-3 rounded-xl bg-[#1F355E] text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-[#628EB8] transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {t("salon_details.continue")}
                            </button>
                        ) : (
                            <div className="relative">
                                {validationError && (
                                    <div className="absolute bottom-full mb-3 right-0 bg-red-500 text-white text-[10px] font-bold py-2 px-4 rounded-xl shadow-lg whitespace-nowrap z-50 animate-[tooltipFadeIn_0.2s_ease-out]">
                                        {validationError}
                                        <div className="absolute top-full right-6 w-2 h-2 bg-red-500 rotate-45 -translate-y-1"></div>
                                    </div>
                                )}
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting || !canSubmit}
                                    className={`px-4 sm:px-8 py-2 sm:py-3 rounded-xl text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] hover:shadow-lg transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap bg-[#1F355E] ${
                                        (submitting || !canSubmit)
                                            ? "opacity-50 cursor-not-allowed"
                                            : paymentMethod !== "CASH"
                                                ? "opacity-60 cursor-pointer"
                                                : "opacity-100 cursor-pointer"
                                    }`}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 size={12} className="animate-spin" />
                                            <span>{t("salon_details.booking_status")}</span>
                                        </>
                                    ) : (
                                        <span>{t("salon_details.confirm_booking")}</span>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Category Info Popup Modal */}
            {infoCategory && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" dir="ltr">
                    <div className="bg-white rounded-3xl max-w-md w-full border border-[#E0E0E0] shadow-2xl p-6 relative overflow-hidden animate-[tooltipFadeIn_0.2s_ease-out] text-start">
                        {/* Elegant top color band */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#C5A566]" />

                        <button
                            onClick={() => setInfoCategory(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
                        >
                            <X size={18} />
                        </button>

                        <div className="space-y-4">
                            <div>
                                <span className="text-[9px] tracking-widest uppercase font-bold text-[#C5A566] block mb-1">
                                    {infoCategory.serviceCount} {infoCategory.serviceCount === 1 ? t("salon_details.service_count") : t("salon_details.services_count")}
                                </span>
                                <h3 className="font-[Cormorant_Garamond,Georgia,serif] text-2xl font-bold text-[#1F355E] leading-tight">
                                    {infoCategory.name}
                                </h3>
                            </div>

                            {infoCategory.description ? (
                                <p className="text-gray-600 text-sm leading-relaxed font-medium">
                                    {infoCategory.description}
                                </p>
                            ) : (
                                <p className="text-gray-400 text-sm italic font-medium">
                                    {t("salon_details.no_description_available")}
                                </p>
                            )}

                            <div className="pt-4 border-t border-[#E0E0E0]/30 space-y-2 text-xs text-gray-600 font-medium">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">{t("salon_details.price_range_title")}</span>
                                    <span className="text-[#1F355E] font-bold">AED {infoCategory.minPrice} - {infoCategory.maxPrice}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">{t("salon_details.average_pricing")}</span>
                                    <span className="text-[#C5A566] font-bold">AED {infoCategory.avgPrice}</span>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    onClick={() => {
                                        const cat = infoCategory;
                                        setInfoCategory(null);
                                        handleSelectCategory(cat);
                                    }}
                                    className="flex-1 py-3 bg-[#1F355E] hover:bg-[#16263F] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md hover:shadow-lg text-center cursor-pointer"
                                >
                                    {t("salon_details.select_category_btn")}
                                </button>
                                <button
                                    onClick={() => setInfoCategory(null)}
                                    className="px-5 py-3 border border-[#E0E0E0] hover:bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 text-center cursor-pointer"
                                >
                                    {t("salon_details.close")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Service Info Popup Modal */}
            {infoService && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" dir="ltr">
                    <div className="bg-white rounded-3xl max-w-md w-full border border-[#E0E0E0] shadow-2xl p-6 relative overflow-hidden animate-[tooltipFadeIn_0.2s_ease-out] text-start">
                        {/* Elegant top color band */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#C5A566]" />

                        <button
                            onClick={() => setInfoService(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
                        >
                            <X size={18} />
                        </button>

                        <div className="space-y-4">
                            <div>
                                <span className="text-[9px] tracking-widest uppercase font-bold text-[#C5A566] block mb-1">
                                    {t("salons_list.service")}
                                </span>
                                <h3 className="font-[Cormorant_Garamond,Georgia,serif] text-2xl font-bold text-[#1F355E] leading-tight pr-6">
                                    {infoService.name}
                                </h3>
                            </div>

                            {infoService.description ? (
                                <p className="text-gray-600 text-sm leading-relaxed font-medium">
                                    {infoService.description}
                                </p>
                            ) : (
                                <p className="text-gray-400 text-sm italic font-medium">
                                    {t("salon_details.no_description_available")}
                                </p>
                            )}

                            <div className="pt-4 border-t border-[#E0E0E0]/30 space-y-2 text-xs text-gray-600 font-medium">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">{t("salon_details.price")}</span>
                                    <span className="text-[#1F355E] font-bold">{getServicePriceString(infoService)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">{t("salon_details.time_label")}</span>
                                    <span className="text-[#C5A566] font-bold">{infoService.durationMinutes} {currentLanguage === "ar" ? "دقيقة" : "min"}</span>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    onClick={() => setInfoService(null)}
                                    className="flex-1 py-3 bg-[#1F355E] hover:bg-[#16263F] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md hover:shadow-lg text-center cursor-pointer"
                                >
                                    {t("salon_details.close")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showStaffModal && (
                <StaffProfileModal
                    profile={profile}
                    member={selectedStaffMember}
                    loading={profileLoading}
                    error={profileError}
                    onClose={handleCloseStaffModal}
                />
            )}

            {sliderImages && (
                <ImageSliderModal
                    images={sliderImages}
                    currentIndex={currentSliderIndex}
                    onClose={() => setSliderImages(null)}
                    onPrev={handlePrevSlider}
                    onNext={handleNextSlider}
                    onIndexSelect={handleSelectSliderIndex}
                />
            )}
            <style jsx>{`
                @keyframes slideUp {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes tooltipFadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes scaleIn {
                    from { transform: scale(0); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default BookAppointmentModal;
