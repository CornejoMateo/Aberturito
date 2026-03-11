import { renderHook, act, waitFor } from '@testing-library/react';
import { useNotifications } from '@/hooks/clients/use-notifications';
import * as clientsLib from '@/lib/clients/clients';

jest.mock('@/lib/clients/clients');

const mockWork = {
    id: 'work-1',
    client_id: 'client-1',
    address: 'Calle Test',
    status: 'pending' as const,
    created_at: '2024-01-01',
    tasks: [],
    hasNotes: false,
    progress: 50,
};

const mockClient = {
    id: 'client-1',
    name: 'Juan',
    last_name: 'Pérez',
    email: 'juan@test.com',
    phone: '123456789',
};

// Mock fetch global
global.fetch = jest.fn();

describe('useNotifications', () => {

	beforeEach(() => {
		jest.clearAllMocks();
		(global.fetch as jest.Mock).mockClear();
	});

	it('should initialize with default values', () => {
		const { result } = renderHook(() => useNotifications());

		expect(result.current.activeModal).toBeNull();
		expect(result.current.selectedWork).toBeNull();
		expect(result.current.selectedClient).toBeNull();
		expect(result.current.loading).toBe(false);
	});

	it('should prepare and open email modal correctly', async () => {
		(clientsLib.getClientById as jest.Mock).mockResolvedValue({
			data: mockClient,
			error: null,
		});

		const { result } = renderHook(() => useNotifications());

		await act(async () => {
			await result.current.openEmail(mockWork);
		});

		await waitFor(() => {
			expect(result.current.activeModal).toBe('email');
			expect(result.current.selectedWork).toEqual(mockWork);
			expect(result.current.selectedClient).toEqual(mockClient);
		});

		expect(clientsLib.getClientById).toHaveBeenCalledWith('client-1');
	});

	it('should prepare and open Whatsapp modal correctly', async () => {
		(clientsLib.getClientById as jest.Mock).mockResolvedValue({
			data: mockClient,
			error: null,
		});

		const { result } = renderHook(() => useNotifications());

		await act(async () => {
			await result.current.openWhatsApp(mockWork);
		});

		await waitFor(() => {
			expect(result.current.activeModal).toBe('whatsapp');
			expect(result.current.selectedWork).toEqual(mockWork);
			expect(result.current.selectedClient).toEqual(mockClient);
		});
	});

	it('must be handle works without client', async () => {
		const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
		const workWithoutClient = { ...mockWork, client_id: undefined };

		const { result } = renderHook(() => useNotifications());

		await act(async () => {
			await result.current.openEmail(workWithoutClient as any);
		});

		expect(consoleErrorSpy).toHaveBeenCalledWith(
			'La obra no tiene cliente asignado'
		);
		expect(result.current.activeModal).toBeNull();

		consoleErrorSpy.mockRestore();
	});

	it('must be closed modal correctly', async () => {
		(clientsLib.getClientById as jest.Mock).mockResolvedValue({
			data: mockClient,
			error: null,
		});

		const { result } = renderHook(() => useNotifications());

		await act(async () => {
			await result.current.openEmail(mockWork);
		});

		await act(async () => {
			result.current.closeModal();
		});

		expect(result.current.activeModal).toBeNull();
		expect(result.current.selectedWork).toBeNull();
		expect(result.current.selectedClient).toBeNull();
	});

	it('debería enviar email correctamente', async () => {
		(global.fetch as jest.Mock).mockResolvedValue({
			ok: true,
			json: async () => ({ success: true }),
		});

		const { result } = renderHook(() => useNotifications());

		const emailData = { to: 'test@test.com', subject: 'Test' };

		await act(async () => {
			await result.current.sendEmail(emailData);
		});

		expect(global.fetch).toHaveBeenCalledWith('/api/send-email', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(emailData),
		});

		expect(result.current.activeModal).toBeNull();
	});

	it('debería enviar WhatsApp y abrir URL correctamente', async () => {
		const whatsappUrl = 'https://wa.me/123456789';
		const openSpy = jest.spyOn(window, 'open').mockImplementation();

		(global.fetch as jest.Mock).mockResolvedValue({
			ok: true,
			json: async () => ({
				success: true,
				data: { whatsappUrl },
			}),
		});

		const { result } = renderHook(() => useNotifications());

		const whatsappData = { phone: '123456789', message: 'Hola' };

		await act(async () => {
			await result.current.sendWhatsApp(whatsappData);
		});

		expect(global.fetch).toHaveBeenCalledWith('/api/send-whatsapp', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(whatsappData),
		});

		expect(openSpy).toHaveBeenCalledWith(whatsappUrl, '_blank');
		expect(result.current.activeModal).toBeNull();

		openSpy.mockRestore();
	});

	it('debería manejar errores al enviar email', async () => {
		const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
		(global.fetch as jest.Mock).mockResolvedValue({
			ok: false,
			json: async () => ({ success: false, error: 'Error de red' }),
		});

		const { result } = renderHook(() => useNotifications());

		try {
			await act(async () => {
				await result.current.sendEmail({ to: 'test@test.com' });
			});
		} catch (error) {
			// Error esperado
		}

		expect(consoleErrorSpy).toHaveBeenCalled();
		consoleErrorSpy.mockRestore();
	});

	it('debería manejar errores al enviar WhatsApp', async () => {
		const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
		(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

		const { result } = renderHook(() => useNotifications());

		try {
			await act(async () => {
				await result.current.sendWhatsApp({ phone: '123' });
			});
		} catch (error) {
			// Error esperado
		}

		expect(consoleErrorSpy).toHaveBeenCalled();
		consoleErrorSpy.mockRestore();
	});
});
