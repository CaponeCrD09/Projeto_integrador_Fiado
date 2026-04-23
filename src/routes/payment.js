import { Router } from "express";
import { createPayment, readPayment, showPayment, updatePayment, deletePayment } from "../services/payment.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = Router();

router.post('/', authMiddleware, createPayment);
router.get("/", authMiddleware, readPayment);
router.get("/:id", authMiddleware, showPayment);
router.put("/:id", authMiddleware, updatePayment);
router.delete("/:id", authMiddleware, deletePayment);

export default router; 