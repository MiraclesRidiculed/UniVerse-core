import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
	id: {
		type: String,
		required: true,
		unique: true
	},
	name: {
		type: String,
		required: true,
		unique: true
	},
	email: {
		type: String,
		required: true,
		unique: true
	},
	department: {
		type: String,
		required: true,
		unique: true
	},
	batch: {
		type: Number,
		required: true,
	}
});

export default mongoose.model('User', UserSchema);
