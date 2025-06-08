// app/livros/novo/page.tsx
'use client'

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const livroSchema = z.object({
  isbn: z.string().min(1, "ISBN obrigatório"),
  titulo: z.string().min(1, "Título obrigatório"),
  editora: z.string().min(1, "Editora obrigatória"),
  edicao: z.coerce.number().int().min(1, "Edição obrigatória"),
  categoria: z.string().min(1, "Categoria obrigatória"),
  quantidade_exemplares: z.coerce.number().int().min(1, "Informe ao menos 1 exemplar"),
})

type LivroForm = z.infer<typeof livroSchema>

export default function NovaPaginaLivro() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LivroForm>({
    resolver: zodResolver(livroSchema),
  })

  async function onSubmit(data: LivroForm) {
    try {
      const res = await fetch('https://cpe-biblioteca-ddf34b5779af.herokuapp.com/livros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Erro ao cadastrar livro. Revise os campos e tente novamente!')
      reset()
      router.push('/')
    } catch (err) {
      console.error(err)
      alert("Erro ao adicionar livro. Revise os campos e tente novamente!")
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
        
        <div className="pt-4">
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </main>
  )
}
