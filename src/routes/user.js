import { Router } from 'express';
import { z } from 'zod';
import { createUser, readUser, showUser, updateUser, deletando, loginUser } from '../services/user.js';

import { authMiddleware } from "../middlewares/auth.js";
const router = Router();
// const zod = z();

router.post('/login', loginUser);
router.post('/', authMiddleware, createUser);
router.get('/', authMiddleware, readUser)
router.get('/:id', authMiddleware, showUser);
router.put('/:id', authMiddleware, updateUser);
router.delete('/:id', authMiddleware, deletando)




export default router;

