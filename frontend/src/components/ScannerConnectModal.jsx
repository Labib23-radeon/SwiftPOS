import { useState, useEffect } from 'react';
import { X, Smartphone, Wifi, AlertTriangle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';

export default function ScannerConnectModal({ onClose }) {
  const [localIp, setLocalIp] = useState('');
  
  useEffect(() => {
    axios.get('http://localhost:3001/api/ip')
      .then(res => setLocalIp(res.data.ip))
      .catch(err => console.error('Failed to get IP', err));
  }, []);

  const scannerUrl = `http://${localIp || 'localhost'}:3001/scanner`;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Smartphone size={24} /> Connect Mobile Scanner
          </h2>
          <button onClick={onClose} style={{ cursor: 'pointer', background: 'none', border: 'none' }}>
            <X size={24} color="var(--text-secondary)" />
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ background: '#fff', padding: '1rem', borderRadius: '12px', display: 'inline-block', marginBottom: '1rem' }}>
            {localIp ? (
              <QRCodeSVG value={scannerUrl} size={200} />
            ) : (
              <div style={{ width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', color: '#000' }}>Loading...</div>
            )}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
            {scannerUrl}
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <h3 style={{ marginTop: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Wifi size={18} /> How to connect:
          </h3>
          <ol style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Ensure your phone is on the <strong>same Wi-Fi network</strong> as this computer.</li>
            <li>Open your phone's camera and scan the QR code above.</li>
            <li>Alternatively, type the URL directly into your mobile browser.</li>
          </ol>
        </div>

        <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--warning)', padding: '1rem', borderRadius: 'var(--radius-md)', marginTop: '1rem', color: 'var(--warning)', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Camera Permission Note:</strong> Modern phone browsers block camera access on non-secure (HTTP) connections. <br/>
              To fix this on Android Chrome: go to <code>chrome://flags/#unsafely-treat-insecure-origin-as-secure</code> on your phone, add <code>{scannerUrl}</code> to the list, enable it, and restart your browser!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
