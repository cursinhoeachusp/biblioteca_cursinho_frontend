'use client'

import { Button } from "@/components/ui/button"

interface BotaoProps {
  texto: string
  onClick?: () => void
  type?: "button" | "submit" | "reset"
  disabled?: boolean
}

export function Botao({ texto, onClick, type = "button", disabled = false }: BotaoProps) {
  return (
    <Button
      className="mb-4 text-md bg-[#0b2245] hover:bg-[#153a6c] hover:font-semibold"
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {texto}
    </Button>
  )
}
