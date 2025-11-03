
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { submitContactForm } from '@/lib/actions';
import type { Service } from '@/lib/data';
import SectionTitle from '@/components/shared/SectionTitle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from "@/hooks/use-toast";
import { Mail, Send, Loader2 } from 'lucide-react';

const ContactFormSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, introduce un email válido." }),
  serviceInterest: z.string().optional(),
  message: z.string().min(10, { message: "El mensaje debe tener al menos 10 caracteres." }).max(500, {message: "El mensaje no puede exceder los 500 caracteres."}),
});

type ContactFormData = z.infer<typeof ContactFormSchema>;

export default function ContactSection({ services }: { services: Service[] }) {
  const { toast } = useToast();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(ContactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      serviceInterest: '',
      message: '',
    },
  });

  const onValidSubmit = async (clientData: ContactFormData) => {
    const formData = new FormData();
    formData.append('name', clientData.name);
    formData.append('email', clientData.email);
    
    if (clientData.serviceInterest && clientData.serviceInterest.trim() !== "") {
      formData.append('serviceInterest', clientData.serviceInterest);
    }
    formData.append('message', clientData.message);
    
    const result = await submitContactForm({ success: false, message: '' }, formData);

    if (result.success) {
      toast({
        title: "¡Éxito!",
        description: result.message,
      });
      form.reset(); 
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  return (
    <section id="contact" className="w-full bg-background">
      <div className="container">
        <SectionTitle
          title="Hablemos de Tu Proyecto"
          subtitle="Completa el formulario y nos pondremos en contacto contigo a la brevedad."
          centered
        />
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl">
             <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2 text-2xl">
                <Mail className="h-6 w-6 text-primary" />
                Formulario de Contacto
              </CardTitle>
              <CardDescription>
                Estamos listos para escuchar tus ideas y necesidades.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form 
                  onSubmit={form.handleSubmit(onValidSubmit)} 
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Juan Pérez" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo Electrónico</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Ej: juan.perez@empresa.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="serviceInterest"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Servicio de Interés (Opcional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un servicio" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {services.map(service => (
                              <SelectItem key={service.id} value={service.title}>
                                {service.title}
                              </SelectItem>
                            ))}
                             <SelectItem value="Otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mensaje</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe brevemente tu proyecto o consulta..."
                            rows={5}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Enviar Mensaje
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
