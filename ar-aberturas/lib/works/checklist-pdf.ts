import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Checklist, ChecklistItem } from './checklists';

export async function generateChecklistPDF(checklists: Checklist[], clientName?: string): Promise<void> {
	const pdf = new jsPDF();
	const pageWidth = pdf.internal.pageSize.getWidth();
	const pageHeight = pdf.internal.pageSize.getHeight();
	const margin = 20;
	let yPosition = margin;

	// Helper function to add a new page if needed
	const checkPageBreak = (requiredHeight: number) => {
		if (yPosition + requiredHeight > pageHeight - margin) {
			pdf.addPage();
			yPosition = margin;
		}
	};

	// Helper function to add text with word wrap
	const addText = (text: string, fontSize: number = 12, fontStyle: string = 'normal') => {
		pdf.setFontSize(fontSize);
		pdf.setFont('helvetica', fontStyle);
		const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
		const lineHeight = fontSize * 0.35;
		
		checkPageBreak(lines.length * lineHeight);
		
		lines.forEach((line: string) => {
			pdf.text(line, margin, yPosition);
			yPosition += lineHeight;
		});
		
		return lines.length * lineHeight;
	};

	// Title
	const title = clientName ? `CHECKLISTS - ${clientName.toUpperCase()}` : 'CHECKLISTS';
	addText(title, 16, 'normal');
	yPosition += 10;

	// Process each checklist
	for (let i = 0; i < checklists.length; i++) {
		const checklist = checklists[i];
		
		// Add spacing between checklists
		if (i > 0) {
			yPosition += 10;
		}
		
		// Checklist items as table format
		if (checklist.items) {
			checkPageBreak(30);

			const startY = yPosition;
			const tableLeft = margin;
			const tableWidth = pageWidth - 2 * margin;
			const cellPadding = 3;
			const rowHeight = 8;

			// Column widths
			const col1Width = tableWidth * 0.27;  // Identifier - Type opening
			const col2Width = tableWidth * 0.22; // Description
			const col3Width = tableWidth * 0.16;  // Dimensions

			pdf.setFontSize(10);
			pdf.setFont('helvetica', 'bold');

			// Header row with checklist info
			pdf.rect(tableLeft, startY, col1Width, rowHeight);
			const identifierType = `${checklist.name || `PV${i + 1}`} - ${checklist.type_opening || ''}`;
			pdf.text(identifierType, tableLeft + cellPadding, startY + rowHeight / 2 + 1);

			pdf.rect(tableLeft + col1Width, startY, col2Width, rowHeight);
			pdf.text(checklist.description || 'Sin descripción', tableLeft + col1Width + cellPadding, startY + rowHeight / 2 + 1);

			pdf.rect(tableLeft + col1Width + col2Width, startY, col3Width, rowHeight);
			pdf.text(`${checklist.width || '0'} X ${checklist.height || '0'}`, tableLeft + col1Width + col2Width + cellPadding, startY + rowHeight / 2 + 1);

			yPosition += rowHeight;

			pdf.setFont('helvetica', 'normal');

			// Draw table rows for each item
			checklist.items.forEach((item: ChecklistItem, itemIndex: number) => {
				checkPageBreak(rowHeight + 5);

				const currentY = startY + ((itemIndex + 1) * rowHeight);

				// Row with 3 columns
				pdf.rect(tableLeft, currentY, col1Width, rowHeight);
				pdf.setFontSize(9);
				pdf.text(item.name, tableLeft + cellPadding, currentY + rowHeight / 2 + 1);

				// Empty columns for marking
				pdf.rect(tableLeft + col1Width, currentY, col2Width, rowHeight);
				pdf.rect(tableLeft + col1Width + col2Width, currentY, col3Width, rowHeight);

				yPosition += rowHeight;
			});

			// Add "OBSERVACIONES:" section
			yPosition += 10;
			checkPageBreak(20);
			addText('OBSERVACIONES:', 10, 'bold');
			yPosition += 8;
		}
		
		// Add separator line between checklists (except for the last one)
		if (i < checklists.length - 1) {
			checkPageBreak(10);
			pdf.setDrawColor(200, 200, 200);
			pdf.line(margin, yPosition, pageWidth - margin, yPosition);
			yPosition += 10;
		}
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
