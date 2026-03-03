import {Router} from 'express';
import { z } from 'zod';
import { createUser, readPayment } from '../services/user.js';

const router = Router();
// const zod = z();

router.post('/', createUser);



router.get("/", readPayment)

export default router;

