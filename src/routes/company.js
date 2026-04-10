import { Router } from "express";
import { z } from "zod";
import { createCompany , readCompany , showCompany, updateCompany,deletCompany} from "../services/company.js";
import upload from "../middlewares/upload.js";
import { companyAuthMiddleware } from "../middlewares/companyAuth.js";

const router = Router();

router.post('/',      upload.single('logoFile'), createCompany);
router.get('/',       companyAuthMiddleware, readCompany);
router.get('/:id',    companyAuthMiddleware, showCompany);
router.put('/:id',    companyAuthMiddleware, upload.single('logoFile'), updateCompany);
router.delete('/:id', companyAuthMiddleware, deletCompany);


//ai nenem

export default router;