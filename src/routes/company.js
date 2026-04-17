import { Router } from "express";
import { z } from "zod";
import { createCompany, readCompany, showCompany, updateCompany, deletCompany } from "../services/company.js";
import upload from "../middlewares/upload.js";
import { authMiddleware } from "../middlewares/auth.js";
import { authorizeUserType } from "../middlewares/authorization.js";

const router = Router();

// Rotas públicas (leitura)
router.get('/', readCompany);
router.get('/:id', showCompany);

// Rotas protegidas (autenticação + autorização por tipo de usuário)
// Para permitir múltiplos tipos: authorizeUserType('admin', 'userowner')
router.post('/', authMiddleware, authorizeUserType('userClient', 'userOwner'), upload.single('logoFile'), createCompany);
router.put('/:id', authMiddleware, authorizeUserType('userClient', 'userOwner'), upload.single('logoFile'), updateCompany);
router.delete('/:id', authMiddleware, authorizeUserType('userClient', 'userOwner'), deletCompany);

export default router;