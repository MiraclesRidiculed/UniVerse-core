
import express, { Application } from 'express';
// @ts-ignore
import compression from 'compression';
import { blue, err, misc } from '../modules/logger';
import { rateLimiterMiddleware } from '../modules/util';
import { setupClientRouter, setupAdminRouter } from './router';

class Express {
	public express: express.Application;

	constructor () {
		this.express = express();
		this.mountRoutes();
		this.mountMiddleware(this.express);
	}

	private mountMiddleware(_express: Application): void {
		_express.use(express.json());
		_express.use(compression());
		_express.use(rateLimiterMiddleware);
		_express.disable('x-powered-by');
	}

	private mountClient(_express: Application): Application {
		misc('Routes :: Mounting Client Routes...');

		return _express.use('/client', setupClientRouter);
	}

	private mountAdmin(_express: Application): Application {
		misc('Routes :: Mounting Admin Routes...');

		return _express.use(`/admin`, setupAdminRouter());
	}

	private mountRoutes (): void {
		this.express = this.mountAdmin(this.express);
		this.express = this.mountClient(this.express);
	}

	public init (): void {
		this.express.listen(process.env.PORT, () => {
			return blue(`Express server listening on http://localhost:${process.env.PORT}/`);
		})
		.on('error', (_error) => {
			return err(_error.message);
		});
	}
}

export default new Express();
