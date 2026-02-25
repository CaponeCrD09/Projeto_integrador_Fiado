import {Router} from 'express';
import { z } from 'zod';
import { createUser } from '../services/user.js';

const router = Router();
// const zod = z();

router.post('/', createUser);
export default router;

