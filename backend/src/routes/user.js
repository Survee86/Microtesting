/* для PostgreSQL */

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getCurrentUser, updateCurrentUser } from '../controllers/user.js';

const router = express.Router();

router.get('/', authenticate, getCurrentUser);
router.patch('/', authenticate, updateCurrentUser);

export default router;
