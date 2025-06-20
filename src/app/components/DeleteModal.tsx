'use client'
import { useState } from 'react'

export function DeleteModal({
    isOpen,
    onClose,
    onConfirm,
}: {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => Promise<void>
}) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const handleConfirm = async () => {
        try {
            setIsDeleting(true)
            setErrorMessage(null)
            await onConfirm()
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Falha ao excluir usuário')
        } finally {
            setIsDeleting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
                <h3 className="text-lg font-bold mb-4">Confirmar exclusão</h3>
                {errorMessage && (
                    <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                        {errorMessage}
                    </div>
                )}
                <p className="mb-6">Tem certeza que deseja excluir este usuário?</p>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                        disabled={isDeleting}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Excluindo...' : 'Confirmar'}
                    </button>
                </div>
            </div>
        </div>
    )
}
