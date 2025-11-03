
import HeroSection from '@/components/sections/HeroSection';
import ServicesSection from '@/components/sections/ServicesSection';
import PortfolioSection from '@/components/sections/PortfolioSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import ContactSection from '@/components/sections/ContactSection';
import { getServices } from '@/lib/content-data';


export default async function Home() {
  const services = await getServices();
  
  return (
    <>
      <HeroSection />
      <ServicesSection services={services} />
      <PortfolioSection />
      <TestimonialsSection />
      <ContactSection services={services}/>
    </>
  );
}
