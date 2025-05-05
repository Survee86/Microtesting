import express from 'express';
import { register, login } from '../controllers/auth.js';
import { checkMongo } from '../middleware/checkMongo.js';

const router = express.Router();

router.post('/register',    checkMongo, register);
router.post('/login',       checkMongo, login);

export default router;