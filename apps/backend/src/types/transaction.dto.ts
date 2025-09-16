import type { PaymentMethod, TransactionStatus } from "constants/index";

export interface CreateTransactionDTO {
  bookingId: string;
  customerId: string;
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
    amount: number;
    currency: string;
    status: TransactionStatus;
    paymentMethod: PaymentMethod;
    paymentReference: string;
    createdAt: Date;
    updatedAt: Date;
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