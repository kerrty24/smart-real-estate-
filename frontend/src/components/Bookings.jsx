import React, { useState, useEffect } from 'react';
import { api } from '../api';
import Icon from '../Icon';

const Bookings = ({ user, setView, addToast }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock Payment Modal State
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [amount, setAmount] = useState('250.00'); // default visit processing/holding fee
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [paymentLoading, setPaymentLoading] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/booking');
      setBookings(data || []);
    } catch (err) {
      addToast('Failed to load bookings.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      // API expects integer enum: Pending=0, Confirmed=1, Cancelled=2, Completed=3
      await api.put(`/api/booking/${bookingId}/status`, {
        status: newStatus
      });
      addToast(`Booking status updated successfully.`, 'success');
      fetchBookings();
    } catch (err) {
      addToast(err.message || 'Failed to update booking status.', 'danger');
    }
  };

  const handleOpenPayment = (booking) => {
    setSelectedBooking(booking);
    setAmount('250.00');
    setPaymentMethod('Credit Card');
    setShowPaymentModal(true);
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setPaymentLoading(true);

    const transactionId = 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    try {
      await api.post('/api/payment', {
        bookingId: selectedBooking.id,
        amount: parseFloat(amount),
        paymentMethod,
        transactionId
      });

      addToast(`Payment of $${amount} processed successfully!`, 'success');
      setShowPaymentModal(false);
      setSelectedBooking(null);
      setView('payments'); // Direct to payments list
    } catch (err) {
      addToast(err.message || 'Payment processing failed.', 'danger');
    } finally {
      setPaymentLoading(false);
    }
  };

  // Helper for rendering status badge classes
  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'cancelled':
        return 'badge-danger';
      case 'completed':
        return 'badge-info';
      default:
        return 'badge-info';
    }
  };

  return (
    <div className="card" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
          {user.role === 'Customer' ? 'My Visited Tour Requests' : 'Incoming Tour Requests'}
        </h3>
        <button className="btn btn-outline" onClick={fetchBookings} style={{ padding: '8px 12px' }}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
          <Icon name="loader" style={{ width: '32px', height: '32px', color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-light)' }}>
          <Icon name="calendar" style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.5 }} />
          <p>No bookings requested yet.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-light)', fontSize: '0.85rem', fontWeight: 700 }}>
                <th style={{ padding: '12px' }}>Property</th>
                {user.role !== 'Customer' && <th style={{ padding: '12px' }}>Customer</th>}
                <th style={{ padding: '12px' }}>Visit Date</th>
                <th style={{ padding: '12px' }}>Notes</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem', verticalAlign: 'middle' }}>
                  <td style={{ padding: '16px 12px', fontWeight: 700 }}>{b.propertyTitle}</td>
                  {user.role !== 'Customer' && (
                    <td style={{ padding: '16px 12px' }}>
                      <div style={{ fontWeight: 600 }}>{b.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{b.customerEmail}</div>
                    </td>
                  )}
                  <td style={{ padding: '16px 12px' }}>
                    {new Date(b.visitDate).toLocaleDateString()} at{' '}
                    {new Date(b.visitDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '16px 12px', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {b.notes || <span style={{ fontStyle: 'italic', opacity: 0.6 }}>No notes</span>}
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <span className={`badge ${getStatusBadgeClass(b.status)}`}>
                      {b.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {/* Customer Actions */}
                      {user.role === 'Customer' && b.status.toLowerCase() === 'pending' && (
                        <button
                          className="btn btn-outline"
                          onClick={() => handleStatusChange(b.id, 2)} // Cancel = 2
                          style={{ padding: '6px 12px', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                        >
                          Cancel Visit
                        </button>
                      )}
                      
                      {user.role === 'Customer' && b.status.toLowerCase() === 'confirmed' && (
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleOpenPayment(b)}
                          style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Icon name="dollar" style={{ width: '12px', height: '12px' }} />
                          Hold Payment
                        </button>
                      )}

                      {/* Agent / Admin Actions */}
                      {user.role !== 'Customer' && b.status.toLowerCase() === 'pending' && (
                        <>
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleStatusChange(b.id, 1)} // Confirm = 1
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-outline"
                            onClick={() => handleStatusChange(b.id, 2)} // Cancel/Reject = 2
                            style={{ padding: '6px 12px', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {user.role !== 'Customer' && b.status.toLowerCase() === 'confirmed' && (
                        <button
                          className="btn btn-outline"
                          onClick={() => handleStatusChange(b.id, 3)} // Complete = 3
                          style={{ padding: '6px 12px', fontSize: '0.8rem', color: 'var(--secondary)', borderColor: 'rgba(16, 185, 129, 0.2)' }}
                        >
                          Mark Completed
                        </button>
                      )}

                      {/* Default no-action placeholder */}
                      {(b.status.toLowerCase() === 'cancelled' || b.status.toLowerCase() === 'completed') && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontStyle: 'italic' }}>No actions</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MOCK PAYMENT MODAL */}
      {showPaymentModal && selectedBooking && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
          padding: '24px'
        }}>
          <div className="card" style={{
            maxWidth: '440px', width: '100%', padding: '32px', boxShadow: 'var(--shadow-xl)', position: 'relative'
          }}>
            <button
              onClick={() => { setShowPaymentModal(false); setSelectedBooking(null); }}
              style={{
                position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none',
                color: 'var(--text-light)', cursor: 'pointer', fontSize: '1.2rem'
              }}
            >
              ✕
            </button>
            <h3 style={{ marginBottom: '12px' }}>Security Deposit Payment</h3>
            <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', marginBottom: '24px' }}>
              Submit a holding deposit to confirm visit priority or leasing hold for property: <strong>{selectedBooking.propertyTitle}</strong>.
            </p>

            <form onSubmit={handleProcessPayment}>
              <div className="form-group">
                <label className="form-label">Deposit Amount (USD)</label>
                <input
                  type="number"
                  className="form-input"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select
                  className="form-input"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Stripe">Stripe Checkout</option>
                  <option value="Bank Transfer">Direct Debit</option>
                </select>
              </div>

              <div style={{
                backgroundColor: 'var(--bg-hover)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                marginBottom: '24px',
                lineHeight: 1.4
              }}>
                ℹ️ <strong>Mock Demo Payment:</strong> This processed transaction is fully simulated and will NOT charge any real monetary instruments.
              </div>

              <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => { setShowPaymentModal(false); setSelectedBooking(null); }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={paymentLoading}>
                  {paymentLoading ? 'Processing...' : 'Pay Deposit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
