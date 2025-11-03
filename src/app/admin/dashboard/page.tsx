
'use client';

import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useMemo, startTransition } from 'react';
import { listenToQuoteRequests } from '@/lib/firebase-client';
import type { QuoteRequest, QuoteStatus } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Eye, Search, Inbox, AlertCircle, MailCheck, XCircle, ListChecks, Filter, FileDown } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import DeleteQuoteButton from '@/components/admin/DeleteQuoteButton';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';


const DashboardSkeleton = () => (
  <div className="container mx-auto py-8 space-y-6">
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
       {[...Array(5)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-6 w-6 rounded-sm" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-12" />
          </CardContent>
        </Card>
      ))}
    </div>
    <Card>
      <CardHeader className="px-7">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-80 mt-2" />
            </div>
            <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2 items-stretch">
                <Skeleton className="h-10 w-full sm:w-[300px]" />
                <Skeleton className="h-10 w-full sm:w-[180px]" />
                <Skeleton className="h-10 w-24" />
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><Skeleton className="h-5 w-20" /></TableHead>
              <TableHead><Skeleton className="h-5 w-24" /></TableHead>
              <TableHead className="hidden sm:table-cell"><Skeleton className="h-5 w-32" /></TableHead>
              <TableHead className="hidden md:table-cell"><Skeleton className="h-5 w-36" /></TableHead>
              <TableHead><Skeleton className="h-5 w-20" /></TableHead>
              <TableHead className="text-right"><Skeleton className="h-5 w-20" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-36" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                <TableCell className="text-right"><div className="flex justify-end gap-2"><Skeleton className="h-8 w-8" /><Skeleton className="h-8 w-8" /></div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
);

export default function AdminDashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();

  const [allQuoteRequests, setAllQuoteRequests] = useState<QuoteRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const searchTerm = searchParams.get('search') || '';
  const statusFilter = (searchParams.get('status') as QuoteStatus | 'todos') || 'todos';

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = listenToQuoteRequests((quotes, err) => {
        if (err) {
            setError(err);
        } else {
            setAllQuoteRequests(quotes);
        }
        if (isLoading) setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading]);

  const filteredQuoteRequests = useMemo(() => {
    return allQuoteRequests
      .filter(quote => {
        if (statusFilter === 'todos') return true;
        return quote.status === statusFilter;
      })
      .filter(quote => {
        if (!searchTerm) return true;
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        return (
          quote.name.toLowerCase().includes(lowercasedSearchTerm) ||
          quote.email.toLowerCase().includes(lowercasedSearchTerm) ||
          (quote.trackingId && quote.trackingId.toLowerCase().includes(lowercasedSearchTerm)) ||
          (quote.serviceInterest && quote.serviceInterest.toLowerCase().includes(lowercasedSearchTerm))
        );
      });
  }, [allQuoteRequests, searchTerm, statusFilter]);
  
  const stats = useMemo(() => {
    return allQuoteRequests.reduce(
      (acc, quote) => {
        acc[quote.status] = (acc[quote.status] || 0) + 1;
        acc.total = (acc.total || 0) + 1;
        return acc;
      },
      { total: 0, pendiente: 0, revisado: 0, respondido: 0, cerrado: 0 } as Record<QuoteStatus | 'total', number>
    );
  }, [allQuoteRequests]);

  const getStatusVariant = (status: QuoteStatus) => {
    switch (status) {
      case 'pendiente': return 'outline';
      case 'revisado': return 'secondary';
      case 'respondido': return 'default'; 
      case 'cerrado': return 'destructive';
      default: return 'outline';
    }
  };
  
  const getStatusIcon = (status: QuoteStatus) => {
    switch (status) {
      case 'pendiente': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'revisado': return <ListChecks className="h-4 w-4 text-blue-500" />;
      case 'respondido': return <MailCheck className="h-4 w-4 text-green-500" />;
      case 'cerrado': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Inbox className="h-4 w-4" />;
    }
  };

  const handleFilterChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const currentSearchTerm = formData.get('search') as string;
    const currentStatusFilter = formData.get('status') as string;
    const params = new URLSearchParams(searchParams);
    
    if (currentSearchTerm) {
        params.set('search', currentSearchTerm);
    } else {
        params.delete('search');
    }
    if (currentStatusFilter && currentStatusFilter !== 'todos') {
        params.set('status', currentStatusFilter);
    } else {
        params.delete('status');
    }

    startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
    });
  };
  
  const handleExportCSV = () => {
    if (filteredQuoteRequests.length === 0) return;

    const headers = [
      'ID Rastreo', 'Nombre Cliente', 'Email', 'Servicio de Interés', 
      'Fecha Solicitud', 'Estado', 'Monto Cotizado (CLP)', 'Fecha Respuesta', 'Mensaje Cliente', 'Respuesta Admin', 'Notas Internas', 'ID Documento'
    ];
    
    const escapeCsvCell = (cellData: any) => {
      if (cellData === null || cellData === undefined) {
        return '';
      }
      const stringData = String(cellData);
      if (stringData.includes(',') || stringData.includes('"') || stringData.includes('\n')) {
        return `"${stringData.replace(/"/g, '""')}"`;
      }
      return stringData;
    };

    const csvContent = [
      headers.join(','),
      ...filteredQuoteRequests.map(quote => [
        escapeCsvCell(quote.trackingId || ''),
        escapeCsvCell(quote.name),
        escapeCsvCell(quote.email),
        escapeCsvCell(quote.serviceInterest || 'No especificado'),
        escapeCsvCell(format(new Date(quote.submittedAt), "yyyy-MM-dd HH:mm:ss", { locale: es })),
        escapeCsvCell(quote.status),
        escapeCsvCell(quote.quotedAmount || ''),
        escapeCsvCell(quote.respondedAt ? format(new Date(quote.respondedAt), "yyyy-MM-dd HH:mm:ss", { locale: es }) : ''),
        escapeCsvCell(quote.message),
        escapeCsvCell(quote.adminResponse),
        escapeCsvCell(quote.internalNotes),
        escapeCsvCell(quote.id),
      ].join(','))
    ].join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `export_solicitudes_${date}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  if (isLoading || authLoading) {
    return <DashboardSkeleton />;
  }
  
  if (error) {
     return (
        <div className="container mx-auto py-8 text-center">
            <Card className="max-w-2xl mx-auto border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive flex items-center justify-center gap-2">
                        <AlertCircle className="h-6 w-6"/> Error al Cargar Datos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {error === 'PERMISSION_ERROR' ? (
                         <div className="text-left space-y-4">
                            <p className="text-lg font-semibold">Error de Permisos: Tu cuenta no tiene los privilegios necesarios para ver esta página.</p>
                            <p>Esto generalmente ocurre porque las reglas de seguridad de Firestore no están configuradas para reconocer tu cuenta (`{user?.email}`) como administrador.</p>
                            <p className="text-sm pt-2">Por favor, contacta al desarrollador para que verifique las reglas de seguridad de Firestore y añada tu UID (`{user?.uid || 'No disponible'}`) a la lista de administradores.</p>
                        </div>
                    ) : (
                        <p className="text-left">{error}</p>
                    )}
                    <Button onClick={() => window.location.reload()} variant="outline" className="mt-6">
                        Reintentar Carga
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Solicitudes</CardTitle>
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendiente}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revisadas</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.revisado}</div>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Respondidas</CardTitle>
            <MailCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.respondido}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cerradas</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cerrado}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="px-7">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                Solicitudes de Cotización
                {stats.pendiente > 0 && (
                  <Badge variant="destructive" className="ml-2 animate-pulse">
                    {stats.pendiente} Pendiente{stats.pendiente > 1 ? 's' : ''}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Visualiza, busca y gestiona todas las solicitudes de cotización recibidas.
              </CardDescription>
            </div>
            <form onSubmit={handleFilterChange} className="w-full sm:w-auto flex flex-col sm:flex-row gap-2 items-stretch">
                <div className="relative flex-grow">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        name="search"
                        placeholder="Buscar ID, nombre, email..."
                        className="pl-8 w-full sm:w-[250px] lg:w-[300px]"
                        defaultValue={searchTerm}
                    />
                </div>
                <div className="flex-grow sm:flex-grow-0">
                    <Select name="status" defaultValue={statusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                        <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder="Filtrar por estado..." />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="todos">Todos los Estados</SelectItem>
                        <SelectItem value="pendiente">Pendiente</SelectItem>
                        <SelectItem value="revisado">Revisado</SelectItem>
                        <SelectItem value="respondido">Respondido</SelectItem>
                        <SelectItem value="cerrado">Cerrado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button type="submit" variant="outline" className="w-full sm:w-auto">
                    <Search className="h-4 w-4 mr-2 sm:hidden" />
                    <span className="hidden sm:inline">Buscar/Filtrar</span>
                    <span className="sr-only">Aplicar filtros y búsqueda</span>
                </Button>
                <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={handleExportCSV} disabled={filteredQuoteRequests.length === 0}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Exportar
                </Button>
            </form>
          </div>
        </CardHeader>
        <CardContent>
          {filteredQuoteRequests.length === 0 ? (
             <div className="text-center py-12">
              <Inbox className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold text-muted-foreground">
                {searchParams.get('search') || searchParams.get('status') ? `No se encontraron solicitudes para tu búsqueda/filtro.` : "No hay solicitudes de cotización por el momento."}
              </p>
              {(searchParams.get('search') || searchParams.get('status')) && (
                <Button asChild variant="link" className="mt-2">
                  <Link href="/admin/dashboard">Limpiar búsqueda/filtros</Link>
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">ID Rastreo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden sm:table-cell">Servicio de Interés</TableHead>
                  <TableHead className="hidden md:table-cell">Fecha Solicitud</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuoteRequests.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-mono text-xs">{quote.trackingId || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="font-medium">{quote.name}</div>
                      <div className="text-xs text-muted-foreground hidden sm:block">{quote.email}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{quote.serviceInterest || 'No especificado'}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {format(new Date(quote.submittedAt), "dd MMM yyyy, HH:mm", { locale: es })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(quote.status)} className="capitalize flex items-center gap-1.5">
                        {getStatusIcon(quote.status)}
                        {quote.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button asChild variant="outline" size="sm" className="p-2">
                          <Link href={`/admin/quotes/${quote.id}`}>
                            <Eye className="h-4 w-4" />
                             <span className="sr-only">Ver</span>
                          </Link>
                        </Button>
                        <DeleteQuoteButton quoteId={quote.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    