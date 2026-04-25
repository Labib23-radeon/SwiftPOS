import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
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
        const res = await axios.get(`http://localhost:3001/api/products/${data.barcode}`);
        addToCart(res.data);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setScannedBarcode(data.barcode);
          setShowRegisterModal(true);
        } else {
          console.error('Error fetching product data:', err);
        }
      }
    });
    return () => socket.disconnect();
  }, [addToCart]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const sampleProducts = [
    { id: 1, name: 'Wireless Earbuds', price: 99.99, image: '🛒' },
    { id: 2, name: 'Smart Watch', price: 199.50, image: '⌚' },
    { id: 3, name: 'Mechanical Keyboard', price: 149.00, image: '⌨️' },
    { id: 4, name: 'Gaming Mouse', price: 79.99, image: '🖱️' },
    { id: 5, name: 'USB-C Hub', price: 45.00, image: '🔌' },
    { id: 6, name: 'Webcam 4K', price: 120.00, image: '📷' },
    { id: 7, name: 'Desk Pad', price: 29.99, image: '🖲️' },
    { id: 8, name: 'Gaming Monitor', price: 299.99, image: '🖥️' },
  ];

  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Navbar theme={theme} toggleTheme={toggleTheme} />
          <div className="content-area">
            <Routes>
              <Route path="/" element={
                <>
                  <div className="pos-grid">
                    {sampleProducts.map(p => (
                      <ProductCard key={p.id} product={p} onClick={() => addToCart(p)} />
                    ))}
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
            }} 
          />
        )}
      </div>
    </Router>
  );
}

export default App;
