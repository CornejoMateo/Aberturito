'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { DueDateDialogState } from './client-survey-tab.types';
import { formatCreatedAt } from '@/helpers/date/format-date';

interface SurveyDueDateDialogProps {
	dialog: DueDateDialogState;
	onOpenChange: (open: boolean) => void;
	onSave: (dueDate: Date | null) => Promise<void>;
	onDateSelect: (date: Date | undefined) => void;
}

export function SurveyDueDateDialog({ dialog, onOpenChange, onSave, onDateSelect }: SurveyDueDateDialogProps) {
	return (
		<Dialog open={dialog.open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[400px]">
				<DialogHeader>
					<DialogTitle>Fecha de vencimiento</DialogTitle>
					<DialogDescription>
						Establecé una fecha límite para completar este relevamiento.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					<div>
						<label htmlFor="due-date" className="text-sm font-medium">
							Fecha de vencimiento
						</label>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									id="due-date"
									variant="outline"
									className={cn(
										'w-full justify-start text-left font-normal mt-1.5',
										!dialog.currentDueDate && 'text-muted-foreground'
									)}
								>
									<CalendarIcon className="mr-2 h-4 w-4" />
									{dialog.currentDueDate ? formatCreatedAt(dialog.currentDueDate) : 'Seleccionar fecha'}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0" align="start">
								<Calendar
									mode="single"
									selected={dialog.currentDueDate ?? undefined}
									onSelect={onDateSelect}
									initialFocus
									locale={es}
									required={false}
								/>
							</PopoverContent>
						</Popover>
					</div>
					<div className="flex justify-end gap-2">
						{dialog.currentDueDate && (
							<Button
								variant="ghost"
								onClick={() => onSave(null)}
								className="text-destructive hover:text-destructive"
							>
								Quitar fecha
							</Button>
						)}
						<Button variant="outline" onClick={() => onOpenChange(false)}>
							Cancelar
						</Button>
						<Button onClick={() => onSave(dialog.currentDueDate)}>Guardar</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
