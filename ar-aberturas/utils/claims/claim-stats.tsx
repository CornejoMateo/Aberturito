import { Card } from '@/components/ui/card';
import { FileText, Clock, CheckCircle } from 'lucide-react';
import { FilterType } from '@/constants/claims/filters';
import { Claim } from '@/lib/claims/claims';

export function ClaimsStats({ claims, filterType }: { claims: Claim[], filterType: FilterType }) {

const dailyCount = claims.filter((c) => c.daily).length;
const claimsCount = claims.length - dailyCount;
const pendingCount = claims.filter((c) => !c.resolved && !c.daily).length;
const resolvedCount = claims.filter((c) => c.resolved && !c.daily).length;

return (
    <div className="grid gap-4 md:grid-cols-3">
				<Card className="p-6 bg-card border-border">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-muted-foreground">{filterType !== 'diario' ? 'Total reclamos' : 'Total actividades diarias'}</p>
							<p className="text-2xl font-bold text-foreground mt-2">{filterType !== 'diario' ? claimsCount : dailyCount}</p>
						</div>
						<div className="rounded-lg bg-secondary p-3 text-chart-1">
							<FileText className="h-6 w-6" />
						</div>
					</div>
				</Card>

				{filterType !== 'diario' && (
					<>
						<Card className="p-6 bg-card border-border">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-muted-foreground">Pendientes</p>
									<p className="text-2xl font-bold text-foreground mt-2">{pendingCount}</p>
								</div>
								<div className="rounded-lg bg-orange-500/10 p-3 text-orange-500">
									<Clock className="h-6 w-6" />
								</div>
							</div>
						</Card>
					

						<Card className="p-6 bg-card border-border">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-muted-foreground">Resueltos</p>
									<p className="text-2xl font-bold text-foreground mt-2">{resolvedCount}</p>
								</div>
								<div className="rounded-lg bg-green-500/10 p-3 text-green-500">
									<CheckCircle className="h-6 w-6" />
								</div>
							</div>
						</Card>
					</>
				)}
			</div>
);

}