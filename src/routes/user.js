import {Router} from 'express';
import { z } from 'zod';
import { createUser,readUser,showUser, updateUser} from '../services/user.js';

const router = Router();
// const zod = z();

router.post('/', createUser);
router.get('/',readUser)
router.get('/:id',showUser);
router.put('/:id',updateUser);




export default router;

