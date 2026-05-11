import mysql, {
	type Pool,
	type PoolOptions,
	type ResultSetHeader,
} from 'mysql2/promise';
import { err, success } from '../modules/logger';

type QueryParam = string | number | boolean | Date | null;

class Database {
	private pool: Pool | null;

	constructor() {
		this.pool = null;
	}

	private getConfig(): string | PoolOptions {
		if (process.env.MYSQL_URL) return process.env.MYSQL_URL;

		return {
			host: process.env.MYSQL_HOST || '127.0.0.1',
			port: Number(process.env.MYSQL_PORT || 3306),
			user: process.env.MYSQL_USER || 'root',
			password: process.env.MYSQL_PASSWORD || '',
			database: process.env.MYSQL_DATABASE || 'universe_core',
			waitForConnections: true,
			connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT || 10),
			queueLimit: 0,
			namedPlaceholders: false,
		};
	}

	public async start(): Promise<boolean> {
		try {
			const config = this.getConfig();
			this.pool =
				typeof config === 'string'
					? mysql.createPool(config)
					: mysql.createPool(config);
			await this.pool.query('SELECT 1');
			success('Established connection with MySQL database');
			return true;
		} catch (error: any) {
			err('Failed to connect to the MySQL server');
			err(error.message);
			this.pool = null;
			return false;
		}
	}

	private ensurePool(): Pool {
		if (!this.pool)
			throw new Error(
				'MySQL pool not initialised. Call Database.start() before querying.',
			);
		return this.pool;
	}

	public async query<T>(sql: string, params: QueryParam[] = []): Promise<T> {
		const [rows] = await this.ensurePool().query(sql, params);
		return rows as T;
	}

	public async execute<T = ResultSetHeader>(
		sql: string,
		params: QueryParam[] = [],
	): Promise<T> {
		const [result] = await this.ensurePool().execute(sql, params);
		return result as T;
	}
}

export default new Database();
