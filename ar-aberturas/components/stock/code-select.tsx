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
import { listOptions, type CodeOption } from '@/lib/stock-options';

interface CodeSelectProps {
	value: string;
	onValueChange: (value: string) => void;
	lineName?: string;
	disabled?: boolean;
	placeholder?: string;
	className?: string;
	materialType?: 'Aluminio' | 'PVC';
}

export function CodeSelect({
	value,
	onValueChange,
	lineName,
	disabled = false,
	placeholder,
	className,
	materialType,
}: CodeSelectProps) {
	const [open, setOpen] = useState(false);

	const {
		options: codesOptions,
		loading,
		error,
	} = useOptions<CodeOption>('codes', () =>
		listOptions('codes').then((res) => (res.data ?? []) as CodeOption[])
	);

	const filteredCodes = lineName
		? codesOptions.filter((code) => code.line_name === lineName)
		: codesOptions;

	const defaultPlaceholder = materialType === 'PVC' ? 'Seleccionar nombre' : 'Seleccionar código';

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
					{value || placeholder || defaultPlaceholder}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-full p-0"
				align="start"
				style={{ width: 'var(--radix-popover-trigger-width)' }}
			>
				<Command>
					<CommandInput placeholder="Buscar código..." />
					<CommandEmpty>No se encontraron códigos.</CommandEmpty>
					<CommandGroup className="max-h-60 overflow-auto">
						{filteredCodes.map((code) => (
							<CommandItem
								key={code.id}
								value={code.name_code ?? ''}
								onSelect={(selectedValue) => {
									onValueChange(selectedValue === value ? '' : selectedValue);
									setOpen(false);
								}}
							>
								<Check
									className={cn(
										'mr-2 h-4 w-4',
										value === code.name_code ? 'opacity-100' : 'opacity-0'
									)}
								/>
								{code.name_code}
							</CommandItem>
						))}
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
