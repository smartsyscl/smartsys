
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SectionTitleProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  centered?: boolean;
}

export default function SectionTitle({ title, subtitle, centered = false, className, ...props }: SectionTitleProps) {
  return (
    <div
      className={cn(
        'mb-8 md:mb-12',
        centered ? 'text-center' : '',
        className
      )}
      {...props}
    >
      <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-lg text-foreground/80 sm:mt-4 sm:text-xl">
          {subtitle}
        </p>
      )}
    </div>
  );
}
