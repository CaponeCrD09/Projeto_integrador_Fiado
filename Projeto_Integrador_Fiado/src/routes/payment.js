import { Router} from "express";
import { z } from "zod";
import { createPayment } from "../services/payment.js";
const router = Router();

router.post('/', createPayment);
export default router;