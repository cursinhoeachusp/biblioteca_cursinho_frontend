import { Sidebar } from './components/sidebar'
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from '@/components/ui/sonner';

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100","200","300","400","500","600","700","800","900"]
});

export const metadata: Metadata = {
  title: "Biblioteca Popular",
  description: "Sistema de Biblioteca do Curcinho Popular",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${poppins.className} antialiased`}>
        {/* Sidebar fixa */}
        <div className="w-14 md:w-56 fixed top-0 left-0 h-screen z-50 transition-all duration-300">
          <Sidebar />
        </div>

        {/* Conteúdo com padding lateral para evitar sobreposição */}
        <main className="min-h-screen bg-orange-50 pt-6 pb-6 pr-6 pl-20 md:pl-56 transition-all duration-300">
          {children}
        </main>
      <Toaster richColors />
      </body>
    </html>
  );
}
