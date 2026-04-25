import { Search, Sun, Moon, ScanLine } from 'lucide-react';
import { useState } from 'react';
import ScannerConnectModal from './ScannerConnectModal';

export default function Navbar({ theme, toggleTheme }) {
  const [showScannerModal, setShowScannerModal] = useState(false);

  return (
    <>
      <div className="navbar">
        <div className="search-bar">
          <Search size={20} color="var(--text-secondary)" />
          <input type="text" placeholder="Search products or scan barcode..." />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn" onClick={() => setShowScannerModal(true)} style={{ padding: '0.5rem 1rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)' }}>
            <ScanLine size={20} /> Connect Scanner
          </button>
          <button onClick={toggleTheme} style={{ color: 'var(--text-primary)' }}>
            {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>
      </div>
      
      {showScannerModal && <ScannerConnectModal onClose={() => setShowScannerModal(false)} />}
    </>
  );
}
