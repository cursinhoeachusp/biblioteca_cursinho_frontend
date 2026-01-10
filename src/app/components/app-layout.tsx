'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Sidebar } from './sidebar'
import { Menu, X } from 'lucide-react' // Ícones do Menu e Fechar
import { Button } from '@/components/ui/button'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)
  
  // Estado para controlar se o menu mobile está aberto ou fechado
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const token = localStorage.getItem('biblioteca_token')
    const publicRoutes = ['/login']

    if (!token && !publicRoutes.includes(pathname)) {
      router.push('/login')
    }
    
    if (token && pathname === '/login') {
        router.push('/')
    }
    setMobileMenuOpen(false)

  }, [router, pathname])

  if (!isMounted) return null

  const isLoginPage = pathname === '/login'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {!isLoginPage && (
        <div className="hidden md:block fixed top-0 left-0 h-screen w-64 z-50 border-r bg-white">
          <Sidebar />
        </div>
      )}

      {!isLoginPage && mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-xl animate-in slide-in-from-left duration-200">
            <div className="flex justify-end p-2">
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}

      <div className={`flex-1 w-full ${!isLoginPage ? 'md:pl-64' : ''}`}>
        
        {!isLoginPage && (
          <header className="md:hidden sticky top-0 z-40 bg-white border-b h-14 flex items-center px-4 justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
                <Menu className="h-6 w-6" />
              </Button>
              <span className="font-semibold text-lg">Biblioteca</span>
            </div>
          </header>
        )}

        <main className="p-4 md:p-8 w-full max-w-full overflow-x-hidden">
            {children}
        </main>
      </div>
    </div>
  )
}