import { Router } from 'express';
import { z } from 'zod';
import { createProducts, readProducts, showProducts, editProducts, deleteProducts } from '../services/product.js';
import { authMiddleware } from "../middlewares/auth.js";

const router = Router();
// const zod = z();

router.post('/', authMiddleware, createProducts);
router.get('/', readProducts);
router.get('/:id', showProducts);
router.put('/:id', authMiddleware, editProducts);
router.delete('/:id', authMiddleware, deleteProducts);

export default router; 