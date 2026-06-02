import type { Request, Response } from 'express';
import { createPost, listPosts } from '../../controllers/post-controller';
import { requireAuth } from '../../middleware/auth';

export const name = 'posts';

export async function get(req: Request, res: Response) {
	try {
		return requireAuth(req, res, () => listPosts(req, res));
	} catch (error: any) {
		return res.status(500).json({ error: error.message });
	}
}

export async function post(req: Request, res: Response) {
	try {
		return requireAuth(req, res, () => createPost(req, res));
	} catch (error: any) {
		return res.status(500).json({ error: error.message });
	}
}
