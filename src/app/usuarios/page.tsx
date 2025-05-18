'use client'

import { DataTable } from '../components/data-table'
import { columns } from '../components/columns'
import { todosUsuarios } from '@/data/todosUsuarios'
import { usuariosAtrasados } from '@/data/usuariosAtrasados'
import { Input } from "@/components/ui/input"
import { useState } from 'react'
import { AdicionarUsuarioBotao } from '../components/add-user-button'

export default function UsuariosPage() {
  const [search, setSearch] = useState("")

  const termo = search.toLowerCase()

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
    <main >
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