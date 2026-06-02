import type { Request, Response } from 'express';
import { listResources, uploadResource } from '../../controllers/resource-controller';
import { requireAuth } from '../../middleware/auth';

export const name = 'resources';

export async function get(req: Request, res: Response) {
	try {
		return requireAuth(req, res, () => listResources(req, res));
	} catch (error: any) {
		return res.status(500).json({ error: error.message });
	}
}

export async function post(req: Request, res: Response) {
	try {
		return requireAuth(req, res, () => uploadResource(req, res));
	} catch (error: any) {
		return res.status(500).json({ error: error.message });
	}
}
