import type { Response } from 'express';
import bcrypt from 'bcrypt';
import SchemaService from '../services/schema-service';
import { serializeStudentRecord } from '../modules/serializers';
import { cleanString, isEmail } from '../modules/validation';
import {
	type AuthenticatedRequest,
	signStudentToken,
} from '../middleware/auth';

function authResponse(student: Awaited<ReturnType<typeof SchemaService.getStudentRecord>>) {
	if (!student) throw new Error('Student not found');
	return {
		token: signStudentToken({
			studentId: student.studentId,
			email: student.email,
		}),
		student: serializeStudentRecord(student),
	};
}

export async function signup(req: AuthenticatedRequest, res: Response) {
	const name = cleanString(req.body?.name, 120);
	const email = cleanString(req.body?.email, 255).toLowerCase();
	const password = cleanString(req.body?.password, 128);

	if (!name || !email || !password)
		return res
			.status(400)
			.json({ error: 'name, email, and password are required' });
	if (!isEmail(email))
		return res.status(400).json({ error: 'Enter a valid email address' });
	if (password.length < 8)
		return res.status(400).json({ error: 'Password must be at least 8 characters' });

	const existing = await SchemaService.getStudentByEmail(email);
	if (existing) return res.status(409).json({ error: 'Email is already registered' });

	const passwordHash = await bcrypt.hash(password, 12);
	const student = await SchemaService.createStudent({
		name,
		email,
		password: passwordHash,
	});

	return res.status(201).json(authResponse(student));
}

export async function login(req: AuthenticatedRequest, res: Response) {
	const email = cleanString(req.body?.email, 255).toLowerCase();
	const password = cleanString(req.body?.password, 128);
	if (!email || !password)
		return res.status(400).json({ error: 'email and password are required' });

	const student = await SchemaService.getStudentByEmail(email);
	if (!student?.passwordHash)
		return res.status(401).json({ error: 'Invalid email or password' });

	const matches = await bcrypt.compare(password, student.passwordHash);
	if (!matches) return res.status(401).json({ error: 'Invalid email or password' });

	return res.json(authResponse(student));
}

export async function me(req: AuthenticatedRequest, res: Response) {
	if (!req.student) return res.status(401).json({ error: 'Authentication required' });
	const profile = await SchemaService.getStudentProfile(req.student.studentId);
	if (!profile) return res.status(404).json({ error: 'Student not found' });
	return res.json(serializeStudentRecord(profile));
}
