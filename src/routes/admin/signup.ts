import type { Request, Response } from 'express';
import {UniVerseClient} from "../../app/UniVerse";
import User from "../../structures/User";

export const name = 'signup';

export async function post(req: Request, res: Response): Promise<any> {
	const { id, email, name, batch, department } = req.body;

	const NewUser = new User({
		id: id,
		email: email,
		name: name,
		batch: batch,
		department: department,
		handles: {
			instagram: '',
			github: '',
			facebook: '',
			linkedin: '',
		}
	});

	try {
		await NewUser.createNew();
		UniVerseClient.users.set(id, NewUser);
		return res.json(NewUser);
	} catch (e) {
		console.error(e);
		return res.sendStatus(500);
	}
}
