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

type Autor = { id: string, nome: string }

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

  function handleSelect(autor: Autor) {
    if (!value.find(a => a.id === autor.id)) {
      onChange([...value, autor])
    }
  }

  function handleCreateNovoAutor() {
    const novo = { id: crypto.randomUUID(), nome: input }
    onChange([...value, novo])
    setInput("")
  }

  function handleRemover(autorId: string) {
    onChange(value.filter(a => a.id !== autorId))
  }

  const autoresFiltrados = autoresDisponiveis.filter(
    a => a.nome.toLowerCase().includes(input.toLowerCase()) &&
         !value.find(v => v.id === a.id)
  )

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map(autor => (
          <Badge key={autor.id} className="flex items-center gap-1">
            {autor.nome}
            <button onClick={() => handleRemover(autor.id)}>
              <X className="w-3 h-3 ml-1" />
            </button>
          </Badge>
        ))}
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Selecionar autores</Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-72">
          <Command>
            <CommandInput
              placeholder="Buscar ou criar..."
              value={input}
              onValueChange={setInput}
            />
            <CommandEmpty>
              <Button variant="ghost" onClick={handleCreateNovoAutor}>
                Criar “{input}”
              </Button>
            </CommandEmpty>
            <CommandGroup>
              {autoresFiltrados.map(autor => (
                <CommandItem key={autor.id} onSelect={() => handleSelect(autor)}>
                  {autor.nome}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
