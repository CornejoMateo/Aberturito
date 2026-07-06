'use client';

import { useState, useEffect, useCallback } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { BalanceWithBudget } from '@/lib/works/balances';
import {
	BalanceTransaction,
	getTransactionsByBalanceId,
	createTransaction,
	updateTransaction,
	deleteTransaction,
} from '@/lib/works/balance_transactions';
import { updateBalance } from '@/lib/works/balances';
import { getClientFilesByTransaction, uploadClientFile } from '@/lib/clients/files';
import { optimizeFile } from '@/helpers/images/optimization';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, FileText, Trash2, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency } from '../../helpers/format-prices.tsx/formats';
import { calculateBalanceSummary } from '../../helpers/balances/balance-calculations';
import { parseArsToNumber } from '@/utils/budgets/utils';
import { AddTransactionSection } from './add-transaction';
import { TransactionsTable } from './transactions-table';
import { BalanceInformation } from './balance-information';
import { NotesInput } from '@/components/ui/notes-input';
import { translateError } from '@/lib/error-translator';
import { formatCreatedAt } from '@/helpers/date/format-date';
import { formatFileSize } from '@/utils/file-upload-utils';
import { getSupabaseClient } from '@/lib/supabase-client';
import { deleteClientFile } from '@/lib/clients/files';
import { FileViewerModal } from '@/components/ui/file-viewer-modal';
import { FileViewerItem } from '@/utils/file-upload-utils';
import { getFileKind } from '@/utils/file-upload-utils';

interface BalanceDetailsModalProps {
	balance: BalanceWithBudget | null;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onTransactionCreated?: () => void;
}

export function BalanceDetailsModal({
	balance,
	isOpen,
	onOpenChange,
	onTransactionCreated,
}: BalanceDetailsModalProps) {
	const [transactions, setTransactions] = useState<BalanceTransaction[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [addingMode, setAddingMode] = useState<'transaction' | 'extra' | null>(null);
	const [transactionToDelete, setTransactionToDelete] = useState<BalanceTransaction | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isEditingNotes, setIsEditingNotes] = useState(false);
	const [balanceNotes, setBalanceNotes] = useState('');
	const [editingTransaction, setEditingTransaction] = useState<BalanceTransaction | null>(null);
	const [transactionFilesToUpload, setTransactionFilesToUpload] = useState<File[]>([]);
	const [isSavingTransaction, setIsSavingTransaction] = useState(false);
	const [transactionForFiles, setTransactionForFiles] = useState<BalanceTransaction | null>(null);
	const [transactionFiles, setTransactionFiles] = useState<FileViewerItem[]>([]);
	const [isLoadingFiles, setIsLoadingFiles] = useState(false);
	const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null);
	const [transactionFileToDelete, setTransactionFileToDelete] = useState<number | null>(null);
	const { toast } = useToast();

	// Form state
	const [transactionDate, setTransactionDate] = useState<Date>(new Date());
	const [transactionAmount, setTransactionAmount] = useState('');
	const [paymentMethod, setPaymentMethod] = useState('');
	const [notes, setNotes] = useState('');
	const [quoteUsd, setQuoteUsd] = useState('');
	const [usdAmount, setUsdAmount] = useState('');

	useEffect(() => {
		if (balance && isOpen) {
			loadTransactions();
			setBalanceNotes(balance.notes ?? '');
		}
	}, [balance, isOpen]);

	const loadTransactions = async () => {
		if (!balance) return;

		try {
			setIsLoading(true);
			const { data, error } = await getTransactionsByBalanceId(balance.id);

			if (error) {
				console.error('Error al cargar transacciones:', error);
				toast({
					variant: 'destructive',
					title: 'Error al cargar transacciones',
					description:
						translateError(error) ||
						'Hubo un problema al cargar las transacciones. Intente nuevamente.',
				});
				setTransactions([]);
				return;
			}

			setTransactions(data || []);
		} catch (error) {
			console.error('Error inesperado al cargar transacciones:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSaveTransaction = async (isExtraAmount?: boolean) => {
		if (!balance || !transactionAmount || isSavingTransaction) return;

		setIsSavingTransaction(true);

		try {
			const { data, error } = await createTransaction({
				balance_id: balance.id,
				date: format(transactionDate, 'yyyy-MM-dd'),
				amount: parseArsToNumber(transactionAmount),
				payment_method: paymentMethod || null,
				notes: notes || null,
				quote_usd: quoteUsd ? parseArsToNumber(quoteUsd) : null,
				usd_amount: usdAmount ? parseFloat(usdAmount) : null,
				...(isExtraAmount && { is_extra_amount: true }),
			});

			if (error) {
				setIsSavingTransaction(false);
				const err = translateError(error);
				toast({
					variant: 'destructive',
					title: isExtraAmount ? 'Error al crear monto extra' : 'Error al crear transacción',
					description:
						err ||
						(isExtraAmount
							? 'Hubo un problema al crear el monto extra. Intente nuevamente.'
							: 'Hubo un problema al crear la transacción. Intente nuevamente.'),
				});
				return;
			}

			// Upload files if selected
			if (data && transactionFilesToUpload.length > 0) {
				await uploadFilesForTransaction(data.id);
			}

			toast({
				title: isExtraAmount ? 'Monto extra creado' : 'Transacción creada',
				description: isExtraAmount
					? 'El monto extra se ha creado exitosamente.'
					: 'La transacción se ha creado exitosamente.',
			});

			resetTransactionForm();

			// Reload transactions
			await loadTransactions();
			onTransactionCreated?.();
		} catch (error) {
			const err = translateError(error);
			toast({
				variant: 'destructive',
				title: 'Error inesperado',
				description: err || 'Ocurrió un error inesperado. Intente nuevamente.',
			});
		} finally {
			setIsSavingTransaction(false);
		}
	};

	const handleDeleteTransaction = async () => {
		if (!transactionToDelete) return;

		try {
			const { error } = await deleteTransaction(transactionToDelete.id);

			if (error) {
				toast({
					variant: 'destructive',
					title: 'Error al eliminar transacción',
					description:
						translateError(error) ||
						'Hubo un problema al eliminar la transacción. Intente nuevamente.',
				});
				return;
			}

			toast({
				title: 'Transacción eliminada',
				description: 'La transacción se ha eliminado exitosamente.',
			});

			// Reload transactions
			await loadTransactions();
			onTransactionCreated?.();
		} catch (error) {
			const err = translateError(error);
			toast({
				variant: 'destructive',
				title: 'Error inesperado',
				description: err || 'Ocurrió un error inesperado. Intente nuevamente.',
			});
		} finally {
			setIsDeleteDialogOpen(false);
			setTransactionToDelete(null);
		}
	};

	const uploadFilesForTransaction = async (transactionId: number) => {
		if (transactionFilesToUpload.length === 0 || !balance) {
			return;
		}

		const clientId = (balance as any)?.client_id;

		if (!clientId) {
			toast({
				variant: 'destructive',
				title: 'Error al subir archivos',
				description: 'No se encontró el cliente asociado a esta transacción.',
			});
			return;
		}

		for (const file of transactionFilesToUpload) {
			try {
				console.log('[uploadFilesForTransaction] procesando archivo:', file.name);
				const optimizedFile = await optimizeFile(file);

				const { error } = await uploadClientFile(
					clientId,
					optimizedFile,
					null,
					null,
					null,
					null,
					transactionId
				);

				if (error) {
					const err = translateError(error);
					toast({
						variant: 'destructive',
						title: 'Error al subir archivo',
						description: err || `Hubo un problema al subir el archivo ${file.name}.`,
					});
				} else {
					toast({
						title: 'Archivos exitosamente subidos',
						description: `Los archivos se han subido exitosamente para la transacción.`,
					});
				}
			} catch (error) {
				const err = translateError(error);
				toast({
					variant: 'destructive',
					title: 'Error al subir archivo',
					description: err || `Hubo un problema al subir el archivo ${file.name}.`,
				});
			}
		}
	};

	const handleEditTransaction = (transaction: BalanceTransaction) => {
		setEditingTransaction(transaction);
		setTransactionDate(transaction.date ? new Date(transaction.date + 'T00:00:00') : new Date());
		setTransactionAmount(
			transaction.amount
				? transaction.amount.toLocaleString('es-AR', {
						minimumFractionDigits: 0,
						maximumFractionDigits: 3,
					})
				: ''
		);
		setPaymentMethod(transaction.payment_method || '');
		setNotes(transaction.notes || '');
		setQuoteUsd(
			transaction.quote_usd
				? transaction.quote_usd.toLocaleString('es-AR', {
						minimumFractionDigits: 0,
						maximumFractionDigits: 3,
					})
				: ''
		);
		setUsdAmount(transaction.usd_amount ? String(transaction.usd_amount) : '');
		setTransactionFilesToUpload([]);
		setAddingMode('transaction');
	};

	const handleUpdateTransaction = async () => {
		if (!balance || !editingTransaction || !transactionAmount || isSavingTransaction) return;

		setIsSavingTransaction(true);

		try {
			const { error } = await updateTransaction(editingTransaction.id, {
				date: format(transactionDate, 'yyyy-MM-dd'),
				amount: parseArsToNumber(transactionAmount),
				payment_method: paymentMethod || null,
				notes: notes || null,
				quote_usd: quoteUsd ? parseArsToNumber(quoteUsd) : null,
				usd_amount: usdAmount ? parseFloat(usdAmount) : null,
			});

			if (error) {
				setIsSavingTransaction(false);
				const err = translateError(error);
				toast({
					variant: 'destructive',
					title: 'Error al actualizar transacción',
					description: err || 'Hubo un problema al actualizar la transacción. Intente nuevamente.',
				});
				return;
			}

			// Upload files if selected
			if (transactionFilesToUpload.length > 0) {
				await uploadFilesForTransaction(editingTransaction.id);
			}

			toast({
				title: 'Transacción actualizada',
				description: 'La transacción se ha actualizado exitosamente.',
			});

			resetTransactionForm();
			await loadTransactions();
			onTransactionCreated?.();
		} catch (error) {
			const err = translateError(error);
			toast({
				variant: 'destructive',
				title: 'Error inesperado',
				description: err || 'Ocurrió un error inesperado. Intente nuevamente.',
			});
			console.error('Error inesperado al actualizar transacción:', error);
		} finally {
			setIsSavingTransaction(false);
		}
	};

	const resetTransactionForm = () => {
		setEditingTransaction(null);
		setTransactionDate(new Date());
		setTransactionAmount('');
		setPaymentMethod('');
		setNotes('');
		setQuoteUsd('');
		setUsdAmount('');
		setTransactionFilesToUpload([]);
		setAddingMode(null);
	};

	const handleDeleteTransactionFile = async () => {
		if (!transactionFileToDelete) return;

		try {
			const { success, error } = await deleteClientFile(transactionFileToDelete);

			if (error || !success) {
				toast({
					variant: 'destructive',
					title: 'Error al eliminar archivo',
					description:
						translateError(error?.message || error) || 'Hubo un problema al eliminar el archivo.',
				});
			} else {
				toast({
					title: 'Archivo eliminado',
					description: 'El archivo se eliminó exitosamente.',
				});
				if (transactionForFiles) {
					await loadTransactionFiles(transactionForFiles.id);
				}
			}
		} catch (error) {
			const err = translateError(error);
			toast({
				variant: 'destructive',
				title: 'Error',
				description: 'Ocurrió un error inesperado al eliminar el archivo.',
			});
		} finally {
			setTransactionFileToDelete(null);
		}
	};

	const loadTransactionFiles = useCallback(async (transactionId: number) => {
		setIsLoadingFiles(true);
		try {
			const { data, error } = await getClientFilesByTransaction(transactionId);

			if (error) {
				const err = translateError(error);
				toast({
					variant: 'destructive',
					title: 'Error al cargar archivos',
					description: err || 'Hubo un problema al cargar los archivos.',
				});
				setTransactionFiles([]);
				return;
			}

			if (!data || data.length === 0) {
				setTransactionFiles([]);
				return;
			}

			const supabase = getSupabaseClient();
			const filesWithUrls: (FileViewerItem | null)[] = await Promise.all(
				data.map(async (file) => {
					try {
						if (!file.path) return null;

						const { data: blob, error: downloadError } = await supabase.storage
							.from('clients')
							.download(file.path);

						if (downloadError || !blob) {
							console.error('Error downloading file:', file.path, downloadError);
							return null;
						}

						const url = URL.createObjectURL(blob);
						const name = file.path.split('/').pop() || 'archivo';

						return {
							id: file.id,
							url,
							name,
							displayName: file.title,
							description: file.description,
							size: blob.size,
							uploadedAt: file.uploaded_at || new Date().toISOString(),
						} as FileViewerItem;
					} catch (err) {
						const errorMessage = translateError(err);
						toast({
							variant: 'destructive',
							title: 'Error al procesar archivo',
							description: errorMessage || 'Hubo un problema al procesar un archivo.',
						});
						return null;
					}
				})
			);

			const validFiles = filesWithUrls.filter((f): f is FileViewerItem => f !== null);
			setTransactionFiles(validFiles);
		} catch (error) {
			const err = translateError(error);
			toast({
				variant: 'destructive',
				title: 'Error al cargar archivos',
				description: err || 'Hubo un problema al cargar los archivos.',
			});
			setTransactionFiles([]);
		} finally {
			setIsLoadingFiles(false);
		}
	}, []);

	const handleViewTransactionFiles = (transaction: BalanceTransaction) => {
		setTransactionForFiles(transaction);
		loadTransactionFiles(transaction.id);
	};

	const handleUpdateBalanceNotes = async () => {
		if (!balance) return;

		try {
			const { error } = await updateBalance(balance.id, {
				notes: balanceNotes ? balanceNotes : null,
			});

			if (error) {
				toast({
					variant: 'destructive',
					title: 'Error al actualizar notas',
					description: translateError(error) || 'Hubo un problema al actualizar las notas.',
				});
				return;
			}

			toast({
				title: 'Notas actualizadas',
				description: 'Las notas del saldo se han actualizado exitosamente.',
			});

			setIsEditingNotes(false);
			onTransactionCreated?.();
		} catch (error) {
			toast({
				variant: 'destructive',
				title: 'Error inesperado',
				description: translateError(error) || 'Ocurrió un error inesperado. Intente nuevamente.',
			});
		}
	};

	const totalPaid = transactions
		.filter((t) => !t.is_extra_amount)
		.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
	const totalPaidUSD = transactions
		.filter((t) => !t.is_extra_amount)
		.reduce((sum, t) => sum + (Number(t.usd_amount) || 0), 0);
	const totalExtraArs = transactions
		.filter((t) => t.is_extra_amount)
		.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
	const totalExtraUsd = transactions
		.filter((t) => t.is_extra_amount)
		.reduce((sum, t) => sum + (Number(t.usd_amount) || 0), 0);
	const summary = calculateBalanceSummary({
		budgetAmountArs: balance?.balance_amount_ars,
		budgetAmountUsd: balance?.balance_amount_usd,
		budgetInitialUsd: balance?.budget?.amount_usd,
		budgetInitialArs: balance?.budget?.amount_ars,
		usdCurrent: balance?.usd_current,
		totalPaidArs: totalPaid,
		totalPaidUsd: totalPaidUSD,
		totalExtraArs,
		totalExtraUsd,
	});
	const work = balance?.budget?.folder_budget?.work;

	useEffect(() => {
		if (transactionAmount && quoteUsd) {
			const normalizedAmount = transactionAmount.replace(/\./g, '').replace(',', '.');
			const normalizedQuote = quoteUsd.replace(/\./g, '').replace(',', '.');

			const amountNumber = Number(normalizedAmount);
			const rateNumber = Number(normalizedQuote);

			if (!isNaN(amountNumber) && !isNaN(rateNumber)) {
				const calculatedUsd = (amountNumber / rateNumber).toFixed(3);
				setUsdAmount(calculatedUsd);
			}
		}
	}, [quoteUsd, transactionAmount]);

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="!max-w-5xl !max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Detalle del saldo</DialogTitle>
					<DialogDescription>
						Información completa del saldo, pagos realizados y estado de la obra.
					</DialogDescription>
				</DialogHeader>

				{balance && (
					<div className="space-y-6">
						<BalanceInformation
							balanceId={balance.id}
							work={work}
							startDate={balance.start_date}
							contractDateUsd={balance.contract_date_usd}
							usdCurrent={balance.usd_current}
							totalPaid={totalPaid}
							totalPaidUsd={totalPaidUSD}
							totalExtraArs={totalExtraArs}
							totalExtraUsd={totalExtraUsd}
							summary={summary}
							budget={balance.budget}
							formatDate={formatCreatedAt}
						/>

						{/* Balance Notes Section */}
						<div className="border rounded-lg p-4">
							<div className="flex items-center justify-between mb-3">
								<h4 className="font-semibold">Notas del saldo</h4>
								{!isEditingNotes && (
									<button
										onClick={() => setIsEditingNotes(true)}
										className="text-sm text-primary hover:underline"
									>
										{balance.notes && String(balance.notes).trim() !== ''
											? 'Editar notas'
											: 'Agregar notas'}
									</button>
								)}
							</div>
							{isEditingNotes ? (
								<div className="space-y-3">
									<NotesInput
										value={balanceNotes}
										onChange={setBalanceNotes}
										placeholder="Agregar notas sobre este saldo (opcional)"
										rows={3}
										showLabel={false}
									/>
									<div className="flex justify-end gap-2">
										<button
											onClick={() => {
												setIsEditingNotes(false);
												setBalanceNotes(balance.notes ?? '');
											}}
											className="px-4 py-2 text-sm border rounded-md hover:bg-secondary"
										>
											Cancelar
										</button>
										<button
											onClick={handleUpdateBalanceNotes}
											className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
										>
											Guardar
										</button>
									</div>
								</div>
							) : (
								<div>
									{balance.notes && balance.notes.length > 0 ? (
										<div className="text-sm text-muted-foreground whitespace-pre-wrap">
											{balance.notes}
										</div>
									) : (
										<p className="text-sm text-muted-foreground italic">No hay notas agregadas</p>
									)}
								</div>
							)}
						</div>

						<AddTransactionSection
							addingMode={addingMode}
							transactionDate={transactionDate}
							onTransactionDateChange={setTransactionDate}
							transactionAmount={transactionAmount}
							onTransactionAmountChange={setTransactionAmount}
							usdAmount={usdAmount}
							onUsdAmountChange={setUsdAmount}
							quoteUsd={quoteUsd}
							onQuoteUsdChange={setQuoteUsd}
							notes={notes}
							onNotesChange={setNotes}
							paymentMethod={paymentMethod}
							onPaymentMethodChange={setPaymentMethod}
							onCancel={resetTransactionForm}
							onSave={
								editingTransaction
									? handleUpdateTransaction
									: () => handleSaveTransaction(addingMode === 'extra')
							}
							onStartAddTransaction={() => setAddingMode('transaction')}
							onStartAddExtra={() => setAddingMode('extra')}
							saveDisabled={!transactionAmount || isSavingTransaction}
							editingTransaction={editingTransaction ?? undefined}
							selectedFiles={transactionFilesToUpload}
							onFilesSelect={(newFiles) =>
								setTransactionFilesToUpload((prev) => [...prev, ...newFiles])
							}
							onRemoveFile={(index) =>
								setTransactionFilesToUpload((prev) => prev.filter((_, i) => i !== index))
							}
						/>

						{/* Transactions Table */}
						<div className="border rounded-lg">
							<TransactionsTable
								isLoading={isLoading}
								transactions={transactions}
								onDeleteTransaction={(transaction) => {
									setTransactionToDelete(transaction);
									setIsDeleteDialogOpen(true);
								}}
								onEditTransaction={handleEditTransaction}
								onViewFiles={handleViewTransactionFiles}
							/>
						</div>
					</div>
				)}
			</DialogContent>

			<AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>¿Eliminar transacción?</AlertDialogTitle>
						<AlertDialogDescription>
							Esta acción no se puede deshacer. Se eliminará permanentemente la transacción
							{transactionToDelete && (
								<>
									{' '}
									de {formatCurrency(transactionToDelete.amount)} del{' '}
									{formatCreatedAt(transactionToDelete.date)}
								</>
							)}
							.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancelar</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteTransaction}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Eliminar
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<Dialog
				open={!!transactionForFiles}
				onOpenChange={(open) => {
					if (!open) {
						transactionFiles.forEach((f) => {
							if (f.url) URL.revokeObjectURL(f.url);
						});
						setTransactionForFiles(null);
						setTransactionFiles([]);
					}
				}}
			>
				<DialogContent className="!max-w-3xl !max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Archivos de la transacción</DialogTitle>
						<DialogDescription>
							Archivos adjuntos a la transacción del{' '}
							{transactionForFiles ? formatCreatedAt(transactionForFiles.date) : ''}.
						</DialogDescription>
					</DialogHeader>

					<div className="flex justify-end">
						<input
							type="file"
							id="gallery-file-upload"
							className="hidden"
							multiple
							onChange={async (e) => {
								const files = e.target.files;
								if (files && files.length > 0 && transactionForFiles) {
									const newFiles = Array.from(files);
									const clientId = (balance as any)?.client_id;
									if (clientId) {
										for (const file of newFiles) {
											try {
												const optimizedFile = await optimizeFile(file);
												await uploadClientFile(
													clientId,
													optimizedFile,
													null,
													null,
													null,
													null,
													transactionForFiles.id
												);
											} catch (err) {
												console.error('Error uploading file from gallery:', err);
											}
										}
										await loadTransactionFiles(transactionForFiles.id);
									}
								}
								e.target.value = '';
							}}
						/>
						<Button
							size="sm"
							variant="outline"
							onClick={() => document.getElementById('gallery-file-upload')?.click()}
						>
							<Upload className="h-4 w-4 mr-2" />
							Subir archivos
						</Button>
					</div>

					{isLoadingFiles ? (
						<div className="flex items-center justify-center h-32">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						</div>
					) : transactionFiles.length === 0 ? (
						<div className="flex items-center justify-center h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg">
							<p className="text-sm text-muted-foreground">No hay archivos adjuntos</p>
						</div>
					) : (
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
							{transactionFiles.map((file, index) => {
								const fileKind = getFileKind(file.name);

								return (
									<div
										key={file.id}
										className="group relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer"
										onClick={() => setSelectedFileIndex(index)}
									>
										{fileKind === 'image' ? (
											<img
												src={file.url}
												alt={file.displayName || file.name}
												className="w-full h-full object-cover"
											/>
										) : (
											<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/60">
												<FileText className="h-12 w-12 text-muted-foreground" />
											</div>
										)}
										<div className="absolute top-2 right-2 opacity-80">
											<Button
												size="icon"
												variant="destructive"
												className="h-7 w-7"
												onClick={(e) => {
													e.stopPropagation();
													setTransactionFileToDelete(file.id);
												}}
											>
												<Trash2 className="h-3 w-3" />
											</Button>
										</div>
										<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
											<p className="text-white text-xs truncate">{file.displayName || file.name}</p>
											{file.size && (
												<p className="text-white/80 text-xs">{formatFileSize(file.size)}</p>
											)}
										</div>
									</div>
								);
							})}
						</div>
					)}
				</DialogContent>
			</Dialog>

			<AlertDialog
				open={!!transactionFileToDelete}
				onOpenChange={() => setTransactionFileToDelete(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>¿Eliminar archivo?</AlertDialogTitle>
						<AlertDialogDescription>
							Esta acción no se puede deshacer. El archivo será eliminado permanentemente.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancelar</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteTransactionFile}
							className="bg-destructive hover:bg-destructive/90"
						>
							Eliminar
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<FileViewerModal
				files={transactionFiles}
				selectedIndex={selectedFileIndex}
				onSelectedIndexChange={setSelectedFileIndex}
			/>
		</Dialog>
	);
}
