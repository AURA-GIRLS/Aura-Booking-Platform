import { PaymentMethod, PayoutCategory, TransactionStatus } from "../constants";

export interface CreateTransactionDTO {
  bookingId: string;
  customerId: string;
  status?: TransactionStatus; // default HOLD
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentReference: string;
}
export interface UpdateTransactionDTO {
  amount?: number;
  currency?: string;
  status?: TransactionStatus;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
}
export interface TransactionResponseDTO {
    _id: string;
    bookingId: string;
    customerId: string;
    customerName:string;
    serviceName:string;
    bookingTime:string;
    amount: number;
    currency: string;
    status: TransactionStatus;
    paymentMethod: PaymentMethod;
    bookingDate?: string;
}

export interface PayOSCreateLinkInput {
  amount: number;
  description: string;
  returnUrl: string;
  cancelUrl: string;
  orderCode?: number;
};

export interface PayOSCreateLinkResult {
  checkoutUrl: string;
  orderCode: number;
  signature: string;
  raw: any;
};

export interface PaymentWebhookResponse {
  code: string;
  desc: string;
  success: boolean;
  data: {
    accountNumber: string;
    amount: number;
    description: string;
    reference: string;
    transactionDateTime: string;       // ISO date string "YYYY-MM-DD HH:mm:ss"
    virtualAccountNumber: string;
    counterAccountBankId: string;
    counterAccountBankName: string;
    counterAccountName: string;
    counterAccountNumber: string;
    virtualAccountName: string;
    currency: string;
    orderCode: number;
    paymentLinkId: string;
    code: string;
    desc: string;
  };
  signature: string;
}

export interface PayoutInput{
  referenceId: string;
  amount: number;
  description: string;
  toBin: string;
  toAccountNumber: string;
  category: PayoutCategory[];
}

// ===== Payout Response DTOs =====
export interface PayoutTransactionDTO {
  id: string;
  referenceId: string;
  amount: number;
  description: string;
  toBin: string;
  toAccountNumber: string;
  toAccountName: string;
  reference: string;
  transactionDatetime: string; // ISO string
  errorMessage?: string;
  errorCode?: string;
  // State from provider (e.g., SUCCEEDED, FAILED, etc.)
  state: string;
}

export interface PayoutResponseDataDTO {
  id: string;
  referenceId: string;
  transactions: PayoutTransactionDTO[];
  category: PayoutCategory[];
  approvalState: string;
  createdAt: string; // ISO string
}

export interface PayoutResponseDTO {
  code: string; // e.g. "00"
  desc: string; // e.g. "Success"
  data: PayoutResponseDataDTO;
}

// ===== Wallet DTO =====
export interface WalletResponseDTO {
  _id: string;
  muaId: string;
  balance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}
