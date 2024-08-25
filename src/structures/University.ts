import UniVerse from '../app/UniVerse'
import Hotspot from './Hotspot';
import { departments, UniversityName, MetaData } from '../data/UniversityConstants';

interface UniversityMetaData {
	area: string;
	yearFounded: number;
	website: string;
	enrolled: number;
}

interface HotspotData {
	type: string;
	location: string;
}

class University {
	public hotspots: Set<Hotspot>;
	public departments: string[];
	public name: string;
	public UniVerse: UniVerse;
	public meta: UniversityMetaData;

	constructor(UniVerse: UniVerse) {
		this.hotspots = new Set<Hotspot>();
		this.departments = departments;
		this.UniVerse = UniVerse;
		this.name = UniversityName;
		this.meta = MetaData;
	}

	add(data: HotspotData): Set<Hotspot> {
		this.hotspots.add(data);
		return this.hotspots;
	}

	bulkAdd(datas: HotspotData[]): Set<Hotspot> {
		for (const data of datas) this.add(data);
		return this.hotspots;
	}

}

export default University;
