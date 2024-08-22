import mongoose from 'mongoose';
import { MongoError } from 'mongodb';
// @ts-ignore
import * as bluebird from 'bluebird';
import { err, success } from '../modules/logger';

export class Database {

	public static start (): any {
		if (!process.env.MONGO_URI || !(typeof process.env.MONGO_URI === 'string')) return err('MongoDB URI must be a string');
		const dbName: string = process.env.DB_NAME || 'core';
		(<any>mongoose).Promise = bluebird;

		mongoose.connect(process.env.MONGO_URI, {
			dbName: dbName,
		})
			.then(() => {
				success('Established connection with Database: ' + dbName.toUpperCase());
			})
			.catch((error: MongoError) => {
				err('Failed to connect to the Mongo server:');
				err(error.errmsg);
			});
	}
}

export default mongoose;
