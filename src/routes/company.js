import { Router } from "express";
import { z } from "zod";
import { createCompany , readCompany , showCompany} from "../services/company.js";
const router = Router();

router.post('/', createCompany);
router.get("/", readCompany);
router.get("/:id", showCompany);

export default router;