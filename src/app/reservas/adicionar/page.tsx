'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { ChevronsUpDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

type Usuario = { id: number; nome: string; cpf: string }
type Exemplar = { codigo: string }

function ReservaForm() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // --- LÓGICA DO FORMULÁRIO ---
    const [exemplarCodigo, setExemplarCodigo] = useState<string>('')
    const [dataEfetuacao, setDataEfetuacao] = useState(new Date().toISOString().split('T')[0])
    const [isLoading, setIsLoading] = useState(false)
    const [exemplares, setExemplares] = useState<Exemplar[]>([])

    // --- NOVOS ESTADOS PARA A BUSCA DE USUÁRIO ---
    const [isUserPopoverOpen, setIsUserPopoverOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<Usuario | null>(null)
    const [userSearchQuery, setUserSearchQuery] = useState('')
    const [userSearchResults, setUserSearchResults] = useState<Usuario[]>([])

    const isbn = searchParams.get('isbn')
    const titulo = searchParams.get('titulo')

    // --- EFEITO PARA BUSCAR EXEMPLARES (Inalterado) ---
    useEffect(() => {
        async function fetchExemplares() {
            if (!isbn) return
            try {
                const res = await fetch(`http://localhost:3999/livros/${isbn}/exemplares-indisponiveis`)
                const data = await res.json()
                setExemplares(data)
            } catch (error) {
                toast.error('Erro ao buscar exemplares indisponíveis.')
                console.error(error)
            }
        }
        fetchExemplares()
    }, [isbn])

    // --- NOVO EFEITO PARA BUSCAR USUÁRIOS COM DEBOUNCE ---
    useEffect(() => {
        // Não busca se o campo estiver vazio
        if (userSearchQuery.trim() === '') {
            setUserSearchResults([])
            return
        }

        // Debounce: espera 300ms após o usuário parar de digitar para fazer a busca
        const delayDebounceFn = setTimeout(async () => {
            try {
                const res = await fetch(`http://localhost:3999/usuarios/search?q=${userSearchQuery}`)
                const data = await res.json()
                if (Array.isArray(data)) {
                    // Se a resposta FOR um array, nós atualizamos o estado com os resultados.
                    setUserSearchResults(data);
                } else {
                    // Se NÃO for um array, nós limpamos os resultados para não quebrar a tela.
                    setUserSearchResults([]);
                    // E mostramos o erro no console para depuração.
                    console.error("A resposta da API de busca não é um array:", data);
                    toast.error("Ocorreu um erro ao buscar usuários.");
                }
            } catch (error) {
                toast.error('Erro ao buscar usuários.')
                console.error(error)
            }
        }, 300)

        // Limpa o timeout se o usuário continuar digitando
        return () => clearTimeout(delayDebounceFn)
    }, [userSearchQuery])


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        // A validação agora checa se um usuário foi selecionado
        if (!selectedUser || !exemplarCodigo || !dataEfetuacao) {
            toast.error('Todos os campos são obrigatórios.')
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch('http://localhost:3999/reservas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuario_id: selectedUser.id, // Usa o ID do usuário selecionado
                    exemplar_codigo: exemplarCodigo,
                    data_efetuacao: new Date(dataEfetuacao).toISOString(),
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Falha ao criar reserva.')
            }

            toast.success('Reserva criada com sucesso!')
            router.push('/reservas') 
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className="p-8 sm:p-16 max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-2">Nova Reserva</h1>
            {titulo && <h2 className="text-xl text-muted-foreground mb-8">Para o livro: {titulo}</h2>}

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* NOVO SELETOR DE USUÁRIO (COMBOBOX) */}
                <div className="space-y-2">
                    <label htmlFor="usuario" className="font-semibold">Usuário</label>
                    <Popover open={isUserPopoverOpen} onOpenChange={setIsUserPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={isUserPopoverOpen}
                                className="w-full justify-between font-normal"
                            >
                                {selectedUser
                                    ? `${selectedUser.nome} (CPF: ${selectedUser.cpf})`
                                    : "Digite para buscar nome ou CPF..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput
                                    placeholder="Buscar por nome ou CPF..."
                                    onValueChange={setUserSearchQuery}
                                />
                                <CommandList>
                                    <CommandEmpty>Nenhum usuário encontrado.</CommandEmpty>
                                    <CommandGroup>
                                        {userSearchResults.map((user) => (
                                            <CommandItem
                                                key={user.id}
                                                value={`${user.nome} ${user.cpf}`}
                                                onSelect={() => {
                                                    setSelectedUser(user)
                                                    setIsUserPopoverOpen(false)
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedUser?.id === user.id ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {user.nome} <span className='text-xs text-muted-foreground ml-2'></span>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Seletor de Exemplar (Inalterado) */}
                <div className="space-y-2">
                    <label htmlFor="exemplar" className="font-semibold">Exemplar Indisponível</label>
                    <Select onValueChange={setExemplarCodigo} value={exemplarCodigo}>
                        <SelectTrigger id="exemplar">
                            <SelectValue placeholder="Selecione o código do exemplar" />
                        </SelectTrigger>
                        <SelectContent>
                            {exemplares.length > 0 ? (
                                exemplares.map((ex) => (
                                    <SelectItem key={ex.codigo} value={ex.codigo}>
                                        {ex.codigo}
                                    </SelectItem>
                                ))
                            ) : (
                                <SelectItem value="-" disabled>
                                    Nenhum exemplar indisponível para reserva
                                </SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>

                {/* Seletor de Data (Inalterado) */}
                <div className="space-y-2">
                    <label htmlFor="data" className="font-semibold">Data de Efetuação</label>
                    <Input
                        id="data"
                        type="date"
                        value={dataEfetuacao}
                        onChange={(e) => setDataEfetuacao(e.target.value)}
                    />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isLoading || exemplares.length === 0}>
                        {isLoading ? 'Salvando...' : 'Salvar Reserva'}
                    </Button>
                </div>
            </form>
        </main>
    )
}

export default function NovaReservaPage() {
    return (
        <Suspense fallback={<div className="p-8">Carregando formulário...</div>}>
            <ReservaForm />
        </Suspense>
    )
}