'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BUDGET_STATUS_OPTIONS, BUDGET_STATUS_COLORS, BUDGET_STATUS_LABELS } from '@/constants/budget-status';
import { getStatusIcon } from '@/helpers/budgets/status-helpers';

interface BudgetStatusSelectorProps {
	value?: string;
	onValueChange?: (value: string) => void;
	disabled?: boolean;
	placeholder?: string;
	className?: string;
}

export function BudgetStatusSelector({
	value,
	onValueChange,
	disabled = false,
	placeholder = "Seleccionar estado...",
	className,
}: BudgetStatusSelectorProps) {
	return (
		<Select value={value} onValueChange={onValueChange} disabled={disabled}>
			<SelectTrigger className={className}>
				<SelectValue placeholder={placeholder}>
					{value && (
						<div className="flex items-center gap-2">
							<Badge className={BUDGET_STATUS_COLORS[value as keyof typeof BUDGET_STATUS_COLORS]}>
								<div className="flex items-center gap-1">
									{getStatusIcon(value)}
									{BUDGET_STATUS_LABELS[value as keyof typeof BUDGET_STATUS_LABELS]}
								</div>
							</Badge>
						</div>
					)}
				</SelectValue>
			</SelectTrigger>
			<SelectContent>
				{BUDGET_STATUS_OPTIONS.map((option) => (
					<SelectItem key={option.value} value={option.value}>
						<div className="flex items-center gap-2">
							<Badge className={BUDGET_STATUS_COLORS[option.value as keyof typeof BUDGET_STATUS_COLORS]}>
								<div className="flex items-center gap-1">
									{getStatusIcon(option.value)}
									{option.label}
								</div>
							</Badge>
						</div>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
