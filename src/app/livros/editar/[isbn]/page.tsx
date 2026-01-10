'use client'

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MultiSelectAutores } from "../../MultiSelectAutores"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const schema = z.object({
  isbn: z.string(),
  titulo: z.string(),
  editora: z.string(),
  edicao: z.number(),
  categoria: z.string(),
  autores: z.array(z.object({ id: z.union([z.string(), z.number()]), nome: z.string() })).min(1)
})

type LivroForm = z.infer<typeof schema>
type Autor = { id: string | number, nome: string }
type Exemplar = { codigo: string, status_disponibilidade: boolean }

export default function EditarLivroPage() {
  const { isbn } = useParams<{ isbn: string }>()
  const router = useRouter()
  const [autoresDisponiveis, setAutoresDisponiveis] = useState<Autor[]>([])
  const [exemplares, setExemplares] = useState<Exemplar[]>([])
  const [livroId, setLivroId] = useState<number | null>(null)
  const [exemplarParaExcluir, setExemplarParaExcluir] = useState<Exemplar | null>(null)
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [loadingRemover, setLoadingRemover] = useState<string | null>(null)
  const [loadingAdicionar, setLoadingAdicionar] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<LivroForm>({
    resolver: zodResolver(schema),
    defaultValues: { autores: [] }
  })

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    fetch(`${baseUrl}/livros/isbn/${isbn}`)
      .then(res => res.json())
      .then(livro => {
        setLivroId(livro.id)
        setExemplares(livro.exemplares)
        reset({
  isbn: livro.isbn,
  titulo: livro.titulo,
  editora: livro.editora,
  edicao: livro.edicao,
  categoria: livro.categoria,
  autores: livro.autores
})

      })
      .catch(() => toast.error("Erro ao carregar livro"))

    fetch(`${baseUrl}/autores`)
      .then(res => res.json())
      .then(setAutoresDisponiveis)
      .catch(console.error)
  }, [isbn, reset])

  async function onSubmit(data: LivroForm) {
    if (!livroId) return
    try {
      setLoadingSubmit(true)
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      await fetch(`${baseUrl}/livros/${livroId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
      toast.success("Livro atualizado com sucesso!")
      router.push("/")
    } catch {
      toast.error("Erro ao atualizar livro")
    } finally {
      setLoadingSubmit(false)
    }
  }

  async function removerExemplar(codigo: string) {
    try {
      setLoadingRemover(codigo)
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      await fetch(`${baseUrl}/exemplar/${codigo}`, { method: "DELETE" })
      setExemplares(prev => prev.filter(e => e.codigo !== codigo))
      toast.success("Exemplar removido")
    } catch {
      toast.error("Erro ao remover exemplar")
    } finally {
      setLoadingRemover(null)
      setExemplarParaExcluir(null)
    }
  }

  async function adicionarExemplar() {
    if (!livroId) return
    try {
      setLoadingAdicionar(true)
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${baseUrl}/exemplares/adicionar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ livro_id: livroId })
      })
      if (!res.ok) throw new Error("Erro ao adicionar exemplar")
      const novo = await res.json()
      setExemplares(prev => [...prev, { codigo: novo.codigo, status_disponibilidade: true }])
      toast.success(`Exemplar ${novo.codigo} adicionado!`)
    } catch {
      toast.error("Erro ao adicionar exemplar")
    } finally {
      setLoadingAdicionar(false)
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Editar Livro</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input placeholder="ISBN" {...register("isbn")} disabled />
        
        <Input placeholder="Título" {...register("titulo")} />
        {errors.titulo && <p className="text-sm text-red-500">{errors.titulo.message}</p>}

        <Input placeholder="Editora" {...register("editora")} />
        <Input type="number" placeholder="Edição" {...register("edicao", { valueAsNumber: true })} />
        <Input placeholder="Categoria" {...register("categoria")} />

        <Controller
          name="autores"
          control={control}
          render={({ field }) => (
            <MultiSelectAutores
              autoresDisponiveis={autoresDisponiveis}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />

        <div className="pt-6">
          <h2 className="text-xl font-semibold mb-2">Exemplares</h2>

          <ul className="space-y-2 mb-4">
            {exemplares.map(ex => (
              <li key={ex.codigo} className="flex justify-between items-center border p-2 rounded-md">
                <span>{ex.codigo} ({ex.status_disponibilidade ? 'Disponível' : 'Emprestado'})</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (!ex.status_disponibilidade) {
                      setExemplarParaExcluir(ex)
                    } else {
                      removerExemplar(ex.codigo)
                    }
                  }}
                  disabled={loadingRemover === ex.codigo}
                >
                  {loadingRemover === ex.codigo ? 'Removendo...' : 'Remover'}
                </Button>
              </li>
            ))}
          </ul>

          <Button
            type="button"
            onClick={adicionarExemplar}
            disabled={loadingAdicionar}
            variant="secondary"
          >
            {loadingAdicionar ? "Adicionando..." : "Adicionar exemplar"}
          </Button>
        </div>

        <Button type="submit" disabled={loadingSubmit} className="mt-6 w-full">
          {loadingSubmit ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </form>

      <Dialog open={!!exemplarParaExcluir} onOpenChange={() => setExemplarParaExcluir(null)}>
        <DialogContent>
          <DialogHeader>
            Tem certeza?
          </DialogHeader>
          <p>Este exemplar está emprestado. Deseja removê-lo mesmo assim?</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setExemplarParaExcluir(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => removerExemplar(exemplarParaExcluir!.codigo)}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
