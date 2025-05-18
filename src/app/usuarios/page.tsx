'use client'

import { useState, useEffect } from 'react'
import { DataTable } from '../components/data-table'
import { columns } from '../components/columns'
import { Input } from "@/components/ui/input"
import { AdicionarUsuarioBotao } from '../components/add-user-button'
import { Usuario } from '@/app/components/columns'

export default function UsuariosPage() {
  const [todosUsuarios, setTodosUsuarios] = useState<Usuario[]>([])
  const [usuariosAtrasados, setUsuariosAtrasados] = useState<Usuario[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    async function fetchUsuarios() {
      try {
        const resTodos = await fetch('https://cpe-biblioteca-ddf34b5779af.herokuapp.com/usuarios')
        const dataTodos = await resTodos.json()
        setTodosUsuarios(dataTodos)

        const resAtrasados = await fetch('https://cpe-biblioteca-ddf34b5779af.herokuapp.com/usuarios/atrasados')
        const dataAtrasados = await resAtrasados.json()
        setUsuariosAtrasados(dataAtrasados)
      } catch (error) {
        console.error("Erro ao buscar usuários:", error)
      }
    }

    fetchUsuarios()
  }, [])

  const termo = search.toLowerCase()

  // Filtra todos os usuários (se houver busca)
  const usuariosFiltrados = todosUsuarios.filter((usuario) => {
    const idStr = usuario.id.toString()
    const cpfStr = usuario.cpf.toString()
    const nomeStr = usuario.nome.toLowerCase()

    return (
      idStr.includes(termo) ||
      cpfStr.includes(termo) ||
      nomeStr.includes(termo)
    )
  })

  return (
    <main>
      <div className='p-16'>
        <h1 className="text-6xl font-bold mb-8">Usuários</h1>

        <div className='relative flex flex-row'>
          <Input
            placeholder="Buscar por nome, ID ou CPF"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
          <div className='absolute right-0'>
            <AdicionarUsuarioBotao />
          </div>
        </div>

        <div className="p-4 mt-12">
          {search.trim() === "" ? (
            <>
              <h2 className="text-2xl font-bold mb-4">Usuários com empréstimos atrasados</h2>
              <DataTable columns={columns} data={usuariosAtrasados} />

              <h2 className="text-2xl font-bold my-4">Todos os Usuários</h2>
              <DataTable columns={columns} data={todosUsuarios} />
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-4">Usuários filtrados</h2>
              <DataTable columns={columns} data={usuariosFiltrados} />
            </>
          )}
        </div>
      </div>
    </main>
  )
}