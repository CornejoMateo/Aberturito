'use client';

import { useState } from 'react';
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
import { listOptions, type ColorOption } from '@/lib/stock-options';

interface ColorSelectProps {
	value: string;
	onValueChange: (value: string) => void;
	lineName?: string;
	disabled?: boolean;
	placeholder?: string;
	className?: string;
}

export function ColorSelect({
	value,
	onValueChange,
	lineName,
	disabled = false,
	placeholder = 'Seleccionar color',
	className,
}: ColorSelectProps) {
	const [open, setOpen] = useState(false);

	const {
		options: colorsOptions,
		loading,
		error,
	} = useOptions<ColorOption>('colors', () =>
		listOptions('colors').then((res) => (res.data ?? []) as ColorOption[])
	);

	const filteredColors = lineName
		? colorsOptions.filter((color) => color.line_name === lineName)
		: colorsOptions;

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
					disabled={disabled || loading || !lineName}
				>
					{value || placeholder}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-full p-0"
				align="start"
				style={{ width: 'var(--radix-popover-trigger-width)' }}
			>
				<Command>
					<CommandInput placeholder="Buscar color..." />
					<CommandEmpty>No se encontraron colores.</CommandEmpty>
					<CommandGroup className="max-h-60 overflow-auto">
						{filteredColors.map((color) => (
							<CommandItem
								key={color.id}
								value={color.name_color ?? ''}
								onSelect={(selectedValue) => {
									onValueChange(selectedValue === value ? '' : selectedValue);
									setOpen(false);
								}}
							>
								<Check
									className={cn(
										'mr-2 h-4 w-4',
										value === color.name_color ? 'opacity-100' : 'opacity-0'
									)}
								/>
								{color.name_color}
							</CommandItem>
						))}
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
