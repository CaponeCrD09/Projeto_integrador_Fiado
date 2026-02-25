import { Router } from "express";
import { z } from "zod";
import { createCompany } from "../services/company.js";
const router = Router();

router.post('/', createCompany);
export default router;