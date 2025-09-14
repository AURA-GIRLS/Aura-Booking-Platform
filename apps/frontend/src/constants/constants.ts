export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export const PROVINCES = [
  "All Areas",
  "Hanoi","Ho Chi Minh","Da Nang","Hai Phong","Can Tho","An Giang","Ba Ria - Vung Tau","Bac Giang","Bac Kan",
  "Bac Lieu","Bac Ninh","Ben Tre","Binh Dinh","Binh Duong","Binh Phuoc","Binh Thuan","Ca Mau","Cao Bang",
  "Dak Lak","Dak Nong","Dien Bien","Dong Nai","Dong Thap","Gia Lai","Ha Giang","Ha Nam","Ha Tinh","Hai Duong",
  "Hau Giang","Hoa Binh","Hung Yen","Khanh Hoa","Kien Giang","Kon Tum","Lai Chau","Lam Dong","Lang Son","Lao Cai",
  "Long An","Nam Dinh","Nghe An","Ninh Binh","Ninh Thuan","Phu Tho","Phu Yen","Quang Binh","Quang Nam","Quang Ngai",
  "Quang Ninh","Quang Tri","Soc Trang","Son La","Tay Ninh","Thai Binh","Thai Nguyen","Thanh Hoa","Thua Thien Hue",
  "Tien Giang","Tra Vinh","Tuyen Quang","Vinh Long","Vinh Phuc","Yen Bai",
];

export const BUDGET_OPTIONS = [
  "200.000 VND - 300.000 VND",
  "300.000 VND - 500.000 VND",
  "500.000 VND - 800.000 VND",
  "800.000 VND - 1.200.000 VND",
  "Above 1.200.000 VND",
];

// Service Categories for makeup occasions (matching backend)
export const SERVICE_CATEGORIES = {
  BRIDAL: 'BRIDAL',          
  PARTY: 'PARTY',             
  WEDDING_GUEST: 'WEDDING_GUEST', 
  GRADUATION: 'GRADUATION',    
  PROM: 'PROM',               
  DAILY: 'DAILY',             
  SPECIAL_EVENT: 'SPECIAL_EVENT' 
} as const;

// Type for service categories including "ALL" option
export type ServiceCategory = 'ALL' | keyof typeof SERVICE_CATEGORIES;

// Display labels for service categories in English
export const SERVICE_CATEGORY_LABELS = {
  ALL: 'All',
  BRIDAL: 'Bridal',
  PARTY: 'Party',
  WEDDING_GUEST: 'Wedding Guest',
  GRADUATION: 'Graduation',
  PROM: 'Prom',
  DAILY: 'Daily',
  SPECIAL_EVENT: 'Special Event'
} as const;

// Service Add-ons for makeup services (matching backend)
export const SERVICE_ADDONS = {
  HAIR_STYLING: 'HAIR_STYLING',
  FALSE_LASHES: 'FALSE_LASHES', 
  SKINCARE_PREP: 'SKINCARE_PREP',
  PHOTOGRAPHY: 'PHOTOGRAPHY',
  NAIL_ART: 'NAIL_ART',
  EYEBROW_SHAPING: 'EYEBROW_SHAPING',
  CONTOURING: 'CONTOURING',
  AIRBRUSH: 'AIRBRUSH'
} as const;

// Display labels for service add-ons in English
export const SERVICE_ADDON_LABELS = {
  HAIR_STYLING: 'Hair Styling',
  FALSE_LASHES: 'False Lashes',
  SKINCARE_PREP: 'Skincare Prep',
  PHOTOGRAPHY: 'Photography',
  NAIL_ART: 'Nail Art',
  EYEBROW_SHAPING: 'Eyebrow Shaping',
  CONTOURING: 'Contouring',
  AIRBRUSH: 'Airbrush'
} as const;

export type ServiceAddon = typeof SERVICE_ADDONS[keyof typeof SERVICE_ADDONS];
