interface HotspotData {
	type: string;
	location: string;
}

class Hotspot implements HotspotData {
	public location: string;
	public type: string;

	constructor(data: HotspotData) {
		this.type = data.type;
		this.location = data.location;
	}
	// I'm out of ideas for methods lol
}

export default Hotspot;

export { HotspotData };
