
'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { deleteQuoteRequestAction } from '@/lib/actions';
import { useAuth } from '@/context/AuthContext';

interface DeleteQuoteButtonProps {
  quoteId: string;
}

export default function DeleteQuoteButton({ quoteId }: DeleteQuoteButtonProps) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleDeleteConfirm = async () => {
    if (!user) {
        toast({
            title: 'Error de Autenticación',
            description: 'No estás autenticado. Por favor, inicia sesión de nuevo.',
            variant: 'destructive',
        });
        return;
    }

    setIsDeleting(true);
    const formData = new FormData();
    formData.append('id', quoteId);
    formData.append('userId', user.uid);

    const result = await deleteQuoteRequestAction({ success: false, message: '' }, formData);

    if (result.success) {
      toast({
        title: 'Éxito',
        description: result.message,
        variant: 'default',
        action: <CheckCircle className="text-green-500" />,
      });
    } else {
      toast({
        title: 'Error',
        description: result.message,
        variant: 'destructive',
        action: <AlertTriangle className="text-red-500" />,
      });
    }

    setIsDeleting(false);
    setIsAlertOpen(false);
  };

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setIsAlertOpen(true)}
        className="p-2" // Ensure padding for icon-only button
        disabled={isDeleting}
      >
        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        <span className="sr-only">Eliminar</span>
      </Button>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la solicitud de cotización.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Eliminando...</> : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
