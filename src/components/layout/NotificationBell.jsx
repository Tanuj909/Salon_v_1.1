"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Check, CheckCheck, Wifi, WifiOff } from "lucide-react";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { formatDistanceToNow } from "@/features/notifications/lib/timeUtils";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/features/auth/hooks/useAuth";

// Notification type → color dot mapping
const TYPE_COLORS = {
  BOOKING_CREATED:   "bg-blue-500",
  BOOKING_CONFIRMED: "bg-green-500",
  BOOKING_REMINDER:  "bg-amber-500",
  BOOKING_BROADCAST: "bg-purple-500",
  DEFAULT:           "bg-gray-400",
};

export default function NotificationBell({ isScrolled }) {
  const { notifications, unreadCount, wsConnected, markAsRead, markAllAsRead, refetch } =
    useNotifications();
  const { t } = useLanguage();
  const { user } = useAuthContext();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    
    const isAdminRole = ["ADMIN", "SUPER_ADMIN", "STAFF", "RECEPTIONIST"].includes(user?.role);
    if (isAdminRole) {
      // For Admins/Staff, only mark as read and do nothing else (no redirection to prevent 404s)
      return;
    }

    if (notification.actionUrl) {
      // Client-side navigation to prevent full page reload/refresh for regular users
      if (notification.actionUrl.startsWith("/bookings/")) {
        router.push("/profile");
      } else if (notification.actionUrl.startsWith("http")) {
        window.location.href = notification.actionUrl;
      } else {
        router.push(notification.actionUrl);
      }
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ── Bell Button ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`p-1.5 sm:p-2 rounded-full transition-all duration-200 border ${
          open || unreadCount > 0 || isScrolled
            ? 'bg-[#D98C5F] text-white hover:bg-[#C07B52] border-white/30'
            : 'bg-white/80 backdrop-blur-sm text-gray-500 hover:bg-[#D98C5F] hover:text-white border-white/50'
        }`}
        aria-label="Notifications"
      >
        <Bell size={20} className="" />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 flex items-center justify-center bg-red-500 text-white text-[9px] font-semibold rounded-full leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}

        {/* WS connection dot */}
        <span
          className={`absolute bottom-1 right-1 w-2 h-2 rounded-full border border-white ${
            wsConnected ? "bg-green-400 animate-pulse" : "bg-gray-300"
          }`}
          title={wsConnected ? t("notifications.live_connection") : t("notifications.offline_polling")}
        />
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div className="fixed md:absolute left-1/2 -translate-x-1/2 md:left-auto md:right-0 md:translate-x-0 top-20 md:top-12 w-[calc(100vw-2rem)] md:w-80 max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 z-[1001] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="fixed inset-0 sm:hidden z-[-1]" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full h-full bg-white">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-gray-900">
                {t("notifications.title")}
              </span>
              {wsConnected ? (
                <Wifi size={12} className="text-green-500" />
              ) : (
                <WifiOff size={12} className="text-gray-400" />
              )}
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  refetch();
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-[#D98C5F]"
                title={t("notifications.refresh")}
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Bell size={32} className="mb-3 opacity-30" />
                <p className="text-sm">{t("notifications.no_notifications")}</p>
              </div>
            ) : (
              [...notifications]
                .sort((a, b) => {
                  // Unread (isRead=false) comes before read (isRead=true)
                  if (a.isRead !== b.isRead) {
                    return a.isRead ? 1 : -1;
                  }
                  // Secondary sort by date (fallback for real-time consistency)
                  return new Date(b.createdAt) - new Date(a.createdAt); // createdAt sort is already done in hook but good handle here for new items
                })
                .map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`flex gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 hover:bg-gray-50 transition-colors duration-150 ${
                    !n.isRead ? "bg-blue-50/40" : ""
                  }`}
                >
                  {/* Type dot */}
                  <div className="mt-1.5 flex-shrink-0">
                    <span
                      className={`block w-2 h-2 rounded-full ${
                        TYPE_COLORS[n.type] ?? TYPE_COLORS.DEFAULT
                      }`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-sm leading-snug ${
                          !n.isRead
                            ? "font-semibold text-gray-900"
                            : "font-medium text-gray-700"
                        }`}
                      >
                        {n.title}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                      {n.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-[11px] text-gray-400">
                        {formatDistanceToNow(n.createdAt, t)}
                      </p>
                      
                      {!n.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(n.id);
                          }}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider"
                        >
                          {t("notifications.mark_as_read")}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Removed View All as per request */}
          </div>
        </div>
      )}
    </div>
  );
}