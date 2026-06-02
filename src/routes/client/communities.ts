import type { Request, Response } from 'express';
import {
	createCommunity,
	listCommunities,
} from '../../controllers/community-controller';
import { requireAuth } from '../../middleware/auth';

export const name = 'communities';

export async function get(req: Request, res: Response) {
	try {
		return requireAuth(req, res, () => listCommunities(req, res));
	} catch (error: any) {
		return res.status(500).json({ error: error.message });
	}
}

export async function post(req: Request, res: Response) {
	try {
		return requireAuth(req, res, () => createCommunity(req, res));
	} catch (error: any) {
		return res.status(500).json({ error: error.message });
	}
}
