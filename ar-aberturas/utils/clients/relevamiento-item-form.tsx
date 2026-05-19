'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RelevamientoItemFormProps {
	initialLabel?: string;
	onSubmit: (label: string) => Promise<void>;
	onCancel: () => void;
	isLoading?: boolean;
}

export function RelevamientoItemForm({
	initialLabel = '',
	onSubmit,
	onCancel,
	isLoading = false,
}: RelevamientoItemFormProps) {
	const [label, setLabel] = useState(initialLabel);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = label.trim();
		if (!trimmed) return;
		await onSubmit(trimmed);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="relevamiento-item-label">Nombre del paso</Label>
				<Input
					id="relevamiento-item-label"
					value={label}
					onChange={(e) => setLabel(e.target.value)}
					placeholder="Ej: Premarcos relevados"
					required
					autoFocus
					disabled={isLoading}
				/>
			</div>
			<div className="flex justify-end gap-2">
				<Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
					Cancelar
				</Button>
				<Button type="submit" disabled={isLoading || !label.trim()}>
					{isLoading ? 'Guardando...' : 'Guardar'}
				</Button>
			</div>
		</form>
	);
}
