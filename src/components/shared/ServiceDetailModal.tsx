
'use client';

import type { Service } from '@/lib/data';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CheckCircleIcon, iconMap } from '@/lib/data'; // Importar el icono y el mapa
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';


interface ServiceDetailModalProps {
  service: Service | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ServiceDetailModal({ service, isOpen, onOpenChange }: ServiceDetailModalProps) {
  if (!service) return null;

  const handleCotizarClick = () => {
    onOpenChange(false); // Cierra el modal
    // El Link se encargará de la navegación suave a #contact
  };

  const IconComponent = iconMap[service.icon] || Sparkles;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg md:max-w-xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-2">
            <IconComponent className="h-10 w-10 sm:h-12 sm:w-12 text-primary flex-shrink-0 mt-1 sm:mt-0" />
            <DialogTitle className="text-xl sm:text-2xl font-headline text-left">{service.title}</DialogTitle>
          </div>
           <DialogDescription className="text-sm sm:text-base text-foreground/80 whitespace-pre-line text-left">
            {service.description}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-grow px-6 pb-6">
          <div className="space-y-4">
            {service.keyFeatures && service.keyFeatures.length > 0 && (
              <div>
                <Separator className="my-4" />
                <h3 className="text-md font-semibold mb-3 text-primary">Características Principales:</h3>
                <ul className="space-y-2">
                  {service.keyFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/90">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {service.detailedDescription && (
              <div>
                <Separator className="my-4" />
                <h3 className="text-md font-semibold mb-2 text-primary">Más Detalles:</h3>
                <p className="text-sm text-foreground/80 whitespace-pre-line">
                  {service.detailedDescription}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <DialogFooter className="p-6 pt-4 border-t mt-auto">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">Cerrar</Button>
          <Button asChild className="w-full sm:w-auto">
            <Link href="#contact" onClick={handleCotizarClick}>
              Cotizar este Servicio
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
