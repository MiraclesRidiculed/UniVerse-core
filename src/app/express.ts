import express, { Application } from 'express';
import path from 'path';
import fs from 'fs';
// @ts-ignore
import compression from 'compression';
import { blue, err } from '../modules/logger';
import { rateLimiterMiddleware } from '../modules/util';
import { setupClientRouter, setupAdminRouter } from './router';
// @ts-ignore
import cors from 'cors';

class Express {
	public express: express.Application;

	constructor() {
		this.express = express();
		this.setupMiddleware();
		this.mountRouters(this.express);
		this.express.disable('x-powered-by');
	}

	private setupMiddleware(): void {
		const uploadPath = path.join(__dirname, '../../uploads');
		fs.mkdirSync(uploadPath, { recursive: true });
		this.express.use(cors()); // Make sure CORS middleware is called before routers
		this.express.use(express.json());
		this.express.use(express.urlencoded({ extended: true }));
		this.express.use(compression());
		this.express.use('/uploads', express.static(uploadPath));
		this.express.use(rateLimiterMiddleware);
	}

	private mountRouters(_express: Application): void {
		this.express = _express.use(`/admin`, setupAdminRouter());
		this.express = _express.use('/client', setupClientRouter());
		this.express.use((_req, res) => {
			res.status(404).json({ error: 'Route not found' });
		});
		this.express.use((error: any, _req: express.Request, res: express.Response) => {
			console.error(error);
			if (!res.headersSent)
				res.status(500).json({
					error: 'Internal server error',
					details:
						process.env.NODE_ENV === 'production'
							? undefined
							: error?.message || String(error),
				});
		});
	}

	public init(): void {
		this.express
			.listen(process.env.PORT, () => {
				return blue(
					`Express server listening on http://localhost:${process.env.PORT}/`,
				);
			})
			.on('error', (_error) => {
				return err(_error.message);
			});
	}
}

export default new Express();
