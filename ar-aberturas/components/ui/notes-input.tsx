'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StickyNote } from 'lucide-react';

interface NotesInputProps {
	value?: string | string[] | null;
	onChange: (value: string) => void;
	placeholder?: string;
	maxLength?: number;
	rows?: number;
	disabled?: boolean;
	showLabel?: boolean;
}

const DEFAULT_MAX_LENGTH = 500;
const DEFAULT_PLACEHOLDER = 'Agregar notas opcionales...';
const DEFAULT_ROWS = 3;

export function NotesInput({
	value = '',
	onChange,
	placeholder = DEFAULT_PLACEHOLDER,
	maxLength = DEFAULT_MAX_LENGTH,
	rows = DEFAULT_ROWS,
	disabled = false,
	showLabel = true,
}: NotesInputProps) {
	const currentLength = value?.length || 0;

	return (
		<div className="space-y-2">
			{showLabel && (
				<div className="flex items-center gap-2">
					<StickyNote className="h-4 w-4 text-yellow-600" />
					<Label htmlFor="notes">Notas (opcional)</Label>
				</div>
			)}
			<Textarea
				id="notes"
				value={value || ''}
				onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
				placeholder={placeholder}
				rows={rows}
				maxLength={maxLength}
				disabled={disabled}
				className="resize-none"
			/>
			{maxLength > 0 && (
				<div className="flex justify-end">
					<span className="text-xs text-muted-foreground">
						{currentLength}/{maxLength}
					</span>
				</div>
			)}
		</div>
	);
}
