import { Router } from "express";
import { z } from "zod";
import { createCompany, readCompany, showCompany, updateCompany, deletCompany } from "../services/company.js";
import upload from "../middlewares/upload.js";
import { companyAuthMiddleware } from "../middlewares/companyAuth.js";

const router = Router();

router.post('/', authMiddleware, upload.single('logoFile'), createCompany);
router.get('/', readCompany);
router.get('/:id', showCompany);
router.put('/:id', authMiddleware, upload.single('logoFile'), updateCompany);
router.delete('/:id', authMiddleware, deletCompany);



//ai nenem

export default router;