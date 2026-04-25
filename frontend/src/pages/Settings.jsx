import { useState, useEffect } from 'react';
import { Save, CheckCircle } from 'lucide-react';

export default function Settings() {
  const [currency, setCurrency] = useState('$');
  const [taxRate, setTaxRate] = useState('0');
  const [storeName, setStoreName] = useState('SwiftPOS Store');
  const [receiptFooter, setReceiptFooter] = useState('Thank you for shopping with us!');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load existing settings
    const settings = JSON.parse(localStorage.getItem('pos_settings') || '{}');
    if (settings.currency) setCurrency(settings.currency);
    if (settings.taxRate !== undefined) setTaxRate(settings.taxRate.toString());
    if (settings.storeName) setStoreName(settings.storeName);
    if (settings.receiptFooter) setReceiptFooter(settings.receiptFooter);
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    const settings = {
      currency,
      taxRate: parseFloat(taxRate) || 0,
      storeName,
      receiptFooter
    };
    localStorage.setItem('pos_settings', JSON.stringify(settings));
    
    // Dispatch custom event to update other components if needed
    window.dispatchEvent(new Event('settings_updated'));

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ padding: '1rem', width: '100%', maxWidth: '800px' }}>
      <h2 style={{ margin: '0 0 2rem 0' }}>Application Settings</h2>

      <div style={{ backgroundColor: 'var(--surface-color)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label className="input-label" style={{ marginBottom: '0.5rem' }}>Store Name</label>
              <input 
                className="modal-input" 
                value={storeName} 
                onChange={e => setStoreName(e.target.value)} 
                placeholder="e.g. My Supermarket" 
                required 
              />
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Appears on receipts.</div>
            </div>

            <div>
              <label className="input-label" style={{ marginBottom: '0.5rem' }}>Currency Symbol</label>
              <input 
                className="modal-input" 
                value={currency} 
                onChange={e => setCurrency(e.target.value)} 
                placeholder="$" 
                required 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label className="input-label" style={{ marginBottom: '0.5rem' }}>Default Tax / VAT Rate (%)</label>
              <input 
                type="number" 
                step="0.01" 
                min="0"
                className="modal-input" 
                value={taxRate} 
                onChange={e => setTaxRate(e.target.value)} 
                placeholder="0" 
              />
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Will automatically apply to cart total.</div>
            </div>
          </div>

          <div>
            <label className="input-label" style={{ marginBottom: '0.5rem' }}>Receipt Footer Message</label>
            <textarea 
              className="modal-input" 
              value={receiptFooter} 
              onChange={e => setReceiptFooter(e.target.value)} 
              placeholder="Thank you for shopping!" 
              rows="3"
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>
              <Save size={20} /> Save Settings
            </button>
            {saved && (
              <div style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
                <CheckCircle size={20} /> Settings Saved Successfully!
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
