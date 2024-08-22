
import express from 'express';
import { blue, err } from '../modules/logger';
import { rateLimiterMiddleware } from '../modules/util';

class Express {
	public express: express.Application;

	constructor () {
		this.express = express();
		this.mountRoutes();
	}

	private mountRoutes (): void {
		// this.express = Routes.mountApi(this.express);
	}

	/**
	 * Starts the express server
	 */
	public init (): any {
		this.express.use(rateLimiterMiddleware);

		this.express.listen(process.env.PORT, () => {
			return blue(`Express server listening on http://localhost:${process.env.PORT}/`);
		})
		.on('error', (_error) => {
			return err(_error.message);
		});
	}
}

export default new Express();
