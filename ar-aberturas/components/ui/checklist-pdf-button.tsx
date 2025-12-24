'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { generateChecklistPDF, prepareChecklistData } from '@/lib/works/checklist-pdf';
import type { Checklist } from '@/lib/works/checklists';

type ChecklistPDFButtonProps = {
	checklists: Checklist[];
	workId?: string;
	clientName?: string;
	disabled?: boolean;
};

export function ChecklistPDFButton({ checklists, workId, clientName, disabled }: ChecklistPDFButtonProps) {
	const [isGenerating, setIsGenerating] = useState(false);

	const handleDownloadPDF = async () => {
		if (checklists.length === 0) {
			return;
		}

		try {
			setIsGenerating(true);
			
			// Prepare checklist data with calculated progress
			const preparedChecklists = prepareChecklistData(checklists);
			
			// Generate and download PDF
			await generateChecklistPDF(preparedChecklists, clientName);
		} catch (error) {
			console.error('Error generating PDF:', error);
			// You could add a toast notification here
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<Button
			onClick={handleDownloadPDF}
			disabled={disabled || isGenerating || checklists.length === 0}
			variant="outline"
			className="w-full sm:w-auto"
		>
			{isGenerating ? (
				<>
					<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					Generando PDF...
				</>
			) : (
				<>
					<Download className="mr-2 h-4 w-4" />
					Descargar PDF
				</>
			)}
		</Button>
	);
}
