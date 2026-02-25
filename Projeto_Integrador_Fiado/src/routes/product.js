import { Router} from "express";
import {z} from 'zod';
import {CreateProducts} from '../services/product.js';

const router = Router();

router.post('/', CreateProducts);

export default router;