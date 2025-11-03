
'use client';

import type { Metadata } from 'next'; // Metadata can still be exported
import Link from 'next/link';
import { LayoutDashboard, Home, LogOut, Loader2, FileSignature } from 'lucide-react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { signOutUser } from '@/lib/auth';
import { ThemeToggle } from '@/components/global/ThemeToggle';

// Esta metadata es estática y se puede exportar desde un Client Component en el App Router.
// Sin embargo, si necesitaras metadata dinámica basada en el estado de auth,
// tendrías que usar la función generateMetadata en una página o layout de servidor.
// export const metadata: Metadata = { // Esta línea puede causar problemas si se deja descomentada con 'use client'
//   title: 'Panel de Administración - SmartSYS',
//   description: 'Gestión de solicitudes y cotizaciones.',
// };


function AdminAppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    const { error } = await signOutUser();
    if (error) {
        console.error("Error al cerrar sesión:", error);
        // Podrías mostrar un toast al usuario aquí
    }
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirección ya manejada en useEffect. Retornar null evita renderizar el layout brevemente.
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-2 no-print">
        <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
          <LayoutDashboard className="h-6 w-6 text-primary" />
          <span>Panel SmartSYS</span>
        </Link>
        <nav className="ml-auto flex items-center gap-2 sm:gap-4">
             <Link href="/admin/quote-generator" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                <FileSignature className="h-4 w-4 mr-1 inline-block align-middle" />
                <span className="hidden sm:inline-block">Generador Presupuestos</span>
            </Link>
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                <Home className="h-4 w-4 mr-1 inline-block align-middle" />
                <span className="hidden sm:inline-block">Ir al Sitio</span>
            </Link>
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-1 sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline-block">Cerrar Sesión</span>
              <span className="sm:hidden">Salir</span>
            </Button>
        </nav>
      </header>
      <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8 printable-container">
        {children}
      </main>
      <footer className="border-t bg-background p-4 text-center text-xs text-muted-foreground no-print">
        &copy; {new Date().getFullYear()} SmartSYS Admin Panel
      </footer>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode; }) {
  return (
    <AuthProvider>
      <AdminAppLayout>{children}</AdminAppLayout>
    </AuthProvider>
  );
}
