import { parseArsToNumber } from '@/utils/budgets/utils';
import { formatCurrency } from '@/helpers/format-prices.tsx/formats';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCreatedAt } from '@/helpers/date/format-date';

export async function generateBudgetsReportPDF(
	rows: any[],
	sellerFilter?: string,
	amountMin?: string,
	amountMax?: string,
	amountMinUsd?: string,
	amountMaxUsd?: string
): Promise<void> {
	const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
	const pageWidth = pdf.internal.pageSize.getWidth();
	const pageHeight = pdf.internal.pageSize.getHeight();
	const margin = 10;

	// Title
	pdf.setFontSize(16);
	pdf.setFont('helvetica', 'bold');
	pdf.setTextColor(0, 0, 0);
	pdf.text('Reporte de Presupuestos', margin, 15);

	// Subtitle with filter info
	pdf.setFontSize(10);
	pdf.setFont('helvetica', 'normal');
	const date = new Date().toLocaleDateString('es-AR', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
	pdf.text(`Fecha: ${date}`, margin, 22);

	if (sellerFilter && sellerFilter !== 'all') {
		const sellerName = sellerFilter === 'none' ? 'Sin vendedor' : rows[0]?.seller || '';
		pdf.text(`Vendedor: ${sellerName}`, margin, 28);
	}

	let yOffset = sellerFilter && sellerFilter !== 'all' ? 35 : 28;

	if ((amountMin && amountMin !== '') || (amountMax && amountMax !== '')) {
		const filterText = [];
		if (amountMin && amountMin !== '') {
			const min = formatCurrency(parseArsToNumber(amountMin));
			filterText.push(`Mín: ${min}`);
		}
		if (amountMax && amountMax !== '') {
			const max = formatCurrency(parseArsToNumber(amountMax));
			filterText.push(`Máx: ${max}`);
		}
		pdf.text(`Monto ARS: ${filterText.join(' - ')}`, margin, yOffset);
		yOffset += 7;
	}

	if ((amountMinUsd && amountMinUsd !== '') || (amountMaxUsd && amountMaxUsd !== '')) {
		const filterText = [];
		if (amountMinUsd && amountMinUsd !== '') {
			const min = formatCurrency(parseArsToNumber(amountMinUsd));
			filterText.push(`Mín: $${min}`);
		}
		if (amountMaxUsd && amountMaxUsd !== '') {
			const max = formatCurrency(parseArsToNumber(amountMaxUsd));
			filterText.push(`Máx: $${max}`);
		}
		pdf.text(`Monto USD: ${filterText.join(' - ')}`, margin, yOffset);
		yOffset += 7;
	}

	// Table data
	const tableData = rows.map((row) => [
		row.date,
		row.client,
		row.number,
		row.type,
		row.materialType,
		row.work,
		row.amountArs.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 3 }),
		row.amountUsd.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 3 }),
		row.status,
		row.seller,
	]);

	// Table headers
	const headers = [
		[
			'Fecha',
			'Cliente',
			'Número',
			'Tipo',
			'Material',
			'Obra',
			'Monto ARS',
			'Monto USD',
			'Estado',
			'Vendedor',
		],
	];

	// Generate table
	autoTable(pdf, {
		head: headers,
		body: tableData,
		startY: yOffset,
		margin: { top: margin, left: margin, right: margin, bottom: margin },
		styles: {
			fontSize: 7.5,
			cellPadding: 1.5,
			font: 'helvetica',
		},
		headStyles: {
			fontSize: 8.5,
			fontStyle: 'bold',
			fillColor: [66, 66, 66],
			textColor: [255, 255, 255],
		},
		columnStyles: {
			0: { cellWidth: 20 }, // Fecha
			1: { cellWidth: 30 }, // Cliente
			2: { cellWidth: 18 }, // Número
			3: { cellWidth: 20 }, // Tipo
			4: { cellWidth: 20 }, // Material
			5: { cellWidth: 50 }, // Obra
			6: { cellWidth: 28 }, // Monto ARS
			7: { cellWidth: 28 }, // Monto USD
			8: { cellWidth: 22 }, // Estado
			9: { cellWidth: 26 }, // Vendedor
		},
		didDrawPage: (data) => {
			// Footer with page numbers
			const totalPages = pdf.internal.pages.length - 1;
			pdf.setFontSize(8);
			pdf.setFont('helvetica', 'italic');
			pdf.setTextColor(150);
			pdf.text(`Página ${data.pageNumber} de ${totalPages}`, pageWidth / 2, pageHeight - 10, {
				align: 'center',
			});
			pdf.setTextColor(0);
		},
	});

	const fileDate = new Date();

	// Save PDF
	const fileName =
		sellerFilter && sellerFilter !== 'all'
			? `presupuestos_${sellerFilter === 'none' ? 'sin_vendedor' : rows[0]?.seller?.replace(/\s+/g, '_')}_${formatCreatedAt(fileDate)}.pdf`
			: `presupuestos_${formatCreatedAt(fileDate)}.pdf`;
	pdf.save(fileName);
}
