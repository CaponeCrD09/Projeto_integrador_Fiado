import { Router} from "express";
import { z } from "zod";
import { createPayment, readPayment } from "../services/payment.js";
const router = Router();

router.post('/', createPayment);
router.get("/", readPayment);
export default router; 