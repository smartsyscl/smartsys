
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';

import { 
  addQuoteRequest, 
  getAllQuoteRequests as getAllQuotesFromDb, 
  getQuoteRequestById as getQuoteByIdFromDb, 
  updateQuoteRequest as updateQuoteInDb, 
  deleteQuoteRequest as deleteQuoteFromDb,
} from './admin-data';
import { isAdmin as checkIsAdmin } from './admin-data'; // Renamed to avoid confusion
import type { QuoteRequest, QuoteStatus } from './data';

// Resend and other email logic is now handled in /api/send-quote-notification
// to ensure environment variables are loaded correctly.

export type ContactFormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
  success: boolean;
};

const ContactFormSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, introduce un email válido." }),
  serviceInterest: z.string().optional(),
  message: z.string().min(10, { message: "El mensaje debe tener al menos 10 caracteres." }).max(500, {message: "El mensaje no puede exceder los 500 caracteres."}),
});

export async function submitContactForm(
  prevState: ContactFormState,
  data: FormData
): Promise<ContactFormState> {
  const formData = Object.fromEntries(data);
  const parsed = ContactFormSchema.safeParse(formData);

  if (!parsed.success) {
    return {
      message: "Error de validación. Por favor, revisa los campos.",
      issues: parsed.error.issues.map((issue) => issue.message),
      success: false,
    };
  }

  try {
    const dataToSave: {
      name: string;
      email: string;
      message: string;
      serviceInterest?: string;
    } = {
      name: parsed.data.name,
      email: parsed.data.email,
      message: parsed.data.message,
    };

    if (parsed.data.serviceInterest && parsed.data.serviceInterest.trim() !== "") {
      dataToSave.serviceInterest = parsed.data.serviceInterest;
    }
    
    // Step 1: Save the quote request to the database
    const { id: newQuoteId, trackingId } = await addQuoteRequest(dataToSave);
    
    // Step 2: Trigger the email notification via the new API route
    try {
        const emailPayload = {
            ...dataToSave,
            newQuoteId,
            trackingId,
        };
        // We do not await this call to avoid making the user wait.
        // It's a "fire and forget" notification.
        fetch(new URL('/api/send-quote-notification', process.env.NEXT_PUBLIC_BASE_URL), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailPayload),
        });
        console.log(`Triggered email notification for quote ${trackingId}.`);
    } catch (apiError) {
        // Log the error but don't block the user's success message
        console.error(`Failed to trigger email API for quote ${trackingId}:`, apiError);
    }

    revalidatePath('/'); 
    
    return {
      message: "¡Gracias! Tu mensaje ha sido enviado. Nos pondremos en contacto contigo pronto.",
      success: true,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Ocurrió un error desconocido";
    console.error('Error submitting contact form:', error);
    return {
      message: `Hubo un error al procesar tu solicitud: ${errorMessage}. Revisa las reglas de seguridad de Firestore.`,
      success: false,
    };
  }
}

export async function getAllQuoteRequests(userId: string | undefined): Promise<QuoteRequest[]> {
   if (!userId) {
    throw new Error('PERMISSION_ERROR: User not authenticated.');
  }
  const userIsAdmin = await checkIsAdmin(userId);
  if (!userIsAdmin) {
    console.error(`Permission denied: User ${userId} is not an admin.`);
    throw new Error('PERMISSION_ERROR: User does not have sufficient permissions to view quote requests.');
  }
  return getAllQuotesFromDb(userId);
}

export async function getQuoteRequestById(id: string): Promise<QuoteRequest | undefined> {
  return getQuoteByIdFromDb(id);
}

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

export type QuoteResponseFormState = {
  message: string;
  issues?: string[];
  success: boolean;
  quoteId?: string;
};

export async function submitQuoteResponse(
  prevState: QuoteResponseFormState,
  data: FormData
): Promise<QuoteResponseFormState> {
  const formData = Object.fromEntries(data);
  const parsed = QuoteResponseSchema.safeParse(formData);

  if (!parsed.success) {
    return {
      message: "Error de validación. Por favor, revisa los campos.",
      issues: parsed.error.issues.map((issue) => issue.message),
      success: false,
      quoteId: formData.id as string,
    };
  }
  
  // Security Check: Verify user is an admin before proceeding
  const userIsAdmin = await checkIsAdmin(parsed.data.userId);
  if (!userIsAdmin) {
      return {
          message: "Error de permisos: Esta acción requiere privilegios de administrador.",
          success: false,
          quoteId: parsed.data.id,
      };
  }

  try {
    const updatePayload: Partial<Omit<QuoteRequest, 'id' | 'submittedAt' | 'respondedAt'>> = {
      adminResponse: parsed.data.adminResponse,
      quotedAmount: parsed.data.quotedAmount,
      attachmentName: parsed.data.attachmentName,
      status: parsed.data.status,
      internalNotes: parsed.data.internalNotes,
    };
    
    const updatedQuote = await updateQuoteInDb(parsed.data.id, updatePayload);

    if (!updatedQuote) {
      return {
        message: "Error: No se encontró la cotización para actualizar.",
        success: false,
        quoteId: parsed.data.id,
      };
    }
    
    // --- NOTIFICACIÓN AL CLIENTE ---
    // Esta sección está deshabilitada porque no se ha verificado un dominio en Resend.
    // Para activarla, es necesario verificar un dominio en la cuenta de Resend.
    if (parsed.data.status === 'respondido') {
      console.log(`--- SIMULACIÓN DE CORREO AL CLIENTE ---
      Motivo: El envío de correos a clientes está deshabilitado porque no hay un dominio verificado en Resend.
      Destinatario: ${updatedQuote.email}
      Contenido: ${parsed.data.adminResponse}
      --- FIN SIMULACIÓN ---
      `);
    }

    revalidatePath(`/admin/quotes/${parsed.data.id}`);
    revalidatePath(`/admin/dashboard`);
    return {
      message: "Respuesta guardada y cotización actualizada exitosamente.",
      success: true,
      quoteId: parsed.data.id,
    };
  } catch (error) {
    console.error('Error submitting quote response:', error);
    return {
      message: "Error al guardar la respuesta. Por favor, intenta nuevamente.",
      success: false,
      quoteId: parsed.data.id,
    };
  }
}

export type DeleteQuoteFormState = {
  message: string;
  success: boolean;
  issues?: string[];
};

export async function deleteQuoteRequestAction(
  prevState: DeleteQuoteFormState,
  data: FormData
): Promise<DeleteQuoteFormState> {
  const quoteId = data.get('id') as string;
  const userId = data.get('userId') as string;

  if (!quoteId || !userId) {
    return { message: "ID de cotización o de usuario no proporcionado.", success: false };
  }

  // Security Check: Verify user is an admin
  const userIsAdmin = await checkIsAdmin(userId);
  if (!userIsAdmin) {
    return { message: "Error de permisos: No autorizado para eliminar.", success: false };
  }

  try {
    await deleteQuoteFromDb(quoteId);
    revalidatePath(`/admin/dashboard`); 
    return {
      message: "Solicitud de cotización eliminada exitosamente.",
      success: true,
    };
  } catch (error) {
    console.error('Error deleting quote request:', error);
    return {
      message: "Error al eliminar la solicitud. Por favor, intenta nuevamente.",
      success: false,
    };
  }
}
