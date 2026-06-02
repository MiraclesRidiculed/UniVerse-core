import type { Response } from 'express';
import SchemaService from '../services/schema-service';
import {
	serializeStudentProfile,
	serializeStudentRecord,
} from '../modules/serializers';
import { cleanString, isEmail, parseBatch } from '../modules/validation';
import type { AuthenticatedRequest } from '../middleware/auth';

export async function getProfile(req: AuthenticatedRequest, res: Response) {
	const studentId =
		req.params.id === 'me' ? req.student?.studentId : cleanString(req.params.id, 50);
	if (!studentId) return res.status(401).json({ error: 'Authentication required' });

	const student = await SchemaService.getStudentProfile(studentId);
	if (!student) return res.status(404).json({ error: 'Student not found' });
	return res.json(serializeStudentProfile(student));
}

export async function updateProfile(req: AuthenticatedRequest, res: Response) {
	const studentId =
		req.params.id === 'me' ? req.student?.studentId : cleanString(req.params.id, 50);
	if (!studentId) return res.status(401).json({ error: 'Authentication required' });
	if (req.student?.studentId !== studentId)
		return res.status(403).json({ error: 'You can only edit your own profile' });

	const email =
		typeof req.body?.email === 'string'
			? cleanString(req.body.email, 255).toLowerCase()
			: undefined;
	if (email && !isEmail(email))
		return res.status(400).json({ error: 'Enter a valid email address' });

	const student = await SchemaService.updateStudentHandles(studentId, {
		name:
			typeof req.body?.name === 'string'
				? cleanString(req.body.name, 120)
				: undefined,
		email,
		department:
			typeof req.body?.department === 'string'
				? cleanString(req.body.department, 120)
				: undefined,
		batch:
			typeof req.body?.batch !== 'undefined'
				? parseBatch(req.body.batch) || undefined
				: undefined,
		instagram:
			typeof req.body?.instagram === 'string'
				? cleanString(req.body.instagram)
				: undefined,
		github:
			typeof req.body?.github === 'string' ? cleanString(req.body.github) : undefined,
		linkedin:
			typeof req.body?.linkedin === 'string'
				? cleanString(req.body.linkedin)
				: undefined,
	});

	if (!student) return res.status(404).json({ error: 'Student not found' });
	return res.json(serializeStudentRecord(student));
}
