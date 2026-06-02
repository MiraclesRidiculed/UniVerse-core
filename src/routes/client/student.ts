import type { Request, Response } from 'express';
import { getProfile, updateProfile } from '../../controllers/student-controller';
import { requireAuth } from '../../middleware/auth';

export const name = 'students/:id';

export async function get(req: Request, res: Response) {
	try {
		if (req.params.id === 'me')
			return requireAuth(req, res, () => getProfile(req, res));
		return getProfile(req, res);
	} catch (error: any) {
		return res.status(500).json({ error: error.message });
	}
}

export async function patch(req: Request, res: Response) {
	try {
		return requireAuth(req, res, () => updateProfile(req, res));
	} catch (error: any) {
		return res.status(500).json({ error: error.message });
	}
}
