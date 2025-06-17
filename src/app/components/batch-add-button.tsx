// app/components/batch-add-button.tsx
'use client'

import { useRef, useState } from 'react'
import Papa from 'papaparse'
import { Usuario } from './columns' // Reutilize a tipagem de Usuario
import { Button } from "@/components/ui/button"



interface BatchAddButtonProps {
    onUpload: (data: Partial<Usuario>[]) => void;
    isUploading: boolean;
}

export function BatchAddButton({ onUpload, isUploading }: BatchAddButtonProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        Papa.parse<Partial<Usuario>>(file, {
            header: true, // Trata a primeira linha como cabeçalho (nome, cpf, etc.)
            skipEmptyLines: true,
            complete: (results) => {
                // Envia os dados parseados para a página principal
                onUpload(results.data)
            },
            error: (error) => {
                console.error("Erro ao parsear o CSV:", error)
                alert("Ocorreu um erro ao ler o arquivo CSV. Verifique o formato.")
            },
        })
    }

    const handleButtonClick = () => {
        // Clica no input de arquivo oculto
        fileInputRef.current?.click()
    }

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept=".csv"
            />
            <Button
                onClick={handleButtonClick}
                disabled={isUploading}
                className="mb-4 text-md bg-[#0b2245] hover:bg-[#153a6c] hover:font-semibold"
            >
                {isUploading ? 'Enviando...' : 'Adicionar em Lote (CSV)'}
            </Button>
        </>
    )
}