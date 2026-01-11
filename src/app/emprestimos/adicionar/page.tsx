'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { format, addDays } from 'date-fns'
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

// Tipos
type Usuario = { id: number; nome: string; cpf: string }
type Livro = { isbn: string; titulo: string }

function AdicionarEmprestimoForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Pega dados da URL (se veio pelo botão "Realizar Empréstimo" na lista)
  const urlIsbn = searchParams.get('isbn')
  const urlTitulo = searchParams.get('titulo')

  // Estados do Formulário
  const [dataInicio] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [dataFimPrevisto, setDataFimPrevisto] = useState(format(addDays(new Date(), 10), 'yyyy-MM-dd')) // Padrão 10 dias
  const [exemplarCodigo, setExemplarCodigo] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Estados de Busca (Livro)
  const [livrosDisponiveis, setLivrosDisponiveis] = useState<Livro[]>([])
  const [selectedLivroIsbn, setSelectedLivroIsbn] = useState<string | null>(urlIsbn)
  const [selectedLivroTitulo, setSelectedLivroTitulo] = useState<string | null>(urlTitulo)
  const [isLivroPopoverOpen, setIsLivroPopoverOpen] = useState(false)

  // Estados de Busca (Exemplares do Livro Selecionado)
  const [exemplaresDoLivro, setExemplaresDoLivro] = useState<string[]>([])

  // Estados de Busca (Usuário)
  const [isUserPopoverOpen, setIsUserPopoverOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null)
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [userSearchResults, setUserSearchResults] = useState<Usuario[]>([])

  // 1. Carregar lista geral de livros para o combo de pesquisa
  useEffect(() => {
    async function fetchLivros() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL
        const res = await fetch(`${baseUrl}/livros`)
        const data = await res.json()
        setLivrosDisponiveis(data)
      } catch (error) {
        console.error('Erro ao buscar livros:', error)
      }
    }
    fetchLivros()
  }, [])

  // 2. Buscar Exemplares DISPONÍVEIS quando seleciona um livro
  useEffect(() => {
    async function fetchExemplares() {
      if (!selectedLivroIsbn) {
        setExemplaresDoLivro([])
        return
      }

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL
        // Chama a nova rota que criamos no controller
        const res = await fetch(`${baseUrl}/livros/${selectedLivroIsbn}/exemplares-disponiveis`)
        
        if (!res.ok) throw new Error('Erro ao buscar exemplares')
        
        const data = await res.json() // Espera ["COD-1", "COD-2"]
        setExemplaresDoLivro(data)
      } catch (error) {
        toast.error('Erro ao buscar exemplares disponíveis.')
        console.error(error)
      }
    }
    fetchExemplares()
  }, [selectedLivroIsbn])

  // 3. Busca de Usuários (Com Debounce igual Reservas)
  useEffect(() => {
    if (userSearchQuery.trim() === '') {
      setUserSearchResults([])
      return
    }
    const delayDebounceFn = setTimeout(async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL
        const res = await fetch(`${baseUrl}/usuarios/search?q=${userSearchQuery}`)
        const data = await res.json()
        if (Array.isArray(data)) setUserSearchResults(data)
        else setUserSearchResults([])
      } catch (error) {
        console.error(error)
      }
    }, 300)
    return () => clearTimeout(delayDebounceFn)
  }, [userSearchQuery])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedUser || !exemplarCodigo || !dataFimPrevisto) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    setIsLoading(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL
      const res = await fetch(`${baseUrl}/emprestimos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: selectedUser.id,
          exemplar_codigo: exemplarCodigo,
          data_inicio: dataInicio,
          data_fim_previsto: new Date(dataFimPrevisto).toISOString()
        })
      })

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || 'Erro ao realizar empréstimo')
      }

      toast.success('Empréstimo realizado com sucesso!')
      router.push('/emprestimos')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-8 md:p-16 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Novo empréstimo</h1>
        <p className="text-muted-foreground mt-2">Registre a saída de um livro.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SELEÇÃO DE USUÁRIO */}
        <div className="space-y-2">
            <label className="font-semibold text-sm">Usuário (aluno)</label>
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
                            : "Pesquisar usuário..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                        <CommandInput 
                            placeholder="Nome ou CPF..." 
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

        {/* SELEÇÃO DE LIVRO */}
        <div className="space-y-2">
            <label className="font-semibold text-sm">Livro</label>
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
                            : "Selecione o livro..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                        <CommandInput placeholder="Buscar título do livro..." />
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
                                            setExemplarCodigo('') // Reseta exemplar ao trocar livro
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

        {/* SELEÇÃO DE EXEMPLAR (Só libera se tiver livro selecionado) */}
        <div className="space-y-2">
            <label className="font-semibold text-sm">Exemplar disponível</label>
            <Select 
                onValueChange={setExemplarCodigo} 
                value={exemplarCodigo} 
                disabled={!selectedLivroIsbn}
            >
                <SelectTrigger>
                    <SelectValue placeholder={!selectedLivroIsbn ? "Escolha um livro primeiro" : "Selecione a etiqueta/código"} />
                </SelectTrigger>
                <SelectContent>
                    {exemplaresDoLivro.length > 0 ? (
                        exemplaresDoLivro.map((cod) => (
                            <SelectItem key={cod} value={cod}>
                                {cod}
                            </SelectItem>
                        ))
                    ) : (
                        <SelectItem value="-" disabled>
                           {selectedLivroIsbn ? "Sem exemplares disponíveis" : "..."}
                        </SelectItem>
                    )}
                </SelectContent>
            </Select>
        </div>

        {/* DATAS */}
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="font-semibold text-sm text-muted-foreground">Data de início</label>
                <Input type="date" value={dataInicio} disabled className="bg-slate-50" />
            </div>
            <div className="space-y-2">
                <label className="font-semibold text-sm">Previsão de entrega</label>
                <Input 
                    type="date" 
                    value={dataFimPrevisto} 
                    onChange={(e) => setDataFimPrevisto(e.target.value)} 
                />
            </div>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Confirmar Empréstimo'}
          </Button>
        </div>

      </form>
    </main>
  )
}

export default function Page() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <AdicionarEmprestimoForm />
        </Suspense>
    )
}