const express = require('express');
const ShortUniqueId = require('short-unique-id');
const path = require('path');
const fs = require('fs');
const compression = require('compression');
const App = express();
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const { err, success, misc, blue, caution } = require('./Modules/Logger');
const { authenticateAdmin, rateLimiterMiddleware, caution } = require('./Modules/Util');

const uid = new ShortUniqueId({ length: 10 });

const adminRoutes = fs
	.readdirSync('./Routes/admin')
	.filter((file) => file.endsWith('.js'));
const userRoutes = fs
	.readdirSync('./Routes/user')
	.filter((file) => file.endsWith('.js'));

App.use(express.json());
App.use(compression());
App.disable('x-powered-by');
App.use(rateLimiterMiddleware);
App.admin = uid.rnd();

// -----------------CONNECTION-----------------------------------------------------

async function connect() {
	blue(
		'------------------ UniVerse - Core ------------------------------------------------',
	);
	await mongoose
		.connect(process.env.MONGO_URI, {
			dbName: 'core',
		})
		.then(() => success('Established connection with Database'))
		.catch((error) => err(error));

	await handleRoutes();

	App.listen(process.env.PORT, () => {
		misc(
			`Server running on: http://localhost:${process.env.PORT}/`,
		);
	});
}

// ------------- ROUTES-HANDLER---------------------------------------------------------------

const routePaths = {
	adminRoutes: 'admin',
	userRoutes: 'user',
};

const routeRegistry = new Map();

async function loadEndpoint(routePath, fileName) {
	const endpointPath = path.join(__dirname, 'Routes', routePath, fileName);
	return require(endpointPath);
}

async function registerRoute(App, basePath, methods) {
	const [fileName] = basePath.split('/').slice(-1);
	const endpoint = await loadEndpoint(
		basePath.split('/').slice(1, -1).join('/'),
		`${fileName}.js`,
	);

	methods.forEach((method) => {
		if (endpoint[method]) {
			App[method](basePath, async (req, res) => {
				try {
					if (
						basePath.startsWith('/admin') &&
						!authenticateAdmin(req, ['/admin/login'])
					) {
						return res.sendStatus(401);
					}
					await endpoint[method](App, req, res);
				} catch (error) {
					err(`Error handling route: ${error}`);
					res.sendStatus(500);
				}
			});
			routeRegistry.set(
				`${basePath}_${method.toLowerCase()}`,
				endpoint[method],
			);
		}
	});
}

async function handleRequest(req, res) {
	const { method, originalUrl } = req;
	const handler = routeRegistry.get(`${originalUrl}_${method.toLowerCase()}`);

	if (handler) {
		try {
			if (
				originalUrl.startsWith('/admin') &&
				!authenticateAdmin(req, ['/admin/login'])
			) {
				return res.sendStatus(401);
			}
			await handler(req, res);
		} catch (error) {
			err(`Error handling route: ${error}`);
			res.sendStatus(500);
		}
	} else {
		caution(
			`Request sent from IP: ${req.ip} for invalid method  ${method}: ${originalUrl}`,
		);
		res.sendStatus(404);
	}
}

async function handleRoutes() {
	const methods = ['get', 'post', 'put', 'delete'];
	const routeDirs = [adminRoutes, userRoutes];

	for (const dir of routeDirs) {
		const routePath =
			routePaths[dir === adminRoutes ? 'adminRoutes' : 'userRoutes'];
		const fileNames = await fs.promises.readdir(
			path.join(__dirname, 'Routes', routePath),
		);

		for (const fileName of fileNames) {
			if (fileName.endsWith('.js')) {
				const basePath = `/${routePath}/${path.basename(fileName, '.js')}`;
				await registerRoute(App, basePath, methods);
			}
		}
	}
	App.use(handleRequest);
	success('Registered all Routes');
}
// ---------------------------------------------------------------------------------------------

connect().catch((e) => console.log(e));


