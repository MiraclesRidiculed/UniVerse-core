import type { Request, Response } from 'express';
import { login } from '../../controllers/auth-controller';

export const name = 'auth/login';

export async function post(req: Request, res: Response) {
	return login(req, res);
}
