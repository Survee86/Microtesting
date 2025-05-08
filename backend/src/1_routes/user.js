import express from 'express';
import { authenticate } from '../2_middleware/auth.js';
import { getCurrentUser, updateCurrentUser } from '../3_controllers/user.js';

const router = express.Router();

router.get('/', authenticate, getCurrentUser);
router.patch('/', authenticate, updateCurrentUser);

export default router;
