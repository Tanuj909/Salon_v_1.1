"use client";

import React, { useState, useMemo } from "react";
import { useLanguage } from "@/context/LanguageContext";

const DAYS = {
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  ar: ["إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت", "أحد"]
};
const MONTHS = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  ar: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
};

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i % 12 === 0 ? 12 : i % 12;
  const ampm = i < 12 ? "am" : "pm";
  const label24 = `${String(i).padStart(2, "0")}:00`;
  return { label: `${hour}${ampm}`, value: label24 };
});

function getToday() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function formatDateShort(d, language) {
  const daysList = DAYS[language] || DAYS.en;
  const monthsList = MONTHS[language] || MONTHS.en;
  const dayStr = daysList[((d.getDay() + 6) % 7)];
  const monthStr = monthsList[d.getMonth()].slice(0, 3);
  return `${dayStr}, ${d.getDate()} ${monthStr}`;
}

export default function DateTimePickerModal({ isOpen, onClose, date, startTime, endTime, onApply }) {
  const { t, language } = useLanguage();
  const today = useMemo(() => getToday(), []);
  const tomorrow = useMemo(() => { const d = new Date(today); d.setDate(d.getDate() + 1); return d; }, [today]);

  const PRESETS = [
    { label: t("home.any_time"), startTime: "", endTime: "" },
    { label: t("home.morning"), sub: "8am - 12pm", startTime: "08:00", endTime: "12:00" },
    { label: t("home.afternoon"), sub: "12pm - 5pm", startTime: "12:00", endTime: "17:00" },
    { label: t("home.evening"), sub: "5pm - 10pm", startTime: "17:00", endTime: "22:00" },
  ];

  // Calendar state
  const [viewMonth, setViewMonth] = useState(() => date ? new Date(date).getMonth() : today.getMonth());
  const [viewYear, setViewYear] = useState(() => date ? new Date(date).getFullYear() : today.getFullYear());

  // Internal selections
  const [selectedDate, setSelectedDate] = useState(date || "");
  const [selectedStart, setSelectedStart] = useState(startTime || "");
  const [selectedEnd, setSelectedEnd] = useState(endTime || "");
  const [timeMode, setTimeMode] = useState("any"); // 'any' | 'morning' | 'afternoon' | 'evening' | 'custom'
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Sync time mode on open
  React.useEffect(() => {
    if (!startTime && !endTime) setTimeMode("any");
    else if (startTime === "08:00" && endTime === "12:00") setTimeMode("morning");
    else if (startTime === "12:00" && endTime === "17:00") setTimeMode("afternoon");
    else if (startTime === "17:00" && endTime === "22:00") setTimeMode("evening");
    else setTimeMode("custom");
  }, [isOpen, startTime, endTime]);

  // Calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const startDow = (firstDay.getDay() + 6) % 7; // Mon=0
    const days = [];

    for (let i = 0; i < startDow; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(d);
    return days;
  }, [viewMonth, viewYear]);

  const isDateDisabled = (day) => {
    if (!day) return true;
    const d = new Date(viewYear, viewMonth, day);
    return d < today;
  };

  const isDateSelected = (day) => {
    if (!day || !selectedDate) return false;
    const sel = new Date(selectedDate);
    return sel.getFullYear() === viewYear && sel.getMonth() === viewMonth && sel.getDate() === day;
  };

  const isToday = (day) => {
    if (!day) return false;
    return today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;
  };

  const selectDay = (day) => {
    if (isDateDisabled(day)) return;
    const d = new Date(viewYear, viewMonth, day);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  };

  const selectQuickDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
    setViewMonth(d.getMonth());
    setViewYear(d.getFullYear());
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const isPrevDisabled = viewYear === today.getFullYear() && viewMonth <= today.getMonth();

  const handlePreset = (preset, mode) => {
    setTimeMode(mode);
    setSelectedStart(preset.startTime);
    setSelectedEnd(preset.endTime);
    setShowStartPicker(false);
    setShowEndPicker(false);
  };

  const handleClear = () => {
    setSelectedDate("");
    setSelectedStart("");
    setSelectedEnd("");
    setTimeMode("any");
    onApply("", "", "");
    onClose();
  };

  const handleDone = () => {
    onApply(selectedDate, selectedStart, selectedEnd);
    onClose();
  };

  if (!isOpen) return null;

  const currentDaysList = DAYS[language] || DAYS.en;
  const currentMonthsList = MONTHS[language] || MONTHS.en;

  return (
    <>
      {/* Modal Wrapper */}
      <div 
        className="fixed inset-0 flex items-center justify-center p-4 z-[1100] pointer-events-none"
      >
        {/* Modal Backdrop (moved inside wrapper for better event handling) */}
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" 
          onClick={onClose} 
        />

        {/* Modal Content */}
        <div 
          className="bg-white w-full max-w-[420px] sm:max-h-[95vh] max-h-[90vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-300 pointer-events-auto relative z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-2 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 font-[DM_Sans]">{t("home.date_and_time")}</h2>
            <button 
              type="button"
              onClick={onClose} 
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors text-red-500 hover:text-red-600"
            >
              <span className="material-symbols-outlined text-2xl font-bold">close</span>
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5" style={{ scrollbarWidth: "none" }}>

            {/* Quick Date Picks */}
            <div className="flex gap-2">
              <button
                onClick={() => selectQuickDate(today)}
                className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                  selectedDate === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
                    ? "bg-[#1C3152] text-white border-[#1C3152]"
                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className="block text-[10px] font-bold">{t("home.today")}</span>
                <span className="block text-[9px] opacity-70 mt-0.5">{formatDateShort(today, language)}</span>
              </button>
              <button
                onClick={() => selectQuickDate(tomorrow)}
                className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                  selectedDate === `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`
                    ? "bg-[#1C3152] text-white border-[#1C3152]"
                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className="block text-[10px] font-bold">{t("home.tomorrow")}</span>
                <span className="block text-[9px] opacity-70 mt-0.5">{formatDateShort(tomorrow, language)}</span>
              </button>
            </div>

            {/* Calendar */}
            <div>
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={prevMonth}
                  disabled={isPrevDisabled}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined text-gray-600 text-lg">chevron_left</span>
                </button>
                <span className="text-sm font-bold text-gray-800">{currentMonthsList[viewMonth].slice(0, 3)} {viewYear}</span>
                <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                  <span className="material-symbols-outlined text-gray-600 text-lg">chevron_right</span>
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {currentDaysList.map(d => (
                  <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase py-1">{d}</div>
                ))}
              </div>

              {/* Day grid */}
              <div className="grid grid-cols-7 gap-y-0.5">
                {calendarDays.map((day, i) => (
                  <button
                    key={i}
                    disabled={isDateDisabled(day)}
                    onClick={() => selectDay(day)}
                    className={`h-9 w-full flex items-center justify-center text-sm font-medium rounded-full transition-all ${
                      !day ? "invisible"
                        : isDateSelected(day) ? "bg-[#7C3AED] text-white font-bold shadow-md"
                        : isToday(day) ? "border border-gray-300 text-gray-900"
                        : isDateDisabled(day) ? "text-gray-200 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {day || ""}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{t("home.select_time_label")}</h3>

              {/* Preset chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {PRESETS.map((p, i) => {
                  const modes = ["any", "morning", "afternoon", "evening"];
                  const mode = modes[i];
                  return (
                    <button
                      key={mode}
                      onClick={() => handlePreset(p, mode)}
                      className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
                        timeMode === mode
                          ? "bg-[#1C3152] text-white border-[#1C3152]"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="block">{p.label}</span>
                      {p.sub && <span className="block text-[9px] opacity-70 font-medium">{p.sub}</span>}
                    </button>
                  );
                })}
                <button
                  onClick={() => { setTimeMode("custom"); setShowStartPicker(false); setShowEndPicker(false); }}
                  className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
                    timeMode === "custom"
                      ? "bg-[#1C3152] text-white border-[#1C3152]"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {t("home.custom")}
                </button>
              </div>

              {/* Custom Time Pickers */}
              {timeMode === "custom" && (
                <div className="grid grid-cols-2 gap-3">
                  {/* Start Time */}
                  <div className="relative">
                    <button
                      onClick={() => { setShowStartPicker(!showStartPicker); setShowEndPicker(false); }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-700 hover:border-gray-300 transition-all"
                    >
                      <span className={selectedStart ? "text-gray-900" : "text-gray-400"}>
                        {selectedStart ? `From ${TIME_SLOTS.find(t => t.value === selectedStart)?.label || selectedStart}` : t("home.start_time")}
                      </span>
                      <span className="material-symbols-outlined text-gray-400 text-base">expand_more</span>
                    </button>
                    {showStartPicker && (
                      <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-100 rounded-2xl shadow-2xl z-[10] max-h-[200px] overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
                        {TIME_SLOTS.map(slot => (
                          <button
                            key={slot.value}
                            onClick={() => { setSelectedStart(slot.value); setShowStartPicker(false); }}
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-[11px] border-b border-gray-50 last:border-0 transition-colors ${
                              selectedStart === slot.value ? "bg-[#1C3152]/5 font-bold text-[#1C3152]" : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <span className="whitespace-nowrap">From {slot.label}</span>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ml-2 ${
                              selectedStart === slot.value ? "border-[#1C3152] bg-[#1C3152]" : "border-gray-300"
                            }`}>
                              {selectedStart === slot.value && (
                                <div className="w-2 h-2 rounded-full bg-white" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* End Time */}
                  <div className="relative">
                    <button
                      onClick={() => { setShowEndPicker(!showEndPicker); setShowStartPicker(false); }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-700 hover:border-gray-300 transition-all"
                    >
                      <span className={selectedEnd ? "text-gray-900" : "text-gray-400"}>
                        {selectedEnd ? `To ${TIME_SLOTS.find(t => t.value === selectedEnd)?.label || selectedEnd}` : t("home.end_time")}
                      </span>
                      <span className="material-symbols-outlined text-gray-400 text-base">expand_more</span>
                    </button>
                    {showEndPicker && (
                      <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-100 rounded-2xl shadow-2xl z-[10] max-h-[200px] overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
                        {TIME_SLOTS.map(slot => (
                          <button
                            key={slot.value}
                            onClick={() => { setSelectedEnd(slot.value); setShowEndPicker(false); }}
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-[11px] border-b border-gray-50 last:border-0 transition-colors ${
                              selectedEnd === slot.value ? "bg-[#1C3152]/5 font-bold text-[#1C3152]" : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <span className="whitespace-nowrap">To {slot.label}</span>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ml-2 ${
                              selectedEnd === slot.value ? "border-[#1C3152] bg-[#1C3152]" : "border-gray-300"
                            }`}>
                              {selectedEnd === slot.value && (
                                <div className="w-2 h-2 rounded-full bg-white" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-3 px-5 py-4 border-t border-gray-100">
            <button
              onClick={handleClear}
              className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all active:scale-[0.98]"
            >
              {t("home.clear")}
            </button>
            <button
              onClick={handleDone}
              className="flex-1 py-3 rounded-2xl bg-[#1C3152] text-white text-sm font-bold shadow-lg hover:bg-[#1C3152]/90 transition-all active:scale-[0.98]"
            >
              {t("home.done")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
