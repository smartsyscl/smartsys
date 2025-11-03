
'use client';

import { useState } from 'react';
import Link from 'next/link';
import SmartSysLogo from '@/components/logo/SmartSysLogo'; // Updated import
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { ThemeToggle } from '@/components/global/ThemeToggle';

const navItems = [
  { label: 'Inicio', href: '#hero' },
  { label: 'Servicios', href: '#services' },
  { label: 'Portafolio', href: '#portfolio' },
  { label: 'Testimonios', href: '#testimonials' },
  { label: 'Contacto', href: '#contact' },
];

export default function Header() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleSmoothScroll = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    href: string
  ) => {
    e.preventDefault();
    const targetId = href.substring(1); // Remove #
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const handleMobileLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    href: string
  ) => {
    handleSmoothScroll(e, href);
    setIsSheetOpen(false); // Close sheet after click
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center mr-auto">
            <Link href="/" className="mr-6 flex items-center" onClick={() => setIsSheetOpen(false)}>
              <SmartSysLogo className="h-auto" /> 
            </Link>
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleSmoothScroll(e, item.href)}
                  className="text-foreground/70 transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
        </div>
        
        <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="md:hidden">
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setIsSheetOpen(true)}>
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Abrir menú</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Menu</SheetTitle>
                    <SheetDescription>
                      Navegación principal del sitio
                    </SheetDescription>
                  </SheetHeader>
                  <nav className="grid gap-6 text-lg font-medium mt-8">
                    <Link href="/" onClick={() => setIsSheetOpen(false)} className="flex items-center space-x-2 mb-4">
                      <SmartSysLogo className="h-auto" />
                    </Link>
                    {navItems.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={(e) => handleMobileLinkClick(e, item.href)}
                        className="text-foreground/80 transition-colors hover:text-foreground py-1"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
        </div>
      </div>
    </header>
  );
}
