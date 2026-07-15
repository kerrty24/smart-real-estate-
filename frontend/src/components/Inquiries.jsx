import React, { useState, useEffect } from 'react';
import { api } from '../api';
import Icon from '../Icon';

function Inquiries({ user, addToast }) {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const data = await api.inquiries.getAll();
      setInquiries(data);
    } catch (err) {
      addToast(err.message || 'Failed to load inquiries', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (inquiryId) => {
    if (!replyText.trim()) return;
    try {
      await api.inquiries.reply(inquiryId, replyText);
      addToast('Reply sent successfully', 'success');
      setReplyText('');
      setReplyingTo(null);
      fetchInquiries();
    } catch (err) {
      addToast(err.message || 'Failed to send reply', 'danger');
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '300px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="flex-between align-center" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Inquiries</h2>
      </div>

      {inquiries.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem 2rem' }}>
          <Icon name="messageSquare" style={{ width: '48px', height: '48px', color: 'var(--text-light)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Inquiries Yet</h3>
          <p style={{ color: 'var(--text-light)' }}>
            {user.role === 'Customer' ? "You haven't sent any inquiries." : "There are no customer inquiries for your properties."}
          </p>
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '1rem' }}>
          {inquiries.map((inquiry) => (
            <div key={inquiry.id} className="card" style={{ padding: '1.5rem' }}>
              <div className="flex-between align-start" style={{ marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{inquiry.propertyTitle}</h3>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>
                    From: {inquiry.customerName} • {new Date(inquiry.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <span className={`badge ${inquiry.status === 0 ? 'badge-warning' : inquiry.status === 1 ? 'badge-success' : 'badge-default'}`}>
                  {inquiry.status === 0 ? 'Pending' : inquiry.status === 1 ? 'Answered' : 'Closed'}
                </span>
              </div>

              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-default)', borderRadius: 'var(--radius)', marginBottom: '1rem' }}>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{inquiry.message}</p>
              </div>

              {inquiry.reply && (
                <div style={{ padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: 'var(--radius)', borderLeft: '3px solid var(--primary)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '0.25rem' }}>Response:</div>
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap', color: 'var(--text-main)' }}>{inquiry.reply}</p>
                </div>
              )}

              {user.role !== 'Customer' && inquiry.status === 0 && replyingTo !== inquiry.id && (
                <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                  <button className="btn btn-outline" onClick={() => setReplyingTo(inquiry.id)}>Reply</button>
                </div>
              )}

              {replyingTo === inquiry.id && (
                <div style={{ marginTop: '1rem' }}>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Type your reply here..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    style={{ marginBottom: '0.5rem', resize: 'vertical' }}
                  />
                  <div className="flex-end gap-2">
                    <button className="btn btn-outline" onClick={() => { setReplyingTo(null); setReplyText(''); }}>Cancel</button>
                    <button className="btn btn-primary" onClick={() => handleReply(inquiry.id)} disabled={!replyText.trim()}>Send Reply</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Inquiries;
