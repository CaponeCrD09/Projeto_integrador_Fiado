import { Router } from "express";
import { z } from "zod";
import { createPayment } from "services/company.js";
const router = Router();

router.post('/', createPayment);
export default router;