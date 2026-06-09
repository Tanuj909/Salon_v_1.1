// "use client";
// import React, { useState, useEffect, useRef, useMemo } from 'react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import dynamic from 'next/dynamic';
// import useActiveCategories from '../../../features/salons/hooks/useActiveServices';
// import { fetchDistinctServiceNames } from '@/features/salons/services/salonService';
// import Fuse from 'fuse.js';
// import { fuseData } from '../data/fuseData';
// import { enrichSynonyms, fuseOptions } from '../utils/searchUtils';
// import { useUserLocation } from '@/features/salons/hooks/useUserLocation';

// const MapPickerModal = dynamic(() => import('@/features/salons/components/MapPickerModal'), {
//   ssr: false,
// });

// const HeroSection = () => {
//   const [current, setCurrent] = useState(0);
//   const [selectedCategory, setSelectedCategory] = useState("");
//   const [selectedService, setSelectedService] = useState("");
//   const [serviceSearch, setServiceSearch] = useState("");
//   const [suggestions, setSuggestions] = useState([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const router = useRouter();
//   const searchRef = useRef(null);

//   const [headingIndex, setHeadingIndex] = useState(0);
//   const [headingFade, setHeadingFade] = useState(true);
//   const [placeholderFade, setPlaceholderFade] = useState(true);
//   const [placeholderIndex, setPlaceholderIndex] = useState(0);

//   const [distinctServices, setDistinctServices] = useState([]);
//   const [loadingServices, setLoadingServices] = useState(true);

//   // ─── Location Integration ───
//   const { location, saveManualLocation, loading: locationLoading, refreshLocation } = useUserLocation();
//   const [isMapModalOpen, setIsMapModalOpen] = useState(false);

//   // ─── Combined Service Data for Search ───
//   const combinedServiceData = useMemo(() => {
//     const staticServices = fuseData.filter(item => item.type === 'service');
//     const seenNames = new Set(staticServices.map(s => s.name.toLowerCase()));

//     const apiServicesFormatted = distinctServices
//       .filter(name => name && !seenNames.has(name.toLowerCase()))
//       .map(name => ({
//         name: name.trim(), // Keep original case for display
//         synonyms: enrichSynonyms(name),
//         type: 'service',
//         isFromApi: true
//       }));

//     return [...staticServices, ...apiServicesFormatted];
//   }, [distinctServices]);

//   // ─── Initialize Fuse with Combined Data ───
//   const fuse = useMemo(() => {
//     return new Fuse(combinedServiceData, fuseOptions);
//   }, [combinedServiceData]);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (searchRef.current && !searchRef.current.contains(event.target)) {
//         setShowSuggestions(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleSearchChange = (e) => {
//     const originalVal = e.target.value;
//     setServiceSearch(originalVal);

//     const val = originalVal.toLowerCase().trim();
//     if (val) {
//       const results = fuse.search(val).slice(0, 3);
//       setSuggestions(results.map(r => r.item));
//       setShowSuggestions(true);
//     } else {
//       setSuggestions([]);
//       setShowSuggestions(false);
//     }
//   };

//   const handleSuggestionClick = (serviceName) => {
//     setServiceSearch(serviceName);
//     setShowSuggestions(false);
//   };

//   const handleSearchSubmit = () => {
//     const originalVal = serviceSearch;
//     const trimmed = originalVal.toLowerCase().trim();
//     if (!trimmed) return;

//     const exactMatch = combinedServiceData.find(
//       s => s.name.toLowerCase() === trimmed
//     );

//     let finalSearchTerm = originalVal.trim();

//     if (exactMatch) {
//       finalSearchTerm = exactMatch.name;
//     } else {
//       const results = fuse.search(trimmed);
//       if (results.length > 0) {
//         const bestMatch = results[0];
//         if (bestMatch.score < 0.3) {
//           finalSearchTerm = bestMatch.item.name;
//         }
//       }
//     }

//     setShowSuggestions(false);
//     router.push(`/salons?serviceName=${encodeURIComponent(finalSearchTerm)}`);
//   };

//   const headings = [
//     "Experience Luxury Services Near You",
//     "Find Your Perfect Style Right Today",
//     "Expert Grooming For Everyone Locally",
//     "Your Beauty Is Always Our Priority"
//   ];

//   const servicePlaceholders = [
//     "Haircut", "Manicure", "Beard Trim", "Facial", "Hair Coloring", "Massage", "Spa Treatment"
//   ];

//   const { categories, loading, error } = useActiveCategories();

//   const slides = [
//     { url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1600&q=80', label: '01' },
//     { url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600&q=80', label: '02' },
//     { url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1600&q=80', label: '03' },
//     { url: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1600&q=80', label: '04' }
//   ];

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrent((prev) => (prev + 1) % slides.length);
//     }, 8000);
//     return () => clearInterval(timer);
//   }, []);

//   useEffect(() => {
//     fetchDistinctServiceNames()
//       .then((data) => {
//         setDistinctServices(data || []);
//       })
//       .catch((err) => {
//         console.error("Failed to load distinct services:", err);
//       })
//       .finally(() => {
//         setLoadingServices(false);
//       });
//   }, []);

//   useEffect(() => {
//     const headingTimer = setInterval(() => {
//       setHeadingFade(false);
//       setTimeout(() => {
//         setHeadingIndex((prev) => (prev + 1) % headings.length);
//         setHeadingFade(true);
//       }, 500);
//     }, 5000);
//     return () => clearInterval(headingTimer);
//   }, []);

//   useEffect(() => {
//     const placeholderTimer = setInterval(() => {
//       setPlaceholderFade(false);
//       setTimeout(() => {
//         setPlaceholderIndex((prev) => (prev + 1) % servicePlaceholders.length);
//         setPlaceholderFade(true);
//       }, 500);
//     }, 3500);
//     return () => clearInterval(placeholderTimer);
//   }, []);

//   return (
//     <>
//       <style jsx global>{`
//         @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=DM+Sans:wght@300;400;500&display=swap');
        
//         :root {
//           --gold: #C49B66;
//           --terracotta: #1C3152;
//         }

//         .hero-grain {
//           background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
//         }

//         @keyframes fadeUp {
//           from { opacity: 0; transform: translateY(20px); }
//           to { opacity: 1; transform: translateY(0); }
//         }

//         @keyframes pulse {
//           0%, 100% { opacity: 1; transform: scale(1); }
//           50% { opacity: 0.5; transform: scale(0.85); }
//         }

//         .animate-fade-up {
//           animation: fadeUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) both;
//         }

//         .text-shadow {
//           text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
//         }
        
//         .text-shadow-lg {
//           text-shadow: 0 4px 15px rgba(0, 0, 0, 0.6);
//         }
//       `}</style>

//       <section className="relative w-full min-h-[100svh] overflow-hidden font-['DM_Sans',sans-serif] flex flex-col justify-center py-20 px-4">
//         {/* Animated Background Slides */}
//           {slides.map((slide, index) => (
//             <div
//               key={index}
//               className={`absolute inset-0 transition-opacity duration-[2500ms] ease-in-out ${index === current ? 'opacity-100' : 'opacity-0'
//                 }`}
//               style={{
//                 backgroundImage: `url('${slide.url}')`,
//                 backgroundSize: 'cover',
//                 backgroundPosition: 'center',
//               }}
//             >
//               {/* Ken Burns Zoom Effect Layer */}
//               <div 
//                 className={`absolute inset-0 transition-transform duration-[10000ms] ease-out ${index === current ? 'scale-110' : 'scale-100'}`}
//                 style={{
//                   backgroundImage: `url('${slide.url}')`,
//                   backgroundSize: 'cover',
//                   backgroundPosition: 'center',
//                 }}
//               />
//             </div>
//           ))}

//         {/* Dynamic Overlays */}
//         <div className="absolute inset-0 z-[2] hero-bg-overlay" />
//         <div className="absolute inset-0 z-[4] opacity-[0.03] pointer-events-none hero-grain" />

//         {/* Content Container - Shifted downward slightly to clear navbar */}
//         <div className="relative z-[10] w-full max-w-7xl mx-auto flex flex-col items-center text-center mt-6 md:mt-16 lg:mt-8">
//           {/* Badge */}
//           <div className="inline-flex items-center gap-2 hero-badge-bg border rounded-full px-4 py-1.5 mb-6 animate-fade-up [animation-delay:100ms]">
//             <div className="w-1.5 h-1.5 rounded-full hero-badge-dot animate-pulse" />
//             <span className="text-[10px] md:text-xs tracking-[0.15em] uppercase hero-badge-text font-medium text-shadow">
//               Premium Salon Experiences
//             </span>
//           </div>

//           {/* Main Heading - Refined for single line */}
//           <h1 className="font-['Cormorant_Garamond',serif] text-[clamp(1.4rem,4.5vw,3.6rem)] text-gray-900 font-light leading-tight mb-5 animate-fade-up [animation-delay:300ms] px-7 py-1.5 bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-xl border border-white/20 inline-flex items-center justify-center">
//             <span className={`transition-opacity duration-500 ${headingFade ? 'opacity-100' : 'opacity-0'}`}>
//               {headings[headingIndex].split(' ').map((word, i) => {
//                 const accentedWords = ['Luxury', 'Perfect', 'Grooming', 'Beauty'];
//                 return (
//                   <span key={i}>
//                     {accentedWords.includes(word) ? (
//                       <span className="italic hero-title-accent font-normal px-1">{word}</span>
//                     ) : (
//                       <span>{word}</span>
//                     )}
//                     {i < headings[headingIndex].split(' ').length - 1 && ' '}
//                   </span>
//                 );
//               })}
//             </span>
//           </h1>

//           {/* Subtext */}
//           <p className="hidden md:block text-[clamp(1rem,2vw,1.25rem)] font-light text-white/80 tracking-wide max-w-2xl leading-relaxed mb-10 animate-fade-up [animation-delay:500ms] px-4 text-shadow">
//             Discover and book the finest grooming for Men, Women & Pets. <br className="hidden md:block" /> Seamless appointments, exceptional results.
//           </p>

//           {/* Filter Bar (Optimized for Narrow Mobile and Tablet) */}
//           <div className="w-full max-w-5xl px-3 animate-fade-up [animation-delay:700ms] mt-5 relative z-[100]">
//             <div className="hero-filter-bar-bg p-3 md:p-4 lg:p-2 rounded-[2rem] lg:rounded-full shadow-2xl grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-row items-center gap-3 lg:gap-2">

//               {/* Category Select */}
//               <div className="w-full lg:w-[18%] relative flex items-center hero-filter-input-bg rounded-full border px-4 py-3 lg:py-2 transition-all hover:bg-white focus-within:ring-2 focus-within:ring-[#1C3152]/20">
//                 <span className="material-symbols-outlined hero-filter-icon text-lg mr-2">category</span>
//                 <select
//                   className="w-full bg-transparent hero-filter-input-text text-sm font-medium outline-none appearance-none cursor-pointer"
//                   value={selectedCategory}
//                   onChange={(e) => setSelectedCategory(e.target.value)}
//                 >
//                   <option value="">Categories</option>
//                   {loading ? (
//                     <option disabled>Loading...</option>
//                   ) : (
//                     categories?.map((cat) => (
//                       <option key={cat.id} value={cat.id}>{cat.name}</option>
//                     ))
//                   )}
//                 </select>
//                 <span className="material-symbols-outlined text-gray-400 text-sm absolute right-4 pointer-events-none">expand_more</span>
//               </div>

//               {/* Service Select */}
//               <div className="w-full lg:w-[18%] relative flex items-center hero-filter-input-bg rounded-full border px-4 py-3 lg:py-2 transition-all hover:bg-white focus-within:ring-2 focus-within:ring-[#1C3152]/20">
//                 <span className="material-symbols-outlined hero-filter-icon text-lg mr-2">content_cut</span>
//                 <select
//                   className="w-full bg-transparent hero-filter-input-text text-sm font-medium outline-none appearance-none cursor-pointer"
//                   value={selectedService}
//                   onChange={(e) => setSelectedService(e.target.value)}
//                 >
//                   <option value="">Services</option>
//                   {loadingServices ? (
//                     <option disabled>Loading...</option>
//                   ) : (
//                     distinctServices.map((service, idx) => (
//                       <option key={idx} value={service}>{service}</option>
//                     ))
//                   )}
//                 </select>
//                 <span className="material-symbols-outlined text-gray-400 text-sm absolute right-4 pointer-events-none">expand_more</span>
//               </div>

//               {/* Current Location (Detect) */}
//               <div
//                 onClick={refreshLocation}
//                 className="w-full lg:w-[22%] relative flex items-center hero-filter-input-bg rounded-full border px-4 py-2.5 lg:py-2 transition-all hover:bg-white cursor-pointer group hover:border-[#1C3152]/30"
//               >
//                 <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm mr-2 hero-filter-icon group-hover:hero-filter-btn-bg group-hover:text-white transition-all">
//                   <span className={`material-symbols-outlined text-lg ${locationLoading ? 'animate-spin' : ''}`}>my_location</span>
//                 </div>
//                 <div className="flex flex-col text-left overflow-hidden">
//                   <span className="text-[7px] lg:text-[8px] uppercase font-bold text-gray-400 tracking-tighter">Automatic</span>
//                   <span className="text-xs lg:text-sm font-medium hero-filter-input-text truncate">
//                     {locationLoading ? "Detecting..." : (location?.address || "Current Location")}
//                   </span>
//                 </div>
//               </div>

//               {/* Select Manually (Map) */}
//               <div
//                 onClick={() => setIsMapModalOpen(true)}
//                 className="w-full lg:w-[22%] relative flex items-center hero-filter-input-bg rounded-full border px-4 py-2.5 lg:py-2 transition-all hover:bg-white cursor-pointer group hover:border-[#1C3152]/30"
//               >
//                 <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm mr-2 hero-filter-icon group-hover:hero-filter-btn-bg group-hover:text-white transition-all">
//                   <span className="material-symbols-outlined text-lg">map</span>
//                 </div>
//                 <div className="flex flex-col text-left">
//                   <span className="text-[7px] lg:text-[8px] uppercase font-bold text-gray-400 tracking-tighter">Manual</span>
//                   <span className="text-xs lg:text-sm font-medium hero-filter-input-text">Choose Manually</span>
//                 </div>
//               </div>

//               {/* Search Trigger */}
//               <Link
//                 href={`/salons?${new URLSearchParams({
//                   ...(selectedCategory && { categoryId: selectedCategory }),
//                   ...(selectedService && { serviceName: selectedService }),
//                 }).toString()}`}
//                 className="w-full lg:w-[20%] py-3 lg:py-2.5 hero-filter-btn-bg hover:hero-filter-btn-hover-bg text-white rounded-full font-bold text-sm tracking-wide transition-all shadow-lg hover:shadow-[#1C3152]/30 flex items-center justify-center gap-2"
//               >
//                 <span className="material-symbols-outlined text-lg text-white">search</span>
//                 <span className="text-white">Search</span>
//               </Link>
//             </div>

//             {/* Service Search Bar - Below Filter Bar */}
//             <div className="mt-4 md:mt-6 flex justify-center w-full relative z-[100]">
//               <div className="w-full max-w-xl relative" ref={searchRef}>
//                 <div className="w-full hero-filter-bar-bg p-1.5 md:p-2 rounded-full md:rounded-full shadow-2xl border border-white/20 flex items-center gap-2 group transition-all hover:bg-white relative z-[110]">
//                   <div className="flex-1 relative flex items-center pl-3">
//                     <span className="material-symbols-outlined hero-filter-icon text-xl mr-3">content_cut</span>
//                     <input
//                       type="text"
//                       className={`w-full bg-transparent hero-filter-input-text text-sm md:text-base font-medium outline-none placeholder:text-[#4A3B2F]/50 placeholder:transition-all placeholder:duration-500 ${placeholderFade ? 'placeholder:opacity-100 placeholder:translate-x-0' : 'placeholder:opacity-0 placeholder:-translate-x-4'}`}
//                       placeholder={`${servicePlaceholders[placeholderIndex]}`}
//                       value={serviceSearch}
//                       onChange={handleSearchChange}
//                       onFocus={() => {
//                         if (serviceSearch.trim()) {
//                           setShowSuggestions(true);
//                         }
//                       }}
//                       onKeyDown={(e) => {
//                         if (e.key === 'Enter') {
//                           handleSearchSubmit();
//                         }
//                       }}
//                     />
//                   </div>
//                   <button
//                     onClick={handleSearchSubmit}
//                     className="px-3 py-2.5 hero-filter-btn-bg hover:hero-filter-btn-hover-bg text-white rounded-full md:rounded-full font-bold text-sm tracking-wide transition-all flex items-center gap-2 active:scale-95 shrink-0"
//                   >
//                     <span className="material-symbols-outlined text-lg text-white">search</span>
//                     <span className="hidden sm:inline text-white">Search Service</span>
//                   </button>
//                 </div>

//                 {/* Suggestions Dropdown */}
//                 {showSuggestions && (
//                   <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl overflow-hidden z-[120] border border-gray-100 flex flex-col">
//                     {suggestions.length > 0 ? (
//                       suggestions.map((item, idx) => (
//                         <button
//                           key={idx}
//                           onClick={() => handleSuggestionClick(item.name)}
//                           className="w-full text-left px-5 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 flex items-center gap-3"
//                         >
//                           <span className="material-symbols-outlined text-gray-400 text-sm">search</span>
//                           <span className="text-[#4A3B2F] font-medium text-sm md:text-base">{item.name}</span>
//                         </button>
//                       ))
//                     ) : (
//                       <div className="px-5 py-4 text-center text-gray-500 text-sm font-medium">
//                         No services found
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Quick Actions (Hero Bottom) */}
//           <div className="mt-8 flex flex-wrap justify-center gap-4 animate-fade-up [animation-delay:900ms]">
//             <Link
//               href="/salons"
//               className="px-8 py-4 hero-filter-btn-bg hover:hero-filter-btn-hover-bg border-2 border-white/30 backdrop-blur-md rounded-full text-white font-bold tracking-widest uppercase text-[10px] transition-all flex items-center gap-2 group"
//             >
//               <span className="text-white">Explore All</span>
//               <span className="material-symbols-outlined text-sm text-white group-hover:translate-x-1 transition-transform">arrow_forward</span>
//             </Link>
//           </div>
//         </div>
//       </section>

//       <MapPickerModal
//         isOpen={isMapModalOpen}
//         onClose={() => setIsMapModalOpen(false)}
//         onSelect={(pos) => {
//           saveManualLocation(pos.lat, pos.lng, pos.address);
//           setIsMapModalOpen(false);
//           // Hard refresh to ensure all components sync with new localStorage value
//           if (typeof window !== "undefined") {
//             window.location.reload();
//           }
//         }}
//         // Always default to UAE when picking manually as per user request
//         initialPos={null}
//       />
//     </>
//   );
// };

// export default HeroSection;

"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

import { fetchDistinctServiceNames } from '@/features/salons/services/salonService';
import Fuse from 'fuse.js';
import { fuseData } from '../data/fuseData';
import { enrichSynonyms, fuseOptions } from '../utils/searchUtils';
import { useUserLocation } from '@/features/salons/hooks/useUserLocation';
import DateTimePickerModal from './DateTimePickerModal';
import { useLanguage } from '@/context/LanguageContext';

const MapPickerModal = dynamic(() => import('@/features/salons/components/MapPickerModal'), {
  ssr: false,
});

const HeroSection = () => {
  const { t } = useLanguage();
  const [current, setCurrent] = useState(0);

  const [serviceSearch, setServiceSearch] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();
  const searchRef = useRef(null);

  const [headingIndex, setHeadingIndex] = useState(0);
  const [headingFade, setHeadingFade] = useState(true);
  const [placeholderFade, setPlaceholderFade] = useState(true);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const [distinctServices, setDistinctServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // ─── Location Integration ───
  const { location, saveManualLocation, loading: locationLoading, refreshLocation, showMapTrigger } = useUserLocation();
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  useEffect(() => {
    if (showMapTrigger > 0) {
      setIsMapModalOpen(true);
    }
  }, [showMapTrigger]);

  // ─── Combined Service Data for Search ───
  const combinedServiceData = useMemo(() => {
    const staticServices = fuseData.filter(item => item.type === 'service');
    const seenNames = new Set(staticServices.map(s => s.name.toLowerCase()));

    const apiServicesFormatted = distinctServices
      .filter(name => name && !seenNames.has(name.toLowerCase()))
      .map(name => ({
        name: name.trim(), // Keep original case for display
        synonyms: enrichSynonyms(name),
        type: 'service',
        isFromApi: true
      }));

    return [...staticServices, ...apiServicesFormatted];
  }, [distinctServices]);

  // ─── Initialize Fuse with Combined Data ───
  const fuse = useMemo(() => {
    return new Fuse(combinedServiceData, fuseOptions);
  }, [combinedServiceData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const originalVal = e.target.value;
    setServiceSearch(originalVal);

    const val = originalVal.toLowerCase().trim();
    if (val) {
      // 1. Prefix matches first (services that START with the typed text)
      const prefixMatches = combinedServiceData
        .filter(s => s.name.toLowerCase().startsWith(val))
        .slice(0, 5);

      // 2. Fuzzy matches from Fuse (excluding already-matched prefix items)
      const prefixNames = new Set(prefixMatches.map(s => s.name.toLowerCase()));
      const fuseResults = fuse.search(val)
        .filter(r => !prefixNames.has(r.item.name.toLowerCase()))
        .slice(0, 3)
        .map(r => r.item);

      // Combine: prefix first, then fuzzy, cap at 5
      const combined = [...prefixMatches, ...fuseResults].slice(0, 5);
      setSuggestions(combined);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (serviceName) => {
    setServiceSearch(serviceName);
    setShowSuggestions(false);
  };

  const handleSearchSubmit = () => {
    const originalVal = serviceSearch;
    const trimmed = originalVal.toLowerCase().trim();

    const exactMatch = combinedServiceData.find(
      s => s.name.toLowerCase() === trimmed
    );

    let finalSearchTerm = originalVal.trim();

    if (exactMatch) {
      finalSearchTerm = exactMatch.name;
    } else {
      const results = fuse.search(trimmed);
      if (results.length > 0) {
        const bestMatch = results[0];
        if (bestMatch.score < 0.3) {
          finalSearchTerm = bestMatch.item.name;
        }
      }
    }

    setShowSuggestions(false);
    
    const params = new URLSearchParams();
    if (finalSearchTerm) params.append("serviceName", finalSearchTerm);
    if (date) params.append("date", date);
    if (startTime) params.append("startTime", startTime);
    if (endTime) params.append("endTime", endTime);

    router.push(`/salons?${params.toString()}`);
  };

  const headings = [
    t("home.heading_0"),
    t("home.heading_1"),
    t("home.heading_2"),
    t("home.heading_3")
  ];

  const servicePlaceholders = [
    t("home.placeholder_0"),
    t("home.placeholder_1"),
    t("home.placeholder_2"),
    t("home.placeholder_3"),
    t("home.placeholder_4"),
    t("home.placeholder_5"),
    t("home.placeholder_6")
  ];



  const slides = [
    { url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1600&q=80', label: '01' },
    { url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600&q=80', label: '02' },
    { url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1600&q=80', label: '03' },
    { url: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1600&q=80', label: '04' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchDistinctServiceNames()
      .then((data) => {
        setDistinctServices(data || []);
      })
      .catch((err) => {
        console.error("Failed to load distinct services:", err);
      })
      .finally(() => {
        setLoadingServices(false);
      });
  }, []);

  useEffect(() => {
    const headingTimer = setInterval(() => {
      setHeadingFade(false);
      setTimeout(() => {
        setHeadingIndex((prev) => (prev + 1) % headings.length);
        setHeadingFade(true);
      }, 500);
    }, 5000);
    return () => clearInterval(headingTimer);
  }, []);

  useEffect(() => {
    const placeholderTimer = setInterval(() => {
      setPlaceholderFade(false);
      setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % servicePlaceholders.length);
        setPlaceholderFade(true);
      }, 500);
    }, 3500);
    return () => clearInterval(placeholderTimer);
  }, []);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=DM+Sans:wght@300;400;500&display=swap');
        
        :root {
          --gold: #C49B66;
          --terracotta: #1C3152;
        }

        .hero-grain {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }

        .animate-fade-up {
          animation: fadeUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        .text-shadow {
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
        }
        
        .text-shadow-lg {
          text-shadow: 0 4px 15px rgba(0, 0, 0, 0.6);
        }
      `}</style>

      <section className="relative w-full min-h-[100svh] overflow-hidden font-['DM_Sans',sans-serif] flex flex-col justify-center py-20 px-4">
        {/* Solid White Background */}
        <div className="absolute inset-0 bg-white" />

        {/* Dynamic Overlays */}
        {/* Removed dark overlay for white background */}
        <div className="absolute inset-0 z-[4] opacity-[0.05] pointer-events-none hero-grain" />

        {/* Content Container - Shifted downward slightly to clear navbar */}
        <div className="relative z-[10] w-full max-w-7xl mx-auto flex flex-col items-center text-center mt-6 md:mt-16 lg:mt-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-full px-4 py-1.5 mb-6 animate-fade-up [animation-delay:100ms]">
            <div className="w-4 h-4 rounded-full bg-[#087810] animate-pulse" />
            <span className="text-[10px] md:text-xs tracking-[0.15em] uppercase text-gray-600 font-medium">
              {t("home.premium_experiences")}
            </span>
          </div>

          {/* Main Heading - Dark text for white background */}
          <h1 className="font-['Cormorant_Garamond',serif] text-[clamp(1.4rem,4.5vw,3.6rem)] text-gray-900 font-light leading-tight mb-5 animate-fade-up [animation-delay:300ms] inline-flex items-center justify-center">
            <span className={`transition-opacity duration-500 ${headingFade ? 'opacity-100' : 'opacity-0'}`}>
              {headings[headingIndex].split(' ').map((word, i) => {
                const accentedWords = ['Luxury', 'Perfect', 'Grooming', 'Beauty', 'الفاخرة', 'المثالي', 'احترافي', 'جمالك'];
                return (
                  <span key={i}>
                    {accentedWords.includes(word) ? (
                      <span className="italic hero-title-accent font-normal px-1">{word}</span>
                    ) : (
                      <span>{word}</span>
                    )}
                    {i < headings[headingIndex].split(' ').length - 1 && ' '}
                  </span>
                );
              })}
            </span>
          </h1>

          {/* Subtext */}
          <p className="hidden md:block text-[clamp(1rem,2vw,1.25rem)] font-light text-gray-600 tracking-wide max-w-2xl leading-relaxed mb-10 animate-fade-up [animation-delay:500ms] px-4">
            {t("home.hero_subtext")}
          </p>

          {/* Filter Bar (Optimized for Narrow Mobile and Tablet) */}
          <div className="w-full max-w-7xl px-3 animate-fade-up [animation-delay:700ms] mt-5 relative z-[100]">
            <div className="relative group">
              <div className="hero-filter-bar-bg border border-gray-200 p-4 md:p-5 lg:p-3 rounded-[2.5rem] lg:rounded-full shadow-2xl grid grid-cols-1 lg:flex lg:flex-row items-center gap-3 lg:gap-2 lg:pr-16">

                {/* Service Search Input */}
                <div className="w-full lg:w-[30%] relative flex items-center hero-filter-input-bg rounded-full border px-5 py-4 lg:py-3 transition-all hover:bg-white focus-within:ring-2 focus-within:ring-[#1C3152]/20" ref={searchRef}>
                  <span className="material-symbols-outlined hero-filter-icon text-xl mr-3">content_cut</span>
                  <input
                    type="text"
                    className={`w-full bg-transparent hero-filter-input-text text-sm font-medium outline-none placeholder:text-[#4A3B2F]/50`}
                    placeholder={`${servicePlaceholders[placeholderIndex]}`}
                    value={serviceSearch}
                    onChange={handleSearchChange}
                    onFocus={() => {
                      if (serviceSearch.trim()) {
                        setShowSuggestions(true);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearchSubmit();
                      }
                    }}
                  />
                  
                  {/* Suggestions Dropdown */}
                  {showSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl overflow-hidden z-[120] border border-gray-100 flex flex-col">
                      {suggestions.length > 0 ? (
                        suggestions.map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick(item.name)}
                            className="w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 flex items-center gap-4"
                          >
                            <span className="material-symbols-outlined text-gray-400 text-lg">search</span>
                            <span className="text-[#4A3B2F] font-medium text-sm md:text-base">{item.name}</span>
                          </button>
                        ))
                      ) : (
                        <div className="px-6 py-5 text-center text-gray-500 text-sm font-medium">
                          No services found
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Time Selection (Modal Trigger) */}
                <div className="w-full lg:w-[35%] relative">
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsTimeModalOpen(true);
                    }}
                    className="flex items-center gap-3 hero-filter-input-bg rounded-full border px-5 py-3 lg:py-2.5 transition-all hover:bg-white cursor-pointer group"
                  >
                    <span className="material-symbols-outlined hero-filter-icon text-xl">calendar_today</span>
                    <div className="flex flex-col text-left overflow-hidden">
                      <span className="text-[8px] uppercase font-bold text-gray-400 tracking-tighter leading-none mb-1">{t("home.appointment_time")}</span>
                      <span className="text-[11px] font-bold hero-filter-input-text truncate leading-none">
                        {date ? `${date} ${startTime ? `@ ${startTime}` : ''}` : t("home.choose_datetime")}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-gray-400 text-lg ml-auto">chevron_right</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full lg:w-[35%]">
                  {/* Choose Manually (Map) */}
                  <div
                    onClick={() => setIsMapModalOpen(true)}
                    className="flex-1 relative flex items-center hero-filter-input-bg rounded-full border px-5 py-3 transition-all hover:bg-white cursor-pointer group hover:border-[#1C3152]/30 overflow-hidden"
                  >
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm mr-3 hero-filter-icon group-hover:hero-filter-btn-bg group-hover:text-white transition-all">
                      <span className="material-symbols-outlined text-lg">map</span>
                    </div>
                    <div className="flex flex-col text-left overflow-hidden">
                      <span className="text-[8px] uppercase font-bold text-gray-400 tracking-tighter leading-none mb-1">{t("home.location_label")}</span>
                      <span className="text-[11px] font-bold hero-filter-input-text truncate leading-none">
                        {locationLoading ? t("home.detecting") : (location?.address || t("home.choose_manually"))}
                      </span>
                    </div>
                  </div>
                  
                  {/* Current Location Icon (Mobile only, outside the box) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      refreshLocation(true);
                    }}
                    title="Detect My Location"
                    className="lg:hidden w-12 h-12 flex items-center justify-center rounded-full bg-white border border-gray-100 shadow-xl text-gray-500 hover:text-[#1C3152] transition-all active:scale-95 shrink-0"
                  >
                    <span className={`material-symbols-outlined text-xl ${locationLoading ? 'animate-spin' : ''}`}>my_location</span>
                  </button>
                </div>

                {/* Search Trigger */}
                <div className="w-full lg:w-[10%] flex items-center">
                  <button
                    onClick={handleSearchSubmit}
                    className="w-full h-12 hero-filter-btn-bg hover:hero-filter-btn-hover-bg text-white rounded-full font-bold transition-all shadow-xl hover:shadow-[#1C3152]/30 flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-2xl text-white">search</span>
                  </button>
                </div>
              </div>

              {/* Current Location Icon (Desktop only - Shifted to corner) */}
              <button
                onClick={() => refreshLocation(true)}
                title="Detect My Location"
                className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center rounded-full bg-white border border-gray-100 shadow-md text-gray-400 hover:text-[#1C3152] hover:shadow-lg transition-all active:scale-95 z-[10]"
              >
                <span className={`material-symbols-outlined text-lg ${locationLoading ? 'animate-spin' : ''}`}>my_location</span>
              </button>
            </div>

          </div>

          {/* Quick Actions (Hero Bottom) */}
          <div className="mt-8 flex flex-wrap justify-center gap-4 animate-fade-up [animation-delay:900ms]">
            <Link
              href="/salons"
              className="px-8 py-4 hero-filter-btn-bg hover:hero-filter-btn-hover-bg border-2 border-white/30 backdrop-blur-md rounded-full text-white font-bold tracking-widest uppercase text-[10px] transition-all flex items-center gap-2 group"
            >
              <span className="text-white">{t("home.explore_all")}</span>
              <span className="material-symbols-outlined text-sm text-white group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      <MapPickerModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onSelect={(pos) => {
          saveManualLocation(pos.lat, pos.lng, pos.address);
          setIsMapModalOpen(false);
          // Hard refresh to ensure all components sync with new localStorage value
          if (typeof window !== "undefined") {
            window.location.reload();
          }
        }}
        initialPos={location && location.latitude && location.longitude ? { lat: location.latitude, lng: location.longitude } : null}
      />

      <DateTimePickerModal
        isOpen={isTimeModalOpen}
        onClose={() => setIsTimeModalOpen(false)}
        date={date}
        startTime={startTime}
        endTime={endTime}
        onApply={(d, st, et) => {
          setDate(d);
          setStartTime(st);
          setEndTime(et);
        }}
      />
    </>
  );
};

export default HeroSection;