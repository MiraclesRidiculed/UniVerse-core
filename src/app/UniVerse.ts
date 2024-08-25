import { misc, blue, success } from '../modules/logger';
import Database from './database';
import Express from './express';
import { ADMIN } from './cache';
import { Collection } from '@discordjs/collection';
import University from '../structures/University';

import dotenv from 'dotenv';
import path from 'path';
import User from '../structures/User';

class UniVerse {
	public users: Collection<string, User>;
	public university: University;

	constructor() {
		this.users = new Collection<string, User>();
		this.university = new University(this);
	}

	private init(): void {
		process.stdout.write('\x1B[2J\x1B[0f');
		blue(
			'------------------ UniVerse - Core ------------------------------------------------',
		);
	}

	private loadConfiguration (): void {
		misc('Configuring Environment Variables');

		dotenv.config({ path: path.join(__dirname, '../../.env') });
	}

	private async connectDatabase (): Promise<void> {
		misc('Database :: Attempting to establish connection');

		await Database.start();
	}

	private loadServer (): void {
		misc(`Server :: Booting - PORT: ${process.env.PORT}`);

		Express.init();
	}


	private loadData(UniVerse: this): void {
		process.env.ADMIN = ADMIN;

		Database.fetchData(this).then(r => success('Data successfully fetched from Database'));
		// More in the future
	}

	public async login(): Promise<this> {
		this.loadConfiguration();
		this.init();
		await this.connectDatabase();
		this.loadData(this);
		this.loadServer();

		return this;
	}

}
 export const UniVerseClient = new UniVerse();

export default UniVerse;
