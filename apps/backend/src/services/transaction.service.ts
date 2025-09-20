import { BankAccount, Transaction, Wallet } from "models/transactions.model";
import type { CreateTransactionDTO, UpdateTransactionDTO, TransactionResponseDTO, PayOSCreateLinkInput, PayOSCreateLinkResult, PaymentWebhookResponse, PayoutInput, PayoutResponseDTO } from "types/transaction.dto";
import { config } from "config";
import { createPayOSSignedHttp, payosHttp } from "utils/payosHttp";
import crypto from "crypto";
import { createBooking, deleteRedisPendingBooking, getBookingById, getRedisPendingBooking } from "./booking.service";
import { PAYMENT_METHODS,PAYOUT_CATEGORIES,TRANSACTION_STATUS, type TransactionStatus } from "constants/index";
import type { BookingResponseDTO } from "types";
import type { CreateBookingDTO, PendingBookingResponseDTO } from "types/booking.dtos";
import mongoose from "mongoose";

// UTIL - map mongoose doc to DTO
function formatTransactionResponse(tx: any): TransactionResponseDTO {
  return {
    _id: String(tx._id),
    bookingId: tx.bookingId ? String(tx.bookingId) : "",
    customerId: tx.customerId ? String(tx.customerId) : "",
    amount: typeof tx.amount === "number" ? tx.amount : 0,
    currency: tx.currency || "",
    status: tx.status || 'HOLD',
    paymentMethod: tx.paymentMethod,
    paymentReference: tx.paymentReference || "",
    createdAt: tx.createdAt || new Date(),
    updatedAt: tx.updatedAt || tx.createdAt || new Date(),
  };
}

// CREATE
export async function getCreateTransactionDTO(bookingData: BookingResponseDTO,amount:number,paymentReference:string,currency:string,status:TransactionStatus): Promise<CreateTransactionDTO> {
  try {
    return {
      bookingId: bookingData._id,
      customerId: bookingData?.customerId || '',
      amount: amount,
      currency,
      status,
      paymentMethod: PAYMENT_METHODS.BANK_TRANSFER,
      paymentReference,
    };
  } catch (error) {
    throw new Error(`Failed to create transaction: ${error}`);
  }
}
export async function createTransaction(data: CreateTransactionDTO): Promise<TransactionResponseDTO> {
  try {
    const tx = await Transaction.create({
      bookingId: data.bookingId,
      customerId: data.customerId,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      paymentMethod: data.paymentMethod,
      paymentReference: data.paymentReference,
    });
    return formatTransactionResponse(tx);
  } catch (error) {
    throw new Error(`Failed to create transaction: ${error}`);
  }
}

// ==================== PayOS Payment Link ====================

export function generateOrderCode(): number {
  const random = crypto.randomInt(100000, 999999); // random 6 số
  return random;
}

function createPayOSPaymentSignature({ amount, cancelUrl, description, orderCode, returnUrl }: Required<Omit<PayOSCreateLinkInput, 'orderCode'>> & { orderCode: number }): string {
  // Alphabetical concatenation required by PayOS
  const dataString = `amount=${amount}&cancelUrl=${cancelUrl}&description=${description}&orderCode=${orderCode}&returnUrl=${returnUrl}`;
  const hmac = crypto.createHmac("sha256", config.payosChecksumKey);
  hmac.update(dataString);
  return hmac.digest("hex");
}
function createPayOSOutSignature({
  amount,
  category,
  description,
  referenceId,
  toAccountNumber,
  toBin,
}: Required<PayoutInput>): string {
  // Alphabetical concatenation required by PayOS
  const dataString = `amount=${amount}&category=${Array.isArray(category) ? category.join(",") : category}&description=${description}&referenceId=${referenceId}&toAccountNumber=${toAccountNumber}&toBin=${toBin}`;
  
  const hmac = crypto.createHmac("sha256", config.payosChecksumKey);
  hmac.update(dataString);
  return hmac.digest("hex");
}

export async function createPayOSPaymentLink(input: PayOSCreateLinkInput): Promise<PayOSCreateLinkResult> {
    if (!config.payosClientId || !config.payosApiKey || !config.payosChecksumKey) {
      throw new Error("Missing PayOS credentials (clientId/apiKey/checksumKey)");
    }
    // Generate a simple 6-digit order code (similar to PayOS sample). Allow override via input.
    const orderCode = input.orderCode || generateOrderCode();
    const signature = createPayOSPaymentSignature({
      amount: input.amount,
      cancelUrl: input.cancelUrl,
      description: input.description,
      orderCode,
      returnUrl: input.returnUrl,
    });

    const payload = {
      orderCode,
      amount: input.amount,
      description: input.description,
      returnUrl: input.returnUrl,
      cancelUrl: input.cancelUrl,
      signature,
    };

    const response = await payosHttp.post("/v2/payment-requests", payload);
    const checkoutUrl = (response.data && (response.data.checkoutUrl || response.data.data?.checkoutUrl)) || "";
    return { checkoutUrl, orderCode, signature, raw: response.data };
  
}
export async function makeRefund(bookingId:string ): Promise<PayoutResponseDTO> {
   if (!config.payosClientId || !config.payosApiKey || !config.payosChecksumKey) {
      throw new Error("Missing PayOS credentials (clientId/apiKey/checksumKey)");
    }
    const bookingData = await getBookingById(bookingId);
    if(!bookingData){
      throw new Error(`Booking with ID ${bookingId} not found.`);
    }
    const bankAccount = await BankAccount.findOne({ userId: bookingData.customerId }).exec();
    const transaction = await Transaction.findOne({ bookingId: bookingId }).exec();
    if(!transaction){
      throw new Error(`Transaction with bookingId ${bookingId} not found.`);
    }
    const payload: PayoutInput = {
      referenceId: transaction.paymentReference || '',
      amount: transaction.amount || 0,
      description: `Refund for booking ${bookingId}`,
      toBin: bankAccount?.bankBin || '',
      toAccountNumber: bankAccount?.accountNumber || '',
      category: [PAYOUT_CATEGORIES.REFUND]
    };

    console.info("makePayout called", {payload});
    const signedHttp = createPayOSSignedHttp(
      crypto.randomUUID(),
      createPayOSOutSignature({ ...payload })
    );
    const response = await signedHttp.post("/v1/payouts", payload);
    console.info("makePayout response", {responseData: response.data});
    return response.data;
}

export async function handlePayOSWebhook(data: PaymentWebhookResponse): Promise<TransactionResponseDTO | null> {
  // tìm booking và tạo booking
  const pb = await getRedisPendingBooking(data?.data?.orderCode);
  if(!pb){
    console.warn(`Pending booking with orderCode ${data?.data?.orderCode} not found. Possibly user cancelled.`);
    return null;
  }
  const b = mapPendingBookingToCreate(pb);
  const bookingData = await createBooking(b);
  if(bookingData){
     await deleteRedisPendingBooking(data?.data?.orderCode);
    }
  // check transaction đã tồn tại
  const existingTransaction = await Transaction.findOne({ bookingId:bookingData._id }).exec();
  if (existingTransaction) {
    console.log(`Transaction with reference ${data.data.reference} already exists. Skipping creation.`);
    return formatTransactionResponse(existingTransaction);
  }

  // tạo transaction HOLD
  const input = await getCreateTransactionDTO(
    bookingData,
    data.data.amount,
    data.data.reference,
    "VND",
    TRANSACTION_STATUS.HOLD
  );
  return await createTransaction(input);
}

// ==================== MAPPERS ====================
function mapPendingBookingToCreate(pb: PendingBookingResponseDTO): CreateBookingDTO {
  // Combine bookingDate (YYYY-MM-DD) and startTime (HH:mm) into a Date
  const bookingDate = new Date(`${pb.bookingDate}T${pb.startTime}:00`);
  return {
    customerId: pb.customerId,
    serviceId: pb.serviceId,
    muaId: pb.artistId,
    bookingDate,
    customerPhone: pb.customerPhone,
    duration: pb.duration,
    locationType: pb.locationType,
    address: pb.address,
    transportFee: pb.transportFee,
    totalPrice: pb.totalPrice,
    payed: pb.payed ?? false,
    note: pb.note,
  };
}
export async function handleBalanceConfirmBooking(bookingId:string):Promise<void>{
//update wallet
//update transaction
const bookingData = await getBookingById(bookingId);  
const muaWallet = await Wallet.findById(bookingData?.artistId).exec();

const transaction = await Transaction.findOne({ bookingId: bookingId }).exec();
if(transaction && transaction.status===TRANSACTION_STATUS.HOLD && muaWallet){
  muaWallet.balance += transaction.amount??0;
  await muaWallet.save();
  transaction.status = TRANSACTION_STATUS.CAPTURED;
  await transaction.save();
}
}
export async function handleRefundBooking(bookingId:string):Promise<void>{
//payout(tim customer, lay bank account tu user)
//update transaction
 const payoutRes = await makeRefund(bookingId);
 const transaction = await Transaction.findOne({ bookingId: bookingId }).exec();
 if(transaction){
  transaction.status = TRANSACTION_STATUS.REFUNDED;
  await transaction.save();
 }
}
// READ - by id
export async function getTransactionById(id: string): Promise<TransactionResponseDTO | null> {
  try {
    const tx = await Transaction.findById(id).exec();
    return tx ? formatTransactionResponse(tx) : null;
  } catch (error) {
    throw new Error(`Failed to get transaction: ${error}`);
  }
}

// READ - list with pagination and optional filters
export async function getTransactions(
  page: number = 1,
  pageSize: number = 10,
  filters?: { customerId?: string; bookingId?: string; status?: 'HOLD' | 'CAPTURED' | 'REFUNDED' }
): Promise<{ transactions: TransactionResponseDTO[]; total: number; page: number; totalPages: number }> {
  try {
    const skip = (page - 1) * pageSize;
    const query: any = {};
    if (filters?.customerId) query.customerId = filters.customerId;
    if (filters?.bookingId) query.bookingId = filters.bookingId;
    if (filters?.status) query.status = filters.status;

    const [docs, total] = await Promise.all([
      Transaction.find(query).skip(skip).limit(pageSize).sort({ createdAt: -1 }).exec(),
      Transaction.countDocuments(query),
    ]);

    return {
      transactions: docs.map(formatTransactionResponse),
      total,
      page,
      totalPages: Math.ceil(total / pageSize),
    };
  } catch (error) {
    throw new Error(`Failed to get transactions: ${error}`);
  }
}

// UPDATE
export async function updateTransaction(id: string, data: UpdateTransactionDTO): Promise<TransactionResponseDTO | null> {
  try {
    const tx = await Transaction.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).exec();
    return tx ? formatTransactionResponse(tx) : null;
  } catch (error) {
    throw new Error(`Failed to update transaction: ${error}`);
  }
}

// DELETE
export async function deleteTransaction(id: string): Promise<boolean> {
  try {
    const res = await Transaction.findByIdAndDelete(id).exec();
    return !!res;
  } catch (error) {
    throw new Error(`Failed to delete transaction: ${error}`);
  }
}



















