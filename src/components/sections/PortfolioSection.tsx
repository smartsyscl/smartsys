
import Image from 'next/image';
import type { PortfolioItem } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SectionTitle from '@/components/shared/SectionTitle';
import { Badge } from '@/components/ui/badge';
import { getPortfolioItems } from '@/lib/content-data';

function PortfolioCard({ item }: { item: PortfolioItem }) {
  return (
    <Card className="overflow-hidden h-full flex flex-col group hover:shadow-xl transition-shadow duration-300">
      <div className="aspect-video overflow-hidden">
        <Image
          src={item.imageUrl}
          alt={item.title}
          data-ai-hint={item.imageHint || 'project showcase'}
          width={600}
          height={400}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardHeader>
        <Badge variant="secondary" className="w-fit mb-2">{item.category}</Badge>
        <CardTitle className="font-headline text-xl">{item.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription>{item.description}</CardDescription>
      </CardContent>
    </Card>
  );
}

export default async function PortfolioSection() {
  const portfolioItems = await getPortfolioItems();

  return (
    <section id="portfolio" className="w-full bg-primary/5">
      <div className="container">
        <SectionTitle
          title="Proyectos Destacados"
          subtitle="Casos de éxito que demuestran nuestra capacidad para entregar resultados excepcionales."
          centered
        />
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2"> 
          {/* Using 2 columns for better readability of project cards */}
          {portfolioItems.map((item) => (
            <PortfolioCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
