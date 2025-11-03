
'use client';

import type { QuoteRequest, QuoteStatus, ResponseTemplate } from '@/lib/data';
import type { QuoteResponseFormState } from '@/lib/actions';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { submitQuoteResponse, getQuoteRequestById } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from "@/hooks/use-toast";
import { Send, DollarSign, Paperclip, CheckCircle, AlertTriangle, Loader2, FileText, NotebookPen, ArrowLeft, CalendarDays, Mail, User, Briefcase, MessageSquareText, Edit3 } from 'lucide-react';
import { mockResponseTemplates } from '@/lib/data';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '../ui/skeleton';
import { useAuth } from '@/context/AuthContext';

const QuoteResponseSchema = z.object({
  id: z.string(),
  userId: z.string().min(1, { message: "User ID is required." }),
  adminResponse: z.string().min(10, { message: "La respuesta debe tener al menos 10 caracteres." }).max(2000, {message: "La respuesta no puede exceder los 2000 caracteres."}),
  quotedAmount: z.preprocess(
    (val) => (val === "" || val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) ? undefined : Number(String(val).replace(/\./g, '').replace(',', '.')),
    z.number().positive({ message: "El monto debe ser un número positivo." }).optional()
  ),
  attachmentName: z.string().optional(), 
  status: z.custom<QuoteStatus>((val) => ['pendiente', 'revisado', 'respondido', 'cerrado'].includes(val as string) , {
    message: "Estado inválido.",
  }),
  internalNotes: z.string().optional(),
});

type QuoteResponseFormData = z.infer<typeof QuoteResponseSchema>;

const initialState: QuoteResponseFormState = {
  message: '',
  success: false,
};

interface QuoteResponseFormProps {
  quoteId: string;
}

const DetailPageSkeleton = () => (
    <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-9 w-44" />
        <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Card><CardHeader><Skeleton className="h-8 w-60 mb-2"/><Skeleton className="h-4 w-80"/></CardHeader><CardContent><Skeleton className="h-48 w-full"/></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-8 w-52 mb-2"/><Skeleton className="h-4 w-96"/></CardHeader><CardContent><Skeleton className="h-96 w-full"/></CardContent></Card>
            </div>
            <div className="lg:col-span-1 space-y-6">
                <Card><CardHeader><Skeleton className="h-7 w-48 mb-2"/><Skeleton className="h-4 w-64"/></CardHeader><CardContent><Skeleton className="h-24 w-full"/></CardContent></Card>
            </div>
        </div>
    </div>
);


export default function QuoteResponseForm({ quoteId }: QuoteResponseFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const [quote, setQuote] = useState<QuoteRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [responseTemplates] = useState<ResponseTemplate[]>(mockResponseTemplates);

  const form = useForm<QuoteResponseFormData>({
    resolver: zodResolver(QuoteResponseSchema),
    defaultValues: {
      id: quoteId,
      userId: '',
      adminResponse: '',
      quotedAmount: undefined,
      attachmentName: '',
      status: 'pendiente',
      internalNotes: '',
    },
  });
  
  useEffect(() => {
    const fetchQuote = async () => {
        setIsLoading(true);
        const fetchedQuote = await getQuoteRequestById(quoteId);
        if(fetchedQuote) {
            setQuote(fetchedQuote);
            form.reset({
                id: fetchedQuote.id,
                userId: user?.uid || '',
                adminResponse: fetchedQuote.adminResponse || '',
                quotedAmount: fetchedQuote.quotedAmount || undefined,
                attachmentName: fetchedQuote.attachmentName || '',
                status: fetchedQuote.status || 'pendiente',
                internalNotes: fetchedQuote.internalNotes || '',
            });
        }
        setIsLoading(false);
    }
    if (user) { // Fetch only when user is available
      fetchQuote();
    }
  }, [quoteId, form, user]);

  useEffect(() => {
    if (user) {
      form.setValue('userId', user.uid);
    }
  }, [user, form]);

  const onSubmit = async (data: QuoteResponseFormData) => {
    const formData = new FormData();
    formData.append('id', data.id);
    formData.append('userId', data.userId);
    formData.append('adminResponse', data.adminResponse);
    if (data.quotedAmount !== undefined) {
        formData.append('quotedAmount', data.quotedAmount.toString());
    }
    if (data.attachmentName) {
        formData.append('attachmentName', data.attachmentName);
    }
    if (data.internalNotes) {
        formData.append('internalNotes', data.internalNotes);
    }
    formData.append('status', data.status);
    
    const result = await submitQuoteResponse(initialState, formData);

    if (result.success) {
      toast({
        title: "Éxito",
        description: result.message,
        variant: 'default',
        action: <CheckCircle className="text-green-500" />
      });
      // Refetch data after successful submission
      const updatedQuote = await getQuoteRequestById(quoteId);
      if (updatedQuote) setQuote(updatedQuote);

    } else {
      toast({
        title: "Error",
        description: result.message || "Hubo un error al procesar la solicitud.",
        variant: "destructive",
         action: <AlertTriangle className="text-red-500" />
      });
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    if (!quote) return;
    const selectedTemplate = responseTemplates.find(t => t.id === templateId);
    if (selectedTemplate) {
      let content = selectedTemplate.content;
      content = content.replace(/\[Nombre Cliente\]/g, quote.name);
      if (quote.serviceInterest) {
        content = content.replace(/\[Servicio de Interés\]/g, quote.serviceInterest);
      } else {
        content = content.replace(/\[Servicio de Interés\]/g, "el servicio consultado");
      }
      content = content.replace(/\[Número de Cotización\]/g, `Q-${quote.id.substring(0,6).toUpperCase()}`);
      form.setValue('adminResponse', content, { shouldValidate: true, shouldDirty: true });
    }
  };
  
  if (isLoading) {
    return <DetailPageSkeleton />;
  }

  if (!quote) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Cotización no encontrada</h1>
        <Button asChild variant="outline">
          <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pendiente': return 'outline';
      case 'revisado': return 'secondary';
      case 'respondido': return 'default';
      case 'cerrado': return 'destructive';
      default: return 'outline';
    }
  };


  return (
     <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Dashboard
          </Link>
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-bold mb-1">
                    Solicitud #{quote.trackingId || quote.id.substring(0,6).toUpperCase()}
                  </CardTitle>
                  <CardDescription>Detalles de la solicitud de cotización.</CardDescription>
                </div>
                <Badge variant={getStatusVariant(quote.status)} className="text-sm capitalize px-3 py-1">
                  {quote.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-primary border-b pb-2">Información del Cliente</h3>
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Nombre:</p>
                    <p className="font-medium">{quote.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email:</p>
                    <p className="font-medium">{quote.email}</p>
                  </div>
                </div>
                 <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Servicio de Interés:</p>
                    <p className="font-medium">{quote.serviceInterest || 'No especificado'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de Solicitud:</p>
                    <p className="font-medium">{format(new Date(quote.submittedAt), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-primary border-b pb-2">Mensaje del Cliente</h3>
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-md">
                  <MessageSquareText className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                  <p className="text-sm whitespace-pre-wrap">{quote.message}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-primary" />
                Gestionar Solicitud
              </CardTitle>
              <CardDescription>
                Completa la respuesta al cliente, añade notas internas y actualiza el estado.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <input type="hidden" {...form.register("id")} />
                    <input type="hidden" {...form.register("userId")} />

                    <div className="space-y-4">
                    <FormItem>
                        <FormLabel className="flex items-center gap-1">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            Usar Plantilla de Respuesta
                        </FormLabel>
                        <Select onValueChange={handleTemplateSelect}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar una plantilla..." />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {responseTemplates.map(template => (
                                <SelectItem key={template.id} value={template.id}>
                                {template.title}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        </FormItem>
                    </div>
                    
                    <FormField
                    control={form.control}
                    name="adminResponse"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Respuesta al Cliente</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="Escribe aquí tu respuesta, detalles de la cotización, próximos pasos, etc."
                            rows={8}
                            {...field}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="quotedAmount"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            Monto Cotizado (CLP - Opcional)
                            </FormLabel>
                            <FormControl>
                            <Input 
                                type="number" 
                                placeholder="Ej: 1500000" 
                                {...field} 
                                onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value === '' ? undefined : parseFloat(value));
                                }}
                                value={field.value ?? ''}
                                step="any"
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="attachmentName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-1">
                            <Paperclip className="h-4 w-4 text-muted-foreground" />
                            Nombre del Adjunto (Simulado)
                            </FormLabel>
                            <FormControl>
                            <Input 
                                placeholder="Ej: Cotizacion_Proyecto_XYZ.pdf" 
                                {...field} 
                            />
                            </FormControl>
                            <p className="text-xs text-muted-foreground pt-1">Simulación: Ingresa el nombre del archivo.</p>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    </div>

                    <Separator />
                    
                    <FormField
                    control={form.control}
                    name="internalNotes"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="flex items-center gap-1">
                            <NotebookPen className="h-4 w-4 text-muted-foreground" />
                            Notas Internas (Solo visible para administradores)
                        </FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="Añade notas de seguimiento, detalles internos, recordatorios, etc."
                            rows={4}
                            {...field}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                    <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Estado de la Solicitud</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un estado" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {(['pendiente', 'revisado', 'respondido', 'cerrado'] as QuoteStatus[]).map(statusValue => (
                                <SelectItem key={statusValue} value={statusValue} className="capitalize">
                                {statusValue}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" className="w-full md:w-auto" disabled={!user || form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? (
                        <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando Cambios...
                        </>
                    ) : (
                        <>
                        <Send className="mr-2 h-4 w-4" />
                        Guardar Cambios y Actualizar
                        </>
                    )}
                    </Button>
                </form>
                </Form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
           <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-primary">
                <NotebookPen className="h-5 w-5" />
                Notas Internas
              </CardTitle>
              <CardDescription>Solo visible para administradores.</CardDescription>
            </CardHeader>
            <CardContent>
              {quote.internalNotes ? (
                <p className="text-sm whitespace-pre-wrap text-muted-foreground bg-muted/50 p-3 rounded-md">{quote.internalNotes}</p>
              ) : (
                <p className="text-sm text-muted-foreground">No hay notas internas para esta solicitud.</p>
              )}
            </CardContent>
          </Card>

          {quote.status === 'respondido' && quote.adminResponse && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-primary">
                  Respuesta Enviada
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    <strong>Fecha:</strong> {quote.respondedAt ? format(new Date(quote.respondedAt), "dd MMM yyyy, HH:mm", { locale: es }) : 'N/A'}
                  </p>
                  {quote.quotedAmount && (
                      <p className="text-sm text-muted-foreground flex items-center">
                          <DollarSign className="h-4 w-4 mr-2" />
                          <strong>Monto:</strong> ${quote.quotedAmount.toLocaleString('es-CL')}
                      </p>
                  )}
                  {quote.attachmentName && (
                      <p className="text-sm text-muted-foreground flex items-center">
                          <Paperclip className="h-4 w-4 mr-2" />
                          <strong>Adjunto:</strong> {quote.attachmentName}
                      </p>
                  )}
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md w-full">
                      <p className="text-sm whitespace-pre-wrap text-green-700">{quote.adminResponse}</p>
                  </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
