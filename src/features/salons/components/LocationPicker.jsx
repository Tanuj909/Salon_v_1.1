"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Search, Loader2, X, Map as MapIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/context/LanguageContext';

const MapPickerModal = dynamic(() => import('./MapPickerModal'), {
    ssr: false,
    loading: () => null
});

const LocationPicker = ({ currentAddress, lat, lng, onLocationSelect, onDetectLocation }) => {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isMapOpen, setIsMapOpen] = useState(false);
    const wrapperRef = useRef(null);
    const { t } = useLanguage();

    // Update query when currentAddress changes externally
    useEffect(() => {
        if (currentAddress) setQuery(currentAddress);
    }, [currentAddress]);

    // Close suggestions when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const [searchError, setSearchError] = useState("");

    const searchPlaces = async (val) => {
        if (val.length < 3) {
            setSuggestions([]);
            return;
        }

        setIsSearching(true);
        setSearchError("");
        try {
            const response = await fetch(
                `https://photon.komoot.io/api/?q=${encodeURIComponent(val)}&limit=5`
            );
            const data = await response.json();

            // Map Photon format to internal format
            const mapped = (data.features || []).map(f => {
                const p = f.properties;
                const name = p.name || "";
                const details = [p.city, p.state, p.country].filter(Boolean).join(", ");
                const display_name = name ? (details ? `${name}, ${details}` : name) : details;

                return {
                    lat: f.geometry.coordinates[1],
                    lon: f.geometry.coordinates[0],
                    display_name: display_name,
                    name: name
                };
            });

            setSuggestions(mapped);
            setShowSuggestions(true);
        } catch (error) {
            console.error("Geocoding error:", error);
            setSearchError(t("location.search_failed"));
            setSuggestions([]);
            setShowSuggestions(true);
        } finally {
            setIsSearching(false);
        }
    };

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query && query !== currentAddress && query.length >= 3) {
                searchPlaces(query);
            }
        }, 800);
        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (s) => {
        setQuery(s.display_name);
        setSuggestions([]);
        setShowSuggestions(false);
        onLocationSelect({
            lat: parseFloat(s.lat),
            lng: parseFloat(s.lon),
            address: s.display_name
        });
    };

    const handleMapSelect = (data) => {
        setIsMapOpen(false);
        onLocationSelect(data);
    };

    return (
        <div className="relative flex-1" ref={wrapperRef}>
            <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7a2860]">
                    <MapPin size={18} />
                </div>

                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 3 && setShowSuggestions(true)}
                    placeholder={t("location.search_placeholder")}
                    className="w-full h-11 pl-10 pr-[100px] bg-white border border-[#3c143212] rounded-xl text-[0.8rem] font-medium text-[#1e0a18] outline-none transition-all focus:border-[#7a2860] focus:ring-4 focus:ring-[#7a2860]/5 shadow-sm"
                />

                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {query && (
                        <button
                            onClick={() => { setQuery(""); setSuggestions([]); }}
                            className="p-1.5 text-muted hover:text-muted"
                        >
                            <X size={14} />
                        </button>
                    )}

                    <button
                        onClick={() => setIsMapOpen(true)}
                        className="p-1.5 sm:p-2 bg-transparent sm:bg-background-light text-[#7a2860] sm:text-[#1e0a18] rounded-lg hover:bg-[#7a2860]/10 sm:hover:bg-[#7a2860] sm:hover:text-white transition-all active:scale-95"
                        title={t("location.pick_from_map")}
                    >
                        <MapIcon size={16} />
                    </button>

                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            onDetectLocation();
                        }}
                        className="p-1.5 sm:p-2 sm:px-3 flex items-center gap-1.5 bg-transparent sm:bg-[#7a2860] text-[#7a2860] sm:text-white rounded-lg hover:bg-[#7a2860]/10 sm:hover:bg-[#1e0a18] transition-all active:scale-95 sm:shadow-md sm:shadow-[#7a2860]/20"
                        title={t("location.detect_location")}
                    >
                        <Navigation size={16} className="sm:w-3 sm:h-3" fill="currentColor" />
                        <span className="hidden sm:inline font-bold text-[0.7rem]">{t("location.detect_location")}</span>
                    </button>
                </div>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && (suggestions.length > 0 || isSearching || searchError || (query.length >= 3 && suggestions.length === 0)) && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-[#3c143212] overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                    {isSearching ? (
                        <div className="p-6 flex items-center justify-center gap-3 text-[#3c143260]">
                            <Loader2 size={20} className="animate-spin" />
                            <span className="text-sm font-medium">{t("location.searching")}</span>
                        </div>
                    ) : searchError ? (
                        <div className="p-6 flex flex-col items-center justify-center gap-2 text-red-500">
                            <X size={20} />
                            <span className="text-sm font-medium">{searchError}</span>
                        </div>
                    ) : query.length >= 3 && suggestions.length === 0 ? (
                        <div className="p-6 flex flex-col items-center justify-center gap-2 text-[#3c143260]">
                            <Search size={20} />
                            <span className="text-sm font-medium">{t("location.no_locations_found")}</span>
                        </div>
                    ) : (
                        <div className="max-h-[300px] overflow-y-auto">
                            {suggestions.map((s, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSelect(s)}
                                    className="w-full px-5 py-4 flex items-start gap-4 hover:bg-[#f9f5f2] transition-colors border-b border-[#3c143208] last:border-0 text-left group"
                                >
                                    <div className="mt-1 p-1.5 rounded-lg bg-background-light text-muted group-hover:bg-[#7a2860]/10 group-hover:text-[#7a2860]">
                                        <MapPin size={14} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[0.85rem] font-bold text-[#1e0a18] line-clamp-1">
                                            {s.name || s.display_name.split(',')[0]}
                                        </p>
                                        <p className="text-[0.75rem] text-[#3c143260] line-clamp-1">
                                            {s.name ? s.display_name.split(',').slice(1).join(',').trim() : s.display_name.split(',').slice(1).join(',').trim()}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <MapPickerModal
                isOpen={isMapOpen}
                onClose={() => setIsMapOpen(false)}
                onSelect={handleMapSelect}
                initialPos={lat && lng ? { lat, lng } : null}
            />
        </div>
    );
};

export default LocationPicker;
