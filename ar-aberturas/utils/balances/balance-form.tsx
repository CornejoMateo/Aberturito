'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Balance, BudgetWithWork } from '@/lib/works/balances';
import { Work } from '@/lib/works/works';
import { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format, set } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface BalanceFormProps {
	clientId: string;
	budgets: BudgetWithWork[];
	onSubmit: (balance: Omit<Balance, 'id' | 'created_at'>) => Promise<void>;
	onCancel: () => void;
}

export function BalanceForm({ clientId, budgets, onSubmit, onCancel }: BalanceFormProps) {
	const [selectedBudgetId, setSelectedBudgetId] = useState<string>('');
	const [isCalendarOpen, setIsCalendarOpen] = useState(false);
	const [formData, setFormData] = useState<Partial<Balance>>({
		contract_date_usd: undefined,
		start_date: undefined,
		usd_current: undefined,
	});

	const budgetsAccepted = useMemo(() => {
		return budgets.filter((b) => b.accepted);
	}, [budgets]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const balanceData: Omit<Balance, 'id' | 'created_at'> = {
			client_id: clientId,
			budget_id: selectedBudgetId || null,
			start_date: formData.start_date ? format(formData.start_date, 'yyyy-MM-dd') : undefined,
			contract_date_usd: formData.contract_date_usd || null,
			usd_current: formData.usd_current || null,
			notes: null,
		};

		await onSubmit(balanceData);
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		const numericFields = ['budget', 'contract_date_usd'];

		setFormData((prev) => ({
			...prev,
			[name]: numericFields.includes(name) ? (value ? parseFloat(value) : null) : value,
		}));
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="space-y-2 md:col-span-2">
					<Label htmlFor="budget">Presupuesto asociado</Label>
					<Select value={selectedBudgetId} onValueChange={setSelectedBudgetId}>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Seleccionar presupuesto" />
						</SelectTrigger>

						<SelectContent>
							{budgetsAccepted.map((budget) => {
								const work = budget.folder_budget?.work;
								const locality = work?.locality || 'Sin localidad';
								const address = work?.address || 'Sin dirección';
								const budgetNumber = budget.number || 'Sin número';
								const budgetType = budget.type || 'Sin tipo';
								return (
									<SelectItem key={budget.id} value={String(budget.id)}>
										{locality} - {address} - {budgetNumber} - {budgetType} (${budget.amount_ars.toLocaleString('es-AR')})
									</SelectItem>
								);
							})}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label>Fecha de inicio</Label>
					<Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								className={cn(
									'w-full',
									'text-left font-normal',
									!formData.start_date && 'text-muted-foreground'
								)}
							>
								{formData.start_date ? (
									format(formData.start_date, 'PPP', { locale: es })
								) : (
									<span>Seleccionar fecha</span>
								)}
								<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0" align="start">
							<Calendar
								mode="single"
								selected={
									formData.start_date?.toString() ? new Date(formData.start_date) : undefined
								}
								onSelect={(date) => {
									setFormData((prev) => ({ ...prev, start_date: date?.toString() || undefined }));
									setIsCalendarOpen(false);
								}}
								locale={es}
							/>
						</PopoverContent>
					</Popover>
				</div>

				<div className="space-y-2">
					<Label htmlFor="contract_date_usd">USD en fecha de contratación</Label>
					<Input
						id="contract_date_usd"
						name="contract_date_usd"
						type="number"
						step="0.01"
						value={formData.contract_date_usd || ''}
						onChange={handleChange}
						placeholder="0.00"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="usd_current">Valor dólar actual</Label>
					<Input
						id="usd_current"
						name="usd_current"
						type="number"
						step="0.01"
						value={formData.usd_current || ''}
						onChange={handleChange}
					/>
				</div>
			</div>

			<div className="flex justify-end gap-2 pt-4">
				<Button type="button" variant="outline" onClick={onCancel}>
					Cancelar
				</Button>
				<Button type="submit">Crear saldo</Button>
			</div>
		</form>
	);
}
