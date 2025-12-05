// Funciones para obtener imágenes de la galería

export const fetchImages = async (materialType?: string, line?: string, code?: string) => {
	try {
		const params = new URLSearchParams();
		if (materialType) params.append('material_type', materialType);
		if (line) params.append('name_line', line);
		if (code) params.append('name_code', code);
		const res = await fetch(`/api/gallery/list?${params.toString()}`);
		const data = await res.json();
		return data;
	} catch (err: any) {
		throw err;
	}
};

export const fetchImagesAccsIronSupply = async (categoryState?: string, code?: string) => {
	try {
		const params = new URLSearchParams();
		params.append('mode', 'accs_iron_supply');
		if (categoryState) params.append('categoryState', categoryState);
		if (code) params.append('name_code', code);
		const res = await fetch(`/api/gallery/list?${params.toString()}`);
		const data = await res.json();
		return data;
	} catch (err: any) {
		throw err;
	}
};
