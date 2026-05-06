import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Toaster, toast } from 'react-hot-toast';
import api from './api';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Cart from './components/Cart';
import ProductCard from './components/ProductCard';
import RegisterProductModal from './components/RegisterProductModal';
import Products from './pages/Products';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import './App.css';

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [cartItems, setCartItems] = useState([]);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      toast.error('Failed to load products from database');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addToCart = useCallback((product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  }, []);

  useEffect(() => {
    const socket = io('http://localhost:3001');
    socket.on('pos_barcode', async (data) => {
      try {
        const res = await api.get(`/products/${data.barcode}`);
        addToCart(res.data);
        toast.success(`Added ${res.data.name} to cart`);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setScannedBarcode(data.barcode);
          setShowRegisterModal(true);
          toast('Unknown barcode scanned', { icon: '🔍' });
        } else {
          console.error('Error fetching product data:', err);
          toast.error('Error reading barcode');
        }
      }
    });
    return () => socket.disconnect();
  }, [addToCart]);

  const handleManualBarcode = async (barcode) => {
    if (!barcode.trim()) return;
    try {
      const res = await api.get(`/products/${barcode}`);
      addToCart(res.data);
      toast.success(`Added ${res.data.name} to cart`);
      setSearchQuery(''); // clear after success
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setScannedBarcode(barcode);
        setShowRegisterModal(true);
        toast('Unknown barcode scanned', { icon: '🔍' });
        setSearchQuery('');
      } else {
        toast.error('Error finding product');
      }
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.barcode && p.barcode.includes(searchQuery))
  );

  return (
    <Router>
      <div className="app-container">
        <Toaster position="top-right" toastOptions={{
          style: {
            background: 'var(--surface-opaque)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)'
          }
        }} />
        <Sidebar />
        <div className="main-content">
          <Navbar theme={theme} toggleTheme={toggleTheme} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSearchEnter={handleManualBarcode} />
          <div className="content-area">
            <Routes>
              <Route path="/" element={
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '1rem', overflow: 'hidden' }}>
                    <div className="pos-grid" style={{ overflowY: 'auto', paddingRight: '0.5rem' }}>
                      {filteredProducts.map(p => (
                        <ProductCard key={p.id} product={p} onClick={() => addToCart(p)} />
                      ))}
                      {filteredProducts.length === 0 && (
                        <div style={{ padding: '2rem', color: 'var(--text-secondary)', gridColumn: '1 / -1', textAlign: 'center' }}>
                          No products found.
                        </div>
                      )}
                    </div>
                  </div>
                  <Cart items={cartItems} setItems={setCartItems} />
                </>
              } />
              <Route path="/products" element={<Products />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </div>
        
        {showRegisterModal && (
          <RegisterProductModal 
            barcode={scannedBarcode} 
            onClose={() => setShowRegisterModal(false)}
            onRegister={(newProduct) => {
              setShowRegisterModal(false);
              addToCart(newProduct);
              toast.success('Product registered and added to cart!');
              fetchProducts(); // Refresh product list
            }} 
          />
        )}
      </div>
    </Router>
  );
}

export default App;
