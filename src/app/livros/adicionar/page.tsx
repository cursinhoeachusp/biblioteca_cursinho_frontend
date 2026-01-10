'use client'

import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MultiSelectAutores } from "../MultiSelectAutores"
import { toast } from "sonner"

const livroSchema = z.object({
  isbn: z.string().min(1, "ISBN obrigatório"),
  titulo: z.string().min(1, "Título obrigatório"),
  editora: z.string().min(1, "Editora obrigatória"),
  edicao: z.coerce.number().int().min(1, "Edição obrigatória"),
  categoria: z.string().min(1, "Categoria obrigatória"),
  quantidade_exemplares: z.coerce.number().int().min(1, "Informe ao menos 1 exemplar"),
  autores: z.array(z.object({ id: z.union([z.string(), z.number()]), nome: z.string() })).min(1, "Informe ao menos um autor")
})

type LivroForm = z.infer<typeof livroSchema>
type Autor = { id: string | number, nome: string }

export default function NovaPaginaLivro() {
  const router = useRouter()
  const [autoresDisponiveis, setAutoresDisponiveis] = useState<Autor[]>([])

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<LivroForm>({
    resolver: zodResolver(livroSchema),
    defaultValues: { autores: [] },
  })

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    fetch(`${baseUrl}/autores`)
      .then(res => res.json())
      .then(setAutoresDisponiveis)
      .catch(console.error)
  }, [])

  async function onSubmit(data: LivroForm) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${baseUrl}/livros`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isbn: data.isbn,
          titulo: data.titulo,
          editora: data.editora,
          edicao: data.edicao,
          categoria: data.categoria,
          quantidade_exemplares: data.quantidade_exemplares
        }),
      })

      if (!res.ok) throw new Error('Erro ao cadastrar livro')

      const livroCriado = await res.json()

      for (const autor of data.autores) {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        await fetch(`${baseUrl}/livros/autor`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            livroId: livroCriado.id,
            autorId: autor.id
          }),
        })
      }

      toast.success("Livro cadastrado com sucesso!", {
        description: "O livro e seus autores foram cadastrados.",
      })

      reset()
      router.push('/')
    } catch (err) {
      console.error(err)
      toast.error("Erro ao cadastrar livro", {
        description: "Falha ao salvar livro ou associar autores.",
      })
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">Adicionar novo livro</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input placeholder="ISBN" {...register("isbn")} />
          {errors.isbn && <p className="text-sm text-red-500">{errors.isbn.message}</p>}
        </div>
        <div>
          <Input placeholder="Título" {...register("titulo")} />
          {errors.titulo && <p className="text-sm text-red-500">{errors.titulo.message}</p>}
        </div>
        <div>
          <Input placeholder="Editora" {...register("editora")} />
          {errors.editora && <p className="text-sm text-red-500">{errors.editora.message}</p>}
        </div>
        <div>
          <Input type="number" placeholder="Edição" {...register("edicao")} />
          {errors.edicao && <p className="text-sm text-red-500">{errors.edicao.message}</p>}
        </div>
        <div>
          <Input placeholder="Categoria" {...register("categoria")} />
          {errors.categoria && <p className="text-sm text-red-500">{errors.categoria.message}</p>}
        </div>
        <div>
          <Input type="number" placeholder="Quantidade de exemplares" {...register("quantidade_exemplares")} />
          {errors.quantidade_exemplares && <p className="text-sm text-red-500">{errors.quantidade_exemplares.message}</p>}
        </div>
        <div>
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
          {errors.autores && <p className="text-sm text-red-500">{errors.autores.message}</p>}
        </div>
        <div className="pt-4">
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </main>
  )
}
