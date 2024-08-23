import { misc, blue } from '../modules/logger';
import { Database } from './database';
import Express from './express';
import { ADMIN } from './cache';

import dotenv from 'dotenv';
import path from 'path';

class UniVerse {
	public init(): void {
		process.stdout.write('\x1B[2J\x1B[0f');
		blue(
			'------------------ UniVerse - Core ------------------------------------------------',
		);
	}

	public loadCache(): void {
		process.env.ADMIN = ADMIN;
		// More in the future
	}

	public loadConfiguration (): void {
		misc('Configuring Environment Variables');

		dotenv.config({ path: path.join(__dirname, '../../.env') });
	}

	public loadDatabase (): void {
		misc('Database :: Attempting to establish connection');

		Database.start();
	}

	public loadServer (): void {
		misc(`Server :: Booting - PORT: ${process.env.PORT}`);

		Express.init();
	}

}

export default new UniVerse;
