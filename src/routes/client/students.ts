import type { Request, Response } from 'express';
import type { Handles } from "../../structures/User";
import { UniVerseClient } from "../../app/UniVerse";

export const name = 'students/:id';

export async function get(req: Request, res: Response)  {
	if (!UniVerseClient.users.has(req.params.id))
		return res.status(404).send('User not found!');

	return res.json(UniVerseClient.users.get(req.params.id));
}

// Implement Authorization, Body Validation
export async function patch(req: Request, res: Response) {
	const { id } = req.params;
	const handles: Handles = req.body;

	if (!UniVerseClient.users.has(id))
		return res.status(404).send('User not found!');

	try {
		await UniVerseClient.users.get(id)?.updateHandles(handles);
		return res.sendStatus(200);
	} catch (e) {
		return res.status(500).send(`${e}`);
	}
}
