/**
 *  '/admin/login'
 *
 *  Endpoint to be used to authenticate admin dashboard
 *  Its currently basic, and copy-pasted from the quiz project, will fix soon
 */

import { Request, Response } from 'express';

export const get = (req: Request, res: Response) => {
	if (process.env.PASSWORD === req.get('Authorization')) return res.json(process.env.ADMIN);
	else return res.sendStatus(401);
}
