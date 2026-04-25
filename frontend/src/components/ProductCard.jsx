export default function ProductCard({ product, onClick }) {
  const currency = JSON.parse(localStorage.getItem('pos_settings') || '{}').currency || '$';
  
  return (
    <div className="product-card" onClick={onClick}>
      <div className="product-image" style={{ fontSize: '3rem' }}>
        {product.image || '📦'}
      </div>
      <div>
        <div className="product-title">{product.name}</div>
        <div className="product-price">{currency}{product.price.toFixed(2)}</div>
      </div>
    </div>
  );
}
