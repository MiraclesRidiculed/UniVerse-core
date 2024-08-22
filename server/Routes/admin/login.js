/**
 *  '/admin/login'
 *
 *  Endpoint to be used to authenticate admin dashboard
 *  Its currently basic, and copy-pasted from the quiz project, will fix soon
 */

module.exports = {
	name: 'login',
	async get(App, req, res) {
		process.env.PASSWORD === req.get('Authorization') ?
			res.json(App.admin)
			:	res.sendStatus(401);
	},
	async post(App, req, res) {

	}
};
