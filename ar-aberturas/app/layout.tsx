import type React from 'react';
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Analytics } from '@vercel/analytics/next';
import '../styles/globals.css';
import { Suspense } from 'react';
import { AuthProvider } from '@/components/provider/auth-provider';
import { ThemeProvider } from '@/components/provider/theme-provider';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
	title: 'AR Aberturas - Sistema de Gestión',
	description: 'Ecosistema administrativo para AR Aberturas',
	generator: 'v0.app',
};

// Asegurarse de que el tema se aplique al body
export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="es" suppressHydrationWarning className="h-full">
			<head>
				<link rel="manifest" href="/manifest.json" />
				<link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180.png" />
				<link rel="icon" href="/icons/icon-192.png" />
				<meta name="theme-color" content="#0f172a" />
				<meta name="mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-title" content="AR Aberturas" />
			</head>
			<body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased bg-background text-foreground min-h-screen`}>
				<ThemeProvider 
					attribute="class" 
					defaultTheme="system" 
					enableSystem 
					disableTransitionOnChange
					enableColorScheme
					>
					<AuthProvider>
						<Suspense fallback={null}>{children}</Suspense>
					</AuthProvider>
					<Toaster />
					<Analytics />
				</ThemeProvider>
			</body>
		</html>
	);
}
