'use client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from "@/components/ui/input"

const usuarioSchema = z.object({
    nome: z.string().min(2, 'Nome obrigatório'),
    cpf: z.string().min(11, 'CPF inválido'),
    gmail: z.string().email('Email inválido'),
    telefone: z.string().min(8, 'Telefone obrigatório'),
    status: z.enum(['Regular', 'Bloqueado'], {
        message: 'Selecione um status válido'
    }),
    endereco: z.object({
        cep: z.string(),
        logradouro: z.string(),
        numero: z.string(),
        complemento: z.string().optional(),
    })
})

type UsuarioForm = z.infer<typeof usuarioSchema>

export function EditModal({
    isOpen,
    onClose,
    userId,
    onSave,
}: {
    isOpen: boolean
    onClose: () => void
    userId: number | null
    onSave: (data: UsuarioForm) => Promise<void>
}) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<UsuarioForm>({
        resolver: zodResolver(usuarioSchema)
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const onSubmit = async (data: UsuarioForm) => {
        if (isSubmitting) return // Bloqueia clique duplo

        setIsSubmitting(true)
        try {
            await onSave(data)
        } finally {
            setIsSubmitting(false)
        }
    }
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState<'dados' | 'endereco'>('dados')

    useEffect(() => {
        if (userId && isOpen) {
            setLoading(true)
            fetch(`http://localhost:3999/usuarios/${userId}`)
                .then(res => {
                    if (!res.ok) throw new Error('Erro ao carregar dados');
                    return res.json()
                })
                .then(data => {
                    // Mapeamento correto dos campos
                    reset({
                        nome: data.nome,
                        cpf: data.cpf,
                        gmail: data.gmail, // Campo deve bater com o nome do schema
                        telefone: data.telefone,
                        status: data.status,
                        endereco: {
                            cep: data.endereco?.cep || '',
                            logradouro: data.endereco?.logradouro || '',
                            numero: data.endereco?.numero || '',
                            complemento: data.endereco?.complemento || ''
                        }
                    })
                })
                .catch(error => {
                    console.error('Erro no fetch:', error)
                    alert('Erro ao carregar dados do usuário')
                })
                .finally(() => setLoading(false))
        }
    }, [userId, isOpen, reset])


    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full max-h-[100vh] overflow-y-auto">
                <h3 className="text-lg font-bold mb-4">Editar Usuário</h3>
                {loading ? (
                    <div className="text-center py-8">Carregando...</div>
                ) : (
                    <>
                        <div className="flex gap-2 mb-4">
                            <button
                                type="button"
                                onClick={() => setStep('dados')}
                                className={`px-4 py-2 rounded ${step === 'dados' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                            >
                                Dados Pessoais
                            </button>
                            <button
                                type="button"
                                onClick={() => setStep('endereco')}
                                className={`px-4 py-2 rounded ${step === 'endereco' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                            >
                                Endereço
                            </button>
                        </div>
                        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
                            {step === 'dados' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block font-medium">Nome</label>
                                        <Input {...register('nome')} />
                                        {errors.nome && <span className="text-red-600">{errors.nome.message}</span>}
                                    </div>
                                    <div>
                                        <label className="block font-medium">CPF</label>
                                        <Input {...register('cpf')} />
                                        {errors.cpf && <span className="text-red-600">{errors.cpf.message}</span>}
                                    </div>
                                    <div>
                                        <label className="block font-medium">Gmail</label>
                                        <Input {...register('gmail')} />
                                        {errors.gmail && <span className="text-red-600">{errors.gmail.message}</span>}
                                    </div>
                                    <div>
                                        <label className="block font-medium">Telefone</label>
                                        <Input {...register('telefone')} />
                                        {errors.telefone && <span className="text-red-600">{errors.telefone.message}</span>}
                                    </div>
                                    <div>
                                        <label className="block font-medium">Status</label>
                                        <select
                                            {...register('status')}
                                            className="w-full p-2 border rounded"
                                        >
                                            <option value="Regular">Regular</option>
                                            <option value="Bloqueado">Bloqueado</option>
                                        </select>
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setStep('endereco')}
                                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                            disabled={isSubmitting}
                                        >
                                            Próximo
                                        </button>
                                    </div>
                                </div>
                            )}
                            {step === 'endereco' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block font-medium">CEP</label>
                                        <Input {...register('endereco.cep')} />
                                    </div>
                                    <div>
                                        <label className="block font-medium">Logradouro</label>
                                        <Input {...register('endereco.logradouro')} />
                                    </div>
                                    <div>
                                        <label className="block font-medium">Número</label>
                                        <Input {...register('endereco.numero')} />
                                    </div>
                                    <div>
                                        <label className="block font-medium">Complemento</label>
                                        <Input {...register('endereco.complemento')} />
                                    </div>
                                    <div className="flex justify-between">
                                        <button
                                            type="button"
                                            onClick={() => setStep('dados')}
                                            className="px-4 py-2 text-gray-500 hover:text-gray-700"
                                        >
                                            Voltar
                                        </button>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={onClose}
                                                className="px-4 py-2 text-gray-500 hover:text-gray-700"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? 'Salvando...' : 'Salvar'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>
                    </>
                )}
            </div>
        </div>
    )
}
