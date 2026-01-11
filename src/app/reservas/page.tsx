// app/reserva/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Botao } from '@/app/components/botao'
import { DataTable } from '@/app/components/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { MoreHorizontal } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import Link from 'next/link'
import ImageG from "@/components/ImageG";

interface Reserva {
  usuario_id: number
  exemplar_codigo: string
  data_efetuacao: string
  usuario_nome: string
  livro_titulo: string
}

export default function ReservaPage() {
  const router = useRouter()
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [buscaLivro, setBuscaLivro] = useState('')

  async function fetchReservas() {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${baseUrl}/reservas`)
      const data = await res.json()
      setReservas(data)
    } catch {
      toast.error('Erro ao carregar reservas')
    }
  }

  useEffect(() => {
    fetchReservas()
  }, [])

  const reservasFiltradas = reservas
    .filter(r => r.livro_titulo?.toLowerCase().includes(buscaLivro.toLowerCase()))
    .sort((a, b) => new Date(a.data_efetuacao).getTime() - new Date(b.data_efetuacao).getTime())

  const columns: ColumnDef<Reserva>[] = [
    {
      accessorKey: 'usuario_nome',
      header: 'Usuário'
    },
    {
      accessorKey: 'livro_titulo',
      header: 'Livro'
    },
    {
      accessorKey: 'exemplar_codigo',
      header: 'Exemplar'
    },
    {
      accessorKey: 'data_efetuacao',
      header: 'Data da Reserva',
      cell: ({ row }) => format(new Date(row.original.data_efetuacao), 'dd/MM/yyyy')
    },
    {
      id: 'acoes',
      header: '',
      cell: ({ row }) => {
        const r = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href={`/emprestimos/adicionar?usuario_id=${r.usuario_id}&exemplar_codigo=${r.exemplar_codigo}`}>
                  Tornar empréstimo
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    }
  ]

  return (
    <main className="p-6 md:p-16">
      <h1 className="text-4xl md:text-6xl font-bold mb-8">Reservas</h1>

      <div className="relative flex flex-col md:flex-row gap-4 items-start md:items-center ">
        <Input
          placeholder="Buscar por título do livro"
          value={buscaLivro}
          onChange={e => setBuscaLivro(e.target.value)}
          className="w-full placeholder:text-sm px-2 md:max-w-md border-gray-400"
        />
        <div className="w-full md:w-auto md:ml-auto">
          <Botao texto="Adicionar reserva" onClick={() => router.push('/reservas/adicionar')} />
        </div>
      </div>

      <div className="p-4 mt-12">
        <DataTable columns={columns} data={reservasFiltradas} />
      </div>

      <div className="mt-10 flex justify-center md:hidden">
        <ImageG
          src="/ATENA-CURSINHO.png"
          alt="Logo Atena"
          width={80}
          height={35}
          priority
        />
     </div>
    </main>
  )
}
