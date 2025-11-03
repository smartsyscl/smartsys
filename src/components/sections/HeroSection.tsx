
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function HeroSection() {
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

  return (
    <section id="hero" className="w-full py-16 md:py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <div className="bg-card p-8 md:p-12 lg:p-16 rounded-2xl shadow-xl">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-6">
              <div className="space-y-4">
                <h1 className="font-headline text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                  <span className="text-primary">Desarrollo Web</span><br />
                  <span className="text-accent">y Apps a Medida</span>
                </h1>
                <p className="max-w-[600px] text-foreground/80 md:text-xl">
                  En SmartSYS, diseñamos y desarrollamos sitios web y aplicaciones a medida con estándares de calidad premium para empresas en Chile. Combinamos diseño de vanguardia, desarrollo robusto y estrategias digitales inteligentes para potenciar tu presencia online y maximizar tus resultados.
                </p>
              </div>
              <div className="flex flex-col gap-3 min-[400px]:flex-row">
                <Button asChild size="lg" className="group">
                  <Link href="#contact" onClick={(e) => handleSmoothScroll(e, '#contact')}>
                    Cotiza tu Proyecto
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="mt-8 lg:mt-0">
              <Image
                src="https://placehold.co/800x600.png"
                alt="Muestra de sitios web premium y aplicaciones desarrolladas por SmartSYS"
                data-ai-hint="modern app website showcase"
                width={800}
                height={600}
                priority
                className="mx-auto rounded-xl object-cover shadow-lg aspect-[4/3]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
