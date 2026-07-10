import { formatCreatedAt } from '@/helpers/date/format-date';
import { formatCurrency, formatCurrencyUSD } from '@/helpers/format-prices.tsx/formats';
import { parseArsToNumber } from '@/utils/budgets/utils';
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

	if ((purchaseMin && purchaseMin !== '') || (purchaseMax && purchaseMax !== '')) {
		const filterText = [];
		if (purchaseMin && purchaseMin !== '') {
			const min = formatCurrency(parseArsToNumber(purchaseMin));
			filterText.push(`Mín: ${min}`);
		}
		if (purchaseMax && purchaseMax !== '') {
			const max = formatCurrency(parseArsToNumber(purchaseMax));
			filterText.push(`Máx: ${max}`);
		}
		pdf.text(`Compra ARS: ${filterText.join(' - ')}`, margin, yOffset);
		yOffset += 7;
	}

	if ((deliveriesMin && deliveriesMin !== '') || (deliveriesMax && deliveriesMax !== '')) {
		const filterText = [];
		if (deliveriesMin && deliveriesMin !== '') {
			const min = formatCurrency(parseArsToNumber(deliveriesMin));
			filterText.push(`Mín: ${min}`);
		}
		if (deliveriesMax && deliveriesMax !== '') {
			const max = formatCurrency(parseArsToNumber(deliveriesMax));
			filterText.push(`Máx: ${max}`);
		}
		pdf.text(`Entregas ARS: ${filterText.join(' - ')}`, margin, yOffset);
		yOffset += 7;
	}

	if (
		(balanceAmountMin && balanceAmountMin !== '') ||
		(balanceAmountMax && balanceAmountMax !== '')
	) {
		const filterText = [];
		if (balanceAmountMin && balanceAmountMin !== '') {
			const min = formatCurrency(parseArsToNumber(balanceAmountMin));
			filterText.push(`Mín: ${min}`);
		}
		if (balanceAmountMax && balanceAmountMax !== '') {
			const max = formatCurrency(parseArsToNumber(balanceAmountMax));
			filterText.push(`Máx: ${max}`);
		}
		pdf.text(`Saldo ARS: ${filterText.join(' - ')}`, margin, yOffset);
		yOffset += 7;
	}

	if ((usdContractMin && usdContractMin !== '') || (usdContractMax && usdContractMax !== '')) {
		const filterText = [];
		if (usdContractMin && usdContractMin !== '') {
			const min = formatCurrency(parseArsToNumber(usdContractMin));
			filterText.push(`Mín: ${min}`);
		}
		if (usdContractMax && usdContractMax !== '') {
			const max = formatCurrency(parseArsToNumber(usdContractMax));
			filterText.push(`Máx: ${max}`);
		}
		pdf.text(`USD Contrato: ${filterText.join(' - ')}`, margin, yOffset);
		yOffset += 7;
	}

	if ((usdCurrentMin && usdCurrentMin !== '') || (usdCurrentMax && usdCurrentMax !== '')) {
		const filterText = [];
		if (usdCurrentMin && usdCurrentMin !== '') {
			const min = formatCurrency(parseArsToNumber(usdCurrentMin));
			filterText.push(`Mín: ${min}`);
		}
		if (usdCurrentMax && usdCurrentMax !== '') {
			const max = formatCurrency(parseArsToNumber(usdCurrentMax));
			filterText.push(`Máx: ${max}`);
		}
		pdf.text(`USD Actual: ${filterText.join(' - ')}`, margin, yOffset);
		yOffset += 7;
	}

	if ((balanceInUseMin && balanceInUseMin !== '') || (balanceInUseMax && balanceInUseMax !== '')) {
		const filterText = [];
		if (balanceInUseMin && balanceInUseMin !== '') {
			const min = formatCurrency(parseArsToNumber(balanceInUseMin));
			filterText.push(`Mín: ${min}`);
		}
		if (balanceInUseMax && balanceInUseMax !== '') {
			const max = formatCurrency(parseArsToNumber(balanceInUseMax));
			filterText.push(`Máx: ${max}`);
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
		row.purchaseArs.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 3 }),
		row.deliveriesArs.toLocaleString('es-AR', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 3,
		}),
		row.balanceType,
		row.balanceAmountArs.toLocaleString('es-AR', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 3,
		}),
		row.usdContractRef.toLocaleString('en-US', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 3,
		}),
		row.balanceInUseUsd.toLocaleString('en-US', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 3,
		}),
		row.seller,
	]);

	// Table headers
	const headers = [
		[
			'Fecha',
			'Cliente',
			'Obra',
			'Concepto',
			'Compra ARS',
			'Entregas ARS',
			'Tipo',
			'Saldo ARS',
			'USD Contrato',
			'Saldo USD',
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
			10: { cellWidth: 25 }, // Saldo USD
			11: { cellWidth: 25 }, // Vendedor
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

	// Save PDF
	const fileDate = new Date();

	const fileName =
		balanceTypeFilter && balanceTypeFilter !== 'all'
			? `saldos_${balanceTypeFilter}_${formatCreatedAt(fileDate)}.pdf`
			: `saldos_${formatCreatedAt(fileDate)}.pdf`;
	pdf.save(fileName);
}
