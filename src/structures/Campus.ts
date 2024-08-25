import Hotspot, { HotspotData } from './Hotspot';

class Campus {
	public hotspots: Set<Hotspot>;

	constructor() {
		this.hotspots = new Set<Hotspot>();
	}

	add(data: HotspotData): Set<Hotspot> {
		const HotspotInstance = new Hotspot(data);
		this.hotspots.add(HotspotInstance);
		return this.hotspots;
	}

	bulkAdd(datas: HotspotData[]): Set<Hotspot> {
		for (const data of datas) this.add(data);
		return this.hotspots;
	}
}

export default Campus;
