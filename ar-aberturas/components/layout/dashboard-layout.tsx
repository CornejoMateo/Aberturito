'use client';

import type React from 'react';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
	AlertDialog,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogFooter,
	AlertDialogCancel,
	AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/components/provider/auth-provider';
import { useRouter } from 'next/navigation';
import {
	LayoutDashboard,
	Package,
	Users,
	FileText,
	ClipboardCheck,
	Calendar,
	BarChart3,
	Menu,
	X,
	ChevronDown,
	ChevronRight,
	Lock,
} from 'lucide-react';
import Image from 'next/image';

const navigation = [
	{
		name: 'Dashboard',
		href: '/',
		icon: LayoutDashboard,
		disabled: true,
	},
	{
		name: 'Stock',
		href: '/stock',
		icon: Package,
		disabled: false,
		subItems: [
			{ name: 'Aluminio', href: '/stock/aluminio' },
			{ name: 'PVC', href: '/stock/pvc' },
		],
	},
	{
		name: 'Clientes',
		href: '/clientes',
		icon: Users,
		disabled: true,
	},
	{
		name: 'Presupuestos',
		href: '/presupuestos',
		icon: FileText,
		disabled: true,
	},
	{
		name: 'Obras',
		href: '/obras',
		icon: ClipboardCheck,
		disabled: true,
	},
	{
		name: 'Calendario',
		href: '/calendario',
		icon: Calendar,
		disabled: true,
	},
	{
		name: 'Reportes',
		href: '/reportes',
		icon: BarChart3,
		disabled: true,
	},
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [expandedItems, setExpandedItems] = useState<string[]>([]);
	const pathname = usePathname();
	const router = useRouter();
	const { user, loading, signOutUser } = useAuth();

	// Función para manejar la expansión de submenús
	const toggleExpanded = (itemName: string) => {
		setExpandedItems((prev) =>
			prev.includes(itemName) ? prev.filter((name) => name !== itemName) : [...prev, itemName]
		);
	};

	// Función para verificar si un item está activo (incluyendo subitems)
	const isItemActive = (item: any) => {
		if (item.subItems) {
			return (
				item.subItems.some((subItem: any) => pathname === subItem.href) || pathname === item.href
			);
		}
		return pathname === item.href;
	};

	// Función para obtener el texto dinámico del menú Stock
	const getStockMenuText = () => {
		if (pathname === '/stock/aluminio') return 'Stock Aluminio';
		if (pathname === '/stock/pvc') return 'Stock PVC';
		if (pathname === '/stock') return 'Stock';
		return 'Stock';
	};

	// Auto-expandir el menú Stock cuando se está en una subpágina
	useEffect(() => {
		if (pathname.startsWith('/stock/')) {
			setExpandedItems((prev) => (prev.includes('Stock') ? prev : [...prev, 'Stock']));
		}
	}, [pathname]);

	// Estado para controlar si debemos redirigir

	// Efecto para manejar la redirección
	useEffect(() => {
		if (!loading && typeof window !== 'undefined') {
			if (!user) {
				router.push('/login');
			} else if (pathname === '/' || pathname === '') {
				router.replace('/stock/aluminio');
			}
		}
	}, [loading, user, pathname, router]);

	if (loading || !user) {
		return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
	}

	if (pathname === '/' && user) {
		return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
	}

	// Definición de permisos por rol
	const allowedByRole = useMemo(() => {
		return {
			Admin: ['Dashboard', 'Stock', 'Clientes', 'Presupuestos', 'Obras', 'Calendario', 'Reportes'],
			Fabrica: ['Stock'],
			Ventas: ['Dashboard', 'Stock', 'Clientes', 'Presupuestos', 'Calendario'],
			Marketing: ['Dashboard', 'Calendario', 'Clientes', 'Reportes', 'Presupuestos'],
			Colocador: ['Obras'],
		} as Record<string, string[]>;
	}, []);

	// Función para verificar si una ruta está permitida
	const isRouteAllowed = (href: string) => {
		if (!user?.role) return false;
		const allowedNames = allowedByRole[user.role] ?? [];

		// Verificar rutas principales
		const mainItem = navigation.find((item) => item.href === href);
		if (mainItem && allowedNames.includes(mainItem.name)) return true;

		// Verificar subitems
		for (const item of navigation) {
			if (item.subItems) {
				const subItem = item.subItems.find((sub) => sub.href === href);
				if (subItem && allowedNames.includes(item.name)) return true;
			}
		}

		return false;
	};

	const filteredNavigation = useMemo(() => {
		if (!user?.role) return navigation;
		const allowedNames = allowedByRole[user.role] ?? [];
		return navigation.filter((item) => allowedNames.includes(item.name));
	}, [user?.role, allowedByRole]);

	// Redirigir a la primera ruta permitida si la actual no está permitida
	useEffect(() => {
		if (loading || !user?.role) return;

		const isAllowed = isRouteAllowed(pathname);

		if (!isAllowed) {
			const allowedNames = allowedByRole[user.role] ?? [];
			const firstAllowed = navigation.find((n) => allowedNames.includes(n.name));
			if (firstAllowed) {
				// Si el primer item permitido tiene subitems, ir al primer subitem
				if (firstAllowed.subItems && firstAllowed.subItems.length > 0) {
					router.replace(firstAllowed.subItems[0].href);
				} else {
					router.replace(firstAllowed.href);
				}
			}
		}

		// Redirigir a Stock Aluminio por defecto si se accede a /stock o a la raíz
		if (pathname === '/stock' || pathname === '/') {
			router.replace('/stock/aluminio');
		}
	}, [loading, user?.role, pathname, router, allowedByRole]);

	// Mostrar carga solo si estamos en el proceso de autenticación
	if (loading || !user) {
		return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
	}

	return (
		<div className="min-h-screen bg-background">
			{/* Mobile sidebar backdrop */}
			{sidebarOpen && (
				<div
					className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<aside
				className={cn(
					'fixed inset-y-0 left-0 z-50 w-64 transform bg-card border-r border-border transition-transform duration-200 ease-in-out lg:translate-x-0',
					sidebarOpen ? 'translate-x-0' : '-translate-x-full'
				)}
			>
				<div className="flex h-full flex-col">
					{/* Logo */}
					<div className="flex h-16 items-center justify-between border-b border-border px-6">
						<div className="flex items-center gap-2">
							<Image src="/logo-ar.png" alt="Logo" width={92} height={92} />
							<span className="font-semibold text-foreground">AR Aberturas</span>
						</div>
						<Button
							variant="ghost"
							size="icon"
							className="lg:hidden"
							onClick={() => setSidebarOpen(false)}
						>
							<X className="h-5 w-5" />
						</Button>
					</div>

					{/* Navigation */}
					<nav className="flex-1 space-y-1 px-3 py-4">
						{filteredNavigation.map((item) => {
							const isActive = isItemActive(item);
							const isExpanded = expandedItems.includes(item.name);
							const hasSubItems = item.subItems && item.subItems.length > 0;

							return (
								<div key={item.name}>
									{hasSubItems ? (
										<div>
											<button
												onClick={() => !item.disabled && toggleExpanded(item.name)}
												className={cn(
													'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
													isActive
														? 'bg-primary text-primary-foreground'
														: item.disabled
															? 'text-muted-foreground/40 cursor-not-allowed'
															: 'text-muted-foreground hover:bg-secondary hover:text-foreground',
													{
														'opacity-60': item.disabled,
													}
												)}
												disabled={item.disabled}
											>
												<div className="flex items-center gap-3">
													<item.icon className="h-5 w-5" />
													{item.name === 'Stock' ? getStockMenuText() : item.name}
													{item.disabled && <Lock className="h-3.5 w-3.5 ml-1" />}
												</div>
												{isExpanded ? (
													<ChevronDown className="h-4 w-4" />
												) : (
													<ChevronRight className="h-4 w-4" />
												)}
											</button>
											{isExpanded && (
												<div className="ml-6 mt-1 space-y-1">
													{item.subItems.map((subItem) => {
														const isSubActive = pathname === subItem.href;
														return (
															<Link
																key={subItem.name}
																href={subItem.href}
																className={cn(
																	'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
																	isSubActive
																		? 'bg-primary text-primary-foreground'
																		: 'text-muted-foreground hover:bg-secondary hover:text-foreground'
																)}
																onClick={() => setSidebarOpen(false)}
															>
																<div className="h-2 w-2 rounded-full bg-current" />
																{subItem.name}
															</Link>
														);
													})}
												</div>
											)}
										</div>
									) : (
										<div
											className={cn(
												'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
												isActive
													? 'bg-primary text-primary-foreground'
													: item.disabled
														? 'text-muted-foreground/40 cursor-not-allowed'
														: 'text-muted-foreground hover:bg-secondary hover:text-foreground',
												{
													'opacity-60': item.disabled,
												}
											)}
										>
											{item.disabled ? (
												<>
													<item.icon className="h-5 w-5" />
													<span className="flex items-center gap-1">
														{item.name}
														<Lock className="h-3.5 w-3.5" />
													</span>
												</>
											) : (
												<Link
													href={item.href}
													className="flex items-center gap-3 w-full"
													onClick={() => setSidebarOpen(false)}
												>
													<item.icon className="h-5 w-5" />
													{item.name}
												</Link>
											)}
										</div>
									)}
								</div>
							);
						})}
					</nav>

					{/* User info */}
					<div className="border-t border-border p-4">
						<div className="flex items-center gap-3">
							<div className="flex-1 min-w-0">
								{/*<p className="text-sm font-medium text-foreground truncate">{user?.usuario ?? 'Usuario'}</p>*/}
								<p className="text-xs text-muted-foreground truncate">{user?.role ?? ''}</p>
							</div>
							<div className="ml-2">
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button variant="ghost" size="sm">
											Cerrar sesión
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>¿Seguro que querés cerrar sesión?</AlertDialogTitle>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel>Cancelar</AlertDialogCancel>
											<AlertDialogAction asChild>
												<Button variant="destructive" size="sm" onClick={() => signOutUser()}>
													Sí, cerrar sesión
												</Button>
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</div>
						</div>
					</div>
				</div>
			</aside>

			{/* Main content */}
			<div className="lg:pl-64">
				{/* Top bar */}
				<header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card px-4 lg:px-6">
					<Button
						variant="ghost"
						size="icon"
						className="lg:hidden"
						onClick={() => setSidebarOpen(true)}
					>
						<Menu className="h-5 w-5" />
					</Button>
					<div className="flex-1">
						<h1 className="text-lg font-semibold text-foreground">Sistema de Gestión</h1>
					</div>
				</header>

				{/* Page content */}
				<main className="p-4 lg:p-6">{children}</main>
			</div>
		</div>
	);
}
