// src/app/api/send-quote-notification/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const notificationSchema = z.object({
  newQuoteId: z.string(),
  trackingId: z.string(),
  name: z.string(),
  email: z.string(),
  serviceInterest: z.string().optional(),
  message: z.string(),
});

export async function POST(request: Request) {
  if (!ADMIN_EMAIL || !process.env.RESEND_API_KEY || !BASE_URL) {
    console.error('API Error: Server environment variables are not fully set.');
    return NextResponse.json({ success: false, message: 'Server is not configured for sending emails.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const parsed = notificationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, message: 'Invalid request body.', issues: parsed.error.issues }, { status: 400 });
    }

    const { newQuoteId, trackingId, name, email, serviceInterest, message } = parsed.data;
    const quoteLink = `${BASE_URL}/admin/quotes/${newQuoteId}`;
    
    const { data, error } = await resend.emails.send({
        from: `SmartSYS Notificaciones <onboarding@resend.dev>`,
        to: ADMIN_EMAIL,
        subject: `Nueva Solicitud de Cotización: ${trackingId}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Nueva Solicitud de Cotización Recibida</h2>
            <p>Has recibido una nueva solicitud de cotización a través del sitio web.</p>
            <hr>
            <h3>Detalles:</h3>
            <ul>
              <li><strong>ID de Rastreo:</strong> ${trackingId}</li>
              <li><strong>Nombre:</strong> ${name}</li>
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>Servicio de Interés:</strong> ${serviceInterest || 'No especificado'}</li>
            </ul>
            <h3>Mensaje:</h3>
            <p style="background-color: #f4f4f4; padding: 15px; border-radius: 5px;">${message}</p>
            <hr>
            <p>
              <a href="${quoteLink}" style="background-color: #3F51B5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Ver y Responder en el Panel
              </a>
            </p>
            <p style="font-size: 0.8em; color: #888;">Este es un mensaje automático. Por favor, no respondas a este correo.</p>
          </div>
        `,
      });

    if (error) {
      console.error(`Resend API Error for quote #${trackingId}:`, error);
      return NextResponse.json({ success: false, message: 'Failed to send email notification.', error: error.message }, { status: 500 });
    }
    
    console.log(`Email notification sent to ${ADMIN_EMAIL} for quote request #${trackingId}.`);
    return NextResponse.json({ success: true, message: 'Email sent successfully.' });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error('API Route /api/send-quote-notification Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error.', error: errorMessage }, { status: 500 });
  }
}
