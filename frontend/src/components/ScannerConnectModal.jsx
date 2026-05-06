import { useState, useEffect } from 'react';
import { X, Smartphone, Wifi, ShieldCheck, AlertTriangle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../api';

export default function ScannerConnectModal({ onClose }) {
  const [localIp, setLocalIp] = useState('');
  const [httpsPort, setHttpsPort] = useState(3002);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    api.get('/ip')
      .then(res => {
        setLocalIp(res.data.ip);
        if (res.data.httpsPort) setHttpsPort(res.data.httpsPort);
      })
      .catch(err => console.error('Failed to get IP', err))
      .finally(() => setIsLoading(false));
  }, []);

  const scannerUrl = `https://${localIp || 'localhost'}:${httpsPort}/scanner`;

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
            {!isLoading ? (
              <QRCodeSVG value={scannerUrl} size={200} />
            ) : (
              <div style={{ width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', color: '#000' }}>Loading...</div>
            )}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
            {isLoading ? 'Connecting...' : scannerUrl}
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <h3 style={{ marginTop: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Wifi size={18} /> How to connect:
          </h3>
          <ol style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Ensure your phone is on the <strong>same Wi-Fi network</strong>.</li>
            <li>Scan the QR code with your phone's camera.</li>
            <li>If the site can't be reached, run <strong>fix-firewall.bat</strong> in the project folder as Administrator.</li>
          </ol>
        </div>

        <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--warning)', padding: '1rem', borderRadius: 'var(--radius-md)', marginTop: '1rem', color: 'var(--warning)', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Security Warning Notice:</strong><br/>
              Because this app runs locally, your phone browser will show a "Your connection is not private" warning.
              <br/><br/>
              <strong>To fix this:</strong> Click <strong>Advanced</strong> -&gt; <strong>Proceed to 192.168... (unsafe)</strong>. This allows the camera to work perfectly!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
