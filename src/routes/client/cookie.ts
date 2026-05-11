/**
 *  '/user/login'
 *
 *  Endpoint to be used to authenticate students on login
 */

import type { Request, Response } from 'express';
import { cookies } from '../../app/cache';

export const name = 'cookie';

export async function get(req: Request, res: Response) {
	res.send('bro');
}

export function post(req: Request, res: Response) {
	const { user, cookie } = req.body;
	cookies.set(user, cookie);
	console.log(cookie);
	return res.sendStatus(200);
}
