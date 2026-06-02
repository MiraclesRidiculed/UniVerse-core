import type { Response } from 'express';
import SchemaService from '../services/schema-service';
import { serializeStudentRecord } from '../modules/serializers';
import { cleanString } from '../modules/validation';
import type { AuthenticatedRequest } from '../middleware/auth';

export async function listCommunities(req: AuthenticatedRequest, res: Response) {
	const communities = await SchemaService.listCommunities();
	if (!req.student) return res.json(communities);

	const withMembership = await Promise.all(
		communities.map(async (community) => {
			const detailed = await SchemaService.getCommunity(
				community.communityId,
				req.student?.studentId,
			);
			return detailed ?? community;
		}),
	);
	return res.json(withMembership);
}

export async function createCommunity(req: AuthenticatedRequest, res: Response) {
	if (!req.student) return res.status(401).json({ error: 'Authentication required' });
	const campusId = cleanString(req.body?.campusId, 50);
	const name = cleanString(req.body?.name, 150);
	const description = cleanString(req.body?.description, 2000);

	if (!campusId || !name)
		return res.status(400).json({ error: 'campusId and name are required' });

	const community = await SchemaService.createCommunity({
		campusId,
		name,
		description,
		studentId: req.student.studentId,
	});
	return res.status(201).json(community);
}

export async function joinCommunity(req: AuthenticatedRequest, res: Response) {
	if (!req.student) return res.status(401).json({ error: 'Authentication required' });
	await SchemaService.joinCommunity(req.params.id, req.student.studentId);
	const community = await SchemaService.getCommunity(req.params.id, req.student.studentId);
	if (!community) return res.status(404).json({ error: 'Community not found' });
	return res.json(community);
}

export async function communityMembers(req: AuthenticatedRequest, res: Response) {
	const members = await SchemaService.listCommunityMembers(req.params.id);
	return res.json(members.map((student) => serializeStudentRecord(student)));
}
