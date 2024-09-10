import mongoose from 'mongoose';
import { MongoError } from 'mongodb';
import UniVerse from './UniVerse';
// @ts-ignore
import * as bluebird from 'bluebird';
import { err, success } from '../modules/logger';
import UserSchema from '../schemas/UserSchema';
import HotspotSchema from '../schemas/HotspotSchema';
import User from "../structures/User";

class Database {
	private started: boolean;

	constructor() {
		this.started = false;
	}

	public async start(): Promise<any> {
		if (
			!process.env.MONGO_URI ||
			!(typeof process.env.MONGO_URI === 'string')
		)
			return err('MongoDB URI must be a string');
		const dbName: string = process.env.DB_NAME || 'core';
		(<any>mongoose).Promise = bluebird;

		try {
			await mongoose.connect(process.env.MONGO_URI, {
				dbName: dbName,
			});
			success(
				'Established connection with Database: ' + dbName.toUpperCase(),
			);
			// @ts-ignore
		} catch (error: MongoError) {
			err('Failed to connect to the Mongo server:');
			err(error.errmsg);
		}

		this.started = true;
		return this.started;
	}

	private async fetchUsers(UniVerse: UniVerse): Promise<void> {
		const users: User[] = await UserSchema.find().lean();

		for (const UserData of users) {
			const user = new User(UserData);
			UniVerse.users.set(user.id, user);
		}
	}

	private async fetchHotspots(UniVerse: UniVerse): Promise<void> {
		const HotspotData = await HotspotSchema.find();
		UniVerse.university.bulkAddHotspot(HotspotData);
	}

	public async fetchData(UniVerse: UniVerse) {
		await this.fetchUsers(UniVerse);
		await this.fetchHotspots(UniVerse);
	}
}

export default new Database();
