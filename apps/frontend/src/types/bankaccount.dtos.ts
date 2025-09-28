// ===== BANK ACCOUNT DTOs =====
export interface CreateBankAccountDTO {
  userId: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  bankCode: string;
  bankLogo?: string;
  bankBin: string;
  swiftCode?: string;
}

export interface UpdateBankAccountDTO {
  accountNumber?: string;
  accountName?: string;
  bankName?: string;
  bankCode?: string;
  bankBin?: string;
  bankLogo?: string;
  swiftCode?: string;
}

export interface BankAccountResponseDTO {
  _id: string;
  userId: string;
  accountNumber: string;
  accountName: string;
  bankLogo?: string;
  bankName: string;
  bankCode: string;
  bankBin: string;
  swiftCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BankDTO {
  id: number;
  name: string;             // Tên đầy đủ ngân hàng
  code: string;             // Mã ngân hàng (ICB, VCB...)
  bin: string;              // BIN code
  shortName: string;        // Tên viết tắt
  logo: string;             // URL logo
  transferSupported: number; // Có hỗ trợ chuyển khoản (1: có, 0: không)
  lookupSupported: number;   // Có hỗ trợ lookup (1: có, 0: không)
  short_name: string;        // Trùng với shortName (đôi khi API trả khác)
  support: number;           // Loại support (1,2,3...)
  isTransfer: number;        // Có hỗ trợ transfer (1: có)
  swift_code: string;        // Mã SWIFT
}

export interface BankListResponseDTO {
  code: string;   // "00" = success
  desc: string;   // Mô tả kết quả
  data: BankDTO[]; // Danh sách ngân hàng
}
