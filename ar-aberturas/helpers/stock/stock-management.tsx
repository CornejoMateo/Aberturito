import { STOCK_CONFIGS, type StockCategory } from '@/lib/stock/stock-config';

export const getTitle = (category: string, materialType: string) => {
    const categoryName =
        category === 'Perfiles' ? 'Perfiles' : STOCK_CONFIGS[category as StockCategory].title;
    if (category === 'Insumos') {
        return `Gestión de ${categoryName}`;
    }
    switch (materialType) {
        case 'Aluminio':
            return `${categoryName} de Aluminio`;
        case 'PVC':
            return `${categoryName} de PVC`;
        default:
            return `Gestión de ${categoryName}`;
    }
};

export const getDescription = (category: string, materialType: string) => {
    const categoryName =
        category === 'Perfiles' ? 'Perfiles' : STOCK_CONFIGS[category as StockCategory].title;
    if (category === 'Insumos') {
        return `Control de inventario de ${categoryName.toLowerCase()}`;
    }
    switch (materialType) {
        case 'Aluminio':
            return `Control de inventario de ${categoryName.toLowerCase()} de aluminio`;
        case 'PVC':
            return `Control de inventario de ${categoryName.toLowerCase()} de PVC`;
        default:
            return `Control de inventario de ${categoryName.toLowerCase()}`;
    }
};

export const formatCreatedAt = (dateValue: unknown) => {
    if (!dateValue) return 'N/A';
    const d = new Date(String(dateValue));
    if (isNaN(d.getTime())) return 'N/A';
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const year = d.getUTCFullYear();
    return `${day}/${month}/${year}`;
};