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
type Livro = { isbn: string; titulo: string } // Tipo simples para a busca
type Exemplar = { codigo: string }

function ReservaForm() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Pegamos o ISBN da URL, se existir
    const urlIsbn = searchParams.get('isbn')
    const urlTitulo = searchParams.get('titulo')

    // --- ESTADOS ---
    const [exemplarCodigo, setExemplarCodigo] = useState<string>('')
    const [dataEfetuacao, setDataEfetuacao] = useState(new Date().toISOString().split('T')[0])
    const [isLoading, setIsLoading] = useState(false)
    const [exemplares, setExemplares] = useState<Exemplar[]>([])

    // Busca de Usuário
    const [isUserPopoverOpen, setIsUserPopoverOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<Usuario | null>(null)
    const [userSearchQuery, setUserSearchQuery] = useState('')
    const [userSearchResults, setUserSearchResults] = useState<Usuario[]>([])

    // NOVO: Busca de Livro (Para quando não vier da URL)
    const [isLivroPopoverOpen, setIsLivroPopoverOpen] = useState(false)
    const [selectedLivroIsbn, setSelectedLivroIsbn] = useState<string | null>(urlIsbn)
    const [selectedLivroTitulo, setSelectedLivroTitulo] = useState<string | null>(urlTitulo)
    const [livrosDisponiveis, setLivrosDisponiveis] = useState<Livro[]>([]) // Para listar no combo

    // 1. Carregar lista de livros (Simples: Pega todos. Se tiver muitos, ideal é fazer busca via API igual usuário)
    useEffect(() => {
        async function fetchLivros() {
            try {
                const baseUrl = process.env.NEXT_PUBLIC_API_URL;
                const res = await fetch(`${baseUrl}/livros`)
                const data = await res.json()
                setLivrosDisponiveis(data)
            } catch (error) {
                console.error('Erro ao buscar livros:', error)
            }
        }
        // Só busca se não tiver vindo pré-selecionado (ou busca sempre para permitir trocar)
        fetchLivros()
    }, [])

    // 2. Buscar Exemplares Indisponíveis (Agora depende do estado selectedLivroIsbn, não só da URL)
    useEffect(() => {
        async function fetchExemplares() {
            // Se não tiver livro selecionado, zera a lista e para
            if (!selectedLivroIsbn) {
                setExemplares([])
                return
            }

            try {
                const baseUrl = process.env.NEXT_PUBLIC_API_URL;
                const res = await fetch(`${baseUrl}/livros/${selectedLivroIsbn}/exemplares-indisponiveis`)
                
                if (!res.ok) throw new Error('Erro ao buscar exemplares')
                
                const data = await res.json()
                setExemplares(data)
            } catch (error) {
                toast.error('Erro ao buscar exemplares indisponíveis.')
                console.error(error)
            }
        }
        fetchExemplares()
    }, [selectedLivroIsbn]) // Roda toda vez que o livro selecionado mudar

    // Busca de Usuários (Mantida igual)
    useEffect(() => {
        if (userSearchQuery.trim() === '') {
            setUserSearchResults([])
            return
        }
        const delayDebounceFn = setTimeout(async () => {
            try {
                const baseUrl = process.env.NEXT_PUBLIC_API_URL;
                const res = await fetch(`${baseUrl}/usuarios/search?q=${userSearchQuery}`)
                const data = await res.json()
                if (Array.isArray(data)) setUserSearchResults(data);
                else setUserSearchResults([]);
            } catch (error) {
                console.error(error)
            }
        }, 300)
        return () => clearTimeout(delayDebounceFn)
    }, [userSearchQuery])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedUser || !exemplarCodigo || !dataEfetuacao) {
            toast.error('Todos os campos são obrigatórios.')
            return
        }

        setIsLoading(true)
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL;
            const response = await fetch(`${baseUrl}/reservas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuario_id: selectedUser.id,
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
            <h1 className="text-4xl font-bold mb-2">Nova reserva</h1>
            <p className="text-muted-foreground mb-8">Preencha os dados para registrar a reserva.</p>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* 1. SELETOR DE LIVRO (NOVO!) */}
                <div className="space-y-2">
                    <label className="font-semibold">Livro</label>
                    <Popover open={isLivroPopoverOpen} onOpenChange={setIsLivroPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={isLivroPopoverOpen}
                                className="w-full justify-between font-normal"
                            >
                                {selectedLivroIsbn
                                    ? (selectedLivroTitulo || livrosDisponiveis.find(l => l.isbn === selectedLivroIsbn)?.titulo || selectedLivroIsbn)
                                    : "Selecione um livro..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput placeholder="Buscar livro..." />
                                <CommandList>
                                    <CommandEmpty>Nenhum livro encontrado.</CommandEmpty>
                                    <CommandGroup>
                                        {livrosDisponiveis.map((livro) => (
                                            <CommandItem
                                                key={livro.isbn}
                                                value={livro.titulo}
                                                onSelect={() => {
                                                    setSelectedLivroIsbn(livro.isbn)
                                                    setSelectedLivroTitulo(livro.titulo)
                                                    setExemplarCodigo('') // Reseta o exemplar ao trocar de livro
                                                    setIsLivroPopoverOpen(false)
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedLivroIsbn === livro.isbn ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {livro.titulo}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* 2. SELETOR DE EXEMPLAR (Agora reage ao livro selecionado acima) */}
                <div className="space-y-2">
                    <label htmlFor="exemplar" className="font-semibold">Exemplar indisponível</label>
                    <Select onValueChange={setExemplarCodigo} value={exemplarCodigo} disabled={!selectedLivroIsbn}>
                        <SelectTrigger id="exemplar">
                            <SelectValue placeholder={!selectedLivroIsbn ? "Selecione um livro primeiro" : "Selecione o código do exemplar"} />
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
                                    {selectedLivroIsbn ? "Nenhum exemplar indisponível neste livro" : "Aguardando seleção do livro..."}
                                </SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>

                {/* 3. SELETOR DE USUÁRIO (Igual ao anterior) */}
                <div className="space-y-2">
                    <label className="font-semibold">Usuário</label>
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
                                                {user.nome}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* 4. DATA */}
                <div className="space-y-2">
                    <label htmlFor="data" className="font-semibold">Data de efetuação</label>
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
                    <Button type="submit" disabled={isLoading || !selectedUser || !exemplarCodigo}>
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