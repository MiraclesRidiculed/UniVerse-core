import express, { Application } from 'express';
// @ts-ignore
import compression from 'compression';
import { blue, err, misc } from '../modules/logger';
import { rateLimiterMiddleware } from '../modules/util';
import { setupClientRouter, setupAdminRouter } from './router';
// @ts-ignore
import cors from 'cors';

class Express {
	public express: express.Application;

	constructor() {
		this.express = express();
		this.mountRouters(this.express);
		this.mountMiddleware(this.express);
	}

	private mountMiddleware(_express: Application): void {
		_express.use(express.json());
		_express.use(compression());
		_express.use(rateLimiterMiddleware);
		_express.use(cors());
		_express.disable('x-powered-by');
	}

	private mountRouters(_express: Application): void {
		this.express = _express.use(`/admin`, setupAdminRouter());
		this.express = _express.use('/client', setupClientRouter());
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
