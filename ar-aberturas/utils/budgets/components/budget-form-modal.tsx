'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Work } from '@/lib/works/works';
import { BudgetWithWork } from '@/lib/works/balances';
import { DEFAULT_TYPES, FORM_DEFAULTS } from '@/constants/budgets/constants';
import { BudgetFormData } from '@/utils/budgets/types';

interface BudgetFormModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	mode: 'create' | 'edit';
	works: Work[];
	budget?: BudgetWithWork | null;
	onSubmit: (data: BudgetFormData) => Promise<void>;
	isLoading: boolean;
}

export function BudgetFormModal({
	isOpen,
	onOpenChange,
	mode,
	works,
	budget,
	onSubmit,
	isLoading,
}: BudgetFormModalProps) {
	const [formData, setFormData] = useState<BudgetFormData>({
		type: FORM_DEFAULTS.type,
		version: FORM_DEFAULTS.version,
		number: FORM_DEFAULTS.number,
		amount: FORM_DEFAULTS.amount,
		amountUsd: FORM_DEFAULTS.amountUsd,
		workId: FORM_DEFAULTS.workId,
		pdf: null,
		created_at: FORM_DEFAULTS.created_at,
	});

	const resetForm = (data?: Partial<BudgetFormData>) => {
		setFormData({ ...FORM_DEFAULTS, ...data, pdf: data?.pdf ?? null });
	};

	// Reset form when modal opens or budget changes
	useEffect(() => {
		console.log('BudgetFormModal useEffect:', { isOpen, mode, budget });
		
		if (isOpen && mode === 'edit' && budget) {
			console.log('Loading budget data:', budget);
			setFormData({
				type: budget.type || FORM_DEFAULTS.type,
				version: budget.version || FORM_DEFAULTS.version,
				number: budget.number || FORM_DEFAULTS.number,
				amount: budget.amount_ars?.toString() || FORM_DEFAULTS.amount,
				amountUsd: budget.amount_usd?.toString() || FORM_DEFAULTS.amountUsd,
				workId: budget.folder_budget?.work_id || FORM_DEFAULTS.workId,
				pdf: null,
				created_at: budget.created_at ? new Date(budget.created_at).toISOString().split('T')[0] : FORM_DEFAULTS.created_at,
			});
		} else if (isOpen) {
			console.log('Loading empty form for create mode');
			resetForm();
		}
	}, [isOpen, mode, budget]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await onSubmit(formData);
	};

	const handleClose = () => {
		resetForm();
		onOpenChange(false);
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>
						{mode === 'edit' ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
					</DialogTitle>
				</DialogHeader>
				
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid gap-2">
						<Label>Tipo</Label>
						<Select 
							value={formData.type} 
							onValueChange={(value) => setFormData((prev: BudgetFormData) => ({ ...prev, type: value }))}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Seleccionar tipo" />
							</SelectTrigger>
							<SelectContent>
								{DEFAULT_TYPES.map((t: string) => (
									<SelectItem key={t} value={t}>
										{t}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="grid gap-2">
						<Label>Variante</Label>
						<Select 
							value={formData.version} 
							onValueChange={(value) => setFormData((prev: BudgetFormData) => ({ ...prev, version: value }))}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Seleccionar variante" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="Mínimo">Mínimo</SelectItem>
								<SelectItem value="Estándar">Estándar</SelectItem>
								<SelectItem value="Óptimo">Óptimo</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="grid gap-2">
						<Label>Obra</Label>
						<Select 
							value={formData.workId} 
							onValueChange={(value) => setFormData((prev: BudgetFormData) => ({ ...prev, workId: value }))}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Seleccionar obra" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none">Sin obra</SelectItem>
								{works.map((w) => (
									<SelectItem key={w.id} value={w.id}>
										{[w.address, w.locality].filter(Boolean).join(' - ') || `Obra ${w.id}`}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="grid gap-2">
						<Label>Fecha de Creación</Label>
						<Input
							type="date"
							value={formData.created_at}
							onChange={(e) => setFormData((prev: BudgetFormData) => ({ ...prev, created_at: e.target.value }))}
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="grid gap-2">
							<Label>Número de presupuesto</Label>
							<Input
								type="text"
								value={formData.number}
								onChange={(e) => setFormData((prev: BudgetFormData) => ({ ...prev, number: e.target.value }))}
								placeholder="Ej: 123 o 1-2-A"
							/>
						</div>
						<div className="grid gap-2">
							<Label>Monto ARS</Label>
							<Input
								type="number"
								value={formData.amount}
								onChange={(e) => setFormData((prev: BudgetFormData) => ({ ...prev, amount: e.target.value }))}
								placeholder="0"
							/>
						</div>
						<div className="grid gap-2">
							<Label>Monto USD</Label>
							<Input
								type="number"
								value={formData.amountUsd}
								onChange={(e) => setFormData((prev: BudgetFormData) => ({ ...prev, amountUsd: e.target.value }))}
								placeholder="0"
							/>
						</div>
					</div>

					<div className="grid gap-2">
						<Label>PDF {mode === 'edit' && '(Opcional - dejar vacío para mantener el actual)'}</Label>
						<Input
							type="file"
							accept="application/pdf"
							onChange={(e) => setFormData((prev: BudgetFormData) => ({ ...prev, pdf: e.target.files?.[0] ?? null }))}
						/>
					</div>

					<div className="flex justify-end gap-2 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={handleClose}
							disabled={isLoading}
						>
							Cancelar
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? 'Procesando...' : mode === 'edit' ? 'Actualizar' : 'Crear'}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
