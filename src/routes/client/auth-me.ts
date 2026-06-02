import type { Request, Response } from 'express';
import { me } from '../../controllers/auth-controller';
import { requireAuth } from '../../middleware/auth';

export const name = 'auth/me';

export async function get(req: Request, res: Response) {
	return requireAuth(req, res, () => me(req, res));
}
