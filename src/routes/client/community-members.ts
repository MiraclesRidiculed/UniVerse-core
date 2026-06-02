import type { Request, Response } from 'express';
import { communityMembers } from '../../controllers/community-controller';

export const name = 'communities/:id/members';

export async function get(req: Request, res: Response) {
	try {
		return communityMembers(req, res);
	} catch (error: any) {
		return res.status(500).json({ error: error.message });
	}
}
