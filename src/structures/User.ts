interface UserData {
	id: string;
	name: string;
	email: string;
	department: string;
	batch: number;
	handles: Handles;
}

interface Handles {
	instagram: string,
	github: string,
	facebook: string,
	linkedin: string,
}

class User implements UserData {
	id: string;
	name: string;
	email: string;
	department: string;
	batch: number;
	handles: Handles;

	constructor(data: UserData) {
		this.id = data.id
		this.name = data.name;
		this.email = data.email;
		this.department = data.department;
		this.batch = data.batch;
		this.handles = data.handles;
	}
}

export default User;
