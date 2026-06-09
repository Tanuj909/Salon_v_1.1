"use client";

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

const GallerySection = () => {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState('all');

  const categories = [
    { id: 'all', label: t("home.gallery_cat_all") },
    { id: 'hair', label: t("home.gallery_cat_hair") },
    { id: 'skin', label: t("home.gallery_cat_skin") },
    { id: 'nails', label: t("home.gallery_cat_nails") },
    { id: 'bridal', label: t("home.gallery_cat_bridal") }
  ];

  const galleryItems = [
    {
      id: 1,
      title: t("home.gallery_item_title_1"),
      category: "hair",
      image: "https://images.unsplash.com/photo-1525614686090-7a3108e3758e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGJvYiUyMGN1dHxlbnwwfHwwfHx8MA%3D%3D",
      description: t("home.gallery_item_desc_1")
    },
    {
      id: 2,
      title: t("home.gallery_item_title_2"),
      category: "hair",
      image: "https://images.unsplash.com/photo-1568530134868-5d89f49d5a72?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fEJhbGF5YWdlfGVufDB8fDB8fHww",
      description: t("home.gallery_item_desc_2")
    },
    {
      id: 3,
      title: t("home.gallery_item_title_3"),
      category: "skin",
      image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHNhbG9ufGVufDB8fDB8fHww",
      description: t("home.gallery_item_desc_3")
    },
    {
      id: 4,
      title: t("home.gallery_item_title_4"),
      category: "bridal",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDZwatrTnvnmq9fKbDCD54TxCGWmSdF8uG7JHsAv0tsf_y3mGeYufo8SXtIpO5SGh5ZdtVgEvAvpcofmIXhg8ePC2wo6M5VSUlq5LDaZDwcuFsbofUOH--p6xj8SwLQYhQHiGmOllpVgvnClOpKg14NyUI5yuRUD3iJPUSkg-SnqU2y0z1bsZbaP25NgGW7wYH5jmHzl_5tQmksd7ezywNc_n6PnQhu8DraI5qkvvtgaDvi3GdA0mqj-nYxXuwNKtpY9G7YxDel5-Br",
      description: t("home.gallery_item_desc_4")
    },
    {
      id: 5,
      title: t("home.gallery_item_title_5"),
      category: "nails",
      image: "https://images.unsplash.com/photo-1588015810531-dd522c9c8bbb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8TmFpbCUyMERlc2lnbnxlbnwwfHwwfHx8MA%3D%3D",
      description: t("home.gallery_item_desc_5")
    },
    {
      id: 6,
      title: t("home.gallery_item_title_6"),
      category: "skin",
      image: "https://plus.unsplash.com/premium_photo-1718626724867-970453587837?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8TWljcm9ibGFkaW5nfGVufDB8fDB8fHww",
      description: t("home.gallery_item_desc_6")
    },
    {
      id: 7,
      title: t("home.gallery_item_title_7"),
      category: "bridal",
      image: "https://images.unsplash.com/photo-1760220006440-4b98ad942c53?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8QnJpZGFsJTIwVXBkb3xlbnwwfHwwfHx8MA%3D%3D",
      description: t("home.gallery_item_desc_7")
    },
    {
      id: 8,
      title: t("home.gallery_item_title_8"),
      category: "nails",
      image: "https://images.unsplash.com/photo-1611821828952-3453ba0f9408?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fEdlbCUyME1hbmljdXJlfGVufDB8fDB8fHww",
      description: t("home.gallery_item_desc_8")
    }
  ];

  const filteredItems = activeFilter === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeFilter);

  return (
    <section className="py-24 px-6 max-w-[1280px] mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight rec-section-heading font-[Cormorant_Garamond,serif]">{t("home.our_gallery")}</h2>
        <div className="w-20 h-1 rec-section-divider mx-auto rounded-full mt-3 mb-8"></div>
        
        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveFilter(category.id)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 font-[DM_Sans] ${ activeFilter === category.id ? 'rec-btn-primary shadow-lg scale-105' : 'bg-white border rec-btn-outline hover:scale-105' }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group relative h-[350px] overflow-hidden rounded-2xl cursor-pointer border rec-card-border"
          >
            <img
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              src={item.image}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1C3152]/90 via-[#1C3152]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Category Tag */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rec-card-title px-3 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-[DM_Sans]">
              {categories.find(cat => cat.id === item.category)?.label}
            </div>
            
            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 p-6 w-full transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <h3 className="text-white text-xl font-bold mb-1 drop-shadow-md font-[Cormorant_Garamond,serif]">
                {item.title}
              </h3>
              <p className="text-white/90 text-xs mb-3 font-[DM_Sans]">
                {item.description}
              </p>
              <button className="rec-btn-primary border border-white/30 text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-white hover:text-[#1C3152] transition-colors mt-3 font-[DM_Sans]">
                {t("home.view_details_btn")}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="rec-section-subtext text-lg font-[DM_Sans]">{t("home.gallery_no_items")}</p>
        </div>
      )}
    </section>
  );
};

export default GallerySection;