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
import { listOptions, type SiteOption } from '@/lib/stock/stock-options';

interface SiteSelectProps {
	value: string;
	onValueChange: (value: string) => void;
	disabled?: boolean;
	placeholder?: string;
	className?: string;
}

export function SiteSelect({
	value,
	onValueChange,
	disabled = false,
	placeholder = 'Seleccionar ubicación',
	className,
}: SiteSelectProps) {
	const [open, setOpen] = useState(false);

	const {
		options: sitesOptions,
		loading,
		error,
	} = useOptions<SiteOption>('sites', () =>
		listOptions('sites').then((res) => (res.data ?? []) as SiteOption[])
	);

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
				style={{ width: 'var(--radix-popover-trigger-width)' }}
			>
				<Command>
					<CommandInput placeholder="Buscar ubicación..." />
					<CommandEmpty>No se encontraron ubicaciones.</CommandEmpty>
					<CommandGroup className="max-h-60 overflow-auto">
						{sitesOptions.map((site) => (
							<CommandItem
								key={site.id}
								value={site.name_site ?? ''}
								onSelect={(selectedValue) => {
									onValueChange(selectedValue === value ? '' : selectedValue);
									setOpen(false);
								}}
							>
								<Check
									className={cn(
										'mr-2 h-4 w-4',
										value === site.name_site ? 'opacity-100' : 'opacity-0'
									)}
								/>
								{site.name_site}
							</CommandItem>
						))}
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
