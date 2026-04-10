export function formatShortDate(value: string | null | undefined) {
	if (!value) return '-';
	try {
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return '-';
		return date.toLocaleDateString('es-AR');
	} catch {
		return '-';
	}
}
