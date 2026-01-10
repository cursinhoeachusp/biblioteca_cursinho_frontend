'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Sidebar } from './sidebar' // Certifique-se que o caminho está certo

export function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const token = localStorage.getItem('biblioteca_token')
    const publicRoutes = ['/login'] // Rotas que não precisam de senha

    // Se NÃO tem token e NÃO está na tela de login -> Manda pro Login
    if (!token && !publicRoutes.includes(pathname)) {
      router.push('/login')
    }
    
    // Opcional: Se JÁ tem token e tenta ir pro login -> Manda pra Home
    if (token && pathname === '/login') {
        router.push('/')
    }

  }, [router, pathname])

  // Evita erro de hidratação (espera o componente montar no cliente)
  if (!isMounted) return null

  // Verifica se é a página de login para esconder a Sidebar
  const isLoginPage = pathname === '/login'

  return (
    <>
      {/* Só mostra a Sidebar se NÃO for a página de Login */}
      {!isLoginPage && (
        <div className="fixed top-0 left-0 h-screen w-64 z-50">
          <Sidebar />
        </div>
      )}

      {/* Ajusta o padding do conteúdo */}
      <main className={`${!isLoginPage ? 'pl-64' : ''} min-h-screen bg-gray-50 p-6`}>
        {children}
      </main>
    </>
  )
}