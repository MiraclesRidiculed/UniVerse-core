import express, { Router, Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';

const routePaths = {
	adminRoutes: 'admin',
	clientRoutes: 'client',
};

function loadRoutesFromDirectory(routePath: string) {
	const routes: { [key: string]: any } = {};
	const directoryPath = path.join(__dirname, '../routes', routePath);
	const files = fs.readdirSync(directoryPath);

	files.forEach((fileName) => {
		if (fileName.endsWith('.js')) {
			const routeModule = require(path.join(directoryPath, fileName));
			const routeName = `/${routeModule.name}`;
			if (routeName) routes[routeName] = routeModule;
		}
	});

	return routes;
}

function registerRoutes(
	router: Router,
	routePath: string,
	methods: string[],
	routes: { [key: string]: any },
) {
	Object.keys(routes).forEach((routeKey) => {
		const endpoint = routes[routeKey];

		methods.forEach((method) => {
			if (endpoint[method]) {
				// @ts-ignore
				router[method](
					routeKey,
					async (req: Request, res: Response, next: NextFunction) => {
						try {
							await endpoint[method](req, res, next);
						} catch (error) {
							console.error(
								`Error handling route ${routeKey}: ${error}`,
							);
							res.sendStatus(500);
						}
					},
				);
			}
		});
	});
}

export function setupAdminRouter() {
	const adminRouter = express.Router();
	const methods = ['get', 'post', 'put', 'delete'];
	const routes = loadRoutesFromDirectory(routePaths.adminRoutes);
	registerRoutes(adminRouter, routePaths.adminRoutes, methods, routes);
	return adminRouter;
}

export function setupClientRouter() {
	const clientRouter = express.Router();
	const methods = ['get', 'post', 'put', 'delete'];
	const routes = loadRoutesFromDirectory(routePaths.clientRoutes);
	registerRoutes(clientRouter, routePaths.clientRoutes, methods, routes);
	return clientRouter;
}
