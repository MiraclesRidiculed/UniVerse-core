const { RateLimiterMemory } = require('rate-limiter-flexible');

const rateLimiter = new RateLimiterMemory({
	points: process.env.MAX_REQUESTS_PER_SECOND || 4,
	duration: 1,
});

const rateLimiterMiddleware = (req, res, next) => {
	const token = req.get('Authorization')?.split(' ')[1] || req.ip;
	rateLimiter
		.consume(token, 1)
		.then(() => {
			next();
		})
		.catch(() => {
			res.status(429).send('Too Many Requests');
		});
};

function authenticateAdmin(req, ignoreRoutes) {
	if (!ignoreRoutes.includes(req.path))
		return !(
			!req.get('Authorization') ||
			!(process.env.ADMIN === req.get('Authorization').split(' ')[1])
		);
	else return true;
}

module.exports = {
	rateLimiterMiddleware,
	authenticateAdmin,
};
