'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { addDays, format, differenceInCalendarDays, isBefore, parseISO } from 'date-fns'

const schema = z.object({
  usuario_id: z.string().min(1, 'Usuário obrigatório'),
  exemplar_codigo: z.string().min(1, 'Exemplar obrigatório'),
  emprestimo_data_inicio: z.string().min(1, 'Data de início obrigatória'),
  data_aplicacao: z.string().min(1, 'Data de aplicação obrigatória'),
  tipo_id: z.union([z.string(), z.number()]).refine(val => val !== '', {
    message: 'Tipo é obrigatório',
  }),
  causa_id: z.union([z.string(), z.number()]).refine(val => val !== '' && val !== undefined && val !== null, {
    message: 'Causa obrigatória',
  }),
  data_suspensao: z.string().optional()
})

export default function AdicionarPenalidadePage() {
  const router = useRouter()
  const [tipos, setTipos] = useState<{ id: number, nome: string }[]>([])
  const [causas, setCausas] = useState<{ id: number, nome: string }[]>([])
  const [tipoReposicaoId, setTipoReposicaoId] = useState<number | null>(null)
  const [causaNome, setCausaNome] = useState<string>('')

  const { register, handleSubmit, watch, setValue, setError, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      usuario_id: '',
      exemplar_codigo: '',
      emprestimo_data_inicio: '',
      data_aplicacao: format(new Date(), 'yyyy-MM-dd'),
      tipo_id: undefined,
      causa_id: undefined,
      data_suspensao: ''
    }
  })

  const causa_id = watch('causa_id')
  const tipo_id = watch('tipo_id')
  const dataEmprestimo = watch('emprestimo_data_inicio')

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    fetch(`${baseUrl}/penalidade/tipos`)
      .then(res => res.json())
      .then(data => {
        setTipos(data)
        const reposicao = data.find((t: any) => t.nome.toLowerCase() === 'bloqueio com reposicao')
        if (reposicao) setTipoReposicaoId(reposicao.id)
      })

    fetch(`${baseUrl}/penalidade/causas`)
      .then(res => res.json())
      .then(setCausas)

    setValue('data_aplicacao', format(new Date(), 'yyyy-MM-dd'))
  }, [])

  useEffect(() => {
    const causa = causas.find(c => c.id === Number(causa_id))
    if (!causa) return
    const nome = causa.nome.toLowerCase()
    setCausaNome(nome)

    if (nome === 'perda') {
      if (tipoReposicaoId !== null) setValue('tipo_id', tipoReposicaoId)
      setValue('data_suspensao', '')
    } else if (nome === 'atraso' && dataEmprestimo) {
      const hoje = new Date()
      const emprestimoDate = new Date(dataEmprestimo)
      const diasAtraso = differenceInCalendarDays(hoje, emprestimoDate)
      const suspensao = format(addDays(hoje, diasAtraso), 'yyyy-MM-dd')
      setValue('data_suspensao', suspensao)
    } else {
      setValue('tipo_id', '')
    }
  }, [causa_id, causas, tipoReposicaoId, dataEmprestimo, setValue])

  async function onSubmit(data: any) {
    const hoje = format(new Date(), 'yyyy-MM-dd')
    if (data.data_suspensao && isBefore(parseISO(data.data_suspensao), parseISO(hoje))) {
      setError('data_suspensao', { type: 'manual', message: 'Data de suspensão deve ser posterior à data atual.' })
      return
    }

    try {
      const payload = {
        ...data,
        tipo_id: data.tipo_id ? Number(data.tipo_id) : null,
        causa_id: Number(data.causa_id)
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${baseUrl}/penalidade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errText = await res.text()
        console.error('Erro backend:', errText)

        setError('usuario_id', { type: 'manual', message: 'Verifique o ID do usuário ou vínculo com o empréstimo.' })
        setError('exemplar_codigo', { type: 'manual', message: 'Verifique o código do exemplar.' })
        setError('emprestimo_data_inicio', { type: 'manual', message: 'Data inválida ou empréstimo inexistente.' })

        toast.error('Erro ao cadastrar penalidade', {
          description: errText || 'Verifique os campos informados.'
        })
        return
      }

      toast.success('Penalidade adicionada com sucesso!')
      router.push('/penalidades')
    } catch (err: any) {
      toast.error('Erro ao cadastrar penalidade', {
        description: err.message
      })
    }
  }

  const causaSelecionada = causas.find(c => c.id === Number(causa_id))?.nome
  const tipoSelecionado = tipos.find(t => t.id === Number(tipo_id))?.nome

  return (
    <main className="max-w-2xl mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">Adicionar penalidade</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input placeholder="ID do usuário" {...register('usuario_id')} />
        {errors.usuario_id && <p className="text-sm text-red-500 mt-1">{errors.usuario_id.message}</p>}

        <Input placeholder="Código do exemplar" {...register('exemplar_codigo')} />
        {errors.exemplar_codigo && <p className="text-sm text-red-500 mt-1">{errors.exemplar_codigo.message}</p>}

        <div>
          <p className="text-xs text-muted-foreground mb-1">Data de início do empréstimo</p>
          <Input type="date" placeholder="dd/mm/aaaa" {...register('emprestimo_data_inicio')} />
          {errors.emprestimo_data_inicio && <p className="text-sm text-red-500 mt-1">{errors.emprestimo_data_inicio.message}</p>}
        </div>

        <Select key={String(causa_id)} value={String(causa_id)} onValueChange={v => setValue('causa_id', Number(v))}>
          <SelectTrigger>
            <SelectValue placeholder="Causa da penalidade">
              {causaSelecionada ?? 'Causa da penalidade'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {causas.map(c => (
              <SelectItem key={c.id} value={String(c.id)}>{c.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.causa_id && <p className="text-sm text-red-500 mt-1">{errors.causa_id.message}</p>}

        <div className={causaNome === 'perda' ? 'opacity-50 pointer-events-none' : ''}>
          <Select key={String(tipo_id)} value={String(tipo_id)} onValueChange={v => setValue('tipo_id', Number(v))} disabled={causaNome === 'perda'}>
            <SelectTrigger>
              <SelectValue placeholder={causaNome === 'perda' ? 'Tipo: Bloqueio com reposição (fixo)' : 'Tipo de penalidade'}>
                {tipoSelecionado ?? (causaNome === 'perda' ? 'Bloqueio com reposição (fixo)' : 'Tipo de penalidade')}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {tipos.map(t => (
                <SelectItem key={t.id} value={String(t.id)}>{t.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.tipo_id && <p className="text-sm text-red-500 mt-1">{errors.tipo_id.message}</p>}
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1">Data de aplicação da penalidade (data vigente)</p>
          <Input type="date" placeholder="dd/mm/aaaa" {...register('data_aplicacao')} disabled className="opacity-50" />
          {errors.data_aplicacao && <p className="text-sm text-red-500 mt-1">{errors.data_aplicacao.message}</p>}
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1">Data de suspensão</p>
          <div className={(causaNome === 'perda' || causaNome === 'atraso') ? 'opacity-50 pointer-events-none' : ''}>
            <Input
              type="date"
              placeholder="dd/mm/aaaa"
              {...register('data_suspensao')}
              disabled={causaNome === 'perda' || causaNome === 'atraso'}
              min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
            />
          </div>
          {errors.data_suspensao && <p className="text-sm text-red-500 mt-1">{errors.data_suspensao.message}</p>}
        </div>

        <div className="pt-4">
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </main>
  )
}
