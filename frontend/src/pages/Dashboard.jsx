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
      <div>
        <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700' }}>Analytics Dashboard</h2>
        <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Here is what's happening with your store today.</p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        
        <div style={{ backgroundColor: 'var(--surface-color)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', gap: '1.5rem', boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.1)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)', borderRadius: '50%' }} />
          <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', padding: '1.2rem', borderRadius: 'var(--radius-md)', color: 'var(--primary)' }}>
            <DollarSign size={32} />
          </div>
          <div style={{ zIndex: 1 }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: '500', marginBottom: '0.2rem' }}>Daily Revenue</div>
            <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>{currency}{(stats.dailyRevenue || 0).toFixed(2)}</div>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--surface-color)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', gap: '1.5rem', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.1)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)', borderRadius: '50%' }} />
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '1.2rem', borderRadius: 'var(--radius-md)', color: 'var(--success)' }}>
            <ShoppingBag size={32} />
          </div>
          <div style={{ zIndex: 1 }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: '500', marginBottom: '0.2rem' }}>Transactions</div>
            <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>{stats.transactions || 0}</div>
          </div>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        <div style={{ backgroundColor: 'var(--surface-color)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--danger)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--danger)', fontWeight: '700', backgroundColor: 'rgba(244, 63, 94, 0.05)' }}>
            <AlertTriangle size={22} /> Low Stock Alerts
          </div>
          <div style={{ padding: '0' }}>
            {stats.lowStockItems.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>All items have sufficient stock level.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {stats.lowStockItems.map((item, idx) => (
                  <div key={item.id} style={{ padding: '1.2rem 1.5rem', borderBottom: idx === stats.lowStockItems.length - 1 ? 'none' : '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '1.05rem' }}>{item.name}</strong>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>Barcode: {item.barcode}</div>
                    </div>
                    <div style={{ backgroundColor: 'rgba(244, 63, 94, 0.1)', color: 'var(--danger)', padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      {item.stock} left
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
