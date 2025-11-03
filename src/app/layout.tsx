
'use client';

import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ThemeProvider } from '@/components/global/ThemeProvider';
import ClientEffects from '@/components/global/ClientEffects';
import { useState } from 'react';


const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
});

// Metadata estática sigue funcionando en un client component de alto nivel
// export const metadata: Metadata = {
//   title: 'SmartSYS Soluciones Digitales - Desarrollo Web, Apps y Diseño de Marca en Chile',
//   description: 'SmartSYS: Desarrollo de aplicaciones web y móviles, bases de datos, backend, diseño de logotipos, rebranding y estrategias de imagen corporativa para empresas en Chile.',
//   keywords: ['aplicaciones web Chile', 'desarrollo móvil Chile', 'diseño de logotipos Chile', 'rebranding Chile', 'identidad de marca', 'bases de datos escalables', 'backend sin servidor Chile', 'almacenamiento en la nube Chile', 'autenticación de usuarios', 'notificaciones push', 'SmartSYS', 'desarrollo de software Chile', 'Flutter Chile', 'Unity Chile', 'transformación digital', 'diseño gráfico empresarial'],
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isAdminRoute, setIsAdminRoute] = useState(false);

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
          <title>SmartSYS Soluciones Digitales</title>
          <meta name="description" content="Desarrollo de aplicaciones web y móviles, bases de datos, backend, diseño de logotipos, rebranding y estrategias de imagen corporativa para empresas en Chile." />
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-body antialiased flex flex-col min-h-screen bg-background text-foreground`}>
        <ClientEffects onIsAdminRoute={setIsAdminRoute} />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {!isAdminRoute && <Header />}
          <main className="flex-grow">
            {children}
          </main>
          {!isAdminRoute && <Footer />}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
