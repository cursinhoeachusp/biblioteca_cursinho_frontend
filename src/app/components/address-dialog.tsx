import * as Dialog from "@radix-ui/react-dialog"

interface AddressDialogProps {
  address: string
  nome: string
}

export function AddressDialog({ address, nome }: AddressDialogProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger className="text-blue-600 hover:underline">
        Ver endereço
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-lg">
          <Dialog.Title className="text-lg font-bold">Endereço de {nome}</Dialog.Title>
          <div className="mt-4">{address}</div>
          <Dialog.Close className="mt-6 text-sm text-blue-600 hover:underline">
            Fechar
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
