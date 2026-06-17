import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export async function generateBudgetsReportPDF(
	rows: any[],
	sellerFilter?: string,
	amountMin?: string,
	amountMax?: string
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

	if (amountMin && amountMin !== '' || amountMax && amountMax !== '') {
		const filterText = [];
		if (amountMin && amountMin !== '') filterText.push(`Mín: $${parseFloat(amountMin).toLocaleString('es-AR')}`);
		if (amountMax && amountMax !== '') filterText.push(`Máx: $${parseFloat(amountMax).toLocaleString('es-AR')}`);
		pdf.text(`Monto ARS: ${filterText.join(' - ')}`, margin, yOffset);
		yOffset += 7;
	}

	// Table data
	const tableData = rows.map((row) => [
		row.date,
		row.client,
		row.number,
		row.type,
		row.work,
		row.amountArs.toLocaleString('es-AR', { minimumFractionDigits: 2 }),
		row.amountUsd.toLocaleString('en-US', { minimumFractionDigits: 2 }),
		row.status,
		row.seller,
	]);

	// Table headers
	const headers = [
		['Fecha', 'Cliente', 'Número', 'Tipo', 'Obra', 'Monto ARS', 'Monto USD', 'Estado', 'Vendedor'],
	];

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
			0: { cellWidth: 25 }, // Fecha
			1: { cellWidth: 35 }, // Cliente
			2: { cellWidth: 20 }, // Número
			3: { cellWidth: 25 }, // Tipo
			4: { cellWidth: 60 }, // Obra
			5: { cellWidth: 30, halign: 'right' }, // Monto ARS
			6: { cellWidth: 30, halign: 'right' }, // Monto USD
			7: { cellWidth: 25 }, // Estado
			8: { cellWidth: 30 }, // Vendedor
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
	const fileName = sellerFilter && sellerFilter !== 'all'
		? `presupuestos_${sellerFilter === 'none' ? 'sin_vendedor' : rows[0]?.seller?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
		: `presupuestos_${new Date().toISOString().split('T')[0]}.pdf`;
	pdf.save(fileName);
}
