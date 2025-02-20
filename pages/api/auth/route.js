import { NextResponse } from 'next/server';
import { initializeWhatsAppClient } from '../../../lib/whatsapp';

export const config = {
  runtime: 'edge',
  regions: ['fra1'],
};

export default async function handler(request) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phoneNumber');

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Missing phoneNumber' },
        { status: 400 }
      );
    }

    const { qrCodeData, isAuthenticated } = await initializeWhatsAppClient(phoneNumber);
    return NextResponse.json({ qrCodeData, isAuthenticated });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize WhatsApp client' },
      { status: 500 }
    );
  }
}