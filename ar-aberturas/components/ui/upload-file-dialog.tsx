import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { formatFileSize } from '@/utils/file-upload-utils';

interface UploadFileDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	displayName: string;
	description: string;
	selectedFile: File | null;
	isUploading: boolean;
	onDisplayNameChange: (value: string) => void;
	onDescriptionChange: (value: string) => void;
	onSubmit: () => void;
	title?: string;
	descriptionText?: string;
	submitText?: string;
	cancelText?: string;
	requireName?: boolean;
	showDescription?: boolean;
}

export function UploadFileDialog({
	open,
	onOpenChange,
	displayName,
	description,
	selectedFile,
	isUploading,
	onDisplayNameChange,
	onDescriptionChange,
	onSubmit,
	title = 'Subir archivo',
	descriptionText = 'Completa la información del archivo que deseas subir.',
	submitText = 'Subir archivo',
	cancelText = 'Cancelar',
	requireName = true,
	showDescription = true,
}: UploadFileDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="
					w-[95vw]
					max-w-lg
					max-h-[95vh]
					overflow-auto
				"
			>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{descriptionText}</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="upload-file-name">Nombre del archivo {requireName ? '*' : ''}</Label>
						<Input
							id="upload-file-name"
							value={displayName}
							onChange={(e) => onDisplayNameChange(e.target.value)}
							disabled={isUploading}
						/>
					</div>

					{showDescription && (
						<div className="grid gap-2">
							<Label htmlFor="upload-file-description">Descripción (opcional)</Label>
							<Textarea
								id="upload-file-description"
								value={description}
								onChange={(e) => onDescriptionChange(e.target.value)}
								rows={3}
								disabled={isUploading}
							/>
						</div>
					)}

					{selectedFile && (
						<div className="rounded-lg border p-3 bg-muted/50">
							<p className="text-sm font-medium mb-1">Archivo seleccionado:</p>
							<p className="text-sm text-muted-foreground truncate">{selectedFile.name}</p>
							<p className="text-xs text-muted-foreground mt-1">
								{formatFileSize(selectedFile.size)}
							</p>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
						{cancelText}
					</Button>
					<Button onClick={onSubmit} disabled={isUploading || (requireName && !displayName.trim())}>
						{isUploading ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								Subiendo...
							</>
						) : (
							submitText
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
