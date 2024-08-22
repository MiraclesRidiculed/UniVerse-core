import { misc, blue } from '../modules/logger';
import { Database } from './database';
import dotenv from 'dotenv';
import path from 'path';

class UniVerse {
	public init(): void {
		process.stdout.write('\x1B[2J\x1B[0f');
		blue(
			'------------------ UniVerse - Core ------------------------------------------------',
		);
	}

	public loadConfiguration (): void {
		misc('Configuring Environment Variables');

		dotenv.config({ path: path.join(__dirname, '../../.env') });
	}

	public loadDatabase (): void {
		misc('Database :: Attempting to establish connection');

		Database.start();
	}

	public loadServer(): void {

	}

}
