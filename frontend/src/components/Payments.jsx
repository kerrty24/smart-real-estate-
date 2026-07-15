import React, { useState, useEffect } from 'react';
import { api } from '../api';
import Icon from '../Icon';

const Payments = ({ user, addToast }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/payment');
      setPayments(data || []);
    } catch (err) {
      addToast('Failed to load payments.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div className="card" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
          {user.role === 'Customer' ? 'My Payments History' : 'All Platform Payments'}
        </h3>
        <button className="btn btn-outline" onClick={fetchPayments} style={{ padding: '8px 12px' }}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
          <Icon name="loader" style={{ width: '32px', height: '32px', color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : payments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-light)' }}>
          <Icon name="dollar" style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.5 }} />
          <p>No transactions recorded yet.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-light)', fontSize: '0.85rem', fontWeight: 700 }}>
                <th style={{ padding: '12px' }}>Transaction ID</th>
                {user.role !== 'Customer' && <th style={{ padding: '12px' }}>Customer</th>}
                <th style={{ padding: '12px' }}>Amount</th>
                <th style={{ padding: '12px' }}>Date</th>
                <th style={{ padding: '12px' }}>Method</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem', verticalAlign: 'middle' }}>
                  <td style={{ padding: '16px 12px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-muted)' }}>
                    {p.transactionId}
                  </td>
                  {user.role !== 'Customer' && (
                    <td style={{ padding: '16px 12px', fontWeight: 600 }}>{p.customerName}</td>
                  )}
                  <td style={{ padding: '16px 12px', fontWeight: 800, color: 'var(--secondary-hover)' }}>
                    ${p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>
                    {new Date(p.paymentDate || p.createdAt).toLocaleDateString()} at{' '}
                    {new Date(p.paymentDate || p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <span className="badge badge-info" style={{ textTransform: 'none', letterSpacing: 'normal' }}>
                      {p.paymentMethod}
                    </span>
                  </td>
                  <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                    <span className="badge badge-success">
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Payments;
