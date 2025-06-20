'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '../components/data-table'
import { Input } from '@/components/ui/input'
import { Botao } from '../components/botao'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

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
  tituloLivro: string
}

export default function PenalidadesPage() {
  const router = useRouter()
  const [penalidades, setPenalidades] = useState<Penalidade[]>([])
  const [search, setSearch] = useState('')
  const [penalidadeSelecionada, setPenalidadeSelecionada] = useState<Penalidade | null>(null)
  const [modoConfirmacao, setModoConfirmacao] = useState<'excluir' | 'cumprir' | null>(null)
  const [loadingConfirmacao, setLoadingConfirmacao] = useState(false)

  async function fetchPenalidades() {
    try {
      const res = await fetch('https://cpe-biblioteca-ddf34b5779af.herokuapp.com/penalidade')
      const data = await res.json()
      setPenalidades(data)
    } catch (error) {
      console.error('Erro ao buscar penalidades:', error)
    }
  }

  useEffect(() => {
    fetchPenalidades()
  }, [])

  const penalidadesFiltradas = penalidades.filter((penalidade) =>
    penalidade.usuarioNome.toLowerCase().includes(search.toLowerCase())
  )

  const penalidadesPendentes = penalidadesFiltradas.filter(p => !p.statusCumprida)
  const todasPenalidades = penalidadesFiltradas

  const columns: ColumnDef<Penalidade>[] = [
    { accessorKey: 'usuarioNome', header: 'Usuário' },
    { accessorKey: 'tituloLivro', header: 'Título do Livro' },
    { accessorKey: 'exemplarCodigo', header: 'Exemplar' },
    { accessorKey: 'tipo', header: 'Tipo' },
    { accessorKey: 'causa', header: 'Causa' },
    {
      accessorKey: 'dataAplicacao',
      header: 'Data Aplicação',
      cell: ({ row }) => formatarData(row.original.dataAplicacao),
    },
    {
      accessorKey: 'dataSuspensao',
      header: 'Data Suspensão',
      cell: ({ row }) => formatarData(row.original.dataSuspensao),
    },
    {
      accessorKey: 'statusCumprida',
      header: 'Status',
      cell: ({ row }) => (
        <span className={row.original.statusCumprida ? 'text-green-600' : 'text-red-600 font-bold'}>
          {row.original.statusCumprida ? 'Cumprida' : 'Pendente'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const penalidade = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {
                setPenalidadeSelecionada(penalidade)
                setModoConfirmacao('cumprir')
              }}>
                Marcar como cumprida
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setPenalidadeSelecionada(penalidade)
                setModoConfirmacao('excluir')
              }}>
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <main>
      <div className="p-16">
        <h1 className="text-6xl font-bold mb-8">Penalidades</h1>

        <div className="relative flex flex-row">
          <Input
            placeholder="Buscar por nome de usuário"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
          <div className="absolute right-0">
            <Botao texto="Adicionar Penalidade" onClick={() => router.push('/penalidades/adicionar')} />
          </div>
        </div>

        <div className="p-4 mt-12">
          {search.trim() === '' ? (
            <>
              <h2 className="text-2xl font-bold mb-4">Penalidades Pendentes</h2>
              <DataTable columns={columns} data={penalidadesPendentes} />

              <h2 className="text-2xl font-bold mt-8 mb-4">Todas as Penalidades</h2>
              <DataTable columns={columns} data={todasPenalidades} />
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-4">Penalidades filtradas</h2>
              <DataTable columns={columns} data={penalidadesFiltradas} />
            </>
          )}
        </div>
      </div>

      <Dialog open={!!modoConfirmacao} onOpenChange={() => {
        setModoConfirmacao(null)
        setPenalidadeSelecionada(null)
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modoConfirmacao === 'excluir'
                ? 'Tem certeza que deseja excluir esta penalidade?'
                : 'Deseja marcar esta penalidade como cumprida?'}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Penalidade de <strong>{penalidadeSelecionada?.usuarioNome}</strong> — exemplar {penalidadeSelecionada?.exemplarCodigo}
          </p>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => {
              setModoConfirmacao(null)
              setPenalidadeSelecionada(null)
            }}>
              Cancelar
            </Button>
            <Button variant={modoConfirmacao === 'excluir' ? 'destructive' : 'default'} onClick={async () => {
              if (!penalidadeSelecionada) return
              setLoadingConfirmacao(true)
              try {
                const baseUrl = `https://cpe-biblioteca-ddf34b5779af.herokuapp.com/penalidade/${penalidadeSelecionada.usuarioId}/${penalidadeSelecionada.exemplarCodigo}/${penalidadeSelecionada.emprestimoDataInicio}/${penalidadeSelecionada.dataAplicacao}`
                const res = await fetch(
                  modoConfirmacao === 'excluir' ? baseUrl : `${baseUrl}/cumprida`,
                  { method: modoConfirmacao === 'excluir' ? 'DELETE' : 'PATCH' }
                )
                if (!res.ok) throw new Error()
                toast.success(
                  modoConfirmacao === 'excluir'
                    ? 'Penalidade excluída com sucesso'
                    : 'Penalidade marcada como cumprida'
                )
                fetchPenalidades()
              } catch {
                toast.error('Erro ao atualizar penalidade')
              } finally {
                setLoadingConfirmacao(false)
                setModoConfirmacao(null)
                setPenalidadeSelecionada(null)
              }
            }} disabled={loadingConfirmacao}>
              {loadingConfirmacao ? 'Processando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
