import { useEffect, useState } from 'react';
import QRCodeDisplay from '../components/QrCodeDisplay';

export default function Home() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('isAdminAuthenticated') === 'true';
    }
    return false;
  });
  const [password, setPassword] = useState('');
  const [qrCodeData, setQrCodeData] = useState(null);
  const [isWhatsAppAuthenticated, setIsWhatsAppAuthenticated] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [activeSessions, setActiveSessions] = useState([]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('isAdminAuthenticated', 'true');
    } else {
      alert('Invalid password');
    }
  };

  // Add logout functionality
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAdminAuthenticated');
  };

  const fetchQrCode = async (phoneNumber) => {
    const response = await fetch(`/api/auth?phoneNumber=${phoneNumber}`);
    const data = await response.json();
    setQrCodeData(data.qrCodeData);
    setIsWhatsAppAuthenticated(data.isAuthenticated);
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

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">WhatsApp API Login</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            type="submit"
            className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition-colors font-medium"
          >
            Login
          </button>
        </form>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">WhatsApp API Dashboard</h1>
            <button 
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Add New Session</h2>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Enter phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                onClick={handleAddSession}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Add Session
              </button>
            </div>
          </div>

          {qrCodeData && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <QRCodeDisplay 
                qrCodeData={qrCodeData} 
                isAuthenticated={isWhatsAppAuthenticated} 
              />
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Active Sessions</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">Phone Number</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activeSessions.map((session) => (
                    <tr key={session._id} className="border-t">
                      <td className="px-4 py-2 text-sm text-gray-600">{session._id.toString()}</td>
                      <td className="px-4 py-2">{session.phoneNumber}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          session.isAuthenticated 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {session.isAuthenticated ? 'Connected' : 'Not Connected'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}