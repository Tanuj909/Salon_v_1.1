import { useState } from "react";
import { getStaffProfile, getStaffCustomPrices } from "../services/salonService";

export const useStaffProfile = () => {
  const [profile, setProfile] = useState(null);
  const [customPrices, setCustomPrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = async (staffId) => {
    if (!staffId) return;
    setLoading(true);
    setError(null);
    try {
      const [profileData, customPricesData] = await Promise.all([
        getStaffProfile(staffId),
        getStaffCustomPrices(staffId).catch(err => {
          console.warn("Failed to load custom prices, using fallback:", err);
          return {};
        })
      ]);
      setProfile(profileData);
      setCustomPrices(customPricesData || {});
    } catch (err) {
      console.error("Error fetching staff profile:", err?.response?.status, err?.response?.data || err.message);
      setError("Failed to load staff profile.");
    } finally {
      setLoading(false);
    }
  };

  const clearProfile = () => {
    setProfile(null);
    setCustomPrices({});
    setError(null);
  };

  return { profile, customPrices, loading, error, fetchProfile, clearProfile };
};
