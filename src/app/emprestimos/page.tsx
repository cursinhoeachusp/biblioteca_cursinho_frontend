'use client'
import { formatInTimeZone } from 'date-fns-tz'
import { format, parseISO } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Botao } from '../components/botao'
import { DataTable } from '@/app/components/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, ArrowDown, ArrowUp } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

interface Emprestimo {
  usuario_id: number
  exemplar_codigo: string
  data_inicio: string
  data_fim_previsto: string
  data_devolucao: string | null
  renovado: boolean
  usuario_nome: string
  livro_titulo: string
}

export default function EmprestimosPage() {
  const router = useRouter()
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([])
  const [busca, setBusca] = useState('')
  const [filtroData, setFiltroData] = useState<'inicio' | 'devolucao'>('inicio')
  const [ordemCrescente, setOrdemCrescente] = useState(true)
  const [emprestimoSelecionado, setEmprestimoSelecionado] = useState<Emprestimo | null>(null)
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false)
  const [loadingConfirmacao, setLoadingConfirmacao] = useState(false)

  async function fetchEmprestimos() {
    try {
      const res = await fetch('https://biblioteca-cpe-1659a290eab7.herokuapp.com/emprestimos')
      const data = await res.json()
      setEmprestimos(data)
    } catch {
      toast.error('Erro ao carregar empréstimos')
    }
  }

  useEffect(() => {
    fetchEmprestimos()
  }, [])

  const filtered = emprestimos
    .filter(e => {
      const search = busca.toLowerCase()
      return (
        (e.usuario_nome?.toLowerCase().includes(search) ?? false) ||
        e.usuario_id.toString().includes(search) ||
        (e.livro_titulo?.toLowerCase().includes(search) ?? false) ||
        e.exemplar_codigo.toLowerCase().includes(search)
      )
    })
    .sort((a, b) => {
      const aDate = filtroData === 'inicio' ? new Date(a.data_inicio) : new Date(a.data_devolucao || '9999-12-31')
      const bDate = filtroData === 'inicio' ? new Date(b.data_inicio) : new Date(b.data_devolucao || '9999-12-31')
      return ordemCrescente ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime()
    })

  const renovarEmprestimo = async (e: Emprestimo) => {
    try {
      const dataUTC = e.data_inicio.substring(0, 10)
      const res = await fetch(`https://biblioteca-cpe-1659a290eab7.herokuapp.com/emprestimos/${e.usuario_id}/${e.exemplar_codigo}/${dataUTC}/renovar`, {
        method: 'PATCH'
      })
      if (!res.ok) throw new Error()
      toast.success('Empréstimo renovado com sucesso!')
      await fetchEmprestimos()
    } catch {
      toast.error('Erro ao renovar empréstimo')
    }
  }

  const marcarComoDevolvido = async (e: Emprestimo) => {
    try {
      const dataUTC = e.data_inicio.substring(0, 10)
      const res = await fetch(`https://biblioteca-cpe-1659a290eab7.herokuapp.com/emprestimos/${e.usuario_id}/${e.exemplar_codigo}/${dataUTC}/devolver`, {
        method: 'PATCH'
      })
      if (!res.ok) throw new Error()
      toast.success('Empréstimo marcado como devolvido!')
      await fetchEmprestimos()
    } catch {
      toast.error('Erro ao marcar como devolvido')
    }
  }

  const excluirEmprestimo = async () => {
    if (!emprestimoSelecionado) return
    setLoadingConfirmacao(true)
    try {
      const dataUTC = emprestimoSelecionado.data_inicio.substring(0, 10)
      const res = await fetch(`https://biblioteca-cpe-1659a290eab7.herokuapp.com/emprestimos/${emprestimoSelecionado.usuario_id}/${emprestimoSelecionado.exemplar_codigo}/${dataUTC}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error()
      toast.success('Empréstimo excluído com sucesso')
      await fetchEmprestimos()
    } catch {
      toast.error('Erro ao excluir empréstimo')
    } finally {
      setLoadingConfirmacao(false)
      setConfirmandoExclusao(false)
      setEmprestimoSelecionado(null)
    }
  }

  const columns: ColumnDef<Emprestimo>[] = [
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
      accessorKey: 'data_inicio',
      header: () => (
        <button
          onClick={() => {
            setFiltroData('inicio')
            setOrdemCrescente(filtroData !== 'inicio' ? true : !ordemCrescente)
          }}
          className="flex items-center gap-1"
        >
          Início {filtroData === 'inicio' && (ordemCrescente ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
        </button>
      ),
      cell: ({ row }) => formatInTimeZone(parseISO(row.original.data_inicio), 'UTC', 'dd/MM/yyyy')
    },
    {
      accessorKey: 'data_fim_previsto',
      header: 'Fim Previsto',
      cell: ({ row }) => formatInTimeZone(parseISO(row.original.data_fim_previsto), 'UTC', 'dd/MM/yyyy')
    },
    {
      accessorKey: 'data_devolucao',
      header: () => (
        <button
          onClick={() => {
            setFiltroData('devolucao')
            setOrdemCrescente(filtroData !== 'devolucao' ? true : !ordemCrescente)
          }}
          className="flex items-center gap-1"
        >
          Devolução {filtroData === 'devolucao' && (ordemCrescente ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
        </button>
      ),
      cell: ({ row }) => row.original.data_devolucao
        ? formatInTimeZone(parseISO(row.original.data_devolucao), 'UTC', 'dd/MM/yyyy')
        : '—'
    },
    {
      accessorKey: 'renovado',
      header: 'Renovado',
      cell: ({ row }) => row.original.renovado ? 'Sim' : 'Não'
    },
    {
      id: 'acoes',
      header: '',
      cell: ({ row }) => {
        const e = row.original
        const devolvido = !!e.data_devolucao
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem disabled={e.renovado || devolvido} onClick={() => renovarEmprestimo(e)}>Renovar</DropdownMenuItem>
              <DropdownMenuItem disabled={devolvido} onClick={() => marcarComoDevolvido(e)}>Marcar como Devolvido</DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setEmprestimoSelecionado(e)
                setConfirmandoExclusao(true)
              }}>Excluir</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    }
  ]

  return (
    <main className="p-16">
      <h1 className="text-6xl font-bold mb-8">Empréstimos</h1>

      <div className="relative flex flex-col md:flex-row gap-4 items-start md:items-center">
        <Input placeholder="Buscar por usuário ou livro" value={busca} onChange={e => setBusca(e.target.value)} className="max-w-md" />
        <Select
          onValueChange={(value) => setFiltroData(value as 'inicio' | 'devolucao')}
          value={filtroData}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="inicio">Data de Início</SelectItem>
            <SelectItem value="devolucao">Data de Devolução</SelectItem>
          </SelectContent>
        </Select>
        <div className="md:ml-auto">
          <Botao texto="Adicionar Empréstimo" onClick={() => router.push('/emprestimos/adicionar')} />
        </div>
      </div>

      <div className="p-4 mt-12">
        <DataTable columns={columns} data={filtered} />
      </div>

      <Dialog open={confirmandoExclusao} onOpenChange={() => {
        setConfirmandoExclusao(false)
        setEmprestimoSelecionado(null)
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tem certeza que deseja excluir este empréstimo?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Empréstimo de <strong>{emprestimoSelecionado?.usuario_nome}</strong> — exemplar {emprestimoSelecionado?.exemplar_codigo}
          </p>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => setConfirmandoExclusao(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={excluirEmprestimo} disabled={loadingConfirmacao}>
              {loadingConfirmacao ? 'Processando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
