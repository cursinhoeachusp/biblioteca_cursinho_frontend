// MultiSelectAutores.tsx
'use client'

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import {
  Command,
  CommandInput,
  CommandItem,
  CommandEmpty,
  CommandGroup,
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useState } from "react"

type Autor = { id: string | number, nome: string }

export function MultiSelectAutores({
  autoresDisponiveis,
  onChange,
  value,
}: {
  autoresDisponiveis: Autor[]
  value: Autor[]
  onChange: (autores: Autor[]) => void
}) {
  const [input, setInput] = useState("")
  const [creating, setCreating] = useState(false)

  function handleSelect(autor: Autor) {
    if (!value.find(a => a.id === autor.id)) {
      onChange([...value, autor])
    }
  }

  async function handleCreateNovoAutor() {
    if (!input.trim() || creating) return

    try {
      setCreating(true)
      const res = await fetch("https://cpe-biblioteca-ddf34b5779af.herokuapp.com/autores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: input }),
      })

      if (!res.ok) throw new Error("Erro ao criar autor")

      const novoAutor = await res.json() // { id, nome }
      onChange([...value, novoAutor])
      setInput("")
    } catch (err) {
      console.error(err)
      alert("Erro ao criar novo autor. Tente novamente.")
    } finally {
      setCreating(false)
    }
  }

  function handleRemover(autorId: string | number) {
    onChange(value.filter(a => a.id !== autorId))
  }

  const autoresFiltrados = autoresDisponiveis.filter(
    a => a.nome.toLowerCase().includes(input.toLowerCase()) &&
         !value.find(v => v.id === a.id)
  )

  return (
    <div className="space-y-2">
      <div className="border border-input rounded-md px-3 py-2 flex items-center gap-2 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex gap-1 grow overflow-x-auto max-w-full whitespace-nowrap flex-nowrap pr-1">
          {value.map(autor => (
            <Badge key={autor.id} className="inline-flex items-center gap-1 shrink-0">
              {autor.nome}
              <button onClick={() => handleRemover(autor.id)}>
                <X className="w-3 h-3 ml-1" />
              </button>
            </Badge>
          ))}
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="whitespace-nowrap text-xs">
              + Adicionar autor
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-72">
            <Command>
              <CommandInput
                placeholder="Buscar ou criar..."
                value={input}
                onValueChange={setInput}
              />
              <CommandEmpty>
                <Button variant="ghost" onClick={handleCreateNovoAutor} disabled={creating}>
                  {creating ? "Criando..." : `Criar “${input}”`}
                </Button>
              </CommandEmpty>
              <div className="max-h-40 overflow-y-auto">
                <CommandGroup>
                  {autoresFiltrados.map(autor => (
                    <CommandItem key={autor.id} onSelect={() => handleSelect(autor)}>
                      {autor.nome}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </div>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
