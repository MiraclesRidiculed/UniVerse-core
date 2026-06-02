export function cleanString(value: unknown, max = 255): string {
	if (typeof value !== 'string') return '';
	return value.trim().slice(0, max);
}

export function isEmail(value: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function parseBatch(value: unknown): number {
	const parsed = Number(value);
	if (!Number.isInteger(parsed) || parsed < 1900 || parsed > 2200) return 0;
	return parsed;
}
