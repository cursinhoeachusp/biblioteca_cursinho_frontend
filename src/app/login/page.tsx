'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Image from 'next/image' // Certifique-se de ter o logo

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL
      const res = await fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message || 'Erro ao entrar')

      // Salvar o token no navegador (Cookie ou LocalStorage)
      localStorage.setItem('biblioteca_token', data.token)
      localStorage.setItem('biblioteca_user', JSON.stringify(data.user))

      toast.success(`Bem-vindo, ${data.user.nome}!`)
      
      // Redirecionar para a home
      router.push('/')
      
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#18407c]">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-10 shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Biblioteca CPE
          </h2>
          <p className="mt-2 text-sm text-gray-600">Coloque as suas credenciais. Se não tiver acesso, entre em contato com Inovatec.</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <Input
                type="email"
                placeholder="Email (ex: joao@gmail.com)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>
          </div>

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  )
}