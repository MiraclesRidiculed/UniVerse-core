// src/app/router.ts

import express, { Router, Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { err } from '../modules/logger';

const routeRegistry = new Map<string, Function>();

const routePaths = {
	adminRoutes: 'admin',
	clientRoutes: 'client',
};

async function loadEndpoint(routePath: string, fileName: string) {
	const endpointPath = path.join(__dirname, '../routes', routePath, fileName);
	return require(endpointPath);
}

function registerRoutes(router: Router, routePath: string, methods: string[]) {
	const fileNames = fs.readdirSync(path.join(__dirname, '../routes', routePath));

	for (const fileName of fileNames) {
		if (fileName.endsWith('.ts')) {
			const basePath = `/${routePath}/${path.basename(fileName, '.ts')}`;

			loadEndpoint(routePath, fileName).then((endpoint) => {
				methods.forEach((method) => {
					if (endpoint[method]) {
						// @ts-ignore
						router[method](basePath, async (req: Request, res: Response, next: NextFunction) => {
							try {
								await endpoint[method](req, res, next);
							} catch (error) {
								err(`Error handling route: ${error}`);
								res.sendStatus(500);
							}
						});
						routeRegistry.set(`${basePath}_${method.toLowerCase()}`, endpoint[method]);
					}
				});
			});
		}
	}
}

export function setupAdminRouter() {
	const adminRouter = express.Router();
	const methods = ['get', 'post', 'put', 'delete'];
	registerRoutes(adminRouter, routePaths.adminRoutes, methods);
	return adminRouter;
}

export function setupClientRouter() {
	const clientRouter = express.Router();
	const methods = ['get', 'post', 'put', 'delete'];
	registerRoutes(clientRouter, routePaths.clientRoutes, methods);
	return clientRouter;
}
