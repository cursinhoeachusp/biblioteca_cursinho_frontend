import { ColumnDef } from '@tanstack/react-table'
import { AddressDialog } from "./address-dialog"
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type Usuario = {
  id: number
  nome: string
  email: string
  telefone: string
  status: 'Regular' | 'Bloqueado'
  address: string
  cpf: number
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
    accessorKey: 'email',
    header: 'E-mail',
  },
  {
    accessorKey: 'telefone',
    header: 'Telefone',
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
    header: 'Ação',
    cell: ({ row }) => {
      const address = row.original.address
      const nome = row.getValue('nome') as string // ou o nome da sua coluna de nome
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
                console.log('Editar', row.original)
              }}
            >
              Editar registro
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                console.log('Excluir', row.original)
              }}
            >
              Excluir registro
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]


