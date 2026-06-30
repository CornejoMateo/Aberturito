import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export async function generateBalancesReportPDF(
	rows: any[],
	balanceTypeFilter?: string,
	purchaseMin?: string,
	purchaseMax?: string,
	deliveriesMin?: string,
	deliveriesMax?: string,
	balanceAmountMin?: string,
	balanceAmountMax?: string,
	usdContractMin?: string,
	usdContractMax?: string,
	usdCurrentMin?: string,
	usdCurrentMax?: string,
	balanceInUseMin?: string,
	balanceInUseMax?: string
): Promise<void> {
	const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
	const pageWidth = pdf.internal.pageSize.getWidth();
	const pageHeight = pdf.internal.pageSize.getHeight();
	const margin = 10;

	// Title
	pdf.setFontSize(16);
	pdf.setFont('helvetica', 'bold');
	pdf.setTextColor(0, 0, 0);
	pdf.text('Reporte de Saldos', margin, 15);

	// Subtitle with filter info
	pdf.setFontSize(10);
	pdf.setFont('helvetica', 'normal');
	const date = new Date().toLocaleDateString('es-AR', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
	pdf.text(`Fecha: ${date}`, margin, 22);

	let yOffset = 28;

	if (balanceTypeFilter && balanceTypeFilter !== 'all') {
		pdf.text(`Tipo de saldo: ${balanceTypeFilter}`, margin, yOffset);
		yOffset += 7;
	}

	if (purchaseMin && purchaseMin !== '' || purchaseMax && purchaseMax !== '') {
		const filterText = [];
		if (purchaseMin && purchaseMin !== '') {
			const min = parseFloat(purchaseMin.replace(/\./g, '').replace(',', '.'));
			if (!isNaN(min)) filterText.push(`Mín: $${min.toLocaleString('es-AR')}`);
		}
		if (purchaseMax && purchaseMax !== '') {
			const max = parseFloat(purchaseMax.replace(/\./g, '').replace(',', '.'));
			if (!isNaN(max)) filterText.push(`Máx: $${max.toLocaleString('es-AR')}`);
		}
		pdf.text(`Compra ARS: ${filterText.join(' - ')}`, margin, yOffset);
		yOffset += 7;
	}

	if (deliveriesMin && deliveriesMin !== '' || deliveriesMax && deliveriesMax !== '') {
		const filterText = [];
		if (deliveriesMin && deliveriesMin !== '') {
			const min = parseFloat(deliveriesMin.replace(/\./g, '').replace(',', '.'));
			if (!isNaN(min)) filterText.push(`Mín: $${min.toLocaleString('es-AR')}`);
		}
		if (deliveriesMax && deliveriesMax !== '') {
			const max = parseFloat(deliveriesMax.replace(/\./g, '').replace(',', '.'));
			if (!isNaN(max)) filterText.push(`Máx: $${max.toLocaleString('es-AR')}`);
		}
		pdf.text(`Entregas ARS: ${filterText.join(' - ')}`, margin, yOffset);
		yOffset += 7;
	}

	if (balanceAmountMin && balanceAmountMin !== '' || balanceAmountMax && balanceAmountMax !== '') {
		const filterText = [];
		if (balanceAmountMin && balanceAmountMin !== '') {
			const min = parseFloat(balanceAmountMin.replace(/\./g, '').replace(',', '.'));
			if (!isNaN(min)) filterText.push(`Mín: $${min.toLocaleString('es-AR')}`);
		}
		if (balanceAmountMax && balanceAmountMax !== '') {
			const max = parseFloat(balanceAmountMax.replace(/\./g, '').replace(',', '.'));
			if (!isNaN(max)) filterText.push(`Máx: $${max.toLocaleString('es-AR')}`);
		}
		pdf.text(`Saldo ARS: ${filterText.join(' - ')}`, margin, yOffset);
		yOffset += 7;
	}

	if (usdContractMin && usdContractMin !== '' || usdContractMax && usdContractMax !== '') {
		const filterText = [];
		if (usdContractMin && usdContractMin !== '') {
			const min = parseFloat(usdContractMin.replace(/\./g, '').replace(',', '.'));
			if (!isNaN(min)) filterText.push(`Mín: $${min.toLocaleString('en-US')}`);
		}
		if (usdContractMax && usdContractMax !== '') {
			const max = parseFloat(usdContractMax.replace(/\./g, '').replace(',', '.'));
			if (!isNaN(max)) filterText.push(`Máx: $${max.toLocaleString('en-US')}`);
		}
		pdf.text(`USD Contrato: ${filterText.join(' - ')}`, margin, yOffset);
		yOffset += 7;
	}

	if (usdCurrentMin && usdCurrentMin !== '' || usdCurrentMax && usdCurrentMax !== '') {
		const filterText = [];
		if (usdCurrentMin && usdCurrentMin !== '') {
			const min = parseFloat(usdCurrentMin.replace(/\./g, '').replace(',', '.'));
			if (!isNaN(min)) filterText.push(`Mín: $${min.toLocaleString('en-US')}`);
		}
		if (usdCurrentMax && usdCurrentMax !== '') {
			const max = parseFloat(usdCurrentMax.replace(/\./g, '').replace(',', '.'));
			if (!isNaN(max)) filterText.push(`Máx: $${max.toLocaleString('en-US')}`);
		}
		pdf.text(`USD Actual: ${filterText.join(' - ')}`, margin, yOffset);
		yOffset += 7;
	}

	if (balanceInUseMin && balanceInUseMin !== '' || balanceInUseMax && balanceInUseMax !== '') {
		const filterText = [];
		if (balanceInUseMin && balanceInUseMin !== '') {
			const min = parseFloat(balanceInUseMin.replace(/\./g, '').replace(',', '.'));
			if (!isNaN(min)) filterText.push(`Mín: $${min.toLocaleString('en-US')}`);
		}
		if (balanceInUseMax && balanceInUseMax !== '') {
			const max = parseFloat(balanceInUseMax.replace(/\./g, '').replace(',', '.'));
			if (!isNaN(max)) filterText.push(`Máx: $${max.toLocaleString('en-US')}`);
		}
		pdf.text(`Saldo USD: ${filterText.join(' - ')}`, margin, yOffset);
		yOffset += 7;
	}

	// Table data
	const tableData = rows.map((row) => [
		row.contractDate,
		row.client,
		row.work,
		row.concept,
		row.purchaseArs.toLocaleString('es-AR', { minimumFractionDigits: 2 }),
		row.deliveriesArs.toLocaleString('es-AR', { minimumFractionDigits: 2 }),
		row.balanceType,
		row.balanceAmountArs.toLocaleString('es-AR', { minimumFractionDigits: 2 }),
		row.usdContractRef.toLocaleString('en-US', { minimumFractionDigits: 2 }),
		row.usdCurrentToCancel !== null ? row.usdCurrentToCancel.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-',
		row.balanceInUseUsd.toLocaleString('en-US', { minimumFractionDigits: 2 }),
	]);

	// Table headers
	const headers = [
		['Fecha', 'Cliente', 'Obra', 'Concepto', 'Compra ARS', 'Entregas ARS', 'Tipo', 'Saldo ARS', 'USD Contrato', 'USD Actual', 'Saldo USD'],
	];

	// Generate table
	autoTable(pdf, {
		head: headers,
		body: tableData,
		startY: yOffset,
		margin: { top: margin, left: margin, right: margin, bottom: margin },
		styles: {
			fontSize: 6.5,
			cellPadding: 1,
			font: 'helvetica',
		},
		headStyles: {
			fontSize: 7.5,
			fontStyle: 'bold',
			fillColor: [66, 66, 66],
			textColor: [255, 255, 255],
		},
		columnStyles: {
			0: { cellWidth: 18 }, // Fecha
			1: { cellWidth: 25 }, // Cliente
			2: { cellWidth: 35 }, // Obra
			3: { cellWidth: 25 }, // Concepto
			4: { cellWidth: 25 }, // Compra ARS
			5: { cellWidth: 25 }, // Entregas ARS
			6: { cellWidth: 18 }, // Tipo
			7: { cellWidth: 25 }, // Saldo ARS
			8: { cellWidth: 25 }, // USD Contrato
			9: { cellWidth: 25 }, // USD Actual
			10: { cellWidth: 25 }, // Saldo USD
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
	const fileDate = new Date();
	const day = String(fileDate.getDate()).padStart(2, '0');
	const month = String(fileDate.getMonth() + 1).padStart(2, '0');
	const year = fileDate.getFullYear();
	const formattedDate = `${day}-${month}-${year}`;

	const fileName = balanceTypeFilter && balanceTypeFilter !== 'all'
		? `saldos_${balanceTypeFilter}_${formattedDate}.pdf`
		: `saldos_${formattedDate}.pdf`;
	pdf.save(fileName);
}
