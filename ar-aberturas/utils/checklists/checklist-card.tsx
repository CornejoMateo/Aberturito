import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Checklist } from '@/lib/works/checklists';
import { ChecklistItem } from '@/lib/works/checklists';
import { calculateProgress } from '@/helpers/checklists/progress';

interface ChecklistCardProps {
	checklist: Checklist;
	index: number;
	user: any;
	saving: boolean;
	loading: boolean;
	addingClaim: { [key: string]: boolean };
	savingNotes: { [key: string]: boolean };
	onUpdateNotes: (checklistId: string, notes: string) => void;
	onToggleItem: (checklistId: string, itemIndex: number, items: ChecklistItem[]) => void;
	onSetAllItems: (checklistId: string, done: boolean) => void;
	onEdit: (checklist: Checklist) => void;
	onDelete: (checklist: Checklist) => void;
	onAddEntry: (checklist: Checklist, type: 'claim' | 'daily') => void;
}

export function ChecklistCard({
	checklist,
	index,
	user,
	saving,
	loading,
	addingClaim,
	savingNotes,
	onUpdateNotes,
	onToggleItem,
	onSetAllItems,
	onEdit,
	onDelete,
	onAddEntry,
}: ChecklistCardProps) {
	return (
		<Card key={checklist.id} className="border-2 shadow-sm">
			<CardHeader className="pb-4 space-y-4">
				<div className="flex items-start justify-between gap-2">
					<div className="space-y-3 flex-1">
						<h3 className="text-xl font-bold text-foreground">
							{checklist.name || `Abertura ${index + 1}`}
						</h3>

						{checklist.description && (
							<div className="space-y-1">
								<Label className="text-xs text-muted-foreground">Descripción</Label>
								<p className="text-sm text-foreground">{checklist.description}</p>
							</div>
						)}
					</div>
					{user?.role === 'Admin' && (
						<div className="flex items-center gap-1">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => onEdit(checklist)}
								disabled={saving}
								className="text-muted-foreground hover:text-primary hover:bg-primary/10 flex-shrink-0 h-8 w-8"
								title="Editar checklist"
							>
								<Edit className="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => onDelete(checklist)}
								disabled={saving}
								className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0 h-8 w-8"
								title="Eliminar checklist"
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>
					)}
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
					{checklist.type_opening && (
						<div className="space-y-1">
							<Label className="text-xs text-muted-foreground">Tipo</Label>
							<div className="font-medium text-foreground capitalize">{checklist.type_opening}</div>
						</div>
					)}
					{checklist.width && (
						<div className="space-y-1">
							<Label className="text-xs text-muted-foreground">Ancho</Label>
							<div className="font-medium text-foreground">{checklist.width} cm</div>
						</div>
					)}
					{checklist.height && (
						<div className="space-y-1">
							<Label className="text-xs text-muted-foreground">Alto</Label>
							<div className="font-medium text-foreground">{checklist.height} cm</div>
						</div>
					)}
				</div>

				<div className="space-y-2 pt-2">
					<div className="flex items-center justify-between">
						<Label className="text-xs text-muted-foreground">Progreso</Label>
						<span className="text-sm font-semibold text-primary">
							{calculateProgress(checklist.items || [])}%
						</span>
					</div>
					<div className="w-full bg-secondary rounded-full h-2.5">
						<div
							className="bg-primary h-2.5 rounded-full transition-all duration-300"
							style={{ width: `${calculateProgress(checklist.items || [])}%` }}
						/>
					</div>
				</div>

				<div className="space-y-2 pt-2">
					<div className="flex items-center justify-between">
						<Label className="text-xs text-muted-foreground">Nota / recordatorio</Label>
						{savingNotes[checklist.id] && (
							<span className="text-xs text-muted-foreground">Guardando...</span>
						)}
					</div>
					<Textarea
						value={checklist.notes || ''}
						onChange={(e) => onUpdateNotes(checklist.id, e.target.value)}
						placeholder="Escribí una nota para esta abertura (ej: falta sellador, revisar nivel, etc.)"
						className="text-sm"
						disabled={loading}
					/>
					{user?.role === 'Admin' && (
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => onAddEntry(checklist, 'claim')}
							disabled={!checklist.notes?.trim() || addingClaim[checklist.id] || loading}
							className="w-full mt-2"
						>
							{addingClaim[checklist.id] ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Creando reclamo...
								</>
							) : (
								<>
									<AlertCircle className="mr-2 h-4 w-4" />
									Agregar como reclamo
								</>
							)}
						</Button>
					)}
				</div>
			</CardHeader>

			<CardContent className="pt-0 pb-6">
				<div className="space-y-3">
					<div className="flex items-center justify-between gap-2">
						<h4 className="font-medium text-sm text-muted-foreground">Items de Checklist</h4>
						<div className="flex items-center gap-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => onSetAllItems(checklist.id, true)}
								disabled={saving || (checklist.items || []).length === 0}
							>
								Marcar todo
							</Button>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => onSetAllItems(checklist.id, false)}
								disabled={saving || (checklist.items || []).length === 0}
							>
								Desmarcar todo
							</Button>
						</div>
					</div>

					<div className="space-y-2 max-h-80 overflow-y-auto pr-1">
						{(checklist.items || []).map((item, itemIndex) => (
							<div
								key={itemIndex}
								className="flex items-center gap-3 p-3 bg-card hover:bg-muted/30 rounded-lg border transition-colors"
							>
								<Checkbox
									id={`checklist-${checklist.id}-item-${itemIndex}`}
									checked={item.done || false}
									onCheckedChange={() =>
										onToggleItem(checklist.id, itemIndex, checklist.items || [])
									}
									disabled={saving}
									className="flex-shrink-0"
								/>
								<label
									htmlFor={`checklist-${checklist.id}-item-${itemIndex}`}
									className={`text-sm flex-1 cursor-pointer ${
										item.done ? 'line-through text-muted-foreground' : 'font-medium text-foreground'
									}`}
								>
									{item.name}
								</label>
								{item.done && <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />}
							</div>
						))}
					</div>
				</div>

				{user?.role === 'Admin' && (
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => onAddEntry(checklist, 'daily')}
						disabled={
							checklist.items?.length === 0 ||
							checklist.items?.filter((item) => item.done).length === 0 ||
							addingClaim[checklist.id] ||
							loading
						}
						className="w-full mt-2"
					>
						{addingClaim[checklist.id] ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Creando actividad...
							</>
						) : (
							<>
								<AlertCircle className="mr-2 h-4 w-4" />
								Agregar a actividades diarias
							</>
						)}
					</Button>
				)}
			</CardContent>
		</Card>
	);
}
