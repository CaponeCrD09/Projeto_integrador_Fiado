import { Router } from "express";
import { z } from "zod";
import { createCompany , readCompany , showCompany, updateCompany,deletCompany} from "../services/company.js";
import upload from "../middlewares/upload.js";

const router = Router();

router.post('/',      upload.single('logoFile'), createCompany);
router.get('/',       readCompany);
router.get('/:id',    showCompany);
router.put('/:id',    upload.single('logoFile'), updateCompany);
router.delete('/:id', deletCompany);


//ai nenem

export default router;