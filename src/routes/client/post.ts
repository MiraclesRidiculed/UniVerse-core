import type { Request, Response } from 'express';
import { deletePost, updatePost } from '../../controllers/post-controller';
import { requireAuth } from '../../middleware/auth';

export const name = 'posts/:id';

export async function patch(req: Request, res: Response) {
	try {
		return requireAuth(req, res, () => updatePost(req, res));
	} catch (error: any) {
		return res.status(500).json({ error: error.message });
	}
}

async function deleteHandler(req: Request, res: Response) {
	try {
		return requireAuth(req, res, () => deletePost(req, res));
	} catch (error: any) {
		return res.status(500).json({ error: error.message });
	}
}

export { deleteHandler as delete };
