export interface CampusRecord {
	campusId: string;
	campusName: string;
	location: string;
}

export interface AdminRecord {
	adminId: string;
	campusId: string;
	name: string;
	email: string;
}

export interface StudentRecord {
	studentId: string;
	campusId: string;
	name: string;
	email: string;
	department: string;
	batch: number;
	instagram: string;
	github: string;
	linkedin: string;
}

export interface CommunityRecord {
	communityId: string;
	campusId: string;
	name: string;
	description: string;
}

export interface PostRecord {
	postId: string;
	studentId: string;
	communityId: string;
	content: string;
	createdAt: string;
}

export interface ResourceRecord {
	resourceId: string;
	studentId: string;
	communityId: string;
	title: string;
	fileUrl: string;
	createdAt: string;
}

export interface PostFeedItem extends PostRecord {
	studentName: string;
	studentDepartment: string;
	communityName: string;
}

export interface ResourceFeedItem extends ResourceRecord {
	studentName: string;
	studentDepartment: string;
	communityName: string;
	campusId: string;
}

export interface CommunitySummary extends CommunityRecord {
	campusName: string;
	postCount: number;
	resourceCount: number;
}

export interface CampusSummary extends CampusRecord {
	admins: AdminRecord[];
	students: StudentRecord[];
	communities: CommunityRecord[];
}

export interface StudentProfile extends StudentRecord {
	campus: CampusRecord | null;
	communities: CommunityRecord[];
	resources: ResourceRecord[];
	posts: PostFeedItem[];
}

export interface DashboardSummary {
	counts: {
		campuses: number;
		students: number;
		admins: number;
		communities: number;
		posts: number;
		resources: number;
	};
	recentPosts: PostFeedItem[];
	recentResources: ResourceFeedItem[];
}

export interface StudentHandleUpdateInput {
	instagram?: string;
	github?: string;
	linkedin?: string;
}

export interface CreateStudentInput {
	studentId?: string;
	campusId?: string;
	name: string;
	email: string;
	department: string;
	batch: number;
	instagram?: string;
	github?: string;
	linkedin?: string;
}
