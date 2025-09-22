import { BankAccount, Transaction, Wallet } from "models/transactions.model";
import type { CreateTransactionDTO, UpdateTransactionDTO, TransactionResponseDTO, PayOSCreateLinkInput, PayOSCreateLinkResult, PaymentWebhookResponse, PayoutInput, PayoutResponseDTO, WalletResponseDTO } from "types/transaction.dto";
import { config } from "config";
import { createPayOSSignedHttp, payosHttp } from "utils/payosHttp";
import crypto from "crypto";
import { createBooking, deleteRedisPendingBooking, getBookingById, getRedisPendingBooking } from "./booking.service";
import { PAYMENT_METHODS,PAYOUT_CATEGORIES,TRANSACTION_STATUS, type TransactionStatus } from "constants/index";
import type { BookingResponseDTO } from "types";
import type { CreateBookingDTO, PendingBookingResponseDTO } from "types/booking.dtos";
import mongoose from "mongoose";
import { ServicePackage } from "@models/services.models";
import { User } from "@models/users.models";
import { fromUTC } from "utils/timeUtils";

// UTIL - map mongoose doc to DTO
async function formatTransactionResponse(tx: any): Promise<TransactionResponseDTO> {
  // Attempt to extract friendly names from joined docs when available
  const booking = tx.booking || tx._booking; // support potential aliases
  const serviceId = booking.serviceId;
  const service = await ServicePackage.findById(serviceId).exec();
  const serviceName = service?.name;
  const customer = await User.findById(tx.customerId).select("fullName");
  const customerName = customer?.fullName;
  //
  const startDate: Date | null = booking?.bookingDate ? new Date(booking.bookingDate) : null;
  const durationMinutes: number = typeof booking?.duration === 'number' ? booking.duration : 0;
  const endDate: Date | null = startDate ? new Date(startDate.getTime() + durationMinutes * 60000) : null;
  const fmtTime = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  const bookingTime = startDate && endDate ? `${fmtTime(startDate)} - ${fmtTime(endDate)}` : "";
  const bookingDate = fromUTC(startDate!).format("YYYY-MM-DD"); // DD/MM/YYYY
  return {
    _id: String(tx._id),
    bookingId: tx.bookingId ? String(tx.bookingId) : "",
    customerId: tx.customerId ? String(tx.customerId) : "",
    amount: typeof tx.amount === "number" ? tx.amount : 0,
    currency: tx.currency || "",
    status: tx.status || 'HOLD',
    paymentMethod: tx.paymentMethod,
   bookingDate,
    // extra friendly fields expected by DTO
    serviceName,
    customerName,
    bookingTime,
  } as TransactionResponseDTO;
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
 await makeRefund(bookingId);
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
      transactions: await Promise.all(docs.map(formatTransactionResponse)),
      total,
      page,
      totalPages: Math.ceil(total / pageSize),
    };
  } catch (error) {
    throw new Error(`Failed to get transactions: ${error}`);
  }
}

export async function getMUAWallet(muaId: string): Promise<WalletResponseDTO | null> {
  try {
    const wallet = await Wallet.findOne({ muaId }).exec();
    if (!wallet) return null;
    return {
      _id: String(wallet._id),
      muaId: wallet.muaId.toString(),
      balance: wallet.balance,
      currency: wallet.currency,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    };
  } catch (error) {
    throw new Error(`Failed to get MUA wallet: ${error}`);
  }
}
// READ - list by booking.muaId with optional status and pagination
export async function getTransactionsByMuaId(
  muaId: string,
  page: number = 1,
  pageSize: number = 10,
  status?: 'HOLD' | 'CAPTURED' | 'REFUNDED'
): Promise<{ transactions: TransactionResponseDTO[]; total: number; page: number; totalPages: number }>{
  try {
    const matchStage: any = {};
    if (status) matchStage.status = status;

    const pipeline: any[] = [
      // Optional status filter at transaction level first
      Object.keys(matchStage).length ? { $match: matchStage } : null,
      // Join Booking to filter by muaId
      { $lookup: { from: 'bookings', localField: 'bookingId', foreignField: '_id', as: 'booking' } },
      { $unwind: '$booking' },
      { $match: { 'booking.muaId': new mongoose.Types.ObjectId(muaId) } },
      // Join Service via booking.serviceId
      { $lookup: { from: 'services', localField: 'booking.serviceId', foreignField: '_id', as: 'service' } },
      { $unwind: { path: '$service', preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
      // Facet for pagination + total count
      {
        $facet: {
          docs: [
            { $skip: (page - 1) * pageSize },
            { $limit: pageSize }
          ],
          count: [ { $count: 'total' } ]
        }
      }
    ].filter(Boolean);

    const aggRes = await (Transaction as any).aggregate(pipeline);
    const facet = aggRes[0] || { docs: [], count: [] };
    const total = facet.count[0]?.total || 0;
    // Note: formatTransactionResponse maps only transaction fields.
    // If you need booking/service fields in the response, extend the DTO and mapper accordingly.
    const transactions = await Promise.all((facet.docs || []).map(formatTransactionResponse));
    return { transactions, total, page, totalPages: Math.ceil(total / pageSize) };
  } catch (error) {
    throw new Error(`Failed to get transactions by muaId: ${error}`);
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



















