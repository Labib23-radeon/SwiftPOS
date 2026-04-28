import { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { DollarSign, ShoppingBag, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ dailyRevenue: 0, transactions: 0, lowStockItems: [] });
  const [loading, setLoading] = useState(true);
  const currency = JSON.parse(localStorage.getItem('pos_settings') || '{}').currency || '$';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/stats');
        setStats(res.data);
      } catch (err) {
        toast.error('Failed to load dashboard statistics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div style={{ padding: '2rem' }}>Loading dashboard...</div>;

  return (
    <div style={{ padding: '1rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h2 style={{ margin: 0 }}>Analytics Dashboard</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        
        <div style={{ backgroundColor: 'var(--surface-color)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--primary)' }}>
            <DollarSign size={32} />
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Daily Revenue</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{currency}{(stats.dailyRevenue || 0).toFixed(2)}</div>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--surface-color)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--success)' }}>
            <ShoppingBag size={32} />
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Transactions</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.transactions || 0}</div>
          </div>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        <div style={{ backgroundColor: 'var(--surface-color)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--danger)', overflow: 'hidden' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', fontWeight: 'bold' }}>
            <AlertTriangle size={20} /> Low Stock Alerts
          </div>
          <div style={{ padding: '1rem' }}>
            {stats.lowStockItems.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>All items have sufficient stock level.</p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {stats.lowStockItems.map(item => (
                  <li key={item.id} style={{ color: 'var(--text-primary)' }}>
                    <strong>{item.name}</strong> has only <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>{item.stock}</span> left. (Barcode: {item.barcode})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
