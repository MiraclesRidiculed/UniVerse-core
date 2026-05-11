import type { Request, Response } from 'express';
import SchemaService from '../../services/schema-service';
import { serializeStudentRecord } from '../../modules/serializers';

export const name = 'signup';

export async function post(req: Request, res: Response): Promise<any> {
	const { studentId, id, campusId, email, name, batch, department } = req.body;
	if (!email || !name || !department || Number.isNaN(Number(batch)))
		return res.status(400).json({
			error: 'name, email, department, and batch are required',
		});

	try {
		const student = await SchemaService.createStudent({
			studentId: studentId || id,
			campusId,
			email,
			name,
			batch: Number(batch),
			department,
			instagram: typeof req.body.instagram === 'string' ? req.body.instagram : '',
			github: typeof req.body.github === 'string' ? req.body.github : '',
			linkedin: typeof req.body.linkedin === 'string' ? req.body.linkedin : '',
		});
		return res.status(201).json(serializeStudentRecord(student));
	} catch (error: any) {
		console.error(error);
		return res.status(500).json({ error: error.message });
	}
}
