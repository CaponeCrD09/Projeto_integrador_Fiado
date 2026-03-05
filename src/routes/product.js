import {Router} from 'express';
import { z } from 'zod';
import { createProducts,readProducts,showProducts} from '../services/product.js';

const router = Router();
// const zod = z();

router.post('/', createProducts);
router.get('/',readProducts)
router.get('/:id',showProducts);


export default router;