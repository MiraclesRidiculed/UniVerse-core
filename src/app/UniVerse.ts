import { misc, blue } from '../modules/logger';
import Database from './database';
import Express from './express';
import { ADMIN } from './cache';

import dotenv from 'dotenv';
import path from 'path';

class UniVerse {
	private init(): void {
		blue(
			'------------------ UniVerse - Core ------------------------------------------------',
		);
	}

	private loadConfiguration(): void {
		misc('Configuring Environment Variables');

		dotenv.config({ path: path.join(__dirname, '../../.env') });
	}

	private async connectDatabase(): Promise<void> {
		misc('Database :: Attempting to establish connection');

		await Database.start();
	}

	private loadRuntimeSecrets(): void {
		process.env.ADMIN = ADMIN;
	}

	private loadServer(): void {
		misc(`Server :: Booting - PORT: ${process.env.PORT}`);

		Express.init();
	}

	public async login(): Promise<this> {
		this.init();
		this.loadConfiguration();
		this.loadRuntimeSecrets();
		await this.connectDatabase();
		this.loadServer();

		return this;
	}
}
export const UniVerseClient = new UniVerse();

export default UniVerse;
