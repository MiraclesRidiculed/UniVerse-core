import type { Request, Response } from 'express';
import SchemaService from '../../services/schema-service';

export const name = 'summary';

export async function get(_req: Request, res: Response) {
	try {
		return res.json(await SchemaService.getSummary());
	} catch (error: any) {
		return res.status(500).json({ error: error.message });
	}
}
