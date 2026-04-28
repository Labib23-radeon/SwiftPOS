import { useState, useEffect } from 'react';
import { X, Smartphone, Wifi, ShieldCheck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../api';

export default function ScannerConnectModal({ onClose }) {
  const [localIp, setLocalIp] = useState('');
  const [tunnelUrl, setTunnelUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    api.get('/ip')
      .then(res => {
        setLocalIp(res.data.ip);
        setTunnelUrl(res.data.tunnelUrl);
      })
      .catch(err => console.error('Failed to get IP', err))
      .finally(() => setIsLoading(false));
  }, []);

  const scannerUrl = tunnelUrl ? `${tunnelUrl}/scanner` : `http://${localIp || 'localhost'}:3001/scanner`;

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
            <li>Ensure your phone is on the <strong>same Wi-Fi network</strong> as this computer.</li>
            <li>Open your phone's camera and scan the QR code above.</li>
            <li>Alternatively, type the URL directly into your mobile browser.</li>
          </ol>
        </div>

        <div style={{ backgroundColor: tunnelUrl ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', border: `1px solid ${tunnelUrl ? 'var(--success)' : 'var(--warning)'}`, padding: '1rem', borderRadius: 'var(--radius-md)', marginTop: '1rem', color: tunnelUrl ? 'var(--success)' : 'var(--warning)', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Secure Connection Active:</strong> Your connection is secured via a tunnel. This allows the mobile browser to access your camera without any complicated settings!
              {tunnelUrl && <div><br/><em>Note: The first time you visit this link, you may need to click "Click to Continue" on the security page.</em></div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
