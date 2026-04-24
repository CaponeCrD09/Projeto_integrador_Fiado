import { Router } from 'express';
import { z } from 'zod';
import { createUser, readUser, showUser, updateUser, deletando, loginUser } from '../services/user.js';
import { authMiddleware } from "../middlewares/auth.js";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// Middleware condicional: Pula a validação de token (authMiddleware) caso seja a primeira conta no banco
const checkFirstUser = async (req, res, next) => {
    try {
        const userCount = await prisma.user.count();
        if (userCount === 0) return next();
        return authMiddleware(req, res, next);
    } catch (e) {
        return res.status(500).json({ erro: "Erro ao verificar inicialização." });
    }
};

router.post('/login', loginUser);
router.post('/', checkFirstUser, createUser);
router.get('/', authMiddleware, readUser);
router.get('/:id', authMiddleware, showUser);
router.put('/:id', authMiddleware, updateUser);
router.delete('/:id', authMiddleware, deletando);


export default router;

