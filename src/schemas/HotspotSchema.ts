import mongoose, { Schema } from 'mongoose';

const HotspotSchema = new Schema({
	id: {
		type: String,
		required: true,
		unique: true,
	},
	type: {
		type: String,
		required: true,
	},
	location: {
		type: String,
		required: true,
	},
});

export default mongoose.model('Hotspot', HotspotSchema);
