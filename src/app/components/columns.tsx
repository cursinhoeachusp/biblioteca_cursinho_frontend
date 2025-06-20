// components/columns.tsx
import { ColumnDef } from '@tanstack/react-table'
import { AddressDialog } from "./address-dialog"
import { MoreHorizontal, Trash2, Pencil } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type Usuario = {
  id: number
  nome: string
  gmail: string // ajuste para o campo usado no backend
  telefone: string
  status: 'Regular' | 'Bloqueado'
  address: string
  cpf: string // altere para string para preservar zeros à esquerda
}

export const columns: ColumnDef<Usuario>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'nome',
    header: 'Nome',
  },
  {
    accessorKey: 'gmail', // ajuste para o campo usado no backend
    header: 'E-mail',
  },
  {
    accessorKey: 'telefone',
    header: 'Telefone',
  },
  {
    accessorKey: 'cpf',
    header: 'CPF',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <span
          className={
            status === 'Bloqueado'
              ? 'text-red-500 font-semibold'
              : 'text-green-600'
          }
        >
          {status}
        </span>
      )
    },
  },
  {
    id: 'acoes',
    header: 'Endereço',
    cell: ({ row }) => {
      const address = row.original.address
      const nome = row.getValue('nome') as string
      return <AddressDialog address={address} nome={nome} />
    }
  },
  {
    id: 'menu',
    header: '',
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                // Dispara evento para abrir modal de edição
                document.dispatchEvent(new CustomEvent('openEditModal', { detail: row.original.id }))
              }}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Editar registro
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                // Dispara evento para abrir modal de exclusão
                document.dispatchEvent(new CustomEvent('openDeleteModal', { detail: row.original.id }))
              }}
            >
              <Trash2 className="h-4 w-4 mr-2 text-red-500" />
              Excluir registro
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
