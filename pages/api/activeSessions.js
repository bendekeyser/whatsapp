import { getActiveSessions } from '../../lib/whatsapp';

export default async function handler(req, res) {
  try {
    const activeSessions = await getActiveSessions();
    res.status(200).json(activeSessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch active sessions' });
  }
}