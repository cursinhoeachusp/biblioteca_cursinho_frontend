"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'

export function AdicionarUsuarioBotao() {
  const router = useRouter()
  return (
    <Button className="mb-4 text-md bg-[#0b2245] hover:bg-[#153a6c] hover:font-semibold" onClick={() => router.push('/usuarios/novo')}>
      Adicionar Usuário
    </Button>
  )
}


