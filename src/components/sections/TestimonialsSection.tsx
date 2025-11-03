
import type { Testimonial } from '@/lib/data';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import SectionTitle from '@/components/shared/SectionTitle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Quote, Sparkles } from 'lucide-react';
import { getTestimonials } from '@/lib/content-data';
import { iconMap } from '@/lib/data';

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const IconComponent = testimonial.icon ? iconMap[testimonial.icon] || Sparkles : null;
  return (
    <Card className="flex flex-col h-full bg-card shadow-lg_ transform hover:scale-102 transition-transform duration-300">
      <CardHeader className="relative">
         <Quote className="absolute top-4 right-4 h-12 w-12 text-accent/30" />
         {IconComponent && <IconComponent className="h-8 w-8 text-primary mb-2" />}
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-lg italic text-foreground/90">"{testimonial.quote}"</p>
      </CardContent>
      <CardFooter className="flex items-center gap-4 mt-auto pt-4 border-t">
        {testimonial.avatarUrl && (
          <Avatar>
            <AvatarImage src={testimonial.avatarUrl} alt={testimonial.name} data-ai-hint="person portrait" />
            <AvatarFallback>{testimonial.avatarFallback}</AvatarFallback>
          </Avatar>
        )}
        {!testimonial.avatarUrl && testimonial.avatarFallback && (
           <Avatar>
            <AvatarFallback className="bg-primary text-primary-foreground">{testimonial.avatarFallback}</AvatarFallback>
          </Avatar>
        )}
        <div>
          <p className="font-semibold text-primary">{testimonial.name}</p>
          <p className="text-sm text-foreground/70">{testimonial.company}</p>
        </div>
      </CardFooter>
    </Card>
  );
}

export default async function TestimonialsSection() {
  const testimonials = await getTestimonials();

  return (
    <section id="testimonials" className="w-full bg-background">
      <div className="container">
        <SectionTitle
          title="Lo Que Dicen Nuestros Clientes"
          subtitle="La satisfacción de nuestros clientes es nuestra mayor recompensa."
          centered
        />
        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}
