'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Work } from '@/lib/works/works';
import { DEFAULT_TYPES, BUDGET_VARIANTS } from '../../../constants/budgets/constants';

interface CreateBudgetModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	formData: {
		type: string;
		version: string;
		number: string;
		amount: string;
		amountUsd: string;
		workId: string;
		pdf: File | null;
		created_at: string;
	};
	works: Work[];
	isLoading: boolean;
	onUpdateFormData: (updates: any) => void;
	onCreateBudget: () => void;
	onCancel: () => void;
}

export function CreateBudgetModal({
	isOpen,
	onOpenChange,
	formData,
	works,
	isLoading,
	onUpdateFormData,
	onCreateBudget,
	onCancel,
}: CreateBudgetModalProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Nuevo presupuesto</DialogTitle>
					<DialogDescription>
						Completa los campos para crear un nuevo presupuesto.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4">
					<div className="grid gap-2">
						<Label>Tipo</Label>
						<Select value={formData.type} onValueChange={(value) => onUpdateFormData({ type: value })}>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Seleccionar tipo" />
							</SelectTrigger>
							<SelectContent>
								{DEFAULT_TYPES.map((t) => (
									<SelectItem key={t} value={t}>
										{t}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="grid gap-2">
						<Label>Variante</Label>
						<Select value={formData.version} onValueChange={(value) => onUpdateFormData({ version: value })}>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Seleccionar variante" />
							</SelectTrigger>
							<SelectContent>
								{BUDGET_VARIANTS.map((variant) => (
									<SelectItem key={variant} value={variant}>
										{variant}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="grid gap-2">
						<Label>Obra</Label>
						<Select value={formData.workId} onValueChange={(value) => onUpdateFormData({ workId: value })}>
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
							onChange={(e) => onUpdateFormData({ created_at: e.target.value })}
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="grid gap-2">
							<Label>Número de presupuesto</Label>
							<Input
								type="text"
								value={formData.number}
								onChange={(e) => onUpdateFormData({ number: e.target.value })}
								placeholder="Ej: 123 o 1-2-A"
							/>
						</div>
						<div className="grid gap-2">
							<Label>Monto ARS</Label>
							<Input
								type="number"
								value={formData.amount}
								onChange={(e) => onUpdateFormData({ amount: e.target.value })}
								placeholder="0"
							/>
						</div>
						<div className="grid gap-2">
							<Label>Monto USD</Label>
							<Input
								type="number"
								value={formData.amountUsd}
								onChange={(e) => onUpdateFormData({ amountUsd: e.target.value })}
								placeholder="0"
							/>
						</div>
					</div>

					<div className="grid gap-2">
						<Label>PDF</Label>
						<Input
							type="file"
							accept="application/pdf"
							onChange={(e) => onUpdateFormData({ pdf: e.target.files?.[0] ?? null })}
						/>
					</div>
				</div>

				<div className="flex justify-end gap-2">
					<Button variant="outline" onClick={onCancel}>
						Cancelar
					</Button>
					<Button onClick={onCreateBudget} disabled={isLoading}>
						Crear
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
