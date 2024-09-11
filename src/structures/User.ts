import UserSchema from "../schemas/UserSchema";

export interface UserData {
	id: string;
	name: string;
	email: string;
	department: string;
	batch: number;
	handles: Handles;
	picture?: string;
}

export interface Handles {
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
	picture?: string;

	constructor(data: UserData) {
		this.id = data.id
		this.name = data.name;
		this.email = data.email;
		this.department = data.department;
		this.batch = data.batch;
		this.handles = data.handles;
		this.picture = data.picture || '';
	}

	async setPicture(link: string): Promise<User> {
		await UserSchema.updateOne({ id: this.id }, { picture: link });
		this.picture = link;
		return this;
	}

	async updateHandles(data: Handles): Promise<User> {
		await UserSchema.updateOne({ id: this.id }, { handles: data });
		this.handles = data;
		return this;
	}

	async createNew(): Promise<void> {
		await UserSchema.create(this);
	}
}

export default User;
