import UniVerse from '../app/UniVerse';
import Hotspot, { HotspotData } from './Hotspot';
import HotspotSchema from '../schemas/HotspotSchema';

import {
	departments,
	UniversityName,
	MetaData,
} from '../data/UniversityConstants';

interface UniversityMetaData {
	area: string;
	yearFounded: number;
	website: string;
	enrolled: number;
}

class University {
	public departments: string[];
	public name: string;
	public UniVerse: UniVerse;
	public meta: UniversityMetaData;
	public hotspots: Set<Hotspot>;

	constructor(UniVerse: UniVerse) {
		this.departments = departments;
		this.UniVerse = UniVerse;
		this.name = UniversityName;
		this.meta = MetaData;
		this.hotspots = new Set<Hotspot>();
	}

	addHotspot(data: HotspotData): Set<Hotspot> {
		const HotspotInstance = new Hotspot(data);
		this.hotspots.add(HotspotInstance);
		return this.hotspots;
	}

	bulkAddHotspot(datas: HotspotData[]): Set<Hotspot> {
		for (const data of datas) this.addHotspot(data);
		return this.hotspots;
	}

	async create(data: HotspotData): Promise<Hotspot|string> {
		const HotspotInstance = new HotspotSchema(data);
		try {
			await HotspotInstance.save();
			return HotspotInstance;
		} catch (e: any) {
			console.log(e);
			return (`${e}`);
		}
	}
}

export default University;
