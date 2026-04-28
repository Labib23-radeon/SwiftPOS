import { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { PackagePlus, Edit, Trash2 } from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const currency = JSON.parse(localStorage.getItem('pos_settings') || '{}').currency || '$';

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      toast.error('Failed to fetch products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div style={{ padding: '1rem', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}>Product Inventory</h2>
        <button className="btn btn-primary" style={{ width: 'auto' }}>
          <PackagePlus size={20} /> Add Product
        </button>
      </div>

      <div style={{ backgroundColor: 'var(--surface-color)', borderRadius: 'var(--radius-lg)', padding: '1rem', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
        {loading ? (
          <p>Loading products...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '1rem' }}>ID</th>
                <th style={{ padding: '1rem' }}>Name</th>
                <th style={{ padding: '1rem' }}>Barcode</th>
                <th style={{ padding: '1rem' }}>Category</th>
                <th style={{ padding: '1rem' }}>Price</th>
                <th style={{ padding: '1rem' }}>Stock</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No products found. Scan a barcode to add one!</td>
                </tr>
              ) : (
                products.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem' }}>{p.id}</td>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>{p.name}</td>
                    <td style={{ padding: '1rem' }}>{p.barcode}</td>
                    <td style={{ padding: '1rem' }}>{p.category || '-'}</td>
                    <td style={{ padding: '1rem', color: 'var(--primary)', fontWeight: 'bold' }}>{currency}{p.price.toFixed(2)}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '4px', 
                        backgroundColor: p.stock < 10 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: p.stock < 10 ? 'var(--danger)' : 'var(--success)'
                      }}>
                        {p.stock}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                      <button style={{ color: 'var(--primary)' }}><Edit size={18} /></button>
                      <button style={{ color: 'var(--danger)' }}><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
