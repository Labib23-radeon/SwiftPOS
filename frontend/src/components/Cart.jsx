import { useState, useEffect } from 'react';
import { Trash2, ShoppingBag } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';
import CheckoutModal from './CheckoutModal';
import ReceiptModal from './ReceiptModal';

export default function Cart({ items, setItems }) {
  const [showCheckout, setShowCheckout] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  // Settings
  const [currency, setCurrency] = useState('$');
  const [taxRate, setTaxRate] = useState(0);

  useEffect(() => {
    const loadSettings = () => {
      const s = JSON.parse(localStorage.getItem('pos_settings') || '{}');
      setCurrency(s.currency || '$');
      setTaxRate(s.taxRate || 0);
    };
    loadSettings();
    window.addEventListener('settings_updated', loadSettings);
    return () => window.removeEventListener('settings_updated', loadSettings);
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  const handleCheckoutComplete = async (amountPaid, change) => {
    setIsProcessing(true);
    try {
      const payload = {
        total,
        discount: 0,
        vat: taxAmount,
        amount_paid: amountPaid,
        change,
        items: items.map(i => ({ id: i.id, quantity: i.qty, price: i.price }))
      };
      const res = await api.post('/checkout', payload);
      
      setShowCheckout(false);
      setReceiptData({
        transactionId: res.data.transactionId,
        items: [...items],
        total,
        amountPaid,
        change
      });
      setItems([]); // Clear cart
      toast.success('Checkout completed successfully');
    } catch (err) {
      toast.error('Checkout failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsProcessing(false);
    }
  };

  const updateQty = (id, delta) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  const remove = (id) => {
    setItems(items.filter(i => i.id !== id));
  };

  return (
    <div className="cart-panel">
      <div className="cart-header" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1.5rem', backgroundColor: 'rgba(59, 130, 246, 0.05)' }}>
        <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
          <ShoppingBag size={20} />
        </div>
        Current Order
      </div>
      
      <div className="cart-items">
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', opacity: 0.7 }}>
            <ShoppingBag size={48} />
            <div>Your cart is empty.<br/>Scan a barcode or select a product.</div>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-info">
                <div className="cart-item-name">{item.name}</div>
                <div className="cart-item-price">{currency}{item.price.toFixed(2)} x {item.qty}</div>
              </div>
              <div className="cart-item-qty">
                <button onClick={() => updateQty(item.id, -1)}>-</button>
                <span style={{ minWidth: '20px', textAlign: 'center', fontSize: '0.9rem', fontWeight: '600' }}>{item.qty}</span>
                <button onClick={() => updateQty(item.id, 1)}>+</button>
                <button onClick={() => remove(item.id)} style={{ color: 'var(--danger)', marginLeft: '0.2rem', background: 'transparent' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="cart-footer">
        {taxRate > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            <span>Subtotal:</span>
            <span>{currency}{subtotal.toFixed(2)}</span>
          </div>
        )}
        {taxRate > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            <span>Tax ({taxRate}%):</span>
            <span>{currency}{taxAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="cart-total">
          <span>Total:</span>
          <span>{currency}{total.toFixed(2)}</span>
        </div>
        <button 
          className="btn btn-success" 
          onClick={() => setShowCheckout(true)}
          disabled={items.length === 0 || isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Checkout'}
        </button>
      </div>

      {showCheckout && (
        <CheckoutModal 
          currency={currency}
          total={total}
          onComplete={handleCheckoutComplete}
          onCancel={() => setShowCheckout(false)}
        />
      )}

      {receiptData && (
        <ReceiptModal
          currency={currency}
          taxRate={taxRate}
          taxAmount={taxAmount}
          subtotal={subtotal}
          {...receiptData}
          onClose={() => setReceiptData(null)}
        />
      )}
    </div>
  );
}
