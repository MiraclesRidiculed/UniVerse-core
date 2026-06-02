import type { Request, Response } from 'express';
import { login, me, signup } from '../../controllers/auth-controller';
import { requireAuth } from '../../middleware/auth';

export const name = 'auth';

export async function post(req: Request, res: Response) {
	if (req.path.endsWith('/login')) return login(req, res);
	if (req.path.endsWith('/signup')) return signup(req, res);
	return res.status(404).json({ error: 'Auth endpoint not found' });
}

export async function get(req: Request, res: Response) {
	if (!req.path.endsWith('/me'))
		return res.status(404).json({ error: 'Auth endpoint not found' });

	return requireAuth(req, res, () => me(req, res));
}
