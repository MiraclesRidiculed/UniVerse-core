/**
 *  '/user/login'
 *
 *  Endpoint to be used to authenticate students on login
 */

import { Request, Response } from 'express';
import { cookies } from '../../app/cache';

export const name = 'cookie';

export async function get(req: Request, res: Response) {
	console.log('bro');
	res.send('bro');
}

export function post(req: Request, res: Response) {
	const { user, cookie } = req.body;
	cookies.set(user, cookie);
	console.log(cookie);
	return res.sendStatus(200);
}
