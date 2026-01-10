import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from '@/components/ui/sonner';
import { AppLayout } from './components/app-layout'; // Importe o novo componente

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100","200","300","400","500","600","700","800","900"]
});

export const metadata: Metadata = {
  title: "Biblioteca Popular",
  description: "Sistema de Biblioteca do Cursinho Popular",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${poppins.className} antialiased`}>
        {/* O AppLayout cuida da segurança e do visual */}
        <AppLayout>
          {children}
        </AppLayout>
        <Toaster richColors />
      </body>
    </html>
  );
}
