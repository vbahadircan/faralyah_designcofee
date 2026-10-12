import argon2 from 'argon2';
import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { loginInputSchema, type AdminSession } from '@faralyah/shared';
import { newCsrfToken } from '../../middleware/auth';
import { parseBody } from '../../lib/validate';
import { AdminUser } from '../../models/admin-user';

export const authRouter = Router();

/** Slows down password guessing: 10 failed attempts per IP every 15 minutes. */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'too_many_attempts' },
});

// Verifying against a throwaway hash when the email is unknown keeps the response time the
// same, so the login form can't be used to find out which emails have an account.
let dummyHash: Promise<string> | undefined;
function getDummyHash(): Promise<string> {
  dummyHash ??= argon2.hash('not-a-real-password');
  return dummyHash;
}

authRouter.post('/login', loginLimiter, async (req, res) => {
  // Login CSRF: browsers can't send a cross-site JSON body without a CORS preflight.
  if (!req.is('application/json')) {
    res.status(415).json({ error: 'json_required' });
    return;
  }
  const input = parseBody(loginInputSchema, req, res);
  if (!input) return;

  const user = await AdminUser.findOne({ email: input.email });
  const ok = await argon2.verify(user?.passwordHash ?? (await getDummyHash()), input.password);
  if (!user || !ok) {
    res.status(401).json({ error: 'invalid_credentials' });
    return;
  }

  // New session id on login prevents session fixation.
  await new Promise<void>((resolve, reject) =>
    req.session.regenerate((error) => (error ? reject(error) : resolve())),
  );
  req.session.adminId = user._id.toString();
  req.session.email = user.email;
  req.session.csrfToken = newCsrfToken();
  const body: AdminSession = {
    authenticated: true,
    email: user.email,
    csrfToken: req.session.csrfToken,
  };
  res.json(body);
});

authRouter.post('/logout', (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie('faralyah.sid');
    res.status(204).end();
  });
});

authRouter.get('/session', (req, res) => {
  res.set('Cache-Control', 'no-store');
  const { adminId, email, csrfToken } = req.session;
  const body: AdminSession =
    adminId && email && csrfToken
      ? { authenticated: true, email, csrfToken }
      : { authenticated: false };
  res.json(body);
});
