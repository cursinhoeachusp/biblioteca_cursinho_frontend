'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DataTable } from '../components/data-table'
import { columns } from '../components/columns'
import { Input } from "@/components/ui/input"
import { Usuario } from '@/app/components/columns'
import { BatchAddButton } from '../components/batch-add-button'
import { DeleteModal } from '../components/DeleteModal'
import { EditModal } from '../components/EditModal'
import { Botao } from '../components/botao'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

type CampoBusca = 'id' | 'cpf' | 'nome'


export default function UsuariosPage() {
  const router = useRouter()
  const [todosUsuarios, setTodosUsuarios] = useState<Usuario[]>([])
  const [usuariosAtrasados, setUsuariosAtrasados] = useState<Usuario[]>([])
  const [search, setSearch] = useState("")
  const [filtro, setFiltro] = useState<"nome" | "id" | "cpf">("nome")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [refresh, setRefresh] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [campoBusca, setCampoBusca] = useState<CampoBusca>('nome')


  // Configura listeners para eventos de modais
  useEffect(() => {
    const handleDeleteModal = (e: Event) => {
      const customEvent = e as CustomEvent<number>
      setSelectedUserId(customEvent.detail)
      setShowDeleteModal(true)
    }

    const handleEditModal = (e: Event) => {
      const customEvent = e as CustomEvent<number>
      setSelectedUserId(customEvent.detail)
      setShowEditModal(true)
    }

    document.addEventListener('openDeleteModal', handleDeleteModal as EventListener)
    document.addEventListener('openEditModal', handleEditModal as EventListener)

    return () => {
      document.removeEventListener('openDeleteModal', handleDeleteModal as EventListener)
      document.removeEventListener('openEditModal', handleEditModal as EventListener)
    }
  }, [])

  // Busca usuários com possibilidade de refresh
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
  }, [refresh])


  const handleDelete = async () => {
    try {
      if (!selectedUserId) return

      // Use o backend local, não o Heroku
      const response = await fetch(
        `https://cpe-biblioteca-ddf34b5779af.herokuapp.com/usuarios/${selectedUserId}`,
        { method: 'DELETE' }
      )

      // Verifique o tipo de conteúdo antes de tentar parsear JSON
      const contentType = response.headers.get('content-type')

      if (!response.ok) {
        // Se não é JSON, pegue como texto
        if (contentType?.includes('application/json')) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Erro ao excluir usuário')
        } else {
          const errorText = await response.text()
          throw new Error(`Erro ${response.status}: ${errorText}`)
        }
      }

      alert('Usuário excluído com sucesso!')
      setRefresh(prev => !prev)
      setShowDeleteModal(false)
    } catch (error) {
      console.error('Erro completo:', error)
      alert(error instanceof Error ? error.message : 'Erro desconhecido')
      setShowDeleteModal(false)
    }
  }

  const handleEdit = async (data: Partial<Usuario>) => {
    try {
      if (!selectedUserId) return

      const response = await fetch(
        `https://cpe-biblioteca-ddf34b5779af.herokuapp.com/usuarios/${selectedUserId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }
      )

      const contentType = response.headers.get('content-type')
      if (!response.ok) {
        let errorMsg = 'Erro ao atualizar usuário'
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json()
          errorMsg = errorData.message || errorMsg
        } else {
          const errorText = await response.text()
          errorMsg = errorText || errorMsg
        }
        throw new Error(errorMsg)
      }

      alert('Usuário atualizado com sucesso!')
      setRefresh(prev => !prev)
      setShowEditModal(false)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro desconhecido')
      setShowEditModal(false)
    }
  }

  const handleBatchUpload = async (usuarios: Partial<Usuario>[]) => {
    if (usuarios.length === 0) {
      alert("O arquivo CSV está vazio ou em formato incorreto.");
      return;
    }

    setIsUploading(true);
    try {
      const response = await fetch('https://cpe-biblioteca-ddf34b5779af.herokuapp.com/usuarios/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarios }), // Envia um objeto com a chave "usuarios"
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao adicionar usuários em lote');
      }

      const result = await response.json();
      alert(result.message || 'Usuários adicionados com sucesso!');
      setRefresh(prev => !prev); // Atualiza a lista de usuários

    } catch (error) {
      console.error('Erro no upload em lote:', error);
      alert(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsUploading(false);
    }
  };

  const termo = search.toLowerCase()
  const usuariosFiltrados = todosUsuarios.filter((usuario) => {
    if (campoBusca === "id") return usuario.id.toString().includes(termo)
    if (campoBusca === "cpf") return usuario.cpf.toString().includes(termo)
    return usuario.nome.toLowerCase().includes(termo)
  })

  return (
    <main>
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
      />

      <EditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        userId={selectedUserId}
        onSave={(data) =>
          handleEdit({
            ...data,
            status:
              data.status === "Regular" || data.status === "Bloqueado"
                ? data.status
                : "Regular", // fallback or handle as needed
          })
        }
      />

      <div className='p-16'>
        <h1 className="text-6xl font-bold mb-8">Usuários</h1>

        <div className="relative flex flex-row flex-wrap items-center gap-4 mb-4">
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
          <Select
            onValueChange={(value) => setCampoBusca(value as CampoBusca)}
            value={campoBusca}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Campo de busca" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="id">ID</SelectItem>
              <SelectItem value="cpf">CPF</SelectItem>
              <SelectItem value="nome">Nome</SelectItem>
            </SelectContent>
          </Select>

          <div className="ml-auto flex gap-2">
            <Botao
              texto="Adicionar usuário"
              onClick={() => router.push('/usuarios/novo')}
            />
            <BatchAddButton onUpload={handleBatchUpload} isUploading={isUploading} />
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
