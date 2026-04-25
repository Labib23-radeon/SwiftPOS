import { LayoutGrid, ShoppingCart, Package, BarChart3, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div style={{ color: 'var(--primary)', padding: '10px' }}>
        <ShoppingCart size={32} />
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
        <NavLink to="/" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <LayoutGrid size={24} />
          <span>POS</span>
        </NavLink>
        <NavLink to="/products" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <Package size={24} />
          <span>Products</span>
        </NavLink>
        <NavLink to="/dashboard" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <BarChart3 size={24} />
          <span>Analytics</span>
        </NavLink>
      </div>

      <div style={{ marginTop: 'auto', marginBottom: '1rem', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <NavLink to="/settings" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} style={{ width: '80%' }}>
          <Settings size={24} />
          <span>Settings</span>
        </NavLink>
      </div>
    </div>
  );
}
