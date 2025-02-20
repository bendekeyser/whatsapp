import { initializeWhatsAppClient } from '../../lib/whatsapp';
import apiKeyMiddleware from '../../middleware/apiKeyMiddleware';

async function sendMessageHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { senderPhoneNumber, recipientPhoneNumber, message } = req.body;

  if (!senderPhoneNumber || !recipientPhoneNumber || !message) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const { whatsappClient } = await initializeWhatsAppClient(senderPhoneNumber);
    const chatId = `${recipientPhoneNumber}@c.us`;
    await whatsappClient.sendMessage(chatId, message);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
}

export default apiKeyMiddleware(sendMessageHandler);