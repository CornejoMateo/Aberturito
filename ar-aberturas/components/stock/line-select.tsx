'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOptions } from '@/hooks/use-options';
import { listOptions, type LineOption } from '@/lib/stock-options';

interface LineSelectProps {
	value: string;
	onValueChange: (value: string) => void;
	onBrandChange?: (brand: string) => void;
	materialType?: 'Aluminio' | 'PVC';
	disabled?: boolean;
	placeholder?: string;
	className?: string;
}

export function LineSelect({
	value,
	onValueChange,
	onBrandChange,
	materialType,
	disabled = false,
	placeholder = 'Seleccionar línea',
	className,
}: LineSelectProps) {
	const [open, setOpen] = useState(false);
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	const {
		options: linesOptions,
		loading,
		error,
	} = useOptions<LineOption>('lines', () =>
		listOptions('lines').then((res) => (res.data ?? []) as LineOption[])
	);

	const filteredLines = materialType
		? linesOptions.filter((line) => line.opening === materialType)
		: linesOptions;

	const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
		if (scrollContainerRef.current) {
			e.preventDefault();
			scrollContainerRef.current.scrollTop += e.deltaY;
		}
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					className={cn(
						'w-full h-10 justify-between text-left font-normal',
						!value && 'text-muted-foreground',
						'border-input bg-background rounded-md border',
						'hover:bg-accent hover:text-accent-foreground',
						'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
						'disabled:opacity-50 disabled:pointer-events-none',
						className
					)}
					disabled={disabled || loading}
				>
					{value || placeholder}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-full p-0"
				align="start"
				style={{ 
					width: 'var(--radix-popover-trigger-width)',
					maxHeight: '240px'
				}}
			>
				<Command>
					<CommandInput placeholder="Buscar línea..." />
					<CommandEmpty>No se encontraron líneas.</CommandEmpty>
					<div 
						ref={scrollContainerRef}
						className="max-h-60 overflow-y-auto"
						style={{
							overscrollBehavior: 'contain',
							WebkitOverflowScrolling: 'touch',
							scrollbarWidth: 'auto'
						}}
						onWheel={handleWheel}
					>
						<CommandGroup>
							{filteredLines.map((line) => (
							<CommandItem
								key={line.id}
								value={line.name_line ?? ''}
								onSelect={() => {
									onValueChange(line.name_line);
									setOpen(false);
								}}
							>
								<Check
									className={cn(
										'mr-2 h-4 w-4',
										value === line.name_line ? 'opacity-100' : 'opacity-0'
									)}
								/>
								{line.name_line}
							</CommandItem>
						))}
						</CommandGroup>
					</div>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
