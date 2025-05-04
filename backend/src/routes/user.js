

/* для PostgreSQL */

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getCurrentUser, updateCurrentUser } from '../controllers/user.js';

const router = express.Router();

// Явно обрабатываем OPTIONS для PATCH
router.options('/', (req, res) => {
    res.header('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
    res.status(204).header('Content-Length', '0').end();
});

router.get('/', authenticate, getCurrentUser);
router.patch('/', authenticate, updateCurrentUser);

export default router;