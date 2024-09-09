import type { Request, Response } from 'express';
import { UniVerseClient } from "../../app/UniVerse";

export const name = 'students/:id';

export async function get(req: Request, res: Response)  {
	if (!UniVerseClient.users.has(req.params.id))
		return res.status(404).send('User not found!');

	return res.json(UniVerseClient.users.get(req.params.id));
}
