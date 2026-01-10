'use client'
import ImageG from "@/components/ImageG";
import { SquarePen, BookOpen, Users, RefreshCcw,Clock, Gavel } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const links = [
  { label: 'Livros', href: '/', icon: BookOpen },
  { label: 'Empréstimos', href: '/emprestimos', icon: RefreshCcw },
  { label: 'Reservas', href: '/reservas', icon: Clock },
  { label: 'Penalidades', href: '/penalidades', icon: Gavel },
  { label: 'Usuários', href: '/usuarios', icon: Users },
]

export function Sidebar() {
  return (
    <aside className="flex flex-col py-6   h-screen text-white bg-[#18407c] shadow-md overflow-hidden">
      <div className="mt-3 mb-10 px-4 flex justify-center md:justify-start">
        <ImageG
          src="/logo.png"
          alt="Biblioteca Popular Logo"
          width={350}
          height={73}
          priority
          className="md:block"
        />
      </div>

      <nav className="flex flex-col gap-2 pl-4 px-4 ">
        {links.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#20509a] hover:font-semibold transition-colors',
              ' md:justify-start'
            )}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="text-md md:inline">{label}</span>
          </Link>
        ))}
      </nav>
      <div className="mb-10 mt-auto flex justify-center px-4">
        <ImageG
          src="/ATENA-CURSINHO.png"
          alt="Biblioteca Popular Logo"
          width={120}
          height={53}
          priority
          className="hidden md:block"
        />
      </div>
      
    </aside>
  )
}
