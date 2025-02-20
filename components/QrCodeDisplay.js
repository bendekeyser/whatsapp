import QRCode from 'react-qr-code';

export default function QrCodeDisplay({ qrCodeData, isAuthenticated }) {
  return (
    <div>
      {!isAuthenticated && qrCodeData && (
        <div>
          <h2>Scan the QR Code to Connect</h2>
          <QRCode value={qrCodeData} /> {/* Display the QR code */}
        </div>
      )}
      {isAuthenticated && <h2>Connected!</h2>}
    </div>
  );
}