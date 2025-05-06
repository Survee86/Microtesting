import express from 'express';
import { register, login } from '../controllers/auth.js';
import { checkMongo } from '../middleware/checkMongo.js';
import jwt from 'jsonwebtoken';
import { refreshToken } from '../controllers/auth.js';


const router = express.Router();

router.post('/refresh',     refreshToken);
router.post('/register',    checkMongo, register);
router.post('/login',       checkMongo, login);

export default router;