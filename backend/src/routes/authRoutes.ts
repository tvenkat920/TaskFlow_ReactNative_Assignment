import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validateMiddleware';
import { registerSchema, loginSchema } from '../validators/authValidators';

const router = Router();

// Rate limiting on sensitive auth routes: 20 requests per 15 minutes window (relaxed for automated tests)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 1000 : 20,
  message: {
    success: false,
    error: 'Too many authentication attempts from this IP, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, validateBody(registerSchema), AuthController.register);
router.post('/login', authLimiter, validateBody(loginSchema), AuthController.login);
router.get('/me', authenticate, AuthController.getMe);
router.post('/logout', AuthController.logout);

export default router;
