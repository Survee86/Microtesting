import express from 'express';
import { authenticate } from '../../2_middleware/auth.js';
import { getCurrentUser } from '../../3_controllers/User_controllers/user.js';
import { validateUpdateForm } from '../../2_middleware/user_mid/validateUpdForm.js';
import { mongoHealthMiddleware } from '../../2_middleware/checkMongo.js';
import { updateUserProfile } from '../../3_controllers/User_controllers/user.js';

const router = express.Router();

router.get('/', authenticate, getCurrentUser);
router.patch(
  '/',
  authenticate,
  mongoHealthMiddleware,
  validateUpdateForm,
  updateUserProfile
);
/* router.patch('/', authenticate, updateCurrentUser); */

export default router;
