import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';

export function ConfirmUpdateDialog({
	open,
	onOpenChange,
	onConfirm,
	itemName,
	action,
	quantity,
	isLoading,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	itemName: string;
	action: 'increment' | 'decrement';
	quantity: number;
	isLoading: boolean;
}) {
	const actionText = action === 'increment' ? 'incrementar' : 'disminuir';
	const newQuantity = action === 'increment' ? quantity + 1 : quantity - 1;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Confirmar actualización</DialogTitle>
					<DialogDescription>
						¿Estás seguro de que deseas {actionText} la cantidad de{' '}
						<span className="font-semibold">{itemName}</span>?
					</DialogDescription>
				</DialogHeader>
				<div className="py-4">
					<p className="text-center text-lg font-medium">
						{quantity} →{' '}
						<span className={action === 'increment' ? 'text-green-600' : 'text-red-600'}>
							{newQuantity}
						</span>
					</p>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
						Cancelar
					</Button>
					<Button
						variant={action === 'increment' ? 'default' : 'destructive'}
						onClick={onConfirm}
						disabled={isLoading}
					>
						{isLoading ? 'Actualizando...' : `Sí, ${actionText}`}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
