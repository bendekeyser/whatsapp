import { NextResponse } from 'next/server';
import { initializeWhatsAppClient } from '../../../lib/whatsapp';

export const config = {
  runtime: 'edge',
  regions: ['fra1'], // Specify a single region for better performance
};

export default async function handler(request) {
  const url = new URL(request.url);
  const phoneNumber = url.searchParams.get('phoneNumber');

  if (!phoneNumber) {
    return NextResponse.json(
      { message: 'Missing phoneNumber' },
      { status: 400 }
    );
  }

  try {
    const { qrCodeData, isAuthenticated } = await initializeWhatsAppClient(phoneNumber);
    return NextResponse.json({ qrCodeData, isAuthenticated });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to initialize WhatsApp client' },
      { status: 500 }
    );
  }
}