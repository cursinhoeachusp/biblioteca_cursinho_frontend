'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { format, addDays } from 'date-fns'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const schema = z.object({
  usuario_id: z.string().min(1, 'Usuário obrigatório'),
  exemplar_codigo: z.string().min(1, 'Exemplar obrigatório'),
  data_inicio: z.string().min(1, 'Data de início obrigatória'),
  data_fim_previsto: z.string().min(1, 'Data de fim prevista obrigatória')
})

export default function AdicionarEmprestimoPage() {
  const router = useRouter()
  const hoje = format(new Date(), 'yyyy-MM-dd')
  const fimPrevisto = format(addDays(new Date(), 10), 'yyyy-MM-dd')

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      usuario_id: '',
      exemplar_codigo: '',
      data_inicio: hoje,
      data_fim_previsto: fimPrevisto
    }
  })

  const onSubmit = async (data: any) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${baseUrl}/emprestimos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const msg = await res.text()
        toast.error('Erro ao adicionar empréstimo')
        setError('usuario_id', { type: 'manual', message: 'Verifique o ID do usuário.' })
        setError('exemplar_codigo', { type: 'manual', message: 'Verifique o código do exemplar.' })
        return
      }

      toast.success('Empréstimo adicionado com sucesso!')
      router.push('/emprestimos')
    } catch (err: any) {
      toast.error('Erro ao adicionar empréstimo', { description: err.message })
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">Adicionar Empréstimo</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input placeholder="ID do usuário" {...register('usuario_id')} />
        {errors.usuario_id && <p className="text-sm text-red-500">{errors.usuario_id.message}</p>}

        <Input placeholder="Código do exemplar" {...register('exemplar_codigo')} />
        {errors.exemplar_codigo && <p className="text-sm text-red-500">{errors.exemplar_codigo.message}</p>}

        <div>
          <p className="text-xs text-muted-foreground mb-1">Data de início</p>
          <Input type="date" disabled value={hoje} {...register('data_inicio')} className="opacity-50" />
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1">Data de fim prevista</p>
          <Input type="date" disabled value={fimPrevisto} {...register('data_fim_previsto')} className="opacity-50" />
        </div>

        <div className="pt-4">
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </main>
  )
}
