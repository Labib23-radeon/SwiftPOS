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
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700' }}>Product Inventory</h2>
          <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Manage your store's products and stock levels</p>
        </div>
        <button className="btn btn-primary" style={{ width: 'auto' }}>
          <PackagePlus size={20} /> Add Product
        </button>
      </div>

      <div style={{ backgroundColor: 'var(--surface-color)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', overflowX: 'auto', boxShadow: 'var(--shadow-sm)' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading products...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '1.2rem 1.5rem', fontWeight: '600' }}>ID</th>
                <th style={{ padding: '1.2rem 1.5rem', fontWeight: '600' }}>Name</th>
                <th style={{ padding: '1.2rem 1.5rem', fontWeight: '600' }}>Barcode</th>
                <th style={{ padding: '1.2rem 1.5rem', fontWeight: '600' }}>Category</th>
                <th style={{ padding: '1.2rem 1.5rem', fontWeight: '600' }}>Price</th>
                <th style={{ padding: '1.2rem 1.5rem', fontWeight: '600' }}>Stock</th>
                <th style={{ padding: '1.2rem 1.5rem', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No products found. Scan a barcode to add one!</td>
                </tr>
              ) : (
                products.map((p, index) => (
                  <tr key={p.id} style={{ 
                    borderBottom: index === products.length - 1 ? 'none' : '1px solid var(--border-color)',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>#{p.id}</td>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: '600', color: 'var(--text-primary)' }}>{p.name}</td>
                    <td style={{ padding: '1rem 1.5rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{p.barcode}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ backgroundColor: 'var(--bg-color)', padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                        {p.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>{currency}{p.price.toFixed(2)}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ 
                        padding: '0.3rem 0.8rem', 
                        borderRadius: 'var(--radius-full)', 
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        backgroundColor: p.stock < 10 ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: p.stock < 10 ? 'var(--danger)' : 'var(--success)'
                      }}>
                        {p.stock}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', display: 'flex', gap: '0.5rem' }}>
                      <button style={{ color: 'var(--primary)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(59, 130, 246, 0.1)', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}><Edit size={16} /></button>
                      <button style={{ color: 'var(--danger)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(244, 63, 94, 0.1)', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}><Trash2 size={16} /></button>
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
