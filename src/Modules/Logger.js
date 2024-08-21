const chalk = require('chalk');
const log = console.log;

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
}
