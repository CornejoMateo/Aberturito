export function filterStockItems(
	stock: any[],
	searchTerm: string,
	selectedCategory: string,
	materialType: 'Aluminio' | 'PVC' | undefined,
	category: 'Perfiles' | 'Accesorios' | 'Herrajes'
) {
	return (stock || []).filter((item: any) => {
		const searchLower = searchTerm.toLowerCase();
		const matchesSearch =
			(item.category?.toLowerCase() || '').includes(searchLower) ||
			(item.accessory_category?.toLowerCase?.() || '').includes(searchLower) ||
			(item.ironwork_category?.toLowerCase?.() || '').includes(searchLower) ||
			(item.code?.toLowerCase() || '').includes(searchLower) ||
			(item.line?.toLowerCase() || '').includes(searchLower) ||
			(item.accessory_line?.toLowerCase?.() || '').includes(searchLower) ||
			(item.ironwork_line?.toLowerCase?.() || '').includes(searchLower) ||
			(item.accessory_brand?.toLowerCase?.() || '').includes(searchLower) ||
			(item.ironwork_brand?.toLowerCase?.() || '').includes(searchLower) ||
			(item.color?.toLowerCase() || '').includes(searchLower) ||
			(item.site?.toLowerCase() || '').includes(searchLower) ||
			(item.accessory_code?.toLowerCase?.() || '').includes(searchLower) ||
			(item.accessory_description?.toLowerCase?.() || '').includes(searchLower) ||
			(item.ironwork_code?.toLowerCase?.() || '').includes(searchLower) ||
			(item.ironwork_description?.toLowerCase?.() || '').includes(searchLower) ||
			(item.ironwork_line?.toLowerCase?.() || '').includes(searchLower);

		let matchesCategory = true;
		if (category === 'Perfiles') {
			matchesCategory = item.category === selectedCategory;
		} else if (category === 'Accesorios') {
			matchesCategory = true; // accessories don't use the same category field
		}

		const matchesMaterial =
			!materialType || (item.material || item.accessory_material || item.ironwork_material || '').toLowerCase() === materialType.toLowerCase();

		return matchesSearch && matchesCategory && matchesMaterial;
	});
}
