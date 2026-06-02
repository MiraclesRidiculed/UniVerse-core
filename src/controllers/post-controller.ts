import type { Response } from 'express';
import SchemaService from '../services/schema-service';
import { cleanString } from '../modules/validation';
import type { AuthenticatedRequest } from '../middleware/auth';

export async function listPosts(req: AuthenticatedRequest, res: Response) {
	const communityId =
		typeof req.query.communityId === 'string'
			? cleanString(req.query.communityId, 50)
			: undefined;
	return res.json(await SchemaService.listPosts(communityId));
}

export async function createPost(req: AuthenticatedRequest, res: Response) {
	if (!req.student) return res.status(401).json({ error: 'Authentication required' });
	const communityId = cleanString(req.body?.communityId, 50);
	const content = cleanString(req.body?.content, 5000);
	if (!communityId || !content)
		return res.status(400).json({ error: 'communityId and content are required' });

	const post = await SchemaService.createPost({
		studentId: req.student.studentId,
		communityId,
		content,
	});
	return res.status(201).json(post);
}

export async function updatePost(req: AuthenticatedRequest, res: Response) {
	if (!req.student) return res.status(401).json({ error: 'Authentication required' });
	const content = cleanString(req.body?.content, 5000);
	if (!content) return res.status(400).json({ error: 'content is required' });

	const post = await SchemaService.updatePost(
		req.params.id,
		req.student.studentId,
		content,
	);
	if (!post) return res.status(404).json({ error: 'Post not found or not owned by you' });
	return res.json(post);
}

export async function deletePost(req: AuthenticatedRequest, res: Response) {
	if (!req.student) return res.status(401).json({ error: 'Authentication required' });
	const deleted = await SchemaService.deletePost(req.params.id, req.student.studentId);
	if (!deleted)
		return res.status(404).json({ error: 'Post not found or not owned by you' });
	return res.json({ ok: true });
}
