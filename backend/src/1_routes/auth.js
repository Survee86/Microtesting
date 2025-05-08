import express from 'express';
import { register, login } from '../3_controllers/auth.js';
import { mongoHealthMiddleware } from '../2_middleware/checkMongo.js';
import { refreshToken } from '../3_controllers/auth.js';

const router = express.Router();


router.post('/register',    mongoHealthMiddleware, register);
router.post('/login',       mongoHealthMiddleware, login);
router.post('/refresh',     refreshToken);

export default router;
