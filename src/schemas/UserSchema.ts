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
		instagram: {
			type: String,
			default: '',
		},
		github: {
			type: String,
			default: '',
		},
		facebook: {
			type: String,
			default: '',
		},
		linkedin: {
			type: String,
			default: '',
		},
	},
	picture: {
		type: String,
		default: 'https://insights2techinfo.com/wp-content/uploads/2022/01/za.png',
	},
});

export default mongoose.model('User', UserSchema);
