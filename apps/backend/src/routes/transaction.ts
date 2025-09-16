import { Router } from "express";
import { TransactionController } from "@controllers/transaction.controller";

const router = Router();
const ctrl = new TransactionController();

// Create PayOS payment link
router.post("/payment-link", (req, res) => ctrl.createTransactionLink(req, res));

// PayOS webhook endpoint
router.post("/webhook", (req, res) => ctrl.webhookHandler(req, res));

export default router;
