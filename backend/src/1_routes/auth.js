import express from 'express';
import { register, login } from '../3_controllers/auth.js';
import { checkMongo } from '../2_middleware/checkMongo.js';
import jwt from 'jsonwebtoken';
import { refreshToken } from '../3_controllers/auth.js';

const router = express.Router();

router.post('/refresh', refreshToken);
router.post('/register', checkMongo, register);
router.post('/login', checkMongo, login);

export default router;
