import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { ItemDialogState } from './client-survey-tab.types';
import { SurveyItemForm } from './survey-item-form';

interface SurveyItemDialogProps {
	dialog: ItemDialogState;
	onOpenChange: (open: boolean) => void;
	onSubmit: (label: string) => Promise<void>;
	isLoading: boolean;
}

export function SurveyItemDialog({ dialog, onOpenChange, onSubmit, isLoading }: SurveyItemDialogProps) {
	return (
		<Dialog open={dialog.open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[400px]">
				<DialogHeader>
					<DialogTitle>{dialog.mode === 'add' ? 'Agregar paso' : 'Editar paso'}</DialogTitle>
					<DialogDescription>
						{dialog.mode === 'add'
							? 'Ingresá el nombre del nuevo paso del relevamiento.'
							: 'Modificá el nombre del paso.'}
					</DialogDescription>
				</DialogHeader>
				<SurveyItemForm
					initialLabel={dialog.item?.label ?? ''}
					onSubmit={onSubmit}
					onCancel={() => onOpenChange(false)}
					isLoading={isLoading}
				/>
			</DialogContent>
		</Dialog>
	);
}
