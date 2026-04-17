import { Router } from "express";
import { z } from "zod";
import { createPayment, readPayment, showPayment, updatePayment, deletePayment } from "../services/payment.js";
import { authMiddleware } from "../middlewares/auth.js";
const router = Router();

router.post('/', createPayment);
router.get("/", readPayment);
router.get("/:id", showPayment);
router.put("/:id", updatePayment);
router.put("/:id", updatePayment);
router.delete("/:id", deletePayment);
export default router; 