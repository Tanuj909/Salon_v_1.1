"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X, Check, MapPin, Globe, Search, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

// Fix Leaflet default icon issues
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const COUNTRIES = {
    "UAE": { lat: 25.7971, lng: 56.0220 },
    "Saudi Arabia": { lat: 24.7136, lng: 46.6753 },
    "Oman": { lat: 23.5859, lng: 58.4059 },
    "Qatar": { lat: 25.2854, lng: 51.5310 },
    "Iran": { lat: 35.6892, lng: 51.3890 },
    "India": { lat: 28.6139, lng: 77.2090 },
    "Kuwait": { lat: 29.3759, lng: 47.9774 }
};

const searchCache = new Map();

const MapController = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center && center.lat !== undefined && center.lng !== undefined) {
            try {
                map.setView(
                    [parseFloat(center.lat), parseFloat(center.lng)], 
                    zoom || map.getZoom(),
                    { animate: false }
                );
            } catch (error) {
                console.warn("Leaflet setView error:", error);
            }
        }
    }, [center, map, zoom]);
    return null;
};

const BoundsTracker = ({ updateBounds }) => {
    const map = useMap();
    useMapEvents({
        moveend() {
            updateBounds(map.getBounds());
        },
        zoomend() {
            updateBounds(map.getBounds());
        }
    });
    useEffect(() => {
        updateBounds(map.getBounds());
    }, [map, updateBounds]);
    return null;
};

const LocationMarker = ({ position, setPosition, setAddress, t }) => {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            reverseGeocode(e.latlng.lat, e.latlng.lng, setAddress, t);
        },
    });

    return position ? <Marker position={position} icon={DefaultIcon} /> : null;
};

const reverseGeocode = async (lat, lng, setAddress, t) => {
    if (!lat || !lng) return;
    try {
        setAddress(t("location.locating"));
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
            {
                signal: controller.signal,
                headers: { 
                    'Accept-Language': 'en',
                    'User-Agent': 'SalonHub-MapPicker/1.0'
                }
            }
        ).catch(err => {
            console.warn("Fetch failed:", err);
            return null;
        });

        clearTimeout(timeoutId);

        if (!res || !res.ok) {
            setAddress(`${t("location.selected_location_fallback")} (${lat.toFixed(3)}, ${lng.toFixed(3)})`);
            return;
        }

        const data = await res.json();
        setAddress(data.display_name || `${t("location.selected_location_fallback")} (${lat.toFixed(3)}, ${lng.toFixed(3)})`);
    } catch (err) {
        console.warn("Reverse geocoding suppressed:", err);
        setAddress(`${t("location.selected_location_fallback")} (${lat.toFixed(3)}, ${lng.toFixed(3)})`);
    }
};

const MapPickerModal = ({ isOpen, onClose, onSelect, initialPos }) => {
    const { t } = useLanguage();
    const [position, setPosition] = useState(initialPos || COUNTRIES.UAE);
    const [address, setAddress] = useState(t("location.loading_address"));
    const [isMounted, setIsMounted] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [noResults, setNoResults] = useState(false);
    const [mapZoom, setMapZoom] = useState(13);
    
    const searchRef = useRef(null);
    const abortControllerRef = useRef(null);
    const mapBoundsRef = useRef(null);
    const isSelectingRef = useRef(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Debounced live search with caching, photon-first logic, and bounding box
    useEffect(() => {
        if (isSelectingRef.current) return;

        const query = searchQuery.trim();
        if (query.length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            setNoResults(false);
            return;
        }

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const fetchSuggestions = async () => {
            if (searchCache.has(query)) {
                const cached = searchCache.get(query);
                setSuggestions(cached);
                setNoResults(cached.length === 0);
                setShowSuggestions(true);
                return;
            }

            setIsSearching(true);
            setNoResults(false);
            const controller = new AbortController();
            abortControllerRef.current = controller;

            try {
                let results = [];
                let usedPhoton = false;

                // 1. Photon First Strategy
                try {
                    const photonRes = await fetch(
                        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`,
                        { signal: controller.signal }
                    );
                    if (photonRes.ok) {
                        const photonData = await photonRes.json();
                        if (photonData.features && photonData.features.length > 0) {
                            results = photonData.features.map(f => {
                                const props = f.properties;
                                const title = props.name || [props.street, props.housenumber].filter(Boolean).join(" ") || "Unknown Location";
                                const subtitle = [props.city, props.state, props.country].filter(Boolean).join(", ");
                                return {
                                    title,
                                    subtitle,
                                    lat: f.geometry.coordinates[1],
                                    lng: f.geometry.coordinates[0],
                                    rawName: `${title}, ${subtitle}`
                                };
                            });
                            usedPhoton = true;
                        }
                    }
                } catch (e) {
                    if (e.name !== 'AbortError') console.warn("Photon fetch issue:", e);
                }

                // 2. Nominatim Fallback
                if (!usedPhoton && !controller.signal.aborted) {
                    let nominatimUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=5&countrycodes=in&addressdetails=1`;
                    
                    if (mapBoundsRef.current) {
                        const { _southWest, _northEast } = mapBoundsRef.current;
                        // Nominatim viewbox format: left,top,right,bottom -> minlon,maxlat,maxlon,minlat
                        nominatimUrl += `&viewbox=${_southWest.lng},${_northEast.lat},${_northEast.lng},${_southWest.lat}&bounded=1`;
                    }

                    const nomRes = await fetch(nominatimUrl, {
                        signal: controller.signal,
                        headers: { 'Accept-Language': 'en', 'User-Agent': 'SalonHub-MapPicker/1.0' }
                    });
                    
                    if (nomRes.ok) {
                        const nomData = await nomRes.json();
                        results = nomData.map(item => {
                            const title = item.address?.road || item.address?.suburb || item.name || item.display_name.split(',')[0];
                            const subtitle = item.display_name.substring(item.display_name.indexOf(',') + 1).trim();
                            return {
                                title,
                                subtitle,
                                lat: parseFloat(item.lat),
                                lng: parseFloat(item.lon),
                                rawName: item.display_name
                            };
                        });
                    }
                }

                if (controller.signal.aborted) return;

                // 3. Sorting / Ranking Logic
                const qLower = query.toLowerCase();
                results.sort((a, b) => {
                    const aExact = a.title.toLowerCase() === qLower ? 1 : 0;
                    const bExact = b.title.toLowerCase() === qLower ? 1 : 0;
                    if (aExact !== bExact) return bExact - aExact;

                    const aHasNum = /\d/.test(a.title) ? 1 : 0;
                    const bHasNum = /\d/.test(b.title) ? 1 : 0;
                    if (aHasNum !== bHasNum) return bHasNum - aHasNum;

                    return a.title.length - b.title.length;
                });

                // 4. Update Cache
                if (searchCache.size > 10) {
                    const firstKey = searchCache.keys().next().value;
                    searchCache.delete(firstKey);
                }
                searchCache.set(query, results);
                
                setSuggestions(results);
                setNoResults(results.length === 0);
                setShowSuggestions(true);
                setSelectedIndex(-1);

            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.warn("Suggestions fetch failed:", err);
                    setNoResults(true);
                    setSuggestions([]);
                    setShowSuggestions(true);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsSearching(false);
                }
            }
        };

        const debounceTimer = setTimeout(fetchSuggestions, 400);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    const handleSelectSuggestion = (place) => {
        isSelectingRef.current = true;
        const newPos = { lat: place.lat, lng: place.lng };
        setPosition(newPos);
        setMapZoom(16); // High precision zoom
        setAddress(`${place.title}, ${place.subtitle}`);
        setSearchQuery(place.title);
        setShowSuggestions(false);
        setSelectedIndex(-1);
        
        setTimeout(() => {
            isSelectingRef.current = false;
        }, 100);
    };

    const handleKeyDown = (e) => {
        if (!showSuggestions) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                handleSelectSuggestion(suggestions[selectedIndex]);
            } else if (suggestions.length > 0) {
                handleSelectSuggestion(suggestions[0]);
            }
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        
        if (showSuggestions && suggestions.length > 0) {
            if (selectedIndex >= 0) {
                handleSelectSuggestion(suggestions[selectedIndex]);
            } else {
                handleSelectSuggestion(suggestions[0]);
            }
        }
    };

    useEffect(() => {
        if (!isOpen) {
            setIsMounted(false);
            return;
        }
        setIsMounted(true);

        const useUAEFallback = () => {
            const uae = COUNTRIES.UAE;
            setPosition(uae);
            setSelectedCountry("UAE");
            reverseGeocode(uae.lat, uae.lng, setAddress, t).catch(() => { });
        };

        // If we have an initial position, use it.
        // If not, and we aren't already initialized, attempt geolocation.
        if (initialPos && initialPos.lat && initialPos.lng) {
            setPosition(initialPos);
            reverseGeocode(initialPos.lat, initialPos.lng, setAddress, t).catch(() => { });
        } else if (navigator.geolocation) {
            setIsLocating(true);
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    setPosition(prev => {
                        // Guard: Only overwrite the position if it's still at the default UAE capital
                        if (prev.lat === COUNTRIES.UAE.lat && prev.lng === COUNTRIES.UAE.lng) {
                            reverseGeocode(newPos.lat, newPos.lng, setAddress, t).catch(() => { });
                            return newPos;
                        }
                        return prev;
                    });
                    setIsLocating(false);
                },
                (error) => {
                    console.warn("Geolocation failed:", error.message);
                    setIsLocating(false);
                    useUAEFallback();
                },
                { enableHighAccuracy: true, timeout: 5000 }
            );
        } else {
            useUAEFallback();
        }
    }, [isOpen]); // Only run when the modal opens/closes

    if (!isOpen || !isMounted) return null;

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl rounded-2xl sm:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-[85vh] sm:h-[80vh]">
                {/* Header */}
                <div className="px-4 py-4 sm:px-8 sm:py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#3c14320a]">
                    <div className="flex items-center justify-between w-full md:w-auto shrink-0">
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-[#1e0a18]">{t("location.pick_location_title")}</h2>
                            <p className="text-xs sm:text-sm text-[#3c143260]">{t("location.pick_location_subtitle")}</p>
                        </div>
                        <button onClick={onClose} className="md:hidden p-1.5 hover:bg-[#f9f5f2] rounded-full transition-colors">
                            <X size={20} className="text-[#3c143280]" />
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:flex-1 md:justify-end">
                        <div className="relative w-full sm:w-auto sm:min-w-[160px]">
                            <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3c143260]" />
                            <select 
                                value={selectedCountry}
                                onChange={(e) => {
                                    const cName = e.target.value;
                                    if (!cName) return;
                                    setSelectedCountry(cName);
                                    const coords = COUNTRIES[cName];
                                    if (coords) {
                                        setPosition(coords);
                                        reverseGeocode(coords.lat, coords.lng, setAddress, t);
                                    }
                                }}
                                className="w-full pl-9 pr-4 py-2.5 bg-[#f9f5f2] border-none rounded-xl text-sm font-bold text-[#1e0a18] focus:ring-2 focus:ring-[#7a2860]/20 appearance-none cursor-pointer hover:bg-[#f0ece9] transition-colors"
                            >
                                <option value="">{t("location.select_country")}</option>
                                {Object.keys(COUNTRIES).map(country => (
                                    <option key={country} value={country}>{t(`location.countries.${country}`)}</option>
                                ))}
                            </select>
                        </div>

                        <div ref={searchRef} className="relative w-full sm:flex-1 sm:max-w-[300px]">
                            <form onSubmit={handleSearch} className="relative w-full flex items-center">
                                {isSearching ? (
                                    <Loader2 size={16} className="absolute left-3 text-[#7a2860] animate-spin" />
                                ) : (
                                    <Search size={16} className="absolute left-3 text-[#3c143260] transition-colors" />
                                )}
                                <input 
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    onFocus={() => {
                                        if (searchQuery.length >= 3) {
                                            setShowSuggestions(true);
                                        }
                                    }}
                                    placeholder={t("location.search_map_placeholder")}
                                    className="w-full pl-9 pr-20 py-2.5 bg-[#f9f5f2] border-none rounded-xl text-sm font-medium text-[#1e0a18] focus:outline-none focus:ring-2 focus:ring-[#7a2860]/20 placeholder:text-[#3c143240]"
                                />
                                <button 
                                    type="submit"
                                    className="absolute right-1 top-1 bottom-1 px-4 bg-[#1e0a18] text-white rounded-lg text-xs font-bold hover:bg-[#7a2860] transition-colors"
                                >
                                    {t("location.btn_search")}
                                </button>
                            </form>

                            {/* Suggestions Dropdown */}
                            {showSuggestions && (
                                <div className="absolute top-[110%] left-0 right-0 bg-white rounded-xl shadow-xl border border-[#3c143210] max-h-60 overflow-y-auto z-[99999]">
                                    <ul className="py-2">
                                        {noResults ? (
                                            <li className="px-4 py-3 text-sm text-[#3c143280] text-center italic">
                                                {t("location.no_results_found")}
                                            </li>
                                        ) : (
                                            suggestions.map((place, idx) => (
                                                <li 
                                                    key={idx}
                                                    onClick={() => handleSelectSuggestion(place)}
                                                    className={`px-4 py-2 cursor-pointer text-left transition-colors border-b border-[#3c143205] last:border-0 ${selectedIndex === idx ? 'bg-[#7a2860]/10' : 'hover:bg-[#f9f5f2]'}`}
                                                >
                                                    <div className="text-sm font-bold text-[#1e0a18] line-clamp-1">
                                                        {place.title}
                                                    </div>
                                                    <div className="text-xs text-[#3c143260] line-clamp-1 mt-0.5">
                                                        {place.subtitle}
                                                    </div>
                                                </li>
                                            ))
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                        
                        <button onClick={onClose} className="hidden md:block p-1.5 sm:p-2 hover:bg-[#f9f5f2] rounded-full transition-colors shrink-0">
                            <X size={20} className="sm:w-6 sm:h-6 text-[#3c143280]" />
                        </button>
                    </div>
                </div>

                {/* Map Area */}
                <div className="flex-1 relative">
                    <MapContainer
                        center={position}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={true}
                    >
                        <MapController center={position} zoom={mapZoom} />
                        <BoundsTracker updateBounds={(bounds) => { mapBoundsRef.current = bounds; }} />
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationMarker position={position} setPosition={setPosition} setAddress={setAddress} t={t} />
                    </MapContainer>
                </div>

                {/* Footer Info */}
                <div className="px-4 py-4 sm:px-8 sm:py-6 bg-[#f9f5f2]/50 border-t border-[#3c14320a]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
                        <div className="flex items-start gap-3 flex-1">
                            <div className="p-1.5 sm:p-2 bg-white rounded-xl text-[#7a2860] shadow-sm sm:mt-1">
                                <MapPin size={16} className="sm:w-5 sm:h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[0.6rem] sm:text-[0.65rem] font-black uppercase tracking-widest text-[#3c143250] mb-0.5 sm:mb-1">{t("location.selected_area")}</p>
                                <p className="text-[0.8rem] sm:text-[0.9rem] font-bold text-[#1e0a18] line-clamp-2 sm:line-clamp-1 break-words">{address}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
                            <button
                                onClick={onClose}
                                className="flex-1 md:flex-none px-2 sm:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-[0.8rem] sm:text-[0.9rem] font-bold text-[#3c143280] hover:bg-white hover:shadow-sm transition-all text-center whitespace-nowrap"
                            >
                                {t("location.btn_cancel")}
                            </button>
                            <button
                                onClick={() => onSelect({ ...position, address })}
                                className="flex-[2] md:flex-none px-3 sm:px-10 py-2.5 sm:py-3 bg-[#1e0a18] text-white rounded-xl sm:rounded-2xl text-[0.8rem] sm:text-[0.9rem] font-bold hover:bg-[#7a2860] transition-all flex justify-center items-center gap-1.5 sm:gap-2 shadow-xl active:scale-95 whitespace-nowrap text-center"
                            >
                                <Check size={14} className="sm:w-[18px] sm:h-[18px]" />
                                <span>
                                    {t("location.btn_confirm")}
                                    <span className="hidden sm:inline">
                                        {" "}
                                        {t("location.btn_confirm_location").replace(t("location.btn_confirm"), "").trim()}
                                    </span>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default MapPickerModal;
