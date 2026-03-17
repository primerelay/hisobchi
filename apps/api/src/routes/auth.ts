import { Router } from 'express';
import { loginSchema, superAdminLoginSchema, changePasswordSchema } from '@repo/validation';
import { validateBody, authenticate, loadUser } from '../middleware';
import { loginUser, loginSuperAdmin, changePassword } from '../services';

const router = Router();

// POST /api/v1/auth/login
router.post('/login', validateBody(loginSchema), async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    const result = await loginUser(phone, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/auth/super-admin/login
router.post('/super-admin/login', validateBody(superAdminLoginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await loginSuperAdmin(email, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/auth/me
router.get('/me', authenticate, loadUser, async (req, res) => {
  res.json({ user: req.user });
});

// POST /api/v1/auth/change-password
router.post(
  '/change-password',
  authenticate,
  validateBody(changePasswordSchema),
  async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;
      await changePassword(req.user!.id, currentPassword, newPassword);
      res.json({ success: true, message: 'Parol muvaffaqiyatli o\'zgartirildi' });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/auth/logout
router.post('/logout', authenticate, (req, res) => {
  // JWT is stateless, so we just return success
  // Client should remove the token
  res.json({ success: true });
});

export default router;
