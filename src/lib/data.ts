import type { LucideIcon } from 'lucide-react';
import { 
  AppWindow, 
  DatabaseZap, 
  CloudCog, 
  FolderClosed,
  KeyRound, 
  Bell,
  Users, 
  MessageSquare, 
  Briefcase,
  Palette,
  Sparkles,
  CheckCircle,
} from 'lucide-react';

// --- Icon Map ---
// Maps string identifiers from the database to actual Lucide icon components.
export const iconMap: { [key: string]: LucideIcon } = {
  AppWindow,
  DatabaseZap,
  CloudCog,
  FolderClosed,
  KeyRound,
  Bell,
  Users,
  MessageSquare,
  Briefcase,
  Palette,
  Sparkles,
  CheckCircle,
};

// --- Type Definitions ---
// These interfaces define the shape of the data used throughout the app.
// They are now decoupled from the static data arrays.

export interface Service {
  id: string;
  icon: string; // The name of the icon
  title: string;
  description: string;
  detailedDescription?: string;
  keyFeatures?: string[];
  order: number; // To maintain a specific order
}

export interface PortfolioItem {
  id: string;
  imageUrl: string;
  imageHint?: string;
  category: string;
  title: string;
  description: string;
  order: number;
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  company: string;
  avatarUrl?: string;
  avatarFallback: string;
  icon?: string; // The name of the icon
  order: number;
}

export type QuoteStatus = 'pendiente' | 'revisado' | 'respondido' | 'cerrado';

export interface QuoteRequest {
  id: string;
  trackingId?: string; // User-friendly tracking ID, e.g., SS-000001
  name: string;
  email: string;
  serviceInterest?: string;
  message: string;
  submittedAt: Date;
  status: QuoteStatus;
  adminResponse?: string;
  quotedAmount?: number;
  attachmentName?: string;
  respondedAt?: Date;
  internalNotes?: string;
}

export interface ResponseTemplate {
  id: string;
  title: string;
  content: string;
}

// --- Static Data ---
// Mock data that doesn't need to be in the database can remain here.

export const mockResponseTemplates: ResponseTemplate[] = [
  {
    id: 'gracias-interes',
    title: 'Agradecimiento y Próximos Pasos',
    content: 'Estimado/a [Nombre Cliente],\n\nMuchas gracias por su interés en SmartSYS Digital Solutions y por solicitar una cotización para el servicio de [Servicio de Interés].\n\nHemos recibido su mensaje y lo estamos revisando con atención. Nos pondremos en contacto con usted dentro de las próximas 24-48 horas hábiles con una propuesta detallada o para coordinar una breve reunión si necesitamos clarificar algunos puntos para ofrecerle la mejor solución.\n\nMientras tanto, puede explorar más sobre nuestros proyectos en [Enlace a Portafolio] o conocer más sobre nosotros en [Enlace a Sobre Nosotros].\n\nSaludos cordiales,\nEl equipo de SmartSYS Digital Solutions',
  },
  {
    id: 'agendar-reunion',
    title: 'Propuesta de Reunión para Discutir Detalles',
    content: 'Estimado/a [Nombre Cliente],\n\nGracias por su consulta sobre [Servicio de Interés].\n\nPara entender mejor sus necesidades específicas y cómo podemos ayudarle a alcanzar sus objetivos, nos gustaría proponerle una breve reunión virtual de 15-20 minutos. Durante esta conversación, podremos discutir los detalles de su proyecto y responder cualquier pregunta que tenga.\n\n¿Tendría disponibilidad la próxima semana? Por favor, indíquenos qué día y hora le acomoda más.\n\nQuedamos atentos a su respuesta.\n\nSaludos cordiales,\nEl equipo de SmartSYS Digital Solutions',
  },
  {
    id: 'cotizacion-adjunta',
    title: 'Cotización Adjunta (General)',
    content: 'Estimado/a [Nombre Cliente],\n\nSiguiendo a su solicitud, le adjuntamos la cotización para el servicio de [Servicio de Interés], con el número de referencia [Número de Cotización].\n\nEn el documento encontrará el desglose de los servicios incluidos, el alcance del proyecto, los plazos estimados y la inversión correspondiente.\n\n[Opcional: Mencionar brevemente 1-2 puntos clave o beneficios de la propuesta.]\n\nSi tiene alguna pregunta o desea discutir algún aspecto de la cotización, no dude en contactarnos. Estamos a su disposición para ayudarle.\n\nSaludos cordiales,\nEl equipo de SmartSYS Digital Solutions',
  },
  {
    id: 'seguimiento-general',
    title: 'Seguimiento General (Post-Cotización)',
    content: 'Estimado/a [Nombre Cliente],\n\nEsperamos que se encuentre bien.\n\nQueríamos hacer un seguimiento respecto a la cotización ([Número de Cotización]) que le enviamos el día [Fecha de Envío de Cotización] para el servicio de [Servicio de Interés].\n\n¿Ha tenido oportunidad de revisarla? Estaremos encantados de responder cualquier pregunta que pueda tener o discutir los próximos pasos si está interesado/a en proceder.\n\nQuedamos a su disposición.\n\nSaludos cordiales,\nEl equipo de SmartSYS Digital Solutions',
  }
];

export const CheckCircleIcon = CheckCircle; // Exportar el icono para usarlo en el modal
