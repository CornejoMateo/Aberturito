import {
	listStock,
	createProfileStock,
	updateProfileStock,
	deleteProfileStock,
    updateProfileQuantity,
} from '@/lib/stock/profile-stock';
import {
	listAccesoriesStock,
	createAccessoryStock,
	updateAccessoryStock,
	deleteAccesoryStock,
    updateAccessoryQuantity,
} from '@/lib/stock/accesorie-stock';
import {
	listIronworksStock,
	createIronworkStock,
	updateIronworkStock,
	deleteIronworkStock,
    updateIronworkQuantity,
} from '@/lib/stock/ironwork-stock';
import {
	listSuppliesStock,
	createSupplyStock,
	updateSupplyStock,
	deleteSupplyStock,
    updateSupplyQuantity,
} from '@/lib/stock/supplies-stock';

export type StockAdapter = {
	fetch: () => Promise<any[]>;
	create: (data: any) => Promise<any>;
	update: (id: number, data: any) => Promise<any>;
	remove: (id: number) => Promise<any>;
	getQuantity: (item: any) => number;
    updateQuantity: (id: number, newQuantity: number) => Promise<any>;
};

export const STOCK_ADAPTERS: Record<string, StockAdapter> = {
	Perfiles: {
		fetch: async () => {
			const { data, error } = await listStock();
			if (error) throw error;
			return data || [];
		},
		create: createProfileStock,
		update: updateProfileStock,
		remove: deleteProfileStock,
		getQuantity: (item) => item.quantity ?? 0,
        updateQuantity: updateProfileQuantity,
	},

	Accesorios: {
		fetch: async () => {
			const { data, error } = await listAccesoriesStock();
			if (error) throw error;
			return data || [];
		},
		create: createAccessoryStock,
		update: updateAccessoryStock,
		remove: deleteAccesoryStock,
		getQuantity: (item) => item.accessory_quantity ?? 0,
        updateQuantity: updateAccessoryQuantity,    
	},

	Insumos: {
		fetch: async () => {
			const { data, error } = await listSuppliesStock();
			if (error) throw error;
			return data || [];
		},
		create: createSupplyStock,
		update: updateSupplyStock,
		remove: deleteSupplyStock,
		getQuantity: (item) => item.supply_quantity ?? 0,
        updateQuantity: updateSupplyQuantity,
	},

	Herrajes: {
		fetch: async () => {
			const { data, error } = await listIronworksStock();
			if (error) throw error;
			return data || [];
		},
		create: createIronworkStock,
		update: updateIronworkStock,
		remove: deleteIronworkStock,
		getQuantity: (item) => item.ironwork_quantity ?? 0,
        updateQuantity: updateIronworkQuantity,
	},
};
