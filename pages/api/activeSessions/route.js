import { NextResponse } from 'next/server';
import { getActiveSessions } from '../../../lib/whatsapp';

export const config = {
  runtime: 'edge',
  regions: ['fra1'],
};

export default async function handler(request) {
  try {
    const sessions = await getActiveSessions();
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Sessions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active sessions' },
      { status: 500 }
    );
  }
}