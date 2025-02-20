import { Client, LocalAuth } from 'whatsapp-web.js';
import { connectToDatabase } from './mongo';
import { ObjectId } from 'mongodb';

// Map to store active WhatsApp clients
const sessions = new Map();

export async function initializeWhatsAppClient(phoneNumber) {
  try {
    // Check if the session already exists
    if (sessions.has(phoneNumber)) {
      console.log(`Session already exists for ${phoneNumber}`);
      return sessions.get(phoneNumber);
    }

    // Connect to MongoDB
    const db = await connectToDatabase();
    const sessionCollection = db.collection('sessions');

    // Generate a new ObjectId for the session
    const sessionId = new ObjectId();

    // Initialize the WhatsApp client
    const whatsappClient = new Client({
      authStrategy: new LocalAuth({ clientId: phoneNumber }), // Unique session ID
      puppeteer: { headless: true }, // Run in headless mode
    });

    let qrCodeData = null;
    let isAuthenticated = false;

    // Event: QR code generated
    whatsappClient.on('qr', (qr) => {
      qrCodeData = qr;
      isAuthenticated = false;
      console.log(`QR code generated for ${phoneNumber}`);
    });

    // Event: Authenticated
    whatsappClient.on('authenticated', async () => {
      qrCodeData = null;
      isAuthenticated = true;
      console.log(`Authenticated for ${phoneNumber}`);

      // Save session to MongoDB
      await sessionCollection.insertOne({
        _id: sessionId,
        phoneNumber,
        isAuthenticated,
        createdAt: new Date(),
      });
    });

    // Event: Client is ready
    whatsappClient.on('ready', () => {
      console.log(`Client is ready for ${phoneNumber}`);
    });

    // Event: Client disconnected
    whatsappClient.on('disconnected', async (reason) => {
      console.log(`Client disconnected for ${phoneNumber}. Reason: ${reason}`);
      sessions.delete(phoneNumber);

      // Remove session from MongoDB
      await sessionCollection.deleteOne({ _id: sessionId });
    });

    // Initialize the WhatsApp client
    await whatsappClient.initialize();

    // Store the session in the Map
    sessions.set(phoneNumber, { whatsappClient, qrCodeData, isAuthenticated, sessionId });

    return { whatsappClient, qrCodeData, isAuthenticated, sessionId };
  } catch (error) {
    console.error(`Error initializing WhatsApp client for ${phoneNumber}:`, error);
    throw error;
  }
}

export async function getActiveSessions() {
  try {
    // Connect to MongoDB
    const db = await connectToDatabase();
    const sessionCollection = db.collection('sessions');

    // Fetch all sessions from MongoDB
    const sessions = await sessionCollection.find({}).toArray();

    // Return sessions with required fields
    return sessions.map((session) => ({
      _id: session._id, // Include the ObjectId
      phoneNumber: session.phoneNumber,
      isAuthenticated: session.isAuthenticated,
    }));
  } catch (error) {
    console.error('Error fetching active sessions:', error);
    throw error;
  }
}