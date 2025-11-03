
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import SmartSysLogo from '@/components/logo/SmartSysLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { FileSignature, PlusCircle, Trash2, Printer, User, Clipboard, DollarSign, FileText } from 'lucide-react';


const quoteItemSchema = z.object({
  title: z.string().min(1, 'El título es requerido.'),
  description: z.string().optional(),
  price: z.preprocess(
    (val) => {
      const cleaned = String(val ?? '').replace(/\D/g, '');
      if (cleaned === '') return undefined;
      return Number(cleaned);
    },
    z.number().min(0, 'El precio no puede ser negativo.').optional()
  ),
});

const quoteFormSchema = z.object({
  clientName: z.string().min(1, 'El nombre del cliente es requerido.'),
  projectName: z.string().min(1, 'El nombre del proyecto es requerido.'),
  items: z.array(quoteItemSchema).min(1, 'Debe haber al menos un ítem.'),
  terms: z.string().optional(),
});

type QuoteFormData = z.infer<typeof quoteFormSchema>;

const defaultTerms = `* VALOR TOTAL NO INCLUYE SERVICIOS EXTERNOS QUE PAGA EL CLIENTE (ej. Google Ads, licencias de software de terceros).
* PARA APROBAR LA COTIZACIÓN SE DEBE ABONAR EL 50% DEL TOTAL.
* COTIZACIÓN VÁLIDA POR 20 DÍAS DESDE SU EMISIÓN.`;


export default function QuoteGeneratorPage() {
  const form = useForm<QuoteFormData>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      clientName: '',
      projectName: '',
      items: [
        { title: '', description: '', price: undefined },
      ],
      terms: defaultTerms,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const watchedItems = form.watch('items');
  const watchedClientName = form.watch('clientName');
  const watchedProjectName = form.watch('projectName');
  const watchedTerms = form.watch('terms');
  
  const total = watchedItems.reduce((acc, item) => acc + (Number(item.price) || 0), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col items-center gap-12">
        {/* --- FORM CONTROLS (NO-PRINT) --- */}
        <div className="w-full max-w-4xl no-print space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <FileSignature className="h-6 w-6 text-primary" />
                Generador de Presupuestos
              </CardTitle>
              <CardDescription>
                Completa los campos para generar un presupuesto. El documento de abajo se actualizará en tiempo real.
              </CardDescription>
            </CardHeader>
          </Card>

          <Form {...form}>
            <form className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-muted-foreground"/>Información del Cliente y Proyecto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="clientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Cliente</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre del cliente o empresa" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="projectName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Proyecto/Presupuesto</FormLabel>
                        <FormControl>
                          <Input placeholder="Título del presupuesto" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Clipboard className="h-5 w-5 text-muted-foreground"/>Ítems del Presupuesto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-md space-y-3 relative bg-background">
                       <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-7 w-7"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Eliminar Ítem</span>
                        </Button>
                      <FormField
                        control={form.control}
                        name={`items.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Título del Ítem</FormLabel>
                            <FormControl><Input placeholder="Ej: Desarrollo de Plataforma Web" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.description`}
                        render={({ field }) => (
                           <FormItem>
                            <FormLabel>Descripción Detallada</FormLabel>
                            <FormDescription className="text-xs mb-2">
                              Use HTML para formatear: &lt;b&gt;Negrita&lt;/b&gt;, &lt;u&gt;Subrayado&lt;/u&gt;, &lt;ul&gt;&lt;li&gt;Lista&lt;/li&gt;&lt;/ul&gt;.
                            </FormDescription>
                             <FormControl>
                                <Textarea 
                                  placeholder="Describe los detalles del ítem aquí..."
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
                        name={`items.${index}.price`}
                        render={({ field: { onChange, onBlur, ...restField } }) => (
                          <FormItem>
                            <FormLabel>Precio (CLP)</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                inputMode="numeric"
                                placeholder="1.550.000"
                                {...restField}
                                onBlur={(e) => {
                                   const value = e.target.value;
                                   const numericString = value.replace(/\D/g, '');
                                   const numericValue = numericString === '' ? undefined : parseInt(numericString, 10);
                                   if (numericValue !== undefined && !isNaN(numericValue)) {
                                       e.target.value = new Intl.NumberFormat('es-CL').format(numericValue);
                                   } else {
                                       e.target.value = ''; // Clear if not a valid number
                                   }
                                   onBlur(); // Propagate blur event
                                }}
                                onChange={(e) => {
                                  const numericString = e.target.value.replace(/\D/g, '');
                                  if (numericString === '') {
                                    onChange(undefined);
                                  } else {
                                    const numericValue = parseInt(numericString, 10);
                                    onChange(isNaN(numericValue) ? undefined : numericValue);
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({ title: '', description: '', price: undefined })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Ítem
                  </Button>
                </CardContent>
              </Card>
              
               <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-muted-foreground"/>Términos y Condiciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="terms"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl><Textarea rows={4} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
               <Button onClick={handlePrint} className="w-full text-lg py-6 sticky bottom-4">
                <Printer className="mr-2 h-5 w-5" />
                Imprimir / Guardar como PDF
              </Button>
            </form>
          </Form>
        </div>

        {/* --- DOCUMENT PREVIEW (PRINTABLE) --- */}
        <div className="w-full printable-area">
          <div className="bg-card shadow-xl rounded-lg border p-8 lg:p-12 mx-auto" style={{ width: '210mm', minHeight: '297mm', fontFamily: 'sans-serif' }}>
            <header className="flex justify-between items-start mb-12">
              <SmartSysLogo className="h-auto" width="150"/>
              <div className="text-right">
                <h1 className="text-3xl font-bold text-primary">PRESUPUESTO</h1>
                <p className="text-muted-foreground">Fecha: {format(new Date(), "dd 'de' MMMM, yyyy", { locale: es })}</p>
              </div>
            </header>
            
            <section>
               <h2 className="text-xl font-semibold mb-2">{watchedProjectName || '[Nombre del Proyecto]'}</h2>
               <p><span className="font-semibold text-muted-foreground">Cliente:</span> {watchedClientName || '[Nombre del Cliente]'}</p>
            </section>

            <Separator className="my-8" />
            
            <section>
              <h3 className="text-lg font-semibold pb-2 mb-4 text-primary">SERVICIOS SOLICITADOS</h3>
              <div className="space-y-6">
                {watchedItems.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="font-semibold text-base break-words">{item.title || '[Título del Ítem]'}</h4>
                      <p className="font-semibold text-base whitespace-nowrap pl-4">{formatCurrency(Number(item.price) || 0)}</p>
                    </div>
                     <div 
                      className="text-sm text-muted-foreground mt-1 ml-2 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: item.description?.replace(/\n/g, '<br />') || '' }} 
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-12">
              <div className="flex justify-end">
                <div className="w-full max-w-xs">
                  <Separator />
                  <div className="flex justify-between items-center py-4">
                    <span className="text-xl font-bold">Total</span>
                    <span className="text-xl font-bold text-primary">{formatCurrency(total)}</span>
                  </div>
                  <Separator />
                </div>
              </div>
            </section>
            
            <footer className="mt-auto pt-12">
              <div className="text-center text-xs text-muted-foreground whitespace-pre-wrap">
                {watchedTerms}
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}

    