// Simple time formatter — no extra library needed
export const formatDistanceToNow = (dateString, t) => {
  if (!dateString) return "";

  // Handle high-precision ISO strings (e.g. .667766 -> .667) for better browser compatibility
  let sanitized = dateString;
  if (dateString.includes("T") && dateString.includes(".")) {
    const parts = dateString.split(".");
    if (parts.length > 1) {
      // Keep everything before the dot, and only 3 digits after the dot
      const fraction = parts[1].replace(/Z$/, "");
      sanitized = `${parts[0]}.${fraction.substring(0, 3)}`;
      if (dateString.endsWith("Z")) sanitized += "Z";
    }
  }

  const date = new Date(sanitized);
  
  // If parsing failed, fallback to raw string or local date part
  if (isNaN(date.getTime())) {
    return dateString.split("T")[0] || ""; 
  }

  const now  = new Date();
  const diff = Math.floor((now - date) / 1000); // seconds

  // Fallback translation helper if t is not provided (e.g. tests or other calls)
  const translate = (key, val) => {
    if (t) {
      if (val !== undefined) {
        return t(key).replace("{value}", val);
      }
      return t(key);
    }
    // English defaults
    if (key === "notifications.just_now") return "just now";
    if (key === "notifications.m_ago") return `${val}m ago`;
    if (key === "notifications.h_ago") return `${val}h ago`;
    if (key === "notifications.d_ago") return `${val}d ago`;
    if (key === "notifications.locale_code") return "en-IN";
    return "";
  };

  if (diff < 0)               return translate("notifications.just_now");
  if (diff < 60)              return translate("notifications.just_now");
  if (diff < 3600)            return translate("notifications.m_ago", Math.floor(diff / 60));
  if (diff < 86400)           return translate("notifications.h_ago", Math.floor(diff / 3600));
  if (diff < 86400 * 7)       return translate("notifications.d_ago", Math.floor(diff / 86400));

  return date.toLocaleDateString(translate("notifications.locale_code"), { day: "numeric", month: "short" });
};