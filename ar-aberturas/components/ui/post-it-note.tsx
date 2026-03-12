'use client';

import { POST_IT_CONSTANTS, type PostItColor } from '@/constants/works-constants';

interface PostItNoteProps {
	note?: string | null;
	color?: PostItColor;
	isMobile?: boolean;
	className?: string;
}

export function PostItNote({ 
	note, 
	color = POST_IT_CONSTANTS.DEFAULT_COLOR, 
	isMobile = false,
	className = ''
}: PostItNoteProps) {
	if (!note) return null;

	const colorClass = POST_IT_CONSTANTS.COLORS[color];
	const baseClass = isMobile 
		? POST_IT_CONSTANTS.CLASSES.POST_IT_MOBILE 
		: POST_IT_CONSTANTS.CLASSES.POST_IT_CONTAINER;

	return (
		<div className={`${baseClass} ${colorClass} ${className}`}>
			<div className="flex items-start gap-2">
				<POST_IT_CONSTANTS.ICONS.STICKY_NOTE className="h-4 w-4 flex-shrink-0 mt-0.5" />
				<div className="flex-1">
					<h4 className="font-semibold text-sm mb-1">
						{POST_IT_CONSTANTS.LABELS.GENERAL_NOTE}
					</h4>
					<p className="text-sm leading-relaxed whitespace-pre-wrap">
						{note}
					</p>
				</div>
			</div>
		</div>
	);
}
