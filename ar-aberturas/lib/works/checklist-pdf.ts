import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Checklist, ChecklistItem } from './checklists';

export async function generateChecklistPDF(checklists: Checklist[], clientName?: string): Promise<void> {
	const pdf = new jsPDF('p', 'mm', 'a4');
	const pageWidth = pdf.internal.pageSize.getWidth();
	const pageHeight = pdf.internal.pageSize.getHeight();
	const margin = 10;
	const gutter = 6;
	const footerReserve = 14;
	const columnWidth = (pageWidth - (2 * margin) - gutter) / 2;
	let yPosition = margin;

	const addTextAt = (
		text: string,
		x: number,
		y: number,
		maxWidth: number,
		fontSize: number = 12,
		fontStyle: string = 'normal'
	) => {
		pdf.setFontSize(fontSize);
		pdf.setFont('helvetica', fontStyle);
		const lines = pdf.splitTextToSize(text, maxWidth);
		const lineHeight = fontSize * 0.35;
		lines.forEach((line: string, idx: number) => {
			pdf.text(line, x, y + (idx * lineHeight));
		});
		return lines.length * lineHeight;
	};

	const estimateChecklistHeight = (checklist: Checklist) => {
		const rowHeight = 7;
		const itemsCount = checklist.items?.length ?? 0;
		const headerHeight = rowHeight;
		const tableRowsHeight = itemsCount * rowHeight;
		const observationsHeight = 10 + (10 * 0.35) + 8;
		return headerHeight + tableRowsHeight + observationsHeight;
	};

	const renderChecklistAt = (
		checklist: Checklist,
		checklistIndex: number,
		xLeft: number,
		yTop: number,
		width: number
	) => {
		const startY = yTop;
		const tableLeft = xLeft;
		const tableWidth = width;
		const cellPadding = 2;
		const rowHeight = 7;

		const col1Width = tableWidth * 0.52;
		const col2Width = tableWidth * 0.24;
		const col3Width = tableWidth - col1Width - col2Width;

		pdf.setFontSize(9);
		pdf.setFont('helvetica', 'bold');

		pdf.rect(tableLeft, startY, col1Width, rowHeight);
		const identifierType = `${checklist.name || `PV${checklistIndex + 1}`} - ${checklist.type_opening || ''}`;
		const identifierText = pdf.splitTextToSize(identifierType, col1Width - (2 * cellPadding));
		pdf.text(identifierText[0] || '', tableLeft + cellPadding, startY + rowHeight / 2 + 1);

		pdf.rect(tableLeft + col1Width, startY, col2Width, rowHeight);
		const descriptionText = pdf.splitTextToSize(checklist.description || 'Sin descripción', col2Width - (2 * cellPadding));
		pdf.text(descriptionText[0] || '', tableLeft + col1Width + cellPadding, startY + rowHeight / 2 + 1);

		pdf.rect(tableLeft + col1Width + col2Width, startY, col3Width, rowHeight);
		pdf.text(`${checklist.width || '0'} X ${checklist.height || '0'}`, tableLeft + col1Width + col2Width + cellPadding, startY + rowHeight / 2 + 1);

		pdf.setFont('helvetica', 'normal');
		pdf.setFontSize(8.5);

		const items = checklist.items || [];
		items.forEach((item: ChecklistItem, itemIndex: number) => {
			const currentY = startY + ((itemIndex + 1) * rowHeight);
			pdf.rect(tableLeft, currentY, col1Width, rowHeight);
			const itemText = pdf.splitTextToSize(item.name, col1Width - (2 * cellPadding));
			pdf.text(itemText[0] || '', tableLeft + cellPadding, currentY + rowHeight / 2 + 1);
			pdf.rect(tableLeft + col1Width, currentY, col2Width, rowHeight);
			pdf.rect(tableLeft + col1Width + col2Width, currentY, col3Width, rowHeight);
		});

		const afterTableY = startY + ((items.length + 1) * rowHeight);
		const obsY = afterTableY + 8;
		addTextAt('OBSERVACIONES:', tableLeft, obsY, tableWidth, 9, 'bold');
		return (obsY + (9 * 0.35) + 8) - startY;
	};

	const title = clientName ? `CHECKLISTS - ${clientName.toUpperCase()}` : 'CHECKLISTS';
	const titleHeight = addTextAt(title, margin, yPosition, pageWidth - (2 * margin), 14, 'normal');
	yPosition += titleHeight + 6;

	for (let i = 0; i < checklists.length; i += 2) {
		const left = checklists[i];
		const right = i + 1 < checklists.length ? checklists[i + 1] : undefined;

		const leftHeight = estimateChecklistHeight(left);
		const rightHeight = right ? estimateChecklistHeight(right) : 0;
		const rowHeight = Math.max(leftHeight, rightHeight);

		if (yPosition + rowHeight > pageHeight - margin - footerReserve) {
			pdf.addPage();
			yPosition = margin;
		}

		const leftX = margin;
		const rightX = margin + columnWidth + gutter;

		renderChecklistAt(left, i, leftX, yPosition, columnWidth);
		if (right) {
			renderChecklistAt(right, i + 1, rightX, yPosition, columnWidth);
		}

		yPosition += rowHeight + 6;
	}

	// Footer on each page
	const totalPages = pdf.internal.pages.length - 1; // pages array includes a dummy page at index 0
	for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
		pdf.setPage(pageNum);
		pdf.setFontSize(8);
		pdf.setFont('helvetica', 'italic');
		pdf.setTextColor(150, 150, 150);
		pdf.text(
			`Página ${pageNum} de ${totalPages}`,
			pageWidth / 2,
			pageHeight - 10,
			{ align: 'center' }
		);
		pdf.setTextColor(0, 0, 0);
	}

	// Save the PDF
	const fileName = `checklists_obra_${new Date().toISOString().split('T')[0]}.pdf`;
	pdf.save(fileName);
}

// Alternative function to generate PDF from HTML element
export async function generateChecklistPDFFromHTML(elementId: string, fileName?: string): Promise<void> {
	const element = document.getElementById(elementId);
	if (!element) {
		throw new Error(`Element with id "${elementId}" not found`);
	}

	try {
		const canvas = await html2canvas(element, {
			scale: 2,
			useCORS: true,
			allowTaint: true,
			backgroundColor: '#ffffff'
		});

		const imgData = canvas.toDataURL('image/png');
		const pdf = new jsPDF('p', 'mm', 'a4');
		
		const imgWidth = 210;
		const pageHeight = 297;
		const imgHeight = (canvas.height * imgWidth) / canvas.width;
		let heightLeft = imgHeight;
		let position = 0;

		pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
		heightLeft -= pageHeight;

		while (heightLeft >= 0) {
			position = heightLeft - imgHeight;
			pdf.addPage();
			pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
			heightLeft -= pageHeight;
		}

		const finalFileName = fileName || `checklist_obra_${new Date().toISOString().split('T')[0]}.pdf`;
		pdf.save(finalFileName);
	} catch (error) {
		console.error('Error generating PDF from HTML:', error);
		throw new Error('Failed to generate PDF from HTML element');
	}
}

// Utility function to prepare checklist data for PDF generation
export function prepareChecklistData(checklists: Checklist[]): Checklist[] {
	return checklists.map(checklist => ({
		...checklist,
	}));
}
