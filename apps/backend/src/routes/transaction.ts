import { Router } from "express";
import { TransactionController } from "@controllers/transaction.controller";

const router = Router();
const ctrl = new TransactionController();

// Create PayOS payment link
router.post("/payment-link", (req, res) => ctrl.createTransactionLink(req, res));

// PayOS webhook endpoint
router.post("/webhook", (req, res) => ctrl.webhookHandler(req, res));

//Payout
router.post("/refund/:bookingId", (req, res) => ctrl.makeRefund(req, res));

// Get transactions by MUA ID with optional pagination and status filtering
router.get("/mua/:muaId", (req, res) => ctrl.fetchTransactionsByMuaId(req, res));
//mua wallet
router.get("/wallet/:muaId", (req, res) => ctrl.fetchWalletByMuaId(req, res));
export default router;
