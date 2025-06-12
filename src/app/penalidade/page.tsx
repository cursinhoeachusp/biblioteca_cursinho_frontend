'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '../components/data-table'
import { Input } from '@/components/ui/input'
import { Botao } from '../components/botao'
import { toast } from 'sonner'
import { Pagination } from '@/components/ui/pagination'

// Função para formatar datas no formato dd/mm/aaaa
function formatarData(data: string | null) {
  if (!data) return '-'
  const dataObj = new Date(data)
  return dataObj.toLocaleDateString('pt-BR')
}

type Penalidade = {
  usuarioId: number
  usuarioNome: string
  exemplarCodigo: string
  emprestimoDataInicio: string
  dataAplicacao: string
  dataSuspensao: string | null
  tipo: string
  causa: string
  statusCumprida: boolean
}

export default function PenalidadesPage() {
  const router = useRouter()
  const [penalidades, setPenalidades] = useState<Penalidade[]>([])
  const [search, setSearch] = useState('')
  
  const [paginaTodas, setPaginaTodas] = useState(1)
  const [paginaPendentes, setPaginaPendentes] = useState(1)
  const penalidadesPorPagina = 10

  useEffect(() => {
    async function fetchPenalidades() {
      try {
        const res = await fetch('https://cpe-biblioteca-ddf34b5779af.herokuapp.com/penalidade')
        const data = await res.json()
        setPenalidades(data)
      } catch (error) {
        console.error('Erro ao buscar penalidades:', error)
      }
    }

    fetchPenalidades()
  }, [])

  const penalidadesFiltradas = penalidades.filter((penalidade) =>
    penalidade.usuarioNome.toLowerCase().includes(search.toLowerCase())
  )

  const penalidadesPendentes = penalidadesFiltradas.filter(p => !p.statusCumprida)
  const todasPenalidades = penalidadesFiltradas

  const paginar = (dados: Penalidade[], pagina: number) =>
    dados.slice((pagina - 1) * penalidadesPorPagina, pagina * penalidadesPorPagina)

  const columns: ColumnDef<Penalidade>[] = [
    { accessorKey: 'usuarioNome', header: 'Usuário' },
    { accessorKey: 'exemplarCodigo', header: 'Exemplar' },
    { accessorKey: 'tipo', header: 'Tipo' },
    { accessorKey: 'causa', header: 'Causa' },
    { 
      accessorKey: 'dataAplicacao', 
      header: 'Data Aplicação',
      cell: ({ row }) => formatarData(row.original.dataAplicacao)
    },
    { 
      accessorKey: 'dataSuspensao', 
      header: 'Data Suspensão',
      cell: ({ row }) => formatarData(row.original.dataSuspensao)
    },
    {
      accessorKey: 'statusCumprida',
      header: 'Status',
      cell: ({ row }) => (
        <span className={row.original.statusCumprida ? "text-green-600" : "text-red-600 font-bold"}>
          {row.original.statusCumprida ? "Cumprida" : "Pendente"}
        </span>
      )
    }
  ]

  return (
    <main>
      <div className='p-16'>
        <h1 className="text-6xl font-bold mb-8">Penalidades</h1>

        <div className='relative flex flex-row'>
          <Input
            placeholder="Buscar por nome de usuário"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
          <div className='absolute right-0'>
            <Botao texto="Adicionar Penalidade" onClick={() => router.push('/penalidade/adicionar')} />
          </div>
        </div>

        <div className="p-4 mt-12">
          {search.trim() === "" ? (
            <>
              <h2 className="text-2xl font-bold mb-4">Penalidades Pendentes</h2>
              <DataTable columns={columns} data={paginar(penalidadesPendentes, paginaPendentes)} />
              <Pagination total={penalidadesPendentes.length} perPage={penalidadesPorPagina} currentPage={paginaPendentes} onChangePage={setPaginaPendentes} />

              <h2 className="text-2xl font-bold mt-8 mb-4">Todas as Penalidades</h2>
              <DataTable columns={columns} data={paginar(todasPenalidades, paginaTodas)} />
              <Pagination total={todasPenalidades.length} perPage={penalidadesPorPagina} currentPage={paginaTodas} onChangePage={setPaginaTodas} />
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-4">Penalidades filtradas</h2>
              <DataTable columns={columns} data={penalidadesFiltradas} />
            </>
          )}
        </div>
      </div>
    </main>
  )
}
