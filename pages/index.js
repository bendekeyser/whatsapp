import { useEffect, useState } from 'react';
import QRCodeDisplay from '../components/QrCodeDisplay';

export default function Home() {
  const [qrCodeData, setQrCodeData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [activeSessions, setActiveSessions] = useState([]);

  const fetchQrCode = async (phoneNumber) => {
    const response = await fetch(`/api/auth?phoneNumber=${phoneNumber}`);
    const data = await response.json();
    setQrCodeData(data.qrCodeData); // Set the QR code data
    setIsAuthenticated(data.isAuthenticated);
  };

  const fetchActiveSessions = async () => {
    const response = await fetch('/api/activeSessions');
    const data = await response.json();
    setActiveSessions(data);
  };

  useEffect(() => {
    fetchActiveSessions();
  }, []);

  const handleAddSession = () => {
    if (!phoneNumber) return;
    fetchQrCode(phoneNumber);
  };

  return (
    <div>
      <h1>WhatsApp API</h1>

      <div>
        <h2>Add New Session</h2>
        <input
          type="text"
          placeholder="Enter phone number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        <button onClick={handleAddSession}>Add Session</button>
      </div>

      {/* Display QR code if qrCodeData is available */}
      {qrCodeData && (
        <QRCodeDisplay qrCodeData={qrCodeData} isAuthenticated={isAuthenticated} />
      )}

      <div>
        <h2>Active Sessions</h2>
        <table>
          <thead>
            <tr>
              <th>ObjectId</th>
              <th>Phone Number</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {activeSessions.map((session) => (
              <tr key={session._id}>
                <td>{session._id.toString()}</td>
                <td>{session.phoneNumber}</td>
                <td>{session.isAuthenticated ? 'Connected' : 'Not Connected'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}