
'use client';

import type { PanInfo } from 'framer-motion';
import { animate, motion, useMotionValue } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { type Service, iconMap } from '@/lib/data';
import { cn } from '@/lib/utils';

import SectionTitle from '@/components/shared/SectionTitle';
import ServiceDetailModal from '@/components/shared/ServiceDetailModal';

const SWIPE_THRESHOLD_DISTANCE = 50;
const SWIPE_VELOCITY_THRESHOLD = 0.3;

const MotionCard = motion(Card);

interface ServicesSectionProps {
  services: Service[];
}

export default function ServicesSection({ services }: ServicesSectionProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPageForCarousel, setItemsPerPageForCarousel] = useState(3); // Default for desktop

  const dragX = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(0);

  // Effect to calculate layout parameters based on window size
  useEffect(() => {
    const calculateLayoutParameters = () => {
      let newItemsPerPage = 3; 

      if (typeof window !== 'undefined') {
        if (window.innerWidth < 1024) { 
          newItemsPerPage = 1;
        } else { 
          newItemsPerPage = 3;
        }
      }
      setItemsPerPageForCarousel(newItemsPerPage);

      if (containerRef.current) {
        const currentViewportWidth = containerRef.current.offsetWidth;
        setViewportWidth(currentViewportWidth);

        const newTotalPages = Math.max(1, Math.ceil(services.length / newItemsPerPage));

        setCurrentPage(prevPage => {
          const adjustedPage = Math.min(prevPage, newTotalPages - 1);
          if (currentViewportWidth > 0) {
            animate(dragX, -adjustedPage * currentViewportWidth, { type: 'tween', duration: 0.4, ease: 'easeInOut' });
          }
          return adjustedPage;
        });
      }
    };

    if (typeof window !== 'undefined') {
      calculateLayoutParameters();
      window.addEventListener('resize', calculateLayoutParameters);
      return () => window.removeEventListener('resize', calculateLayoutParameters);
    }
  }, [dragX, services.length]);

  // Effect to animate carousel when currentPage or viewportWidth changes
  useEffect(() => {
    if (viewportWidth > 0) {
      const targetX = -currentPage * viewportWidth;
      animate(dragX, targetX, { type: 'tween', duration: 0.4, ease: 'easeInOut' });
    }
  }, [currentPage, viewportWidth, dragX]);

  const totalPagesCalculated = useMemo(() => {
    return Math.max(1, Math.ceil(services.length / itemsPerPageForCarousel));
  }, [services.length, itemsPerPageForCarousel]);


  const handleOpenModal = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedService(null), 300); 
  };

  const goToPage = (pageNumber: number) => {
    setCurrentPage(Math.max(0, Math.min(pageNumber, totalPagesCalculated - 1)));
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;
    const targetX = -currentPage * viewportWidth; 

    if (Math.abs(offset.x) > SWIPE_THRESHOLD_DISTANCE || Math.abs(velocity.x) > SWIPE_VELOCITY_THRESHOLD) {
      if (offset.x < -SWIPE_THRESHOLD_DISTANCE || velocity.x < -SWIPE_VELOCITY_THRESHOLD) {
        goToPage(currentPage + 1); 
      } else if (offset.x > SWIPE_THRESHOLD_DISTANCE || velocity.x > SWIPE_VELOCITY_THRESHOLD) {
        goToPage(currentPage - 1); 
      } else {
        if (viewportWidth > 0) animate(dragX, targetX, { type: "tween", duration: 0.4, ease: 'easeInOut' });
      }
    } else {
      if (viewportWidth > 0) animate(dragX, targetX, { type: "tween", duration: 0.4, ease: 'easeInOut' });
    }
  };

  const getDisplayedServicesForPage = (pageIndex: number): Service[] => {
    const start = pageIndex * itemsPerPageForCarousel;
    const end = start + itemsPerPageForCarousel;
    return services.slice(start, end);
  };

  return (
    <section id="services" className="w-full bg-background">
      <div className="container">
        <SectionTitle
          title="Nuestros Servicios Digitales"
          subtitle="Soluciones innovadoras diseñadas para impulsar el crecimiento y la eficiencia de tu empresa."
          centered
        />

        <div className="relative">
          {totalPagesCalculated > 1 && ( 
            <Button
              variant="outline"
              size="icon"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 0}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full shadow-md hidden md:flex -translate-x-12"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}

          <div
            ref={containerRef}
            className="overflow-hidden cursor-grab active:cursor-grabbing px-2" 
          >
            <motion.div
              className="flex"
              style={{ x: dragX, width: `${totalPagesCalculated * 100}%` }}
              drag="x"
              dragConstraints={{
                left: viewportWidth > 0 ? -(totalPagesCalculated - 1) * viewportWidth : 0,
                right: 0,
              }}
              onDragEnd={handleDragEnd}
            >
              {Array.from({ length: totalPagesCalculated }).map((_, pageIndex) => (
                <div
                  key={`page-${pageIndex}`}
                  className="flex-shrink-0 flex flex-row" 
                  style={{ width: `${100 / totalPagesCalculated}%` }} 
                >
                  {getDisplayedServicesForPage(pageIndex).map((service) => {
                    const IconComponent = iconMap[service.icon] || Sparkles;
                    return (
                      <div
                        key={service.id}
                        className="p-2" 
                        style={{
                          width: `${100 / itemsPerPageForCarousel}%`, 
                        }}
                      >
                        <MotionCard
                          className={cn(
                            "flex flex-col h-full rounded-lg overflow-hidden",
                            "bg-card hover:bg-secondary",
                            "cursor-pointer transition-colors duration-200"
                          )}
                          onClick={() => handleOpenModal(service)}
                          layout
                        >
                          <CardHeader className="items-center text-center pt-8 pb-4">
                            <IconComponent className="h-16 w-16 text-primary mb-6" />
                            <CardTitle className="font-headline text-xl font-semibold leading-tight min-h-[2.5em] flex items-center justify-center">
                              {service.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="flex-grow px-5 pb-5">
                            <p className="text-sm text-foreground/80 line-clamp-4 text-center min-h-[4.5em]">
                              {service.description}
                            </p>
                          </CardContent>
                          <CardFooter className="p-5 mt-auto">
                            <Button variant="outline" size="sm" className="w-full group">
                              Más Información
                              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                          </CardFooter>
                        </MotionCard>
                      </div>
                    );
                  })}
                </div>
              ))}
            </motion.div>
          </div>

          {totalPagesCalculated > 1 && ( 
            <Button
              variant="outline"
              size="icon"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPagesCalculated - 1}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full shadow-md hidden md:flex translate-x-12"
              aria-label="Siguiente"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          )}
        </div>

        {totalPagesCalculated > 1 && ( 
          <div className="mt-8 flex justify-center items-center gap-4 md:hidden">
            <Button
              variant="outline"
              size="icon"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 0}
              className="h-10 w-10 rounded-full"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {currentPage + 1} de {totalPagesCalculated}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPagesCalculated - 1}
              className="h-10 w-10 rounded-full"
              aria-label="Siguiente"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        )}
      </div>
      <ServiceDetailModal
        service={selectedService}
        isOpen={isModalOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseModal();
        }}
      />
    </section>
  );
}
