"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogCancel,
    AlertDialogAction
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Trash2 } from "lucide-react"

import { OptionLineDialog } from "./option-line-add"
import { OptionColorDialog } from "./option-color-add"
import { OptionTypeDialog } from "./option-type-add"
import { OptionSiteDialog } from "./option-site-add"

import { deleteOption } from "@/lib/stock_options"
import { listOptions, type LineOption, TypeOption, ColorOption, SiteOption } from "@/lib/stock_options"

interface OptionsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  materialType?: "Aluminio" | "PVC"
}

export function OptionsModal({ materialType, open, onOpenChange }: OptionsModalProps) {
    // Estados para abrir los diálogos de agregar
    const [isAddLineOpen, setIsAddLineOpen] = useState(false)
    const [isAddColorOpen, setIsAddColorOpen] = useState(false)
    const [isAddTypeOpen, setIsAddTypeOpen] = useState(false)
    const [isAddSiteOpen, setIsAddSiteOpen] = useState(false)

    // Estados para las tablas
    const [lines, setLines] = useState<LineOption[]>([])
    const [types, setTypes] = useState<TypeOption[]>([])
    const [colors, setColors] = useState<ColorOption[]>([])
    const [sites, setSites] = useState<SiteOption[]>([])

    // AlertDialog for delete option
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean, table: string, id: number | string | undefined, label: string }>({ open: false, table: '', id: undefined, label: '' })

    const handleDeleteOption = async (table: string, id: number | string | undefined) => {
        if (id == null) return
        await deleteOption(table, Number(id))
        if (table === "lines") setLines((prev) => prev.filter((l) => l.id !== id))
        else if (table === "types") setTypes((prev) => prev.filter((t) => t.id !== id))
        else if (table === "colors") setColors((prev) => prev.filter((c) => c.id !== id))
        else if (table === "sites") setSites((prev) => prev.filter((s) => s.id !== id))
    }
    
    useEffect(() => {
        if (open) {
            loadData()
        }
    }, [open])

    const loadData = async () => {
    const [
        { data: linesData },
        { data: colorsData },
        { data: typesData },
        { data: sitesData}
    ] = await Promise.all([
        listOptions("lines"),
        listOptions("colors"),
        listOptions("types"),
        listOptions("sites")
    ])

    setLines((linesData ?? []) as LineOption[])
    setColors((colorsData ?? []) as ColorOption[])
    setTypes((typesData ?? []) as TypeOption[])
    setSites((sitesData ?? []) as SiteOption[])
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-card max-h-[90vh] flex flex-col">
            <DialogHeader>
            <DialogTitle>Administrar opciones</DialogTitle>
            <DialogDescription>Gestione colores, líneas, tipos y ubicaciones</DialogDescription>
            </DialogHeader>

            <div className="overflow-y-auto flex-1 py-4 pr-2 -mr-2 grid gap-6">
                {/* Table lines */}
                <div className="flex flex-col border p-2 rounded">
                    <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Líneas</span>
                    <OptionLineDialog
                        open={isAddLineOpen}
                        onOpenChange={setIsAddLineOpen}
                        materialType={materialType}
                        onSave={(newLine) => setLines((prev) => [newLine, ...prev])}
                        triggerButton={true}
                    />
                    </div>
                    <table className="table-auto w-full border-collapse">
                    <thead>
                        <tr className="border-b">
                        <th className="text-left p-1">Nombre</th>
                        <th className="text-left p-1">Abertura</th>
                        <th className="text-left p-1">Eliminar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lines.map((line) => (
                        <tr key={line.id} className="border-b">
                            <td className="p-1">{line.name_line}</td>
                            <td className="p-1">{line.opening}</td>
                            <td className="p-1">
                                <Button variant="ghost" size="icon" onClick={() => setDeleteDialog({ open: true, table: 'lines', id: line.id, label: line.name_line ?? '' })}>
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                {/* Table types */}
                <div className="flex flex-col border p-2 rounded">
                    <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Tipos</span>
                    <OptionTypeDialog
                        open={isAddTypeOpen}
                        onOpenChange={setIsAddTypeOpen}
                        onSave={(newType) => setLines((prev) => [newType, ...prev])}
                        triggerButton={true}
                    />
                    </div>
                    <table className="table-auto w-full border-collapse">
                    <thead>
                        <tr className="border-b">
                        <th className="text-left p-1">Nombre</th>
                        <th className="text-left p-1">Linea</th>
                        <th className="text-left p-1">Eliminar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {types.map((type) => (
                        <tr key={type.id} className="border-b">
                            <td className="p-1">{type.name_type}</td>
                            <td className="p-1">{type.line_name}</td>
                            <td className="p-1">
                                <Button variant="ghost" size="icon" onClick={() => setDeleteDialog({ open: true, table: 'types', id: type.id, label: type.name_type ?? '' })}>
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                {/* Table colors */}
                <div className="flex flex-col border p-2 rounded">
                    <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Colores</span>
                    <OptionColorDialog
                        open={isAddColorOpen}
                        onOpenChange={setIsAddColorOpen}
                        onSave={(newColor) => setLines((prev) => [newColor, ...prev])}
                        triggerButton={true}
                    />
                    </div>
                    <table className="table-auto w-full border-collapse">
                    <thead>
                        <tr className="border-b">
                        <th className="text-left p-1">Nombre</th>
                        <th className="text-left p-1">Linea</th>
                        <th className="text-left p-1">Eliminar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {colors.map((color) => (
                        <tr key={color.id} className="border-b">
                            <td className="p-1">{color.name_color}</td>
                            <td className="p-1">{color.line_name}</td>
                            <td className="p-1">
                                <Button variant="ghost" size="icon" onClick={() => setDeleteDialog({ open: true, table: 'colors', id: color.id, label: color.name_color ?? '' })}>
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                {/* Table sites */}
                <div className="flex flex-col border p-2 rounded">
                    <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Ubicaciones</span>
                    <OptionSiteDialog
                        open={isAddSiteOpen}
                        onOpenChange={setIsAddSiteOpen}
                        onSave={(newSite) => setSites((prev) => [newSite, ...prev])}
                        triggerButton={true}
                    />
                    </div>
                    <table className="table-auto w-full border-collapse">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left p-1">Nombre</th>
                            <th className="text-left p-1">Eliminar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sites.map((site) => (
                        <tr key={site.id} className="border-b">
                            <td className="p-1">{site.name_site}</td>
                            <td className="p-1">
                                <Button variant="ghost" size="icon" onClick={() => setDeleteDialog({ open: true, table: 'sites', id: site.id, label: site.name_site ?? '' })}>
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
            </div>

            {/* AlertDialog for delete option */}
            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}>
                <AlertDialogContent>
                    <AlertDialogTitle>¿Eliminar opción?</AlertDialogTitle>
                    <AlertDialogDescription>
                        ¿Estás seguro que deseas eliminar <span className="font-semibold">{deleteDialog.label}</span>? Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                    <div className="flex justify-end gap-2 mt-4">
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-white hover:bg-destructive/90"
                            onClick={async () => {
                                if (deleteDialog.id) await handleDeleteOption(deleteDialog.table, deleteDialog.id)
                                setDeleteDialog({ open: false, table: '', id: undefined, label: '' })
                            }}
                        >
                            Eliminar
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>

            <DialogFooter className="flex-shrink-0 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>
    )
}
