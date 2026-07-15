import React, { useState, useEffect } from 'react';
import { api } from '../api';
import Icon from '../Icon';

function RentalAgreements({ user, addToast }) {
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status mapping: 0=Pending, 1=Active, 2=Expired, 3=Terminated
  const statusLabels = ['Pending', 'Active', 'Expired', 'Terminated'];
  const statusColors = ['badge-warning', 'badge-success', 'badge-default', 'badge-danger'];

  useEffect(() => {
    fetchAgreements();
  }, []);

  const fetchAgreements = async () => {
    try {
      setLoading(true);
      const data = await api.agreements.getAll();
      setAgreements(data);
    } catch (err) {
      addToast(err.message || 'Failed to load agreements', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.agreements.updateStatus(id, newStatus);
      addToast('Agreement status updated', 'success');
      fetchAgreements();
    } catch (err) {
      addToast(err.message || 'Failed to update status', 'danger');
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
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Rental Agreements</h2>
      </div>

      {agreements.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem 2rem' }}>
          <Icon name="fileText" style={{ width: '48px', height: '48px', color: 'var(--text-light)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Agreements Found</h3>
          <p style={{ color: 'var(--text-light)' }}>
            There are currently no rental agreements associated with your account.
          </p>
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
          {agreements.map((agreement) => (
            <div key={agreement.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <div className="flex-between align-start" style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', marginRight: '1rem' }}>{agreement.propertyTitle}</h3>
                <span className={`badge ${statusColors[agreement.status]}`}>
                  {statusLabels[agreement.status]}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                <div>
                  <div style={{ color: 'var(--text-light)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>Tenant</div>
                  <div style={{ fontWeight: 500 }}>{agreement.customerName}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-light)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>Monthly Rent</div>
                  <div style={{ fontWeight: 600, color: 'var(--primary)' }}>${agreement.monthlyRent.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-light)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>Start Date</div>
                  <div>{new Date(agreement.startDate).toLocaleDateString()}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-light)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>End Date</div>
                  <div>{new Date(agreement.endDate).toLocaleDateString()}</div>
                </div>
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                {user.role === 'Customer' && agreement.status === 0 && (
                  <>
                    <button className="btn btn-outline" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => handleUpdateStatus(agreement.id, 3)}>Decline</button>
                    <button className="btn btn-primary" onClick={() => handleUpdateStatus(agreement.id, 1)}>Accept</button>
                  </>
                )}
                {user.role !== 'Customer' && agreement.status === 1 && (
                  <button className="btn btn-outline" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => handleUpdateStatus(agreement.id, 3)}>Terminate</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RentalAgreements;
