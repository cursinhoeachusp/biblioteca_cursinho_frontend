'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'

// Regex para CPF: 11 dígitos numéricos
const cpfRegex = /^\d{11}$/

// Regex para telefone: 11 dígitos numéricos (ex: 11999999999)
const telefoneRegex = /^\d{11}$/

// Regex para CEP: 8 dígitos numéricos
const cepRegex = /^\d{8}$/

const usuarioSchema = z.object({
  nome: z.string().min(2, 'Nome obrigatório'),
  cpf: z.string().regex(cpfRegex, 'CPF deve ter 11 números, apenas dígitos'),
  gmail: z.string().email('Email inválido'),
  telefone: z.string().regex(telefoneRegex, 'Telefone deve ter 11 números, apenas dígitos'),
  cep: z.string().regex(cepRegex, 'CEP deve ter 8 números, apenas dígitos'),
  logradouro: z.string().min(2, 'Logradouro obrigatório'),
  numero: z.string().min(1, 'Número obrigatório'),
  complemento: z.string().optional(),
})

type UsuarioForm = z.infer<typeof usuarioSchema>

export default function NovoUsuarioPage() {
  const router = useRouter()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<UsuarioForm>({
    resolver: zodResolver(usuarioSchema)
  })

  async function onSubmit(data: UsuarioForm) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
      const res = await fetch(`${baseUrl}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Erro ao cadastrar usuário')
      router.push('/usuarios')
    } catch (error) {
      alert('Erro ao cadastrar usuário')
    }
  }

  return (
    <main className="p-16 flex justify-center">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-10">
        <h1 className="text-4xl font-bold mb-8 text-center">Novo Usuário</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Grid de campos principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium">Nome</label>
              <Input {...register('nome')} />
              {errors.nome && <span className="text-red-600">{errors.nome.message}</span>}
            </div>
            <div>
              <label className="block font-medium">CPF</label>
              <Input
                {...register('cpf')}
                placeholder="Somente números, ex: 12345678901"
                maxLength={11}
              />
              {errors.cpf && <span className="text-red-600">{errors.cpf.message}</span>}
            </div>
            <div>
              <label className="block font-medium">Gmail</label>
              <Input {...register('gmail')} placeholder="exemplo@gmail.com" />
              {errors.gmail && <span className="text-red-600">{errors.gmail.message}</span>}
            </div>
            <div>
              <label className="block font-medium">Telefone</label>
              <Input
                {...register('telefone')}
                placeholder="Somente números, ex: 11999999999"
                maxLength={11}
              />
              {errors.telefone && <span className="text-red-600">{errors.telefone.message}</span>}
            </div>
          </div>

          <hr className="my-4" />
          <h2 className="text-lg font-semibold">Endereço</h2>

          {/* Grid de campos de endereço */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium">CEP</label>
              <Input
                {...register('cep')}
                placeholder="Somente números, ex: 12345678"
                maxLength={8}
              />
              {errors.cep && <span className="text-red-600">{errors.cep.message}</span>}
            </div>
            <div>
              <label className="block font-medium">Logradouro</label>
              <Input {...register('logradouro')} />
              {errors.logradouro && <span className="text-red-600">{errors.logradouro.message}</span>}
            </div>
            <div>
              <label className="block font-medium">Número</label>
              <Input {...register('numero')} />
              {errors.numero && <span className="text-red-600">{errors.numero.message}</span>}
            </div>
            <div>
              <label className="block font-medium">Complemento</label>
              <Input {...register('complemento')} />
              {errors.complemento && <span className="text-red-600">{errors.complemento.message}</span>}
            </div>
          </div>

          <div className="flex gap-2 mt-8 justify-end">
            <button
              type="button"
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
              onClick={() => router.push('/usuarios')}
            >
              Voltar para Usuários
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
