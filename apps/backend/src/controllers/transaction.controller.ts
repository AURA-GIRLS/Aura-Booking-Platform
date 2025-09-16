import type { Request, Response } from "express";
import type { ApiResponseDTO } from "types";
import { createPayOSPaymentLink } from "../services/transaction.service";
import type { PayOSCreateLinkInput } from "types/transaction.dto";
export class TransactionController {
  // Create a new transaction
  async createTransactionLink(req: Request, res: Response): Promise<void> {
    try {
      const { amount, description, returnUrl, cancelUrl, orderCode } = req.body as PayOSCreateLinkInput;

      if (
        amount === undefined ||
        amount === null ||
        Number.isNaN(Number(amount)) ||
        !description ||
        !returnUrl ||
        !cancelUrl
      ) {
        const response: ApiResponseDTO = {
          status: 400,
          success: false,
          message: "Missing or invalid fields: amount, description, returnUrl, cancelUrl"
        };
        res.status(400).json(response);
        return;
      }

      const data = await createPayOSPaymentLink({
        amount: Number(amount),
        description,
        returnUrl,
        cancelUrl,
        orderCode: orderCode !== undefined ? Number(orderCode) : undefined,
      });

      const response: ApiResponseDTO = {
        status: 201,
        success: true,
        message: "Payment link created successfully",
        data: {
          checkoutUrl: data.checkoutUrl,
          orderCode: data.orderCode,
          signature: data.signature,
        }
      };
      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponseDTO = {
        status: 500,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create payment link'
      };
      res.status(500).json(response);
    }
  }
  async webhookHandler(req: Request, res: Response): Promise<void> {
    try {
        //create transaction type HOLD
      // Webhook handling placeholder (verification and status processing to be implemented)
      const response: ApiResponseDTO = {
        status: 200,
        success: true,
        message: 'Webhook received successfully'
      };
      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponseDTO = {
        status: 500,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to handle webhook'
      };
      res.status(500).json(response);
    }
  }
 //confirm  -> capture payment (add money to mua virtual wallet)
 // cancel -> refund payment (transfer real money, user request, admin refund, user confirm refund done)
}