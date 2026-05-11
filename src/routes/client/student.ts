import type { Request, Response } from 'express';
import SchemaService from '../../services/schema-service';
import {
	serializeStudentProfile,
	serializeStudentRecord,
} from '../../modules/serializers';

export const name = 'students/:id';

export async function get(req: Request, res: Response) {
	try {
		const student = await SchemaService.getStudentProfile(req.params.id);
		if (!student) return res.status(404).json({ error: 'Student not found' });

		return res.json(serializeStudentProfile(student));
	} catch (error: any) {
		return res.status(500).json({ error: error.message });
	}
}

export async function patch(req: Request, res: Response) {
	try {
		const payload =
			req.body && typeof req.body.handles === 'object' ? req.body.handles : req.body;
		const student = await SchemaService.updateStudentHandles(req.params.id, {
			instagram:
				typeof payload?.instagram === 'string' ? payload.instagram : undefined,
			github: typeof payload?.github === 'string' ? payload.github : undefined,
			linkedin:
				typeof payload?.linkedin === 'string' ? payload.linkedin : undefined,
		});

		if (!student) return res.status(404).json({ error: 'Student not found' });

		return res.json(serializeStudentRecord(student));
	} catch (error: any) {
		return res.status(500).json({ error: error.message });
	}
}
