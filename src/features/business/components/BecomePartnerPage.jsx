"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useRegisterBusiness } from "../hooks/useRegisterBusiness";
import dynamic from "next/dynamic";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Briefcase,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Map as MapIcon,
} from "lucide-react";
import { fetchActiveCategories } from "@/features/salons/services/salonService";

const MapPickerModal = dynamic(() => import("@/features/salons/components/MapPickerModal"), {
  ssr: false,
  loading: () => null,
});

export default function BecomePartnerPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { submitBusiness, loading, error, success } =
    useRegisterBusiness();

  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(user?.role);
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const [form, setForm] = useState({
    name: "",
    description: "",
    registrationNumber: "",
    phoneNumber: "",
    email: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    latitude: "",
    longitude: "",
    metaDescription: "",
    metaKeywords: "",
    categoryIds: [],
  });

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [manualLocation, setManualLocation] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  useEffect(() => {
    if (success) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [success]);

  useEffect(() => {
    const getCategories = async () => {
      try {
        setCategoriesLoading(true);
        const data = await fetchActiveCategories();
        setCategories(data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    getCategories();
  }, []);

  // 🔐 Auth Guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/become-partner");
    }
  }, [user, authLoading, router]);

  // Function to reverse geocode coordinates to address
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en', // Ensure English address components
            'User-Agent': 'SalonHub-MapPicker/1.0' // Required by Nominatim policy
          }
        }
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();

      if (data.address) {
        const address = data.address;

        // Extract address components
        const street = address.road || address.street || address.pedestrian || '';
        const houseNumber = address.house_number || '';
        const city = address.city || address.town || address.village || address.municipality || '';
        const state = address.state || address.state_district || '';
        const postalCode = address.postcode || '';
        const country = address.country || '';

        // Format street address
        const streetAddress = `${houseNumber} ${street}`.trim();

        return {
          address: streetAddress || data.display_name?.split(',')[0] || '',
          city,
          state,
          postalCode,
          country
        };
      }
      return null;
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      return null;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryToggle = (id) => {
    setForm((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(id)
        ? prev.categoryIds.filter((c) => c !== id)
        : [...prev.categoryIds, id],
    }));
  };

  // 📍 Handle Map Selection
  const handleMapSelect = async (data) => {
    setIsMapOpen(false);

    if (!data.lat || !data.lng) return;

    // 1. Update coordinates immediately and clear old address fields to show progress
    setForm((prev) => ({
      ...prev,
      latitude: data.lat.toString(),
      longitude: data.lng.toString(),
      address: "Fetching address...",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    }));

    setLocationLoading(true);
    setLocationError(null);

    try {
      // 2. Fetch full address details from Nominatim
      const addressDetails = await reverseGeocode(data.lat, data.lng);

      if (addressDetails) {
        setForm((prev) => ({
          ...prev,
          latitude: data.lat.toString(),
          longitude: data.lng.toString(),
          address: addressDetails.address || prev.address,
          city: addressDetails.city || prev.city,
          state: addressDetails.state || prev.state,
          postalCode: addressDetails.postalCode || prev.postalCode,
          country: addressDetails.country || prev.country,
        }));
      } else {
        // Fallback: use display name from map if it's not a placeholder
        const mapAddress = (data.address && !["Locating...", "Loading address...", "Fetch address..."].includes(data.address))
          ? data.address
          : "";

        setForm((prev) => ({
          ...prev,
          latitude: data.lat.toString(),
          longitude: data.lng.toString(),
          address: mapAddress || prev.address,
        }));

        if (!mapAddress) {
          setLocationError("Could not retrieve full address details. Please fill them manually.");
        }
      }
    } catch (error) {
      console.error("Error getting address details:", error);
      setLocationError("Address lookup failed. Please enter details manually.");
    } finally {
      setLocationLoading(false);
    }
  };

  // 📍 Get User Location (Shortcut)
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported.");
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Update coordinates
        setForm((prev) => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString()
        }));

        // Try to get address from coordinates
        try {
          const addressDetails = await reverseGeocode(latitude, longitude);

          if (addressDetails) {
            setForm((prev) => ({
              ...prev,
              latitude: latitude.toString(),
              longitude: longitude.toString(),
              address: addressDetails.address || prev.address,
              city: addressDetails.city || prev.city,
              state: addressDetails.state || prev.state,
              postalCode: addressDetails.postalCode || prev.postalCode,
              country: addressDetails.country || prev.country,
            }));
          }
        } catch (error) {
          console.error("Reverse geocoding failed:", error);
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        setLocationError("Location permission denied.");
        setLocationLoading(false);
      }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isAdmin) return;

    if (!form.latitude || !form.longitude) {
      setLocationError("Please provide location before submitting.");
      return;
    }

    submitBusiness({
      ...form,
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      categoryIds: form.categoryIds.length > 0
        ? form.categoryIds.map(id => Number(id))
        : [1],
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen hero-filter-input-bg flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#1C3152] animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen pt-24 sm:pt-32 pb-12 sm:pb-24 font-[Jost,sans-serif] hero-filter-input-bg">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=Jost:wght@300;400;500;600&display=swap');
      `}</style>
 
      <div className="max-w-[1240px] mx-auto px-3 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-[3rem] bg-white shadow-2xl border rec-card-border">
          {/* Decorative Background Elements */}
          {success ? (
            <div className="py-12 sm:py-20 px-6 sm:px-10 text-center relative z-10">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-100">
                <CheckCircle2 size={40} className="text-green-600" />
              </div>
 
              <div className="flex flex-col items-center">
                <h2 className="font-[Cormorant_Garamond,serif] text-4xl sm:text-5xl font-bold rec-section-heading mb-6 tracking-tight">
                  Application <em className="italic rec-section-heading-accent font-light">Received</em>
                </h2>
                <p className="rec-section-subtext text-lg max-w-lg mx-auto mb-10 font-medium leading-relaxed">
                  Thank you for choosing Luxe. Please upload your business documents to complete the verification process.
                </p>
              </div>
              <button
                onClick={() => router.push("/partner/documents")}
                className="px-8 sm:px-10 py-3.5 sm:py-4 bg-[#1C3152] text-[#C8A951] rounded-lg text-[10px] sm:text-sm font-bold tracking-widest uppercase hover:bg-[#2a4570] transition-all shadow-lg mt-5 border border-[#C8A951]/30"
              >
                Continue to Documents
              </button>
            </div>
          ) : (
            <div className="relative z-10 flex flex-col md:flex-row">
              {/* Sidebar Info - Navy background for luxury contrast */}
              <div className="md:w-1/3 p-8 sm:p-12 bg-[#1C3152] border-b md:border-b-0 md:border-r border-[#C8A951]/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C8A951]/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                
                <span className="hidden sm:block text-[10px] tracking-[0.4em] uppercase text-[#C8A951] font-bold mb-8 relative z-10">Partnership</span>
                <h2 className="font-[Cormorant_Garamond,serif] text-3xl sm:text-5xl text-white font-bold leading-[1.1] mb-4 sm:mb-8 relative z-10 tracking-tight">
                  Grow Your <em className="italic text-[#C8A951] font-light">Business</em> With Fast Booking Service
                </h2>
                <p className="hidden sm:block text-blue-100/70 text-sm leading-relaxed font-medium mb-12 relative z-10">
                  Join an exclusive community of premium salons. Elevate your brand, reach more clients, and manage your bookings with ease.
                </p>
 
                <div className="hidden sm:block space-y-8 relative z-10">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                      <CheckCircle2 size={20} className="text-[#C8A951]" />
                    </div>
                    <span className="text-xs font-bold text-white tracking-widest uppercase">Premium Visibility</span>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                      <Briefcase size={20} className="text-[#C8A951]" />
                    </div>
                    <span className="text-xs font-bold text-white tracking-widest uppercase">Smart Dashboard</span>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                      <Navigation size={20} className="text-[#C8A951]" />
                    </div>
                    <span className="text-xs font-bold text-white tracking-widest uppercase">Simple Management</span>
                  </div>
                </div>
              </div>
 
              {/* Form Area - Subtle beige background for premium feel */}
              <div className="md:w-2/3 p-8 sm:p-12 hero-filter-input-bg">
                {error && (
                  <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex gap-3 text-sm animate-fade-in">
                    <AlertCircle size={18} />
                    {error}
                  </div>
                )}
 
                {locationError && (
                  <div className="mb-8 p-4 bg-yellow-50 text-yellow-700 rounded-xl border border-yellow-200 flex gap-3 text-sm animate-fade-in">
                    <AlertCircle size={18} />
                    {locationError}
                  </div>
                )}

                {isAdmin && (
                  <div className="mb-8 p-4 bg-[#1C3152]/10 text-[#1C3152] rounded-xl border border-[#1C3152]/20 flex items-center gap-3 text-sm animate-fade-in">
                    <AlertCircle size={20} className="text-[#C8A951]" />
                    <div className="flex flex-col">
                      <span className="font-bold uppercase tracking-wider text-[10px]">
                        {isSuperAdmin ? "Super_Admin View Mode" : "Admin View Mode"}
                      </span>
                      <span className="font-medium opacity-80">
                        Form submission and editing is restricted for {isSuperAdmin ? "super administrative" : "administrative"} roles.
                      </span>
                    </div>
                  </div>
                )}
 
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Basic Information */}
                  <div className="space-y-6 sm:space-y-8">
                    <h3 className="text-xs font-bold uppercase tracking-[0.3em] rec-section-heading-accent">Business Profile</h3>
 
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] rec-section-subtext font-bold ml-1">Salon Name</label>
                        <input
                          name="name"
                          placeholder="e.g. Royal Grace Studio"
                          value={form.name}
                          onChange={handleChange}
                          required
                          disabled={isAdmin}
                          className="w-full h-12 px-5 rounded-xl bg-white border rec-card-border focus:border-[#C8A951] focus:ring-4 focus:ring-[#C8A951]/10 transition-all outline-none font-semibold text-base rec-section-heading placeholder:text-[#1C3152]/30 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] rec-section-subtext font-bold ml-1">Registration No.</label>
                        <input
                          name="registrationNumber"
                          placeholder="Trade License / Tax ID"
                          value={form.registrationNumber}
                          onChange={handleChange}
                          required
                          disabled={isAdmin}
                          className="w-full h-12 px-5 rounded-xl bg-white border rec-card-border focus:border-[#C8A951] focus:ring-4 focus:ring-[#C8A951]/10 transition-all outline-none font-semibold text-base rec-section-heading placeholder:text-[#1C3152]/30 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
 
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] rec-section-subtext font-bold ml-1">About the Business</label>
                      <textarea
                        name="description"
                        placeholder="Tell us about your salon's philosophy and specialties..."
                        value={form.description}
                        onChange={handleChange}
                        required
                        disabled={isAdmin}
                        rows="4"
                        className="w-full p-5 rounded-2xl bg-white border rec-card-border focus:border-[#C8A951] focus:ring-4 focus:ring-[#C8A951]/10 transition-all outline-none font-semibold text-base rec-section-heading placeholder:text-[#1C3152]/30 resize-none shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
 
                  {/* Contact Information */}
                  <div className="space-y-6 sm:space-y-8 pt-6 sm:pt-8 border-t rec-card-border/50">
                    <h3 className="text-xs font-bold uppercase tracking-[0.3em] rec-section-heading-accent">Contact Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] rec-section-subtext font-bold ml-1">Business Email</label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C8A951]" />
                          <input
                            type="email"
                            name="email"
                            placeholder="contact@salon.com"
                            value={form.email}
                            onChange={handleChange}
                            required
                            disabled={isAdmin}
                            className="w-full h-12 pl-12 pr-5 rounded-xl bg-white border rec-card-border focus:border-[#C8A951] focus:ring-4 focus:ring-[#C8A951]/10 transition-all outline-none font-semibold text-base rec-section-heading placeholder:text-[#1C3152]/30 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] rec-section-subtext font-bold ml-1">Phone Number</label>
                        <div className="relative">
                          <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C8A951]" />
                          <input
                            name="phoneNumber"
                            placeholder="+971 -- --- ----"
                            value={form.phoneNumber}
                            onChange={handleChange}
                            required
                            disabled={isAdmin}
                            className="w-full h-12 pl-12 pr-5 rounded-xl bg-white border rec-card-border focus:border-[#C8A951] focus:ring-4 focus:ring-[#C8A951]/10 transition-all outline-none font-semibold text-base rec-section-heading placeholder:text-[#1C3152]/30 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
 
                  {/* Location Information */}
                  <div className="space-y-8 pt-6 sm:pt-8 border-t rec-card-border/50">
                    <h3 className="text-xs font-bold uppercase tracking-[0.3em] rec-section-heading-accent">Location</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] rec-section-subtext font-bold ml-1">Street Address</label>
                        <div className="relative">
                          <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C8A951]" />
                          <input
                            name="address"
                            placeholder="Unit, Floor, Building Name"
                            value={form.address}
                            onChange={handleChange}
                            required
                            disabled={isAdmin}
                            className="w-full h-12 pl-12 pr-5 rounded-xl bg-white border rec-card-border focus:border-[#C8A951] focus:ring-4 focus:ring-[#C8A951]/10 transition-all outline-none font-semibold text-base rec-section-heading placeholder:text-[#1C3152]/30 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>
 
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-[0.1em] rec-section-subtext font-bold ml-1">City</label>
                          <input
                            name="city"
                            placeholder="City"
                            value={form.city}
                            onChange={handleChange}
                            required
                            disabled={isAdmin}
                            className="w-full h-11 px-4 rounded-lg bg-white border rec-card-border outline-none font-bold text-xs focus:border-[#C8A951] focus:ring-4 focus:ring-[#C8A951]/10 rec-section-heading placeholder:text-[#1C3152]/30 disabled:opacity-70 disabled:cursor-not-allowed"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-[0.1em] rec-section-subtext font-bold ml-1">State</label>
                          <input
                            name="state"
                            placeholder="State"
                            value={form.state}
                            onChange={handleChange}
                            required
                            disabled={isAdmin}
                            className="w-full h-11 px-4 rounded-lg bg-white border rec-card-border outline-none font-bold text-xs focus:border-[#C8A951] focus:ring-4 focus:ring-[#C8A951]/10 rec-section-heading placeholder:text-[#1C3152]/30 disabled:opacity-70 disabled:cursor-not-allowed"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-[0.1em] rec-section-subtext font-bold ml-1">Postal</label>
                          <input
                            name="postalCode"
                            placeholder="00000"
                            value={form.postalCode}
                            onChange={handleChange}
                            required
                            disabled={isAdmin}
                            className="w-full h-11 px-4 rounded-lg bg-white border rec-card-border outline-none font-bold text-xs focus:border-[#C8A951] focus:ring-4 focus:ring-[#C8A951]/10 rec-section-heading placeholder:text-[#1C3152]/30 disabled:opacity-70 disabled:cursor-not-allowed"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-[0.1em] rec-section-subtext font-bold ml-1">Country</label>
                          <input
                            name="country"
                            placeholder="Country"
                            value={form.country}
                            onChange={handleChange}
                            required
                            disabled={isAdmin}
                            className="w-full h-11 px-4 rounded-lg bg-white border rec-card-border outline-none font-bold text-xs focus:border-[#C8A951] focus:ring-4 focus:ring-[#C8A951]/10 rec-section-heading placeholder:text-[#1C3152]/30 disabled:opacity-70 disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>
 
                      <div className="flex flex-wrap gap-3 py-2">
                        <button
                          type="button"
                          onClick={handleGetLocation}
                          disabled={locationLoading || isAdmin}
                          className="px-6 py-3 bg-white border border-[#C8A951] text-[#C8A951] rounded-xl flex items-center gap-2 text-xs font-bold hover:bg-[#C8A951] hover:text-[#1C1C1C] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
                        >
                          {locationLoading ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
                          {locationLoading ? "Detecting..." : "Current Location"}
                        </button>
 
                        <button
                          type="button"
                          onClick={() => setIsMapOpen(true)}
                          disabled={locationLoading || isAdmin}
                          className="px-6 py-3 bg-white border border-[#C8A951] text-[#C8A951] rounded-xl flex items-center gap-2 text-xs font-bold hover:bg-[#C8A951] hover:text-[#1C1C1C] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
                        >
                          <MapIcon size={14} />
                          Pick from Map
                        </button>
                      </div>
 
                      {(form.latitude || form.longitude) && (
                        <div className="p-5 rounded-2xl bg-[#1C3152]/5 border border-[#C8A951]/20 flex items-center justify-between shadow-inner">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#1C3152]/10 flex items-center justify-center text-[#C8A951]">
                              <MapPin size={20} />
                            </div>
                            <div>
                              <span className="text-[10px] uppercase rec-section-subtext font-bold block mb-1 tracking-widest">Selected Location</span>
                              <span className="text-sm font-bold rec-section-heading line-clamp-2">
                                {form.address ? `${form.address}${form.city ? `, ${form.city}` : ''}` : "Location set successfully"}
                              </span>
                            </div>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center border border-green-100 flex-shrink-0">
                             <CheckCircle2 size={18} className="text-green-600" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
 
                  {/* Categories Section */}
                  <div className="space-y-6 pt-6 sm:pt-8 border-t rec-card-border/50">
                    <h3 className="text-xs font-bold uppercase tracking-[0.3em] rec-section-heading-accent">Business Categories</h3>
                    {categoriesLoading ? (
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-white/50 border border-[#C8A951]/10">
                        <Loader2 size={18} className="animate-spin text-[#C8A951]" />
                        <span className="text-sm font-medium rec-section-subtext uppercase tracking-widest">Accessing premium categories...</span>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2.5">
                        {categories.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            disabled={isAdmin}
                            onClick={() => handleCategoryToggle(cat.id)}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-bold tracking-[0.1em] uppercase transition-all border ${form.categoryIds.includes(cat.id)
                              ? "bg-[#1C3152] text-[#C8A951] border-[#C8A951] shadow-lg shadow-[#1C3152]/20"
                              : "bg-white text-[#1C3152]/60 border rec-card-border hover:border-[#C8A951] hover:text-[#1C1C12] shadow-sm"
                              } disabled:opacity-70 disabled:cursor-not-allowed`}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
 
                  <button
                    type="submit"
                    disabled={loading || isAdmin}
                    className="group relative w-full h-14 sm:h-16 bg-[#1C3152] text-[#C8A951] rounded-xl font-bold overflow-hidden transition-all hover:shadow-2xl hover:shadow-[#1C3152]/30 active:scale-[0.98] disabled:opacity-70 mt-8 sm:mt-12 border border-[#C8A951]/30"
                  >
                    <div className="absolute inset-0 bg-[#2a4570] translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <div className="relative z-10 flex items-center justify-center gap-4">
                      {loading ? <Loader2 size={20} className="animate-spin" /> : (isAdmin ? <AlertCircle size={20} /> : <Briefcase size={20} />)}
                      <span className="text-xs sm:text-sm tracking-[0.3em] uppercase font-bold">
                        {loading ? "Registering Business..." : (isAdmin ? (isSuperAdmin ? "Super_Admin View Only" : "Admin View Only") : "Send Application")}
                      </span>
                    </div>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* <div className="mt-5">
          <p className="mt-10 text-center rec-section-subtext text-xs font-medium tracking-widest uppercase">
          By submitting, you agree to Luxe's <span className="rec-section-heading-accent cursor-pointer hover:underline">Partner Terms of Service</span> and <span className="rec-section-heading-accent cursor-pointer hover:underline">Privacy Policy</span>.
        </p>
        </div> */}

      </div>
 
      <MapPickerModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onSelect={handleMapSelect}
        initialPos={form.latitude && form.longitude ? { lat: parseFloat(form.latitude), lng: parseFloat(form.longitude) } : null}
      />
    </div>
  );
}