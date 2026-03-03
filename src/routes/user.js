import {Router} from 'express';
import { z } from 'zod';
import { createUser,readUser} from '../services/user.js';

const router = Router();
// const zod = z();

router.post('/', createUser);
router.get('/',readUser)



router.get("/", readPayment)

export default router;

