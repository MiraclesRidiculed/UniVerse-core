const express = require('express');
const ShortUniqueId = require('short-unique-id');
const path = require('path');
const fs = require('fs');
const compression = require('compression');
const App = express();
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const { err, success, misc, blue, caution } = require('./modules/Util');

const uid = new ShortUniqueId({ length: 10 });
const adminRoutes = fs
	.readdirSync('./routes/admin')
	.filter((file) => file.endsWith('.js'));
const quizRoutes = fs
	.readdirSync('./routes/user')
	.filter((file) => file.endsWith('.js'));

App.use(express.json());
App.use(compression());
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

	handleRoutes();

	App.listen(process.env.PORT, () => {
		misc(
			`Server running on: http://localhost:${process.env.PORT}/`,
		);
	});
}

// ------------- ROUTES-HANDLER---------------------------------------------------------------

function handleRoutes() {
	const methods = ['get', 'post', 'put', 'delete'];
	const dirs = [adminRoutes, quizRoutes];
	dirs.forEach((dir) => {
		for (const file of dir) {
			const endpoint = require(
				`./routes/${dir === adminRoutes ? 'admin' : 'user'}/${file}`,
			);

			(async function (App) {
				const path = `/${dir === adminRoutes ? 'admin' : 'user'}/${endpoint.name}`;
				methods.forEach((method) =>
					App[method](path, async (req, res) => {
						await endpoint[method](App, req, res);
					}),
				);
			})(App);
		}
	});
}

// ---------------------------------------------------------------------------------------------

connect().catch((e) => err(e));


