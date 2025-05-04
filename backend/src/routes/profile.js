import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getProfile, updateProfile } from '../controllers/profile.js';

const router = express.Router();

router.get('/', authenticate, getProfile);
router.patch('/', authenticate, updateProfile);

export default router;