import type { Response } from 'express';
import path from 'path';
import multer from 'multer';
import SchemaService from '../services/schema-service';
import { cleanString } from '../modules/validation';
import type { AuthenticatedRequest } from '../middleware/auth';

const uploadRoot = path.join(__dirname, '../../uploads');

const storage = multer.diskStorage({
	destination: uploadRoot,
	filename: (_req, file, callback) => {
		const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
		callback(null, `${Date.now()}-${safeName}`);
	},
});

const upload = multer({
	storage,
	limits: { fileSize: 15 * 1024 * 1024 },
	fileFilter: (_req, file, callback) => {
		const allowed = [
			'application/pdf',
			'application/msword',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
			'application/vnd.ms-powerpoint',
			'application/vnd.openxmlformats-officedocument.presentationml.presentation',
			'application/vnd.ms-excel',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'text/plain',
			'application/zip',
		];
		if (allowed.includes(file.mimetype)) return callback(null, true);
		return callback(new Error('Unsupported file type'));
	},
}).single('file');

function runUpload(req: AuthenticatedRequest, res: Response): Promise<void> {
	return new Promise((resolve, reject) => {
		upload(req, res, (error) => {
			if (error) reject(error);
			else resolve();
		});
	});
}

export async function listResources(req: AuthenticatedRequest, res: Response) {
	const communityId =
		typeof req.query.communityId === 'string'
			? cleanString(req.query.communityId, 50)
			: undefined;
	return res.json(await SchemaService.listResources(communityId));
}

export async function uploadResource(req: AuthenticatedRequest, res: Response) {
	if (!req.student) return res.status(401).json({ error: 'Authentication required' });
	await runUpload(req, res);

	const file = req.file;
	const title = cleanString(req.body?.title, 200);
	const communityId = cleanString(req.body?.communityId, 50);
	if (!file || !title || !communityId)
		return res
			.status(400)
			.json({ error: 'title, communityId, and file are required' });

	const resource = await SchemaService.createResource({
		studentId: req.student.studentId,
		communityId,
		title,
		fileUrl: `/uploads/${file.filename}`,
	});
	return res.status(201).json(resource);
}
