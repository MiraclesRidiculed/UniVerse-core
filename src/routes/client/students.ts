import type { Request, Response } from 'express';
import SchemaService from '../../services/schema-service';
import { serializeStudentRecord } from '../../modules/serializers';

export const name = 'students';

export async function get(req: Request, res: Response) {
	try {
		const search =
			typeof req.query.search === 'string' ? req.query.search.trim() : undefined;
		const campusId =
			typeof req.query.campusId === 'string'
				? req.query.campusId.trim()
				: undefined;
		const students = await SchemaService.listStudents({ search, campusId });

		return res.json(students.map((student) => serializeStudentRecord(student)));
	} catch (error: any) {
		return res.status(500).json({ error: error.message });
	}
}

export async function post(req: Request, res: Response) {
	const { name, email, campus, bio } = req.body ?? {};
	if (!name || !email || !campus)
		return res.status(400).json({ error: 'name, email, and campus are required' });

	try {
		const student = await SchemaService.createStudent({
			campusId: String(campus).trim(),
			name: String(name).trim(),
			email: String(email).trim(),
			bio: typeof bio === 'string' ? bio.trim() : '',
		});

		return res.status(201).json(serializeStudentRecord(student));
	} catch (error: any) {
		console.error(error);
		return res.status(500).json({ error: error.message });
	}
}
