import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { STOCK_CONFIGS } from './stock-config';

export async function generateStockReportPDF(
	rows: any[],
	category: string,
	showOutOfStock?: boolean,
	showLowStock?: boolean
): Promise<void> {
	const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
	const pageWidth = pdf.internal.pageSize.getWidth();
	const pageHeight = pdf.internal.pageSize.getHeight();
	const margin = 10;

	// Title
	pdf.setFontSize(16);
	pdf.setFont('helvetica', 'bold');
	pdf.setTextColor(0, 0, 0);
	const categoryTitle = STOCK_CONFIGS[category as keyof typeof STOCK_CONFIGS]?.title || category;
	pdf.text(`Reporte de Stock - ${categoryTitle}`, margin, 15);

	// Subtitle with filter info
	pdf.setFontSize(10);
	pdf.setFont('helvetica', 'normal');
	const date = new Date().toLocaleDateString('es-AR', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
	pdf.text(`Fecha: ${date}`, margin, 22);

	let yOffset = 28;

	const filterText = [];
	if (showOutOfStock) filterText.push('Sin stock');
	if (showLowStock) filterText.push('Stock bajo');
	if (filterText.length > 0) {
		pdf.text(`Filtros: ${filterText.join(', ')}`, margin, yOffset);
		yOffset += 7;
	}

	// Get column headers based on category
	const config = STOCK_CONFIGS[category as keyof typeof STOCK_CONFIGS];
	if (!config) {
		throw new Error(`Invalid category: ${category}`);
	}

	const headers = [['Código', 'Descripción', 'Categoría', 'Línea', 'Marca', 'Color', 'Cantidad Bultos', 'Cantidad', 'Sitio', 'Material']];

	// Table data
	const tableData = rows.map((row) => [
		row[config.fields.code] || '—',
		row[config.fields.description] || '—',
		row[config.fields.category] || '—',
		row[config.fields.line] || '—',
		row[config.fields.brand] || '—',
		row[config.fields.color] || '—',
		row[config.fields.quantityLump] || 0,
		row[config.fields.quantity] || 0,
		row[config.fields.site] || '—',
		row[config.fields.material] || '—',
	]);

	// Generate table
	autoTable(pdf, {
		head: headers,
		body: tableData,
		startY: yOffset,
		margin: { top: margin, left: margin, right: margin, bottom: margin },
		styles: {
			fontSize: 8,
			cellPadding: 2,
			font: 'helvetica',
		},
		headStyles: {
			fontSize: 9,
			fontStyle: 'bold',
			fillColor: [66, 66, 66],
			textColor: [255, 255, 255],
		},
		columnStyles: {
			0: { cellWidth: 25 }, // Código
			1: { cellWidth: 50 }, // Descripción
			2: { cellWidth: 25 }, // Categoría
			3: { cellWidth: 25 }, // Línea
			4: { cellWidth: 25 }, // Marca
			5: { cellWidth: 20 }, // Color
			6: { cellWidth: 20 }, // Cantidad Bultos
			7: { cellWidth: 20 }, // Cantidad
			8: { cellWidth: 25 }, // Sitio
			9: { cellWidth: 25 }, // Material
		},
		didDrawPage: (data) => {
			// Footer with page numbers
			const totalPages = pdf.internal.pages.length - 1;
			pdf.setFontSize(8);
			pdf.setFont('helvetica', 'italic');
			pdf.setTextColor(150);
			pdf.text(
				`Página ${data.pageNumber} de ${totalPages}`,
				pageWidth / 2,
				pageHeight - 10,
				{ align: 'center' }
			);
			pdf.setTextColor(0);
		},
	});

	// Save PDF
	const filterSuffix = filterText.length > 0 ? `_${filterText.join('_').toLowerCase().replace(/\s+/g, '_')}` : '';
	const fileName = `stock_${category.toLowerCase()}${filterSuffix}_${new Date().toISOString().split('T')[0]}.pdf`;
	pdf.save(fileName);
}
