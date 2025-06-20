// app/components/batch-add-button.tsx
'use client'

import { useRef, useState } from 'react'
import Papa from 'papaparse'
import { Usuario } from './columns'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Botao } from '../components/botao'


interface BatchAddButtonProps {
    onUpload: (data: Partial<Usuario>[]) => void
    isUploading: boolean
}

export function BatchAddButton({ onUpload, isUploading }: BatchAddButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const handleImport = () => {
        if (!selectedFile) {
            alert("Por favor, selecione um arquivo CSV primeiro.")
            return
        }

        // A lógica de parse do Papaparse que estava antes
        Papa.parse<Partial<Usuario>>(selectedFile, {
            header: true, // Trata a primeira linha como cabeçalho
            skipEmptyLines: true, // Pula linhas vazias
            complete: (results) => {
                onUpload(results.data) // Envia os dados para a página principal
                setIsModalOpen(false)  // Fecha o modal após o envio
                setSelectedFile(null)  // Limpa o arquivo selecionado
            },
            error: (error) => {
                console.error("Erro ao parsear o CSV:", error)
                alert("Ocorreu um erro ao ler o arquivo CSV. Verifique o formato.")
                setIsModalOpen(false)
            },
        })
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
                <DialogTrigger asChild>
                    <Botao texto="Importar CSV" />
                </DialogTrigger>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Importar usuários em lote</DialogTitle>
                </DialogHeader>
                <div className="text-sm space-y-4 py-4">
                    <p>
                        Envie um arquivo CSV com os seguintes campos na primeira linha:
                        <br />
                        <strong className="font-mono tracking-tight">
                            nome,cpf,gmail,telefone,cep,logradouro,numero,complemento
                        </strong>
                    </p>
                    <Input
                        type="file"
                        accept=".csv"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleImport}
                        disabled={isUploading || !selectedFile}
                    >
                        {isUploading ? 'Importando...' : 'Importar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}