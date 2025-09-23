// "use client";

// import React, { useState } from "react";
// import { PROVINCES, BUDGET_OPTIONS, type ServiceCategory } from "../../constants/constants";
// import FiltersPanel from "./FiltersPanel";
// import { MapPin, Star, Crown, Eye, Calendar } from "lucide-react";

// // Enhanced mock data with more details
// const mockArtists = [
//   {
//     id: "1",
//     fullName: "Nguyễn Thị Thùy Linh",
//     role: "Chuyên gia trang điểm cô dâu",
//     avatarUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
//     location: "Hà Nội",
//     ratingAverage: 4.9,
//     reviewCount: 120,
//     isPremium: true,
//     bio: "8 năm kinh nghiệm trang điểm cô dâu cao cấp. Chuyên phong cách tự nhiên, sang trọng với kỹ thuật makeup Hàn Quốc.",
//     services: [
//       {
//         id: "s1",
//         name: "Trang Điểm Cô Dâu Luxury",
//         image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=120&h=80&fit=crop",
//         price: 2500000,
//         benefits: ["Makeup HD chống nước", "Làm tóc cô dâu", "Thử makeup miễn phí"],
//         badges: ["Bao gồm làm tóc", "Chụp hình", "Touch-up"],
//         rating: 4.9,
//         reviewCount: 45,
//         isHighlight: true
//       },
//       {
//         id: "s2", 
//         name: "Trang Điểm Dự Tiệc Premium",
//         image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=120&h=80&fit=crop",
//         price: 1200000,
//         benefits: ["Phong cách hiện đại", "Mi giả cao cấp", "Tư vấn outfit"],
//         badges: ["False lashes", "Contouring"],
//         rating: 4.8,
//         reviewCount: 32,
//         isHighlight: true
//       }
//     ],
//     totalServices: 5
//   },
//   {
//     id: "2",
//     fullName: "Trần Minh Châu",
//     role: "Makeup Artist chuyên nghiệp",
//     avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
//     location: "TP. Hồ Chí Minh",
//     ratingAverage: 4.8,
//     reviewCount: 95,
//     isPremium: false,
//     bio: "Makeup artist với đam mê tạo nên vẻ đẹp tự nhiên. Chuyên các sự kiện đặc biệt và chụp ảnh thời trang.",
//     services: [
//       {
//         id: "s3",
//         name: "Trang Điểm Dạ Hội Sang Trọng",
//         image: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=120&h=80&fit=crop",
//         price: 1800000,
//         benefits: ["Phong cách glamour", "Jewelry styling", "Tóc dạ hội"],
//         badges: ["Bao gồm làm tóc", "Jewelry", "HD makeup"],
//         rating: 4.9,
//         reviewCount: 38,
//         isHighlight: true
//       },
//       {
//         id: "s4",
//         name: "Trang Điểm Chụp Ảnh Studio",
//         image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=120&h=80&fit=crop",
//         price: 950000,
//         benefits: ["HD makeup chống flash", "Retouching support", "Multiple looks"],
//         badges: ["HD makeup", "Chụp hình", "Multiple looks"],
//         rating: 4.7,
//         reviewCount: 25,
//         isHighlight: true
//       }
//     ],
//     totalServices: 4
//   },
//   {
//     id: "3",
//     fullName: "Lê Thị Hương Giang",
//     role: "Chuyên gia trang điểm sự kiện",
//     avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
//     location: "Đà Nẵng",
//     ratingAverage: 4.7,
//     reviewCount: 78,
//     isPremium: true,
//     bio: "Chuyên trang điểm cô dâu và sự kiện cao cấp. Phong cách hiện đại, trẻ trung với 6 năm kinh nghiệm.",
//     services: [
//       {
//         id: "s5",
//         name: "Trang Điểm Cô Dâu Truyền Thống",
//         image: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=120&h=80&fit=crop",
//         price: 2200000,
//         benefits: ["Áo dài cô dâu", "Phụ kiện truyền thống", "Makeup lâu trôi"],
//         badges: ["Áo dài", "Phụ kiện", "Truyền thống"],
//         rating: 4.8,
//         reviewCount: 42,
//         isHighlight: true
//       },
//       {
//         id: "s6",
//         name: "Trang Điểm Tốt Nghiệp",
//         image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=120&h=80&fit=crop",
//         price: 700000,
//         benefits: ["Phong cách trẻ trung", "Makeup tự nhiên", "Chụp ảnh đẹp"],
//         badges: ["Trẻ trung", "Tự nhiên"],
//         rating: 4.7,
//         reviewCount: 22,
//         isHighlight: true
//       }
//     ],
//     totalServices: 6
//   }
// ];

// const fmtVND = (n: number) => `${n.toLocaleString("vi-VN")}`;

// function Stars({ value = 0, size = "sm" }: { value?: number; size?: "sm" | "xs" }) {
//   const full = Math.floor(value);
//   const sizeClass = size === "xs" ? "text-xs" : "text-sm";
  
//   return (
//     <div className={`flex items-center gap-1 text-yellow-400 ${sizeClass}`}>
//       {Array.from({ length: 5 }, (_, i) => (
//         <Star key={i} size={size === "xs" ? 12 : 16} className={i < full ? "fill-current" : ""} />
//       ))}
//       <span className="text-gray-700 ml-2 font-bold">
//         {Number(value).toFixed(1)}
//       </span>
//     </div>
//   );
// }

// function ServicePreviewCard({ service }: { service: any }) {
//   const maxVisibleBadges = 2;
//   const visibleBadges = service.badges.slice(0, maxVisibleBadges);
//   const hiddenCount = service.badges.length - maxVisibleBadges;

//   return (
//     <div className="group bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-5 border border-pink-200 hover:shadow-lg hover:border-pink-300 transition-all duration-300">
//       <div className="flex gap-5">
//         {/* Service Image */}
//         <div className="w-24 h-20 rounded-xl overflow-hidden bg-gray-200 shrink-0 shadow-md">
//           <img 
//             src={service.image} 
//             alt={service.name}
//             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//           />
//         </div>

//         {/* Service Info */}
//         <div className="flex-1 min-w-0">
//           <h4 className="font-bold text-gray-900 text-base mb-3 line-clamp-1">
//             {service.name}
//           </h4>
          
//           {/* Benefits */}
//           <ul className="space-y-2 mb-3">
//             {service.benefits.slice(0, 2).map((benefit: string, idx: number) => (
//               <li key={idx} className="flex items-center gap-3 text-sm text-gray-600">
//                 <div className="w-2 h-2 bg-pink-500 rounded-full shrink-0"></div>
//                 <span className="line-clamp-1">{benefit}</span>
//               </li>
//             ))}
//           </ul>

//           {/* Badges & Rating */}
//           <div className="flex items-center justify-between">
//             <div className="flex flex-wrap gap-2">
//               {visibleBadges.map((badge: string, idx: number) => (
//                 <span key={idx} className="inline-block px-3 py-1 bg-pink-100 text-pink-700 text-xs font-medium rounded-full border border-pink-200">
//                   {badge}
//                 </span>
//               ))}
//               {hiddenCount > 0 && (
//                 <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full border border-gray-200">
//                   +{hiddenCount}
//                 </span>
//               )}
//             </div>
//             <Stars value={service.rating} size="xs" />
//           </div>
//         </div>

//         {/* Price & Action */}
//         <div className="text-right shrink-0 flex flex-col justify-between min-w-[120px]">
//           <div className="font-bold text-red-600 text-xl tabular-nums mb-2">
//             {fmtVND(service.price)}
//             <span className="text-sm font-normal text-gray-500 block">VND</span>
//           </div>
//           <button className="px-4 py-2 bg-gradient-to-r from-pink-600 to-pink-700 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:from-pink-700 hover:to-pink-800 transition-all duration-200">
//             <Calendar size={14} className="inline mr-2" />
//             Đặt lịch
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// function EnhancedMUACard({ artist }: { artist: typeof mockArtists[0] }) {
//   // Only show 2 most prominent services (those marked as highlight)
//   const highlightServices = artist.services.filter(service => service.isHighlight).slice(0, 2);

//   return (
//     <article className="group w-full rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
//       {/* Header Section */}
//       <div className="p-8 pb-6 bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100">
//         <div className="flex items-start gap-6">
//           {/* Avatar */}
//           <div className="relative">
//             <div className="w-20 h-20 rounded-full overflow-hidden bg-pink-100 shrink-0 ring-4 ring-white shadow-xl">
//               <img className="w-full h-full object-cover" src={artist.avatarUrl} alt={artist.fullName} />
//             </div>
//             {artist.isPremium && (
//               <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
//                 <Crown size={16} className="text-white" />
//               </div>
//             )}
//           </div>
          
//           {/* Info */}
//           <div className="flex-1 min-w-0">
//             <div className="flex items-start justify-between gap-3 mb-4">
//               <div>
//                 <h3 className="font-bold text-gray-900 text-2xl leading-tight mb-2">
//                   {artist.fullName}
//                 </h3>
//                 <p className="text-pink-600 text-base font-semibold mb-3">
//                   {artist.role}
//                 </p>
//               </div>
//               {artist.isPremium && (
//                 <span className="px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full shadow-md">
//                   PREMIUM
//                 </span>
//               )}
//             </div>
            
//             <div className="flex items-center gap-6 mb-4">
//               <div className="flex items-center gap-2 text-base text-gray-700">
//                 <MapPin size={18} className="text-pink-600" />
//                 <span className="font-medium">{artist.location}</span>
//               </div>
//               <div className="flex items-center gap-3">
//                 <Stars value={artist.ratingAverage} />
//                 <span className="text-base text-gray-600 font-medium">({artist.reviewCount} đánh giá)</span>
//               </div>
//             </div>
            
//             <p className="text-gray-700 text-base leading-relaxed line-clamp-2 mb-5">
//               {artist.bio}
//             </p>

//             {/* Action Buttons */}
//             <div className="flex gap-4">
//               <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-pink-600 text-pink-600 text-base font-semibold rounded-lg hover:bg-pink-50 transition-colors">
//                 <Eye size={16} />
//                 Xem Portfolio
//               </button>
//               <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-600 to-pink-700 text-white text-base font-semibold rounded-lg hover:from-pink-700 hover:to-pink-800 transition-all duration-200 shadow-md">
//                 Liên hệ ngay
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Services Section */}
//       <div className="p-8 pt-6 space-y-5">
//         <h4 className="text-lg font-bold text-gray-900 mb-4">Dịch vụ nổi bật</h4>
//         {highlightServices.map((service) => (
//           <ServicePreviewCard key={service.id} service={service} />
//         ))}
        
//         {/* View All Services */}
//         <div className="text-center pt-4">
//           <button className="text-pink-600 hover:text-pink-700 text-base font-semibold hover:underline">
//             Xem tất cả {artist.totalServices} gói dịch vụ →
//           </button>
//         </div>
//       </div>
//     </article>
//   );
// }

// function SkeletonCard() {
//   return (
//     <div className="w-full rounded-2xl bg-white shadow-lg overflow-hidden animate-pulse border border-gray-100">
//       <div className="p-8 pb-6 bg-gradient-to-br from-pink-50 to-pink-100">
//         <div className="flex items-start gap-6">
//           <div className="w-20 h-20 rounded-full bg-gray-300"></div>
//           <div className="flex-1">
//             <div className="h-7 bg-gray-300 rounded mb-3 w-3/4"></div>
//             <div className="h-5 bg-gray-200 rounded mb-4 w-1/2"></div>
//             <div className="h-5 bg-gray-200 rounded mb-3 w-full"></div>
//             <div className="h-5 bg-gray-200 rounded w-2/3"></div>
//           </div>
//         </div>
//       </div>
//       <div className="p-8 pt-6 space-y-5">
//         {[1, 2].map((i) => (
//           <div key={i} className="bg-pink-50 rounded-xl p-5">
//             <div className="flex gap-5">
//               <div className="w-24 h-20 bg-gray-300 rounded-xl"></div>
//               <div className="flex-1">
//                 <div className="h-5 bg-gray-300 rounded mb-3 w-3/4"></div>
//                 <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
//                 <div className="h-4 bg-gray-200 rounded w-2/3"></div>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default function ArtistsListPreview() {
//   // Filters state
//   const [location, setLocation] = useState("Tất cả khu vực");
//   const [styleText, setStyleText] = useState<string>("");
//   const [occasion, setOccasion] = useState<ServiceCategory>("ALL");
  
//   // Filters panel state
//   const [q, setQ] = useState("");
//   const [selectedBudgets, setSelectedBudgets] = useState<string[]>([]);
//   const [rating, setRating] = useState<number | null>(null);

//   const total = mockArtists.length;
//   const metaLine = `${location}: ${total.toLocaleString("vi-VN")} Makeup Artists đang chờ bạn lựa chọn`;

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-pink-25 to-rose-50 font-sans">
//       {/* Header search bar */}
//       <div className="bg-gradient-to-r from-pink-100 to-rose-200 py-8 md:py-12 shadow-sm">
//         <div className="max-w-screen-2xl mx-auto px-6 sm:px-8 lg:px-12">
//           <div className="w-full bg-white rounded-2xl shadow-lg border-2 border-pink-300 px-6 py-6 md:px-8 md:py-7">
//             <div className="grid grid-cols-1 lg:grid-cols-[2.2fr_1.2fr_1.2fr_auto] gap-4 lg:gap-6 items-center">
//               {/* Location */}
//               <div className="relative">
//                 <span aria-hidden className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-pink-600">
//                   <MapPin size={20} strokeWidth={2.5} />
//                 </span>
//                 <select
//                   aria-label="Địa điểm"
//                   value={location}
//                   onChange={(e) => setLocation(e.target.value)}
//                   className="appearance-none h-14 w-full pl-12 pr-10 rounded-xl md:rounded-2xl border-3 border-pink-400 bg-white text-base font-medium
//                              focus:outline-none focus:ring-3 focus:ring-pink-300 focus:border-pink-500"
//                 >
//                   {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
//                 </select>
//                 <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-pink-400 text-lg">▾</span>
//               </div>

//               {/* Date */}
//               <div className="relative">
//                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-600 text-lg">📅</span>
//                 <input
//                   aria-label="Ngày trang điểm"
//                   type="date"
//                   className="h-14 w-full pl-12 pr-4 rounded-xl md:rounded-2xl border-3 border-pink-400 bg-white text-base font-medium
//                              focus:outline-none focus:ring-3 focus:ring-pink-300 focus:border-pink-500 [color-scheme:light]"
//                 />
//               </div>

//               {/* Style */}
//               <div className="relative">
//                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-600 text-lg">💄</span>
//                 <input
//                   aria-label="Phong cách trang điểm"
//                   value={styleText}
//                   onChange={(e) => setStyleText(e.target.value)}
//                   placeholder="Phong cách (vd: Tự nhiên, Sang trọng...)"
//                   className="h-14 w-full pl-12 pr-4 rounded-xl md:rounded-2xl border-3 border-pink-400 bg-white text-base font-medium
//                              focus:outline-none focus:ring-3 focus:ring-pink-300 focus:border-pink-500 placeholder-gray-400"
//                 />
//               </div>

//               <div className="flex justify-end">
//                 <button className="h-14 px-8 rounded-xl md:rounded-2xl bg-gradient-to-r from-pink-600 to-red-600 text-white text-base font-bold hover:from-pink-700 hover:to-red-700 whitespace-nowrap shadow-lg transition-all duration-200">
//                   Tìm Makeup Artist
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Meta line */}
//           <div className="mt-8">
//             <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
//               {metaLine}
//             </div>
//             <p className="text-gray-600 text-lg">
//               Vừa tìm thấy các dịch vụ trang điểm chất lượng cao {location !== "Tất cả khu vực" ? `tại ${location}` : "trên toàn quốc"}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Main grid: Filters 3/12 – Results 9/12 */}
//       <div className="max-w-screen-2xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
//           <div className="lg:col-span-3">
//             <div className="bg-gradient-to-b from-pink-50 to-rose-50 rounded-2xl p-6 shadow-md border border-pink-200">
//               <FiltersPanel
//                 q={q}
//                 onQChange={setQ}
//                 budgetOptions={BUDGET_OPTIONS}
//                 selectedBudgets={selectedBudgets}
//                 onToggleBudget={(v) => {
//                   setSelectedBudgets((list) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]));
//                 }}
//                 rating={rating}
//                 onRatingChange={(val) => setRating((cur) => (cur === val ? null : val))}
//               />
//             </div>
//           </div>

//           <div className="lg:col-span-9">
//             <div className="space-y-8">
//               {mockArtists.map((artist) => (
//                 <EnhancedMUACard key={artist.id} artist={artist} />
//               ))}
//             </div>

//             {/* Load More */}
//             <div className="mt-12 flex justify-center">
//               <button className="h-14 px-10 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 text-white text-base font-semibold hover:from-gray-900 hover:to-black shadow-lg transition-all duration-200">
//                 Xem thêm Makeup Artists
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
