import { Router } from "express";
import { createCompany, readCompany, showCompany, updateCompany, deletCompany } from "../services/company.js";
import upload from "../middlewares/upload.js";
import { authMiddleware } from "../middlewares/auth.js";
import { blockUserClient, requireOwnership, injectCompanyId } from "../middlewares/authorization.js";

const router = Router();

// ── Rotas públicas (leitura) ─────────────────────────────────────────────────
// authMiddleware opcional: se logado, injeta companyId para userOwner ver só a dele
router.get('/', authMiddleware, injectCompanyId, readCompany);
router.get('/:id', authMiddleware, injectCompanyId, showCompany);

// ── Rotas protegidas (escrita) ───────────────────────────────────────────────
// POST: admin e userOwner podem criar — userClient bloqueado
router.post('/', authMiddleware, blockUserClient, upload.single('logoFile'), createCompany);

// PUT/DELETE: admin passa livre — userOwner só na própria empresa — userClient bloqueado
router.put('/:id', authMiddleware, requireOwnership, upload.single('logoFile'), updateCompany);
router.delete('/:id', authMiddleware, requireOwnership, deletCompany);

export default router;
