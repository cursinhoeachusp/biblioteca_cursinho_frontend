'use client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from "@/components/ui/input"

const usuarioSchema = z.object({
    nome: z.string().min(2, 'Nome obrigatório'),
    cpf: z.string().min(7, 'Documento inválido, insira pelo menos 7 caracteres'),
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
    // Adicionámos o setValue para conseguirmos injetar o endereço do ViaCEP
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<UsuarioForm>({
        resolver: zodResolver(usuarioSchema)
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState<'dados' | 'endereco'>('dados')

    const onSubmit = async (data: UsuarioForm) => {
        if (isSubmitting) return 

        setIsSubmitting(true)
        try {
            await onSave(data)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Corrigido o fetch e o mapeamento dos dados da base de dados
    useEffect(() => {
        if (userId && isOpen) {
            setLoading(true)
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://biblioteca-cursinho-backend.onrender.com';
            
            fetch(`${baseUrl}/usuarios/${userId}`)
                .then(res => {
                    if (!res.ok) throw new Error('Erro ao carregar dados');
                    return res.json()
                })
                .then(data => {
                    reset({
                        nome: data.nome,
                        cpf: data.cpf,
                        gmail: data.gmail, 
                        telefone: data.telefone,
                        status: data.status,
                        endereco: {
                            cep: data.cep || '',             // Corrigido
                            logradouro: data.logradouro || '', // Corrigido
                            numero: data.numero || '',       // Corrigido
                            complemento: data.complemento || ''// Corrigido
                        }
                    })
                })
                .catch(error => {
                    console.error('Erro no fetch:', error)
                    alert('Erro ao carregar dados do utilizador')
                })
                .finally(() => setLoading(false))
        }
    }, [userId, isOpen, reset])

    // --- NOVA FUNÇÃO: Integração com ViaCEP ---
    const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const cepLimpo = e.target.value.replace(/\D/g, '');
        
        if (cepLimpo.length === 8) {
            try {
                const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
                const data = await res.json();
                
                if (!data.erro) {
                    // Preenche o logradouro automaticamente e foca no número
                    setValue('endereco.logradouro', data.logradouro);
                    document.getElementById('numero-input')?.focus();
                }
            } catch (error) {
                console.error("Erro ao consultar o ViaCEP:", error);
            }
        }
    };

    if (!isOpen) return null

    // Preparar o registo do CEP para manter as validações do React Hook Form junto com o onBlur do ViaCEP
    const cepRegister = register('endereco.cep');

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full max-h-[100vh] overflow-y-auto">
                <h3 className="text-lg font-bold mb-4">Editar usuário</h3>
                {loading ? (
                    <div className="text-center py-8 text-gray-500 font-medium animate-pulse">A carregar dados...</div>
                ) : (
                    <>
                        <div className="flex gap-2 mb-4">
                            <button
                                type="button"
                                onClick={() => setStep('dados')}
                                className={`px-4 py-2 rounded font-bold transition-colors ${step === 'dados' ? 'bg-[#18407c] text-white' : 'bg-gray-200 text-gray-800'}`}
                            >
                                Dados Pessoais
                            </button>
                            <button
                                type="button"
                                onClick={() => setStep('endereco')}
                                className={`px-4 py-2 rounded font-bold transition-colors ${step === 'endereco' ? 'bg-[#18407c] text-white' : 'bg-gray-200 text-gray-800'}`}
                            >
                                Endereço
                            </button>
                        </div>
                        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
                            {step === 'dados' && (
                                <div className="space-y-4 animate-fade-in">
                                    <div>
                                        <label className="block font-medium text-sm text-gray-700 mb-1">Nome</label>
                                        <Input {...register('nome')} />
                                        {errors.nome && <span className="text-red-600 text-xs">{errors.nome.message}</span>}
                                    </div>
                                    <div>
                                        <label className="block font-medium text-sm text-gray-700 mb-1">RG/CPF</label>
                                        <Input {...register('cpf')} />
                                        {errors.cpf && <span className="text-red-600 text-xs">{errors.cpf.message}</span>}
                                    </div>
                                    <div>
                                        <label className="block font-medium text-sm text-gray-700 mb-1">E-mail</label>
                                        <Input {...register('gmail')} />
                                        {errors.gmail && <span className="text-red-600 text-xs">{errors.gmail.message}</span>}
                                    </div>
                                    <div>
                                        <label className="block font-medium text-sm text-gray-700 mb-1">Telefone</label>
                                        <Input {...register('telefone')} />
                                        {errors.telefone && <span className="text-red-600 text-xs">{errors.telefone.message}</span>}
                                    </div>
                                    <div>
                                        <label className="block font-medium text-sm text-gray-700 mb-1">Status</label>
                                        <select
                                            {...register('status')}
                                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#ef7b16] outline-none"
                                        >
                                            <option value="Regular">Regular</option>
                                            <option value="Bloqueado">Bloqueado</option>
                                        </select>
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setStep('endereco')}
                                            className="px-6 py-2 bg-[#ef7b16] text-white font-bold rounded hover:bg-[#d56b10] transition-colors"
                                            disabled={isSubmitting}
                                        >
                                            Próximo
                                        </button>
                                    </div>
                                </div>
                            )}
                            {step === 'endereco' && (
                                <div className="space-y-4 animate-fade-in">
                                    <div>
                                        <label className="block font-medium text-sm text-gray-700 mb-1">CEP</label>
                                        <Input 
                                            {...cepRegister} 
                                            onBlur={(e) => {
                                                cepRegister.onBlur(e);
                                                handleCepBlur(e);
                                            }}
                                            placeholder="Digite para preencher automaticamente..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-medium text-sm text-gray-700 mb-1">Logradouro</label>
                                        <Input {...register('endereco.logradouro')} />
                                    </div>
                                    <div>
                                        <label className="block font-medium text-sm text-gray-700 mb-1">Número</label>
                                        <Input id="numero-input" {...register('endereco.numero')} />
                                    </div>
                                    <div>
                                        <label className="block font-medium text-sm text-gray-700 mb-1">Complemento</label>
                                        <Input {...register('endereco.complemento')} />
                                    </div>
                                    <div className="flex justify-between pt-4 border-t border-gray-100">
                                        <button
                                            type="button"
                                            onClick={() => setStep('dados')}
                                            className="px-4 py-2 text-gray-500 font-bold hover:text-gray-700"
                                        >
                                            Voltar
                                        </button>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={onClose}
                                                className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-6 py-2 bg-[#18407c] text-white font-bold rounded hover:bg-blue-800 disabled:opacity-50 transition-colors"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? 'A guardar...' : 'Guardar alterações'}
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