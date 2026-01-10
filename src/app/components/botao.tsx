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
      className=" px-6 py-6 text-md bg-[#18407c] hover:bg-[#20509a] hover:font-semibold"
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {texto}
    </Button>
  )
}
