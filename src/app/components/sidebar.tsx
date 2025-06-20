'use client'
import ImageG from "@/components/ImageG";
import { SquarePen, BookOpen, Users, RefreshCcw,Clock, Gavel } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const links = [
  { label: 'Livros', href: '/', icon: BookOpen },
  { label: 'Autores', href: '/autores', icon: SquarePen },
  { label: 'Empréstimos', href: '/emprestimos', icon: RefreshCcw },
  { label: 'Reservas', href: '/reservas', icon: Clock },
  { label: 'Penalidades', href: '/penalidades', icon: Gavel },
  { label: 'Usuários', href: '/usuarios', icon: Users },
]

export function Sidebar() {
  return (
    <aside className="w-56 h-screen bg-[#0b2245] text-white flex flex-col py-6 pl-4 shadow-md">
      <div className="mt-3 mb-10">
        <ImageG
          src="/logo.png"
          alt="Biblioteca Popular Logo"
          width={350}
          height={73}
          priority
        />
      </div>

      <nav className="flex flex-col gap-2">
        {links.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#153a6c] hover:font-semibold transition-colors',
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-md">{label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}
