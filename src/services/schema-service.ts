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
		department,
		batch,
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
		if (!rows[0])
			throw new Error(
				'No campus records found. Seed the campus table before creating students.',
			);

		return rows[0].campusId;
	}

	private normalizeHandleUpdate(
		input: StudentHandleUpdateInput,
		existing: StudentRecord,
	): Required<StudentHandleUpdateInput> {
		return {
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
					instagram = ?,
					github = ?,
					linkedin = ?
				WHERE student_id = ?
			`,
			[
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
					department,
					batch,
					instagram,
					github,
					linkedin
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
			`,
			[
				studentId,
				campusId,
				input.name,
				input.email,
				input.department,
				input.batch,
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
				FROM community c
				INNER JOIN campus cp ON cp.campus_id = c.campus_id
				ORDER BY c.name ASC
			`,
		);
	}

	public async listPosts(): Promise<PostFeedItem[]> {
		return Database.query<PostFeedRow[]>(
			`${postFeedSelect} ORDER BY p.created_at DESC`,
		);
	}

	public async listResources(): Promise<ResourceFeedItem[]> {
		return Database.query<ResourceFeedRow[]>(
			`${resourceFeedSelect} ORDER BY r.created_at DESC`,
		);
	}
}

export default new SchemaService();
