import { Plus } from 'lucide-react';

export default function ProductCard({ product, onClick }) {
  const currency = JSON.parse(localStorage.getItem('pos_settings') || '{}').currency || '$';

  return (
    <div className="product-card" onClick={onClick}>
      <div className="product-image" style={{ fontSize: '3rem', position: 'relative' }}>
        {product.image || '📦'}
        <div className="product-add-overlay">
          <Plus size={32} />
        </div>
      </div>
      <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <div className="product-title" style={{ marginTop: 0 }}>{product.name}</div>
        <div className="product-price">{currency}{product.price.toFixed(2)}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Stock: <span style={{ color: product.stock > 10 ? 'var(--success)' : 'var(--danger)' }}>{product.stock || 0}</span>
        </div>
      </div>
    </div>
  );
}
