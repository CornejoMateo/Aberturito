import { formatCurrency, formatCurrencyUSD } from '../../helpers/format-prices.tsx/formats';
import { BalanceSummary } from '../../helpers/balances/balance-calculations';

interface BalanceInformationProps {
	work?: {
		locality?: string | null;
		address?: string | null;
	} | null;
	startDate?: string | null;
	contractDateUsd?: number | null;
	usdCurrent?: number | null;
	totalPaid: number;
	totalPaidUsd: number;
	summary: BalanceSummary;
	formatDate: (dateStr: string | null | undefined) => string;
}

export function BalanceInformation({
	work,
	startDate,
	contractDateUsd,
	usdCurrent,
	totalPaid,
	totalPaidUsd,
	summary,
	formatDate,
}: BalanceInformationProps) {
	return (
		<div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
			<div>
				<p className="text-xs text-muted-foreground mb-1">Obra</p>
				<p className="text-sm font-medium">
					{work ? (
						<>
							<span className="block">{work.locality}</span>
							<span className="text-xs text-muted-foreground">{work.address}</span>
						</>
					) : (
						'Sin obra asignada'
					)}
				</p>
			</div>

			<div>
				<p className="text-xs text-muted-foreground mb-1">Fecha de inicio</p>
				<p className="text-sm font-medium">{formatDate(startDate)}</p>
			</div>

			<div>
				<p className="text-xs text-muted-foreground mb-1">Dolar en fecha contratacion</p>
				<p className="text-sm font-bold text-blue-600">{formatCurrency(contractDateUsd)}</p>
			</div>

			<div>
				<p className="text-xs text-muted-foreground mb-1">Dolar actual</p>
				<p className="text-sm font-bold text-blue-600">{formatCurrency(usdCurrent)}</p>
			</div>

			<div>
				<p className="text-xs text-muted-foreground mb-1">Presupuesto inicial</p>
				<div className="flex flex-col">
					<p className="text-sm font-bold text-primary">
						{formatCurrency(summary.budgetArsInitial)}
					</p>
					<p className="text-xs text-muted-foreground">{formatCurrencyUSD(summary.budgetUsd)}</p>
				</div>
			</div>

			<div>
				<p className="text-xs text-muted-foreground mb-1">Presupuesto actual</p>
				<div className="flex flex-col">
					<p className="text-sm font-bold text-primary">
						{formatCurrency(summary.budgetArsCurrent)}
					</p>
					<p className="text-xs text-muted-foreground">{formatCurrencyUSD(summary.budgetUsd)}</p>
				</div>
			</div>

			<div>
				<p className="text-xs text-muted-foreground mb-1">Entregado</p>
				<div className="flex flex-col">
					<p className="text-sm font-bold text-green-600">{formatCurrency(totalPaid)}</p>
					{usdCurrent && (
						<p className="text-xs text-muted-foreground">
							{formatCurrencyUSD(totalPaidUsd)}
						</p>
					)}
				</div>
			</div>

			<div>
				<p className="text-xs text-muted-foreground mb-1">Saldo</p>
				<div className="flex flex-col">
					<p className="text-sm font-bold text-orange-600">
						{formatCurrency(summary.remainingArs)}
					</p>
					<p className="text-xs text-muted-foreground">{formatCurrencyUSD(summary.remainingUsd)}</p>
				</div>
			</div>
		</div>
	);
}
