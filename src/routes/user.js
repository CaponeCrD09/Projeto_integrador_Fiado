import {Router} from 'express';
import { z } from 'zod';
<<<<<<< HEAD
import { createUser,readUser} from '../services/user.js';
=======
import { createUser, readPayment } from '../services/user.js';
>>>>>>> 7da6d7728f6d978276bc56cfaea8e7e803c8b9dc

const router = Router();
// const zod = z();

router.post('/', createUser);
<<<<<<< HEAD
router.get('/',readUser)
=======



router.get("/", readPayment)
>>>>>>> 7da6d7728f6d978276bc56cfaea8e7e803c8b9dc

export default router;

