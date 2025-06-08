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

type Autor = {
  id: number
  nome: string
}

type Livro = {
  isbn: string
  titulo: string
  editora: string
  edicao: string
  categoria: string
  total_exemplares: number | string
  exemplares_disponiveis: number | string
  autores: Autor[]
}

type CampoBusca = 'titulo' | 'categoria' | 'isbn' | 'autores'

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
    const termo = search.toLowerCase()

    if (campoBusca === 'autores') {
      return livro.autores?.some(autor =>
        autor.nome.toLowerCase().includes(termo)
      )
    }

    const valorCampo = (livro as any)[campoBusca]
    if (!valorCampo) return false
    return valorCampo.toString().toLowerCase().includes(termo)
  })

  const columns: ColumnDef<Livro>[] = [
    { accessorKey: 'isbn', header: 'ISBN' },
    { accessorKey: 'titulo', header: 'Título' },
    { accessorKey: 'total_exemplares', header: 'Total' },
    { accessorKey: 'exemplares_disponiveis', header: 'Disponíveis' },
    { accessorKey: 'editora', header: 'Editora' },
    { accessorKey: 'edicao', header: 'Edição' },
    { accessorKey: 'categoria', header: 'Categoria' },
    {
      accessorKey: 'autores',
      header: 'Autores',
      cell: ({ row }) => row.original.autores.map(a => a.nome).join(', '),
    },
    
    
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
              onClick={() => console.log('Emprestimo', row.original)}
            >
              Realizar empréstimo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('Reserva', row.original)}>
              Realizar reserva
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('Editar', row.original)}>
              Editar livro
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('Excluir', row.original)}>
              Excluir livro
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
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
            <SelectItem value="autores">Autor(es)</SelectItem>
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
