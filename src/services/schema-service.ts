import ShortUniqueId from 'short-unique-id';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import Database from '../app/database';
import type {
	AdminRecord,
	CampusRecord,
	CampusSummary,
	CommunityRecord,
	CommunitySummary,
	CreateStudentInput,
	DashboardSummary,
	PostFeedItem,
	ResourceFeedItem,
	ResourceRecord,
	StudentHandleUpdateInput,
	StudentProfile,
	StudentRecord,
} from '../types/schema';

type CountRow = RowDataPacket & { total: number };
type CampusRow = RowDataPacket & CampusRecord;
type AdminRow = RowDataPacket & AdminRecord;
type StudentRow = RowDataPacket & StudentRecord;
type CommunityRow = RowDataPacket & CommunityRecord;
type CommunitySummaryRow = RowDataPacket & CommunitySummary;
type PostFeedRow = RowDataPacket & PostFeedItem;
type ResourceRow = RowDataPacket & ResourceRecord;
type ResourceFeedRow = RowDataPacket & ResourceFeedItem;
type CampusIdRow = RowDataPacket & { campusId: string };

const uid = new ShortUniqueId({ length: 10 });

const campusSelect = `
	SELECT
		campus_id AS campusId,
		campus_name AS campusName,
		location
	FROM campus
`;

const adminSelect = `
	SELECT
		admin_id AS adminId,
		campus_id AS campusId,
		name,
		email
	FROM admin
`;

const studentSelect = `
	SELECT
		student_id AS studentId,
		campus_id AS campusId,
		name,
		email,
		password_hash AS passwordHash,
		department,
		batch,
		COALESCE(bio, '') AS bio,
		COALESCE(instagram, '') AS instagram,
		COALESCE(github, '') AS github,
		COALESCE(linkedin, '') AS linkedin
	FROM student
`;

const communitySelect = `
	SELECT
		community_id AS communityId,
		campus_id AS campusId,
		name,
		COALESCE(description, '') AS description
	FROM community
`;

const postFeedSelect = `
	SELECT
		p.post_id AS postId,
		p.student_id AS studentId,
		p.community_id AS communityId,
		p.content,
		DATE_FORMAT(p.created_at, '%Y-%m-%d %H:%i:%s') AS createdAt,
		s.name AS studentName,
		s.department AS studentDepartment,
		c.name AS communityName
	FROM post p
	INNER JOIN student s ON s.student_id = p.student_id
	INNER JOIN community c ON c.community_id = p.community_id
`;

const resourceFeedSelect = `
	SELECT
		r.resource_id AS resourceId,
		r.student_id AS studentId,
		r.community_id AS communityId,
		r.title,
		r.file_url AS fileUrl,
		DATE_FORMAT(r.created_at, '%Y-%m-%d %H:%i:%s') AS createdAt,
		s.name AS studentName,
		s.department AS studentDepartment,
		s.campus_id AS campusId,
		c.name AS communityName
	FROM resource r
	INNER JOIN student s ON s.student_id = r.student_id
	INNER JOIN community c ON c.community_id = r.community_id
`;

class SchemaService {
	private async fetchCount(tableName: string): Promise<number> {
		const rows = await Database.query<CountRow[]>(
			`SELECT COUNT(*) AS total FROM ${tableName}`,
		);
		return rows[0]?.total ?? 0;
	}

	private async resolveCampusId(campusId?: string): Promise<string> {
		if (campusId) {
			const rows = await Database.query<CountRow[]>(
				`SELECT COUNT(*) AS total FROM campus WHERE campus_id = ?`,
				[campusId],
			);
			if (!rows[0] || rows[0].total === 0)
				throw new Error(`Campus ${campusId} does not exist`);
			return campusId;
		}

		const rows = await Database.query<CampusIdRow[]>(
			`SELECT campus_id AS campusId FROM campus ORDER BY campus_name ASC LIMIT 1`,
		);
		if (!rows[0]) {
			await Database.execute<ResultSetHeader>(
				`
					INSERT INTO campus (campus_id, campus_name, location)
					VALUES (?, ?, ?)
				`,
				['camp_default', 'UniVerse Campus', 'Campus network'],
			);
			return 'camp_default';
		}

		return rows[0].campusId;
	}

	private normalizeHandleUpdate(
		input: StudentHandleUpdateInput,
		existing: StudentRecord,
	): Required<StudentHandleUpdateInput> {
		return {
			name: input.name ?? existing.name,
			email: input.email ?? existing.email,
			department: input.department ?? existing.department ?? '',
			batch: input.batch ?? existing.batch ?? 0,
			instagram: input.instagram ?? existing.instagram ?? '',
			github: input.github ?? existing.github ?? '',
			linkedin: input.linkedin ?? existing.linkedin ?? '',
		};
	}

	public async getSummary(): Promise<DashboardSummary> {
		const [campuses, students, admins, communities, posts, resources] =
			await Promise.all([
				this.fetchCount('campus'),
				this.fetchCount('student'),
				this.fetchCount('admin'),
				this.fetchCount('community'),
				this.fetchCount('post'),
				this.fetchCount('resource'),
			]);
		const [recentPosts, recentResources] = await Promise.all([
			Database.query<PostFeedRow[]>(
				`${postFeedSelect} ORDER BY p.created_at DESC LIMIT 6`,
			),
			Database.query<ResourceFeedRow[]>(
				`${resourceFeedSelect} ORDER BY r.created_at DESC LIMIT 6`,
			),
		]);

		return {
			counts: {
				campuses,
				students,
				admins,
				communities,
				posts,
				resources,
			},
			recentPosts,
			recentResources,
		};
	}

	public async listCampuses(): Promise<CampusSummary[]> {
		const [campusRows, adminRows, studentRows, communityRows] = await Promise.all([
			Database.query<CampusRow[]>(`${campusSelect} ORDER BY campusName ASC`),
			Database.query<AdminRow[]>(`${adminSelect} ORDER BY name ASC`),
			Database.query<StudentRow[]>(`${studentSelect} ORDER BY name ASC`),
			Database.query<CommunityRow[]>(`${communitySelect} ORDER BY name ASC`),
		]);

		return campusRows.map((campus) => ({
			...campus,
			admins: adminRows.filter((admin) => admin.campusId === campus.campusId),
			students: studentRows.filter(
				(student) => student.campusId === campus.campusId,
			),
			communities: communityRows.filter(
				(community) => community.campusId === campus.campusId,
			),
		}));
	}

	public async listStudents(filters?: {
		campusId?: string;
		search?: string;
	}): Promise<StudentRecord[]> {
		const params: string[] = [];
		const clauses: string[] = [];

		if (filters?.campusId) {
			clauses.push(`campus_id = ?`);
			params.push(filters.campusId);
		}

		if (filters?.search) {
			clauses.push(
				`(
					student_id LIKE ?
					OR name LIKE ?
					OR email LIKE ?
					OR department LIKE ?
				)`,
			);
			const searchTerm = `%${filters.search}%`;
			params.push(searchTerm, searchTerm, searchTerm, searchTerm);
		}

		const whereClause = clauses.length
			? ` WHERE ${clauses.join(' AND ')}`
			: '';

		return Database.query<StudentRow[]>(
			`${studentSelect}${whereClause} ORDER BY name ASC`,
			params,
		);
	}

	public async getStudentRecord(studentId: string): Promise<StudentRecord | null> {
		const rows = await Database.query<StudentRow[]>(
			`${studentSelect} WHERE student_id = ? LIMIT 1`,
			[studentId],
		);
		return rows[0] ?? null;
	}

	public async getStudentByEmail(email: string): Promise<StudentRecord | null> {
		const rows = await Database.query<StudentRow[]>(
			`${studentSelect} WHERE email = ? LIMIT 1`,
			[email],
		);
		return rows[0] ?? null;
	}

	public async getStudentProfile(studentId: string): Promise<StudentProfile | null> {
		const student = await this.getStudentRecord(studentId);
		if (!student) return null;

		const [campusRows, communityRows, resourceRows, postRows] = await Promise.all([
			Database.query<CampusRow[]>(
				`${campusSelect} WHERE campus_id = ? LIMIT 1`,
				[student.campusId],
			),
			Database.query<CommunityRow[]>(
				`${communitySelect} WHERE campus_id = ? ORDER BY name ASC`,
				[student.campusId],
			),
			Database.query<ResourceRow[]>(
				`
					SELECT
						resource_id AS resourceId,
						student_id AS studentId,
						community_id AS communityId,
						title,
						file_url AS fileUrl,
						DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS createdAt
					FROM resource
					WHERE student_id = ?
					ORDER BY created_at DESC
				`,
				[studentId],
			),
			Database.query<PostFeedRow[]>(
				`${postFeedSelect} WHERE p.student_id = ? ORDER BY p.created_at DESC`,
				[studentId],
			),
		]);

		return {
			...student,
			campus: campusRows[0] ?? null,
			communities: communityRows,
			resources: resourceRows,
			posts: postRows,
		};
	}

	public async updateStudentHandles(
		studentId: string,
		input: StudentHandleUpdateInput,
	): Promise<StudentRecord | null> {
		const existing = await this.getStudentRecord(studentId);
		if (!existing) return null;

		const nextHandles = this.normalizeHandleUpdate(input, existing);

		await Database.execute<ResultSetHeader>(
			`
				UPDATE student
				SET
					name = ?,
					email = ?,
					department = ?,
					batch = ?,
					instagram = ?,
					github = ?,
					linkedin = ?
				WHERE student_id = ?
			`,
			[
				nextHandles.name,
				nextHandles.email,
				nextHandles.department,
				nextHandles.batch,
				nextHandles.instagram,
				nextHandles.github,
				nextHandles.linkedin,
				studentId,
			],
		);

		return this.getStudentRecord(studentId);
	}

	public async createStudent(input: CreateStudentInput): Promise<StudentRecord> {
		const campusId = await this.resolveCampusId(input.campusId);
		const studentId = input.studentId ?? uid.rnd();

		await Database.execute<ResultSetHeader>(
			`
				INSERT INTO student (
					student_id,
					campus_id,
					name,
					email,
					password_hash,
					department,
					batch,
					bio,
					instagram,
					github,
					linkedin
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			`,
			[
				studentId,
				campusId,
				input.name,
				input.email,
				input.password ?? '',
				input.department ?? '',
				input.batch ?? 0,
				input.bio ?? '',
				input.instagram ?? '',
				input.github ?? '',
				input.linkedin ?? '',
			],
		);

		const createdStudent = await this.getStudentRecord(studentId);
		if (!createdStudent)
			throw new Error('Student was inserted but could not be reloaded');

		return createdStudent;
	}

	public async listCommunities(): Promise<CommunitySummary[]> {
		return Database.query<CommunitySummaryRow[]>(
			`
				SELECT
					c.community_id AS communityId,
					c.campus_id AS campusId,
					c.name,
					COALESCE(c.description, '') AS description,
					cp.campus_name AS campusName,
					(
						SELECT COUNT(*)
						FROM post p
						WHERE p.community_id = c.community_id
					) AS postCount,
					(
						SELECT COUNT(*)
						FROM resource r
						WHERE r.community_id = c.community_id
					) AS resourceCount
					,
					(
						SELECT COUNT(*)
						FROM community_member cm
						WHERE cm.community_id = c.community_id
					) AS memberCount
				FROM community c
				INNER JOIN campus cp ON cp.campus_id = c.campus_id
				ORDER BY c.name ASC
			`,
		);
	}

	public async createCommunity(input: {
		campusId: string;
		name: string;
		description: string;
		studentId: string;
	}): Promise<CommunitySummary> {
		const campusId = await this.resolveCampusId(input.campusId);
		const communityId = uid.rnd();

		await Database.execute<ResultSetHeader>(
			`
				INSERT INTO community (community_id, campus_id, name, description)
				VALUES (?, ?, ?, ?)
			`,
			[communityId, campusId, input.name, input.description],
		);

		await this.joinCommunity(communityId, input.studentId);
		const community = await this.getCommunity(communityId);
		if (!community) throw new Error('Community was created but could not reload');
		return community;
	}

	public async getCommunity(
		communityId: string,
		studentId?: string,
	): Promise<CommunitySummary | null> {
		const rows = await Database.query<CommunitySummaryRow[]>(
			`
				SELECT
					c.community_id AS communityId,
					c.campus_id AS campusId,
					c.name,
					COALESCE(c.description, '') AS description,
					cp.campus_name AS campusName,
					(SELECT COUNT(*) FROM post p WHERE p.community_id = c.community_id) AS postCount,
					(SELECT COUNT(*) FROM resource r WHERE r.community_id = c.community_id) AS resourceCount,
					(SELECT COUNT(*) FROM community_member cm WHERE cm.community_id = c.community_id) AS memberCount,
					${
						studentId
							? `(SELECT COUNT(*) FROM community_member cm WHERE cm.community_id = c.community_id AND cm.student_id = ?) AS joined`
							: `0 AS joined`
					}
				FROM community c
				INNER JOIN campus cp ON cp.campus_id = c.campus_id
				WHERE c.community_id = ?
				LIMIT 1
			`,
			studentId ? [studentId, communityId] : [communityId],
		);
		const community = rows[0];
		if (!community) return null;
		return { ...community, joined: Boolean(community.joined) };
	}

	public async joinCommunity(
		communityId: string,
		studentId: string,
	): Promise<void> {
		await Database.execute<ResultSetHeader>(
			`
				INSERT IGNORE INTO community_member (community_id, student_id)
				VALUES (?, ?)
			`,
			[communityId, studentId],
		);
	}

	public async listCommunityMembers(
		communityId: string,
	): Promise<StudentRecord[]> {
		return Database.query<StudentRow[]>(
			`
				${studentSelect}
				INNER JOIN community_member cm ON cm.student_id = student.student_id
				WHERE cm.community_id = ?
				ORDER BY student.name ASC
			`,
			[communityId],
		);
	}

	public async listPosts(communityId?: string): Promise<PostFeedItem[]> {
		if (communityId) {
			return Database.query<PostFeedRow[]>(
				`${postFeedSelect} WHERE p.community_id = ? ORDER BY p.created_at DESC`,
				[communityId],
			);
		}
		return Database.query<PostFeedRow[]>(
			`${postFeedSelect} ORDER BY p.created_at DESC`,
		);
	}

	public async createPost(input: {
		studentId: string;
		communityId: string;
		content: string;
	}): Promise<PostFeedItem> {
		const postId = uid.rnd();
		await Database.execute<ResultSetHeader>(
			`
				INSERT INTO post (post_id, student_id, community_id, content)
				VALUES (?, ?, ?, ?)
			`,
			[postId, input.studentId, input.communityId, input.content],
		);
		const rows = await Database.query<PostFeedRow[]>(
			`${postFeedSelect} WHERE p.post_id = ? LIMIT 1`,
			[postId],
		);
		if (!rows[0]) throw new Error('Post was created but could not reload');
		return rows[0];
	}

	public async updatePost(
		postId: string,
		studentId: string,
		content: string,
	): Promise<PostFeedItem | null> {
		const result = await Database.execute<ResultSetHeader>(
			`UPDATE post SET content = ? WHERE post_id = ? AND student_id = ?`,
			[content, postId, studentId],
		);
		if (result.affectedRows === 0) return null;
		const rows = await Database.query<PostFeedRow[]>(
			`${postFeedSelect} WHERE p.post_id = ? LIMIT 1`,
			[postId],
		);
		return rows[0] ?? null;
	}

	public async deletePost(postId: string, studentId: string): Promise<boolean> {
		const result = await Database.execute<ResultSetHeader>(
			`DELETE FROM post WHERE post_id = ? AND student_id = ?`,
			[postId, studentId],
		);
		return result.affectedRows > 0;
	}

	public async listResources(communityId?: string): Promise<ResourceFeedItem[]> {
		if (communityId) {
			return Database.query<ResourceFeedRow[]>(
				`${resourceFeedSelect} WHERE r.community_id = ? ORDER BY r.created_at DESC`,
				[communityId],
			);
		}
		return Database.query<ResourceFeedRow[]>(
			`${resourceFeedSelect} ORDER BY r.created_at DESC`,
		);
	}

	public async createResource(input: {
		studentId: string;
		communityId: string;
		title: string;
		fileUrl: string;
	}): Promise<ResourceFeedItem> {
		const resourceId = uid.rnd();
		await Database.execute<ResultSetHeader>(
			`
				INSERT INTO resource (resource_id, student_id, community_id, title, file_url)
				VALUES (?, ?, ?, ?, ?)
			`,
			[resourceId, input.studentId, input.communityId, input.title, input.fileUrl],
		);
		const rows = await Database.query<ResourceFeedRow[]>(
			`${resourceFeedSelect} WHERE r.resource_id = ? LIMIT 1`,
			[resourceId],
		);
		if (!rows[0]) throw new Error('Resource was created but could not reload');
		return rows[0];
	}
}

export default new SchemaService();
