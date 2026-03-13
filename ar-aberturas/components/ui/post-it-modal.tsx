'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { POST_IT_CONSTANTS, type PostItColor } from '@/constants/works-constants';

interface PostItModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	initialNote?: string | null;
	onSave: (note: string) => Promise<void>;
	isLoading?: boolean;
}

export function PostItModal({ 
	isOpen, 
	onOpenChange, 
	initialNote, 
	onSave, 
	isLoading = false 
}: PostItModalProps) {
	const [note, setNote] = useState(initialNote || '');

	const handleSave = async () => {
		await onSave(note);
		onOpenChange(false);
	};

	const handleClose = () => {
		if (!isLoading) {
			setNote(initialNote || '');
			onOpenChange(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Escape' && !isLoading) {
			handleClose();
		}
	};

	if (!isOpen) return null;

	return (
		<div 
			className={POST_IT_CONSTANTS.CLASSES.MODAL_OVERLAY}
			onClick={handleClose}
			onKeyDown={handleKeyDown}
		>
			<div 
				className={POST_IT_CONSTANTS.CLASSES.MODAL_CONTENT}
				onClick={(e) => e.stopPropagation()}
			>
				<div className="p-6">
					<div className="flex items-center gap-2 mb-4">
						<POST_IT_CONSTANTS.ICONS.STICKY_NOTE className="h-5 w-5 text-yellow-600" />
						<h3 className="text-lg font-semibold">
							{initialNote ? POST_IT_CONSTANTS.LABELS.EDIT_NOTE : POST_IT_CONSTANTS.LABELS.ADD_NOTE}
						</h3>
					</div>

					<Textarea
						value={note}
						onChange={(e) => setNote(e.target.value.slice(0, POST_IT_CONSTANTS.MAX_LENGTH))}
						placeholder={POST_IT_CONSTANTS.LABELS.NOTE_PLACEHOLDER}
						className={POST_IT_CONSTANTS.CLASSES.TEXTAREA}
						rows={4}
						maxLength={POST_IT_CONSTANTS.MAX_LENGTH}
						disabled={isLoading}
					/>

					<div className="flex justify-between items-center mt-4">
						<span className="text-sm text-muted-foreground">
							{note.length}/{POST_IT_CONSTANTS.MAX_LENGTH}
						</span>
						
						<div className="flex gap-2">
							<Button
								variant="outline"
								onClick={handleClose}
								disabled={isLoading}
							>
								{POST_IT_CONSTANTS.LABELS.CANCEL}
							</Button>
							<Button
								onClick={handleSave}
								disabled={isLoading}
							>
								{isLoading ? 'Guardando...' : POST_IT_CONSTANTS.LABELS.SAVE}
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
