'use client'

import { useEffect, useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '../components/data-table'
import { Input } from '@/components/ui/input'
import { Botao } from '../components/botao'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Livro = {
  isbn: string
  titulo: string
  editora: string
  edicao: string
  categoria: string
  total_exemplares: number
  exemplares_disponiveis: number
}

type CampoBusca = 'titulo' | 'categoria' | 'isbn'

export default function LivrosPage() {
  const [livros, setLivros] = useState<Livro[]>([])
  const [search, setSearch] = useState('')
  const [campoBusca, setCampoBusca] = useState<CampoBusca>('titulo')

  useEffect(() => {
    async function fetchLivros() {
      try {
        const res = await fetch('https://cpe-biblioteca-ddf34b5779af.herokuapp.com/livros')
        const data = await res.json()
        setLivros(data)
      } catch (error) {
        console.error('Erro ao buscar livros:', error)
      }
    }

    fetchLivros()
  }, [])

  const livrosFiltrados = livros.filter((livro) => {
    const valorCampo = (livro as any)[campoBusca]
    if (!valorCampo || typeof valorCampo !== 'string') return false
    return valorCampo.toLowerCase().includes(search.toLowerCase())
  })

  const columns: ColumnDef<Livro>[] = [
    { accessorKey: 'isbn', header: 'ISBN' },
    { accessorKey: 'titulo', header: 'Título' },
    { accessorKey: 'editora', header: 'Editora' },
    { accessorKey: 'edicao', header: 'Edição' },
    { accessorKey: 'categoria', header: 'Categoria' },
    { accessorKey: 'total_exemplares', header: 'Total' },
    { accessorKey: 'exemplares_disponiveis', header: 'Disponíveis' },
    {
      id: 'menu',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              disabled={Number(row.original.exemplares_disponiveis) === 0}
              onClick={() => {
                console.log('Emprestimo', row.original)
              }}
            >
              Realizar empréstimo
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                console.log('Reserva', row.original)
              }}
            >
              Realizar reserva
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                console.log('Editar', row.original)
              }}
            >
              Editar livro
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                console.log('Excluir', row.original)
              }}
            >
              Excluir livro
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ]

  return (
    <main className="p-16">
      <h1 className="text-6xl font-bold mb-8">Livros</h1>

      <div className="relative flex flex-row items-center gap-4 mb-4">
        <Input
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <Select onValueChange={(value) => setCampoBusca(value as CampoBusca)} value={campoBusca}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Campo de busca" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="titulo">Título</SelectItem>
            <SelectItem value="categoria">Categoria</SelectItem>
            <SelectItem value="isbn">ISBN</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto flex gap-2">
          <Botao texto="Adicionar livro" />
        </div>
      </div>

      <DataTable columns={columns} data={livrosFiltrados} />
    </main>
  )
}
