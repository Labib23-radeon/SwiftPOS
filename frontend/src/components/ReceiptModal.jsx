import { Printer, X } from 'lucide-react';

export default function ReceiptModal({ 
  currency = '$', taxRate = 0, taxAmount = 0, subtotal = 0,
  transactionId, items, total, amountPaid, change, onClose 
}) {
  const storeName = JSON.parse(localStorage.getItem('pos_settings') || '{}').storeName || 'SWIFTPOS';
  const receiptFooter = JSON.parse(localStorage.getItem('pos_settings') || '{}').receiptFooter || 'Thank you for shopping with us!';
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '400px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }} className="no-print">
          <h2 style={{ margin: 0, color: 'var(--success)' }}>Transaction Successful</h2>
          <button onClick={onClose} style={{ cursor: 'pointer', background: 'none', border: 'none' }}>
            <X size={24} color="var(--text-secondary)" />
          </button>
        </div>

        {/* Printable Receipt Area */}
        <div className="receipt-area" style={{ backgroundColor: '#fff', color: '#000', padding: '2rem', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.9rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1rem', borderBottom: '1px dashed #ccc', paddingBottom: '1rem' }}>
            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', textTransform: 'uppercase' }}>{storeName}</h2>
            <div>123 Retail Avenue, NY 10001</div>
            <div>Tel: +1 (555) 123-4567</div>
            <div style={{ marginTop: '0.5rem' }}>Receipt #: {transactionId}</div>
            <div>Date: {new Date().toLocaleString()}</div>
          </div>

          <table style={{ width: '100%', marginBottom: '1rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px dashed #ccc' }}>
                <th style={{ textAlign: 'left', paddingBottom: '0.5rem' }}>Item</th>
                <th style={{ textAlign: 'center', paddingBottom: '0.5rem' }}>Qty</th>
                <th style={{ textAlign: 'right', paddingBottom: '0.5rem' }}>Price</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td style={{ padding: '0.25rem 0' }}>{item.name}</td>
                  <td style={{ textAlign: 'center' }}>{item.qty}</td>
                  <td style={{ textAlign: 'right' }}>{currency}{(item.price * item.qty).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ borderTop: '1px dashed #ccc', paddingTop: '1rem' }}>
            {taxRate > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span>SUBTOTAL:</span>
                <span>{currency}{subtotal.toFixed(2)}</span>
              </div>
            )}
            {taxRate > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span>TAX ({taxRate}%):</span>
                <span>{currency}{taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '1.1rem', fontWeight: 'bold' }}>
              <span>TOTAL:</span>
              <span>{currency}{total.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span>CASH:</span>
              <span>{currency}{amountPaid.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span>CHANGE:</span>
              <span>{currency}{change.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.8rem', whiteSpace: 'pre-line' }}>
            {receiptFooter}
          </div>
        </div>

        <button onClick={handlePrint} className="btn btn-primary no-print" style={{ width: '100%', marginTop: '1.5rem' }}>
          <Printer size={20} /> Print Receipt
        </button>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .receipt-area, .receipt-area * {
            visibility: visible;
          }
          .receipt-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            box-shadow: none;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
