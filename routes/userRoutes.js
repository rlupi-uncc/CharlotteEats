import express from 'express';
import { getCurrentUserHandler, updateCurrentUserHandler, deleteCurrentUserHandler } from '../controllers/userController.js';
import { authenticate } from '../middleware/authenticate.js';
import { validateUpdateUser } from '../middleware/userValidators.js';
const router = express.Router();

router.get('/me', authenticate, getCurrentUserHandler);
router.put('/me', authenticate, validateUpdateUser, updateCurrentUserHandler);
router.delete('/me', authenticate, deleteCurrentUserHandler);

export default router;
