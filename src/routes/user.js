import {Router} from 'express';
import { z } from 'zod';
import { createUser, readUser, showUser, updateUser, deletando, loginUser } from '../services/user.js';

const router = Router();
// const zod = z();

router.post('/login', loginUser);
router.post('/', createUser);
router.get('/',readUser)
router.get('/:id',showUser);
router.put('/:id',updateUser);
router.delete('/:id',deletando)




export default router;

