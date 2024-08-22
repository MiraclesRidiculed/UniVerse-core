import chalk from "chalk";

const log = console.log;

export function err(text: string) {
	log(chalk.italic.bold.redBright(text + '\n'));
}

export function success(text: string) {
	log(chalk.italic.bold.greenBright(text + '\n'));
}

export function misc(text: string) {
	log(chalk.italic.bold.cyanBright(text + '\n'));
}

export function caution(text: string) {
	log(chalk.italic.bold.yellowBright(text + '\n'));
}

export function blue(text: string) {
	log(chalk.italic.bold.blueBright(text + '\n'));
}
