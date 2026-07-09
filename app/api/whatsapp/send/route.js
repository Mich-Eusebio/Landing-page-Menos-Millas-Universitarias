import { NextResponse } from 'next/server';
import { sendRifaConfirmation } from '@/lib/apis/WhatsAppService';

export async function POST(request) {
  try {
    const body = await request.json();
    const { nombre, telefono, plan, ticketsPremium, ticketsGeneral, submissionId } = body;

    if (!nombre || !telefono || !plan) {
      return NextResponse.json(
        { success: false, error: 'Datos incompletos' },
        { status: 400 }
      );
    }

    const result = await sendRifaConfirmation({
      nombre,
      telefono,
      plan,
      ticketsPremium: ticketsPremium || [],
      ticketsGeneral: ticketsGeneral || [],
      submissionId
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error en API WhatsApp:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
