import type { Request, Response } from 'express';
import { signup } from '../../controllers/auth-controller';

export const name = 'auth/signup';

export async function post(req: Request, res: Response) {
	return signup(req, res);
}
