import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { RegisterDto, LoginDto, ChangePasswordDto } from '../dtos/auth.dto.js';

const router = Router();

router.post('/register', validate(RegisterDto), authController.register);
router.post('/login', validate(LoginDto), authController.login);
router.get('/me', authenticate, authController.me);
router.put('/change-password', authenticate, validate(ChangePasswordDto), authController.changePassword);

export default router;
