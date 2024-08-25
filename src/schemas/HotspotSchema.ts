import mongoose, { Schema } from 'mongoose';

const HotspotSchema = new Schema({
	type: {
		type: String,
		required: true,
	},
	location: {
		type: String,
		required: true,
	}
});

export default mongoose.model('Hotspot', HotspotSchema);
