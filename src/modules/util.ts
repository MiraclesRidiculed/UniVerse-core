import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Request, Response, NextFunction } from 'express';

const rateLimiter = new RateLimiterMemory({
	// @ts-ignore
	points: parseInt(process.env.MAX_REQUESTS_PER_SECOND) || 4,
	duration: 1,
});

export const rateLimiterMiddleware = (req: Request, res: Response, next: NextFunction) => {
	const token = req.get('Authorization')?.split(' ')[1] || req.ip;
	if (!token) return res.status(401).send('Unauthorized: Client IP unavailable');
	rateLimiter
		.consume(token, 1)
		.then(() => {
			next();
		})
		.catch(() => {
			res.status(429).send('Too Many Requests');
		});
};

export function authenticateAdmin(req: Request, ignoreRoutes: [string]) {
	if (!ignoreRoutes.includes(req.path))
		return !(
			!req.get('Authorization') ||
			!(process.env.ADMIN === req.get('Authorization')?.split(' ')[1])
		);
	else return true;
}


