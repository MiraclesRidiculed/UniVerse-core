const chalk = require('chalk');
const log = console.log;

// Going to fix this once we decide the security protocol (this was copied and pasted from the quiz project)
// function authenticateEndpoint(App, req, ignoreEndpoints) {
// 	if (!ignoreEndpoints.includes(req.path))
// 		return !(
// 			!req.get('Authorization') ||
// 			!App.players.has(req.get('Authorization').split(' ')[1])
// 		);
// 	else return true;
// }

module.exports = {
	err(text) {
		log(chalk.italic.bold.redBright(text + '\n'));
	},

	success(text) {
		log(chalk.italic.bold.greenBright(text + '\n'));
	},

	misc(text) {
		log(chalk.italic.bold.cyanBright(text + '\n'));
	},

	caution(text) {
		log(chalk.italic.bold.yellowBright(text + '\n'));
	},

	blue(text) {
		log(chalk.italic.bold.blueBright(text + '\n'));
	},
};
