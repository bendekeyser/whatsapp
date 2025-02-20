import { initializeWhatsAppClient } from '../../lib/whatsapp';

export default async function handler(req, res) {
  const { phoneNumber } = req.query;

  if (!phoneNumber) {
    return res.status(400).json({ message: 'Missing phoneNumber' });
  }

  try {
    const { qrCodeData, isAuthenticated } = await initializeWhatsAppClient(phoneNumber);
    res.status(200).json({ qrCodeData, isAuthenticated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to initialize WhatsApp client' });
  }
}