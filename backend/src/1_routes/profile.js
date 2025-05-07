/* для MongoDB */

import express from 'express';
import { authenticate } from '../2_middleware/auth.js';
import { getProfile, updateProfile } from '../3_controllers/profile.js';

const router = express.Router();

router.get('/', authenticate, getProfile);
router.patch('/', authenticate, updateProfile);

export default router;
