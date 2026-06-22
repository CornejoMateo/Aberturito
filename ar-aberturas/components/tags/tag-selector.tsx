'use client';

import { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Tag as TagIcon, X } from 'lucide-react';
import { SurveyTag, getAllTags, assignTagToSurvey, removeTagFromSurvey } from '@/lib/tags/tags';
import { TAG_COLORS } from '@/constants/tags';
import { toast } from '@/components/ui/use-toast';
import { translateError } from '@/lib/error-translator';

interface TagSelectorProps {
	surveyId: number;
	disabled?: boolean;
	onChange?: () => void;
	assignedTags?: SurveyTag[];
}

export function TagSelector({ surveyId, disabled, onChange, assignedTags: propAssignedTags }: TagSelectorProps) {
	const [tags, setTags] = useState<SurveyTag[]>([]);
	const [assignedTags, setAssignedTags] = useState<SurveyTag[]>(propAssignedTags ?? []);
	const [isLoading, setIsLoading] = useState(false);
	const [open, setOpen] = useState(false);

	const loadTags = async () => {
		setIsLoading(true);
		try {
			const { data: allTags } = await getAllTags();
			if (allTags) setTags(allTags);
		} catch (err) {
			console.error('Error loading tags:', err);
		} finally {
			setIsLoading(false);
		}
	};

	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen);
		if (newOpen && tags.length === 0) {
			loadTags();
		}
	};

	useEffect(() => {
		if (propAssignedTags) {
			setAssignedTags(propAssignedTags);
		}
	}, [propAssignedTags]);

	const handleToggleTag = async (tag: SurveyTag) => {
		const isAssigned = assignedTags.some((t) => t.id === tag.id);
		setIsLoading(true);
		
		try {
			if (isAssigned) {
				const { error } = await removeTagFromSurvey(surveyId, tag.id);
				if (error) throw error;
				setAssignedTags(assignedTags.filter((t) => t.id !== tag.id));
			} else {
				const { error } = await assignTagToSurvey(surveyId, tag.id);
				if (error) throw error;
				setAssignedTags([...assignedTags, tag]);
			}
			onChange?.();
		} catch (err) {
			toast({
				variant: 'destructive',
				title: 'Error',
				description: translateError(err) || 'No se pudo actualizar la etiqueta.',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const getColorClass = (colorValue: string) => {
		const color = TAG_COLORS.find((c) => c.value === colorValue);
		return color?.bg ?? 'bg-gray-500';
	};

	return (
		<Popover open={open} onOpenChange={handleOpenChange}>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="h-7 px-2 gap-1"
					disabled={disabled || isLoading}
					onClick={(e) => e.stopPropagation()}
				>
					<TagIcon className="h-3.5 w-3.5" />
					{assignedTags.length > 0 && <span className="text-xs">{assignedTags.length}</span>}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-64 p-3" align="start">
				<div className="space-y-3">
					<div className="text-sm font-medium">Etiquetas</div>
					
					{tags.length === 0 ? (
						<p className="text-xs text-muted-foreground text-center py-2">
							No hay etiquetas disponibles.
						</p>
					) : (
						<div className="space-y-1">
							{tags.map((tag) => {
								const isAssigned = assignedTags.some((t) => t.id === tag.id);
								return (
									<button
										key={tag.id}
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											handleToggleTag(tag);
										}}
										disabled={isLoading}
										className={`w-full flex items-center justify-between p-2 rounded text-sm transition-colors ${
											isAssigned ? 'bg-secondary' : 'hover:bg-secondary/50'
										}`}
									>
										<div className="flex items-center gap-2">
											<div className={`w-3 h-3 rounded ${getColorClass(tag.color)}`} />
											<span>{tag.name}</span>
										</div>
										{isAssigned && <X className="h-3 w-3" />}
									</button>
								);
							})}
						</div>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}
