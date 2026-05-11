import type { StudentProfile, StudentRecord } from '../types/schema';

export function serializeStudentRecord(student: StudentRecord) {
	return {
		...student,
		id: student.studentId,
		picture: '',
		handles: {
			instagram: student.instagram,
			github: student.github,
			facebook: '',
			linkedin: student.linkedin,
		},
	};
}

export function serializeStudentProfile(student: StudentProfile) {
	return {
		...serializeStudentRecord(student),
		campus: student.campus,
		communities: student.communities,
		resources: student.resources,
		posts: student.posts,
	};
}
