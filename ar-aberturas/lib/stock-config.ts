export type StockCategory = 'Accesorios' | 'Herrajes' | 'Insumos';

export interface StockConfig {
	title: string;
	tableName: string;
	galleryTableName: string;
	fields: {
		category: string;
		line: string;
		brand: string;
		code: string;
		description: string;
		color: string;
		quantityForLump: string;
		quantityLump: string;
		quantity: string;
		site: string;
		material: string;
		price: string;
		image_url: string;
		createdAt: string;
	};
}

export const STOCK_CONFIGS: Record<StockCategory, StockConfig> = {
	Accesorios: {
		title: 'Accesorios',
		tableName: 'accesories_category',
		galleryTableName: 'gallery_images_accesories',
		fields: {
			category: 'accessory_category',
			line: 'accessory_line',
			brand: 'accessory_brand',
			code: 'accessory_code',
			description: 'accessory_description',
			color: 'accessory_color',
			quantityForLump: 'accessory_quantity_for_lump',
			quantityLump: 'accessory_quantity_lump',
			quantity: 'accessory_quantity',
			site: 'accessory_site',
			material: 'accessory_material',
			price: 'accessory_price',
			image_url: 'accessory_image_url',
			createdAt: 'created_at',
		},
	},
	Herrajes: {
		title: 'Herrajes',
		tableName: 'ironworks_category',
		galleryTableName: 'gallery_images_ironworks',
		fields: {
			category: 'ironwork_category',
			line: 'ironwork_line',
			brand: 'ironwork_brand',
			code: 'ironwork_code',
			description: 'ironwork_description',
			color: 'ironwork_color',
			quantityForLump: 'ironwork_quantity_for_lump',
			quantityLump: 'ironwork_quantity_lump',
			quantity: 'ironwork_quantity',
			site: 'ironwork_site',
			material: 'ironwork_material',
			price: 'ironwork_price',
			image_url: 'ironwork_image_url',
			createdAt: 'created_at',
		},
	},
	Insumos: {
		title: 'Insumos',
		tableName: 'supplies_category',
		galleryTableName: 'gallery_images_supplies',
		fields: {
			category: 'supply_category',
			line: 'supply_line',
			brand: 'supply_brand',
			code: 'supply_code',
			description: 'supply_description',
			color: 'supply_color',
			quantityForLump: 'supply_quantity_for_lump',
			quantityLump: 'supply_quantity_lump',
			quantity: 'supply_quantity',
			site: 'supply_site',
			material: 'supply_material',
			price: 'supply_price',
			image_url: 'supply_image_url',
			createdAt: 'created_at',
		},
	},
};
