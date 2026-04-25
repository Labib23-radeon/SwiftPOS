import { useState } from 'react';
import { CreditCard, Banknote, X } from 'lucide-react';

export default function CheckoutModal({ currency = '$', total, onComplete, onCancel }) {
  const [amountPaid, setAmountPaid] = useState('');

  const handlePay = (e) => {
    e.preventDefault();
    const paid = parseFloat(amountPaid);
    if (isNaN(paid) || paid < total) {
      alert('Insufficient amount paid!');
      return;
    }
    const change = paid - total;
    onComplete(paid, change);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>Complete Payment</h2>
          <button onClick={onCancel} style={{ cursor: 'pointer', background: 'none', border: 'none' }}>
            <X size={24} color="var(--text-secondary)" />
          </button>
        </div>
        
        <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', textAlign: 'center' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Amount Due</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{currency}{total.toFixed(2)}</div>
        </div>

        <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="input-label">Amount Paid ({currency})</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                <Banknote size={20} />
              </div>
              <input 
                required 
                autoFocus 
                type="number" 
                step="0.01" 
                min={total} 
                placeholder="0.00" 
                value={amountPaid} 
                onChange={e => setAmountPaid(e.target.value)} 
                className="modal-input" 
                style={{ paddingLeft: '2.5rem', fontSize: '1.2rem', fontWeight: 'bold' }}
              />
            </div>
          </div>
          
          <button type="submit" className="btn btn-success" style={{ marginTop: '1rem', padding: '1rem' }}>
            <CreditCard size={20} /> Process Payment
          </button>
        </form>
      </div>
    </div>
  );
}
