import { Router } from "express";
import { z } from "zod";
import { createPayment } from "services/company";
const router = Router();

router.post('/create', createPayment);
