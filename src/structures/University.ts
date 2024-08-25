import UniVerse from '../app/UniVerse';
import Hotspot from './Hotspot';
import campus from './Campus';
import {
	departments,
	UniversityName,
	MetaData,
} from '../data/UniversityConstants';
import Campus from './Campus';

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
	public campus: Campus;

	constructor(UniVerse: UniVerse) {
		this.departments = departments;
		this.UniVerse = UniVerse;
		this.name = UniversityName;
		this.meta = MetaData;
		this.campus = new Campus();
	}
}

export default University;
