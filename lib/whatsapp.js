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
      authStrategy: new LocalAuth({ clientId: phoneNumber }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-features=IsolateOrigins',
          '--disable-site-isolation-trials',
          '--disable-features=site-per-process',
          '--allow-insecure-localhost',
          '--disable-web-security'
        ],
        defaultViewport: null,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
        ignoreHTTPSErrors: true
      },
      authTimeoutMs: 300000,
    });

    let qrCodeData = null;
    let isAuthenticated = false;
    let authTimeout;

    // Event: QR code generated
    whatsappClient.on('qr', (qr) => {
      qrCodeData = qr;
      isAuthenticated = false;
      console.log(`QR code generated for ${phoneNumber}`);
      
      // Reset authentication timeout when new QR code is generated
      if (authTimeout) clearTimeout(authTimeout);
      authTimeout = setTimeout(async () => {
        if (!isAuthenticated) {
          console.log(`Authentication timeout for ${phoneNumber}`);
          await whatsappClient.destroy();
          sessions.delete(phoneNumber);
        }
      }, 300000); // 5 minutes timeout
    });

    // Event: Authenticated
    whatsappClient.on('authenticated', async () => {
      if (authTimeout) clearTimeout(authTimeout);
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
      
      // Clean up the session from memory
      sessions.delete(phoneNumber);

      try {
        // Remove session from MongoDB
        await sessionCollection.deleteOne({ phoneNumber });
        console.log(`Session removed from database for ${phoneNumber}`);
      } catch (dbError) {
        console.error(`Error removing session from database for ${phoneNumber}:`, dbError);
      }

      // Destroy the client instance
      try {
        await whatsappClient.destroy();
        console.log(`WhatsApp client destroyed for ${phoneNumber}`);
      } catch (destroyError) {
        console.error(`Error destroying WhatsApp client for ${phoneNumber}:`, destroyError);
      }
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