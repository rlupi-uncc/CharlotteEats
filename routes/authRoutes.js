import express from 'express';
import { signUpHandler, logInHandler } from '../controllers/authController.js';
import { validateUser } from '../middleware/userValidators.js';
const router = express.Router();

router.post('/register', validateUser, signUpHandler);
router.post('/login', validateUser, logInHandler);

export default router;