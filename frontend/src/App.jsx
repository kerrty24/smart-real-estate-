import React, { useState, useEffect } from 'react';
import { api, getUserData } from './api';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Properties from './components/Properties';
import PropertyDetails from './components/PropertyDetails';
import Bookings from './components/Bookings';
import Payments from './components/Payments';
import Inquiries from './components/Inquiries';
import RentalAgreements from './components/RentalAgreements';
import AiPanel from './components/AiPanel';
import Icon from './Icon';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setView] = useState('properties');
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Check auth session on mount
  useEffect(() => {
    const userData = getUserData();
    if (userData) {
      setUser(userData);
    }
  }, []);

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setView('properties');
  };

  const handleLogout = async () => {
    try {
      await api.auth.logout();
      setUser(null);
      setView('properties');
      setSelectedPropertyId(null);
      addToast('Successfully logged out.', 'info');
    } catch (err) {
      addToast('Logout error.', 'danger');
    }
  };

  // Render view depending on routing state
  const renderActiveView = () => {
    switch (currentView) {
      case 'properties':
        return (
          <Properties
            user={user}
            setView={setView}
            setSelectedPropertyId={setSelectedPropertyId}
            addToast={addToast}
          />
        );
      case 'property-details':
        return (
          <PropertyDetails
            user={user}
            propertyId={selectedPropertyId}
            setView={setView}
            addToast={addToast}
          />
        );
      case 'bookings':
        return (
          <Bookings
            user={user}
            setView={setView}
            addToast={addToast}
          />
        );
      case 'payments':
        return (
          <Payments
            user={user}
            addToast={addToast}
          />
        );
      case 'inquiries':
        return (
          <Inquiries
            user={user}
            addToast={addToast}
          />
        );
      case 'agreements':
        return (
          <RentalAgreements
            user={user}
            addToast={addToast}
          />
        );
      case 'ai':
        return (
          <AiPanel
            user={user}
            setView={setView}
            setSelectedPropertyId={setSelectedPropertyId}
            addToast={addToast}
          />
        );
      default:
        return (
          <Properties
            user={user}
            setView={setView}
            setSelectedPropertyId={setSelectedPropertyId}
            addToast={addToast}
          />
        );
    }
  };

  // Unauthenticated Layout
  if (!user) {
    return (
      <>
        <Auth onAuthSuccess={handleAuthSuccess} addToast={addToast} />
        {/* Render Toasts */}
        <div className="toast-container">
          {toasts.map(t => (
            <div key={t.id} className="toast" style={{
              borderLeft: `4px solid ${
                t.type === 'success' ? 'var(--secondary)' : 
                t.type === 'danger' ? 'var(--danger)' : 
                t.type === 'warning' ? 'var(--warning)' : 
                'var(--primary)'
              }`
            }}>
              <Icon
                name={t.type === 'success' ? 'checkCircle' : t.type === 'danger' ? 'alertCircle' : 'bell'}
                style={{
                  width: '18px', height: '18px',
                  color: t.type === 'success' ? 'var(--secondary)' : 
                         t.type === 'danger' ? 'var(--danger)' : 
                         t.type === 'warning' ? 'var(--warning)' : 
                         'var(--primary)'
                }}
              />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t.message}</span>
            </div>
          ))}
        </div>
      </>
    );
  }

  // Authenticated Layout
  return (
    <>
      <Dashboard
        user={user}
        currentView={currentView}
        setView={setView}
        onLogout={handleLogout}
        addToast={addToast}
      >
        {renderActiveView()}
      </Dashboard>

      {/* Render Toasts */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className="toast" style={{
            borderLeft: `4px solid ${
              t.type === 'success' ? '#10B981' : 
              t.type === 'danger' ? '#EF4444' : 
              t.type === 'warning' ? '#F59E0B' : 
              '#2563EB'
            }`
          }}>
            <Icon
              name={t.type === 'success' ? 'checkCircle' : t.type === 'danger' ? 'alertCircle' : 'bell'}
              style={{
                width: '18px', height: '18px',
                color: t.type === 'success' ? '#10B981' : 
                       t.type === 'danger' ? '#EF4444' : 
                       t.type === 'warning' ? '#F59E0B' : 
                       '#2563EB'
              }}
            />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t.message}</span>
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
