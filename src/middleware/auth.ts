import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
	student?: {
		studentId: string;
		email: string;
	};
}

function getJwtSecret(): string {
	return process.env.JWT_SECRET || process.env.PASSWORD || 'universe-dev-secret';
}

export function signStudentToken(student: { studentId: string; email: string }) {
	return jwt.sign(student, getJwtSecret(), { expiresIn: '7d' });
}

export function requireAuth(
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
) {
	const header = req.headers.authorization;
	const token = header?.startsWith('Bearer ') ? header.slice(7) : '';

	if (!token) return res.status(401).json({ error: 'Authentication required' });

	try {
		req.student = jwt.verify(token, getJwtSecret()) as {
			studentId: string;
			email: string;
		};
		return next();
	} catch (_error) {
		return res.status(401).json({ error: 'Invalid or expired session' });
	}
}
