import { Router } from "express";
import { createCompany, readCompany, showCompany, updateCompany, deletCompany } from "../services/company.js";
import upload from "../middlewares/upload.js";
import { authMiddleware } from "../middlewares/auth.js";
import { blockUserClient, requireOwnership, injectCompanyId, authorizeUserType } from "../middlewares/authorization.js";

const router = Router();

// ── Rotas públicas (leitura) ─────────────────────────────────────────────────
router.get('/', readCompany);
router.get('/:id', showCompany);

// ── Rotas protegidas (escrita) ───────────────────────────────────────────────
router.post('/', authMiddleware, authorizeUserType('userOwner', 'admin'), upload.single('logoFile'), createCompany);
router.put('/:id', authMiddleware, requireOwnership, upload.single('logoFile'), updateCompany);
router.delete('/:id', authMiddleware, requireOwnership, deletCompany);

export default router;
