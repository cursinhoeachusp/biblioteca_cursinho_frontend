import { Sidebar } from './components/sidebar'
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100","200","300","400","500","600","700","800","900"]
});

export const metadata: Metadata = {
  title: "PET SITES BOILERPLATE",
  description: "Templates para projetos criados no setor de Sites do PET-SI",
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
        <div className="fixed top-0 left-0 h-screen w-64 z-50">
          <Sidebar />
        </div>

        {/* Conteúdo com padding lateral para evitar sobreposição */}
        <main className="pl-64 min-h-screen bg-gray-50 p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
