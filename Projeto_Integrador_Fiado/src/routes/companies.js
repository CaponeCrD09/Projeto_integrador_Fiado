import { Router } from "express";
import { z } from "zod";
import { createCompany } from "services/company";
const router = Router();

router.post('/create', createCompany);
