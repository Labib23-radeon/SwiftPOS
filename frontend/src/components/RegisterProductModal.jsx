import { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

export default function RegisterProductModal({ barcode, onClose, onRegister }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('10');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price) return;
    setLoading(true);
    try {
      const resp = await axios.post('http://localhost:3001/api/products', {
        name, 
        barcode, 
        price: parseFloat(price), 
        category, 
        stock: parseInt(stock, 10)
      });
      onRegister(resp.data);
    } catch (err) {
      alert('Error registering product: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>Register New Product</h2>
          <button onClick={onClose} style={{ cursor: 'pointer', background: 'none', border: 'none' }}>
            <X size={24} color="var(--text-secondary)" />
          </button>
        </div>
        <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Barcode scanned: <strong style={{color: 'var(--text-primary)'}}>{barcode}</strong> was not found in the database. Please add its details to register and add to cart.
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="input-label">Product Name</label>
            <input required autoFocus placeholder="e.g. Organic Apples" value={name} onChange={e => setName(e.target.value)} className="modal-input" />
          </div>
          <div>
            <label className="input-label">Price ($)</label>
            <input required type="number" step="0.01" min="0" placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)} className="modal-input" />
          </div>
          <div>
            <label className="input-label">Category (Optional)</label>
            <input placeholder="e.g. Fruits" value={category} onChange={e => setCategory(e.target.value)} className="modal-input" />
          </div>
          <div>
            <label className="input-label">Initial Stock</label>
            <input required type="number" min="0" placeholder="10" value={stock} onChange={e => setStock(e.target.value)} className="modal-input" />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            {loading ? 'Saving...' : 'Register & Add to Cart'}
          </button>
        </form>
      </div>
    </div>
  );
}
