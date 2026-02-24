import { Router} from "express";
import {z} from 'zod';
import {CreateProducts} from '../services/products';

const router = Router();

router.post('/');