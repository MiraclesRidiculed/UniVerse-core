import type { Request, Response } from 'express';
import { joinCommunity } from '../../controllers/community-controller';
import { requireAuth } from '../../middleware/auth';

export const name = 'communities/:id/join';

export async function post(req: Request, res: Response) {
	try {
		return requireAuth(req, res, () => joinCommunity(req, res));
	} catch (error: any) {
		return res.status(500).json({ error: error.message });
	}
}
