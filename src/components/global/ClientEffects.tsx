
'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface ClientEffectsProps {
    onIsAdminRoute: (isAdmin: boolean) => void;
}

export default function ClientEffects({ onIsAdminRoute }: ClientEffectsProps) {
  const pathname = usePathname();

  useEffect(() => {
    const isAdmin = pathname.startsWith('/admin') || pathname === '/login';
    onIsAdminRoute(isAdmin);
  }, [pathname, onIsAdminRoute]);

  return null; // Este componente no renderiza nada
}
