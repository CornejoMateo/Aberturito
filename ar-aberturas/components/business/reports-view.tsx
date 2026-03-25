'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BalancesReport } from './reports/balances-report';
import { FileText } from 'lucide-react';

export function ReportsView() {
	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h2 className="text-2xl font-bold text-foreground text-balance">Reportes y métricas</h2>
					<p className="text-muted-foreground mt-1">Análisis de rendimiento y estadísticas</p>
				</div>
			</div>

			{/* Tabs */}
			<Tabs defaultValue="overview" className="space-y-4">
				<TabsList className="bg-card border border-border">
					<TabsTrigger value="overview">Saldos</TabsTrigger>
					<TabsTrigger value="performance">A definir</TabsTrigger>
					<TabsTrigger value="sources">A definir</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="space-y-4">
					<BalancesReport />
				</TabsContent>

				<TabsContent value="performance" className="space-y-4">
					<div className="border rounded-lg p-8 text-center">
						<FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
						<h3 className="text-lg font-semibold mb-2">A definir</h3>
						<p className="text-muted-foreground">
							Contenido de este reporte será implementado aquí
						</p>
					</div>
				</TabsContent>

				<TabsContent value="sources" className="space-y-4">
					<div className="border rounded-lg p-8 text-center">
						<FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
						<h3 className="text-lg font-semibold mb-2">A definir</h3>
						<p className="text-muted-foreground">
							Contenido de este reporte será implementado aquí
						</p>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}