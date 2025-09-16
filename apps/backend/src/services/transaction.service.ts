import { Transaction } from "models/transactions.model";
import type { CreateTransactionDTO, UpdateTransactionDTO, TransactionResponseDTO, PayOSCreateLinkInput, PayOSCreateLinkResult } from "types/transaction.dto";
import { config } from "config";
import axios from "axios";
import crypto from "crypto";

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
export async function createTransaction(data: CreateTransactionDTO): Promise<TransactionResponseDTO> {
  try {
    const tx = await Transaction.create({
      bookingId: data.bookingId,
      customerId: data.customerId,
      amount: data.amount,
      currency: data.currency,
      // default status = HOLD from schema
      paymentMethod: data.paymentMethod,
      paymentReference: data.paymentReference,
    });
    return formatTransactionResponse(tx);
  } catch (error) {
    throw new Error(`Failed to create transaction: ${error}`);
  }
}

// ==================== PayOS Payment Link ====================



function createPayOSSignature({ amount, cancelUrl, description, orderCode, returnUrl }: Required<Omit<PayOSCreateLinkInput, 'orderCode'>> & { orderCode: number }): string {
  // Alphabetical concatenation required by PayOS
  const dataString = `amount=${amount}&cancelUrl=${cancelUrl}&description=${description}&orderCode=${orderCode}&returnUrl=${returnUrl}`;
  const hmac = crypto.createHmac("sha256", config.payosChecksumKey);
  hmac.update(dataString);
  return hmac.digest("hex");
}

export async function createPayOSPaymentLink(input: PayOSCreateLinkInput): Promise<PayOSCreateLinkResult> {
    if (!config.payosClientId || !config.payosApiKey || !config.payosChecksumKey) {
      throw new Error("Missing PayOS credentials (clientId/apiKey/checksumKey)");
    }
    const orderCode = input.orderCode ?? Date.now();
    const signature = createPayOSSignature({
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

    const apiUrl = config.payosApiUrl + "/v2/payment-requests";
    const response = await axios.post(apiUrl, payload, {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.payosApiKey,
        "x-client-id": config.payosClientId,
      }
    });
    const checkoutUrl = (response.data && (response.data.checkoutUrl || response.data.data?.checkoutUrl)) || "";
    return { checkoutUrl, orderCode, signature, raw: response.data };
  
}

// Convenience: create transaction and payment link together
// export async function createTransactionWithPaymentLink(
//   txData: CreateTransactionDTO,
//   urls: { returnUrl: string; cancelUrl: string; description?: string }
// ): Promise<{ transaction: TransactionResponseDTO; checkoutUrl: string; orderCode: number; signature: string }>{
//   const transaction = await createTransaction(txData);
//   const description = urls.description || `Payment for booking ${transaction.bookingId}`;
//   const link = await createPayOSPaymentLink({
//     amount: transaction.amount,
//     description,
//     returnUrl: urls.returnUrl,
//     cancelUrl: urls.cancelUrl,
//   });
//   return { transaction, checkoutUrl: link.checkoutUrl, orderCode: link.orderCode, signature: link.signature };
// }

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