import { UniVerseClient } from './app/UniVerse';

UniVerseClient.login();

process.on('unhandledRejection', error => {
	console.error('Unhandled Promise Rejection: ', error);
});
