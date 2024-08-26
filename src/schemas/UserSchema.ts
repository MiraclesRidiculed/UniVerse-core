import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
	id: {
		type: String,
		required: true,
		unique: true,
	},
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true
	},
	department: {
		type: String,
		required: true,
	},
	batch: {
		type: Number,
		required: true,
	},
	handles: {
		instagram: String,
		github: String,
		facebook: String,
		twitter: String,
		linkedin: String,
	}
});

export default mongoose.model('User', UserSchema);
