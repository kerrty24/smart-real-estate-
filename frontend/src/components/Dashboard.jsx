import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import Icon from '../Icon';

const Dashboard = ({ user, currentView, setView, onLogout, children, addToast }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const data = await api.get('/api/notification');
      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close notifications dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/api/notification/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.Id === id || n.id === id ? { ...n, IsRead: true, isRead: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/api/notification/read-all');
      setNotifications(prev =>
        prev.map(n => ({ ...n, IsRead: true, isRead: true }))
      );
      addToast('All notifications marked as read.', 'info');
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const unreadCount = notifications.filter(n => !(n.IsRead || n.isRead)).length;

  // Sidebar navigation options depending on role
  const navItems = [
    { view: 'properties', label: 'Properties', icon: 'home', roles: ['Admin', 'Agent', 'Customer'] },
    { view: 'bookings', label: user.role === 'Customer' ? 'My Bookings' : 'Bookings', icon: 'calendar', roles: ['Admin', 'Agent', 'Customer'] },
    { view: 'inquiries', label: 'Inquiries', icon: 'messageSquare', roles: ['Admin', 'Agent', 'Customer'] },
    { view: 'agreements', label: 'Agreements', icon: 'fileText', roles: ['Admin', 'Agent', 'Customer'] },
    { view: 'payments', label: user.role === 'Customer' ? 'Payment History' : 'Payments', icon: 'dollar', roles: ['Admin', 'Agent', 'Customer'] },
    { view: 'ai', label: 'AI Assistant', icon: 'sparkles', roles: ['Admin', 'Agent', 'Customer'] },
  ];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Sidebar Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px 16px 32px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          marginBottom: '24px'
        }}>
          <div style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--text-white)',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 8px rgba(37, 99, 235, 0.3)'
          }}>
            <Icon name="home" style={{ width: '20px', height: '20px' }} />
          </div>
          <span className="nav-text" style={{
            fontSize: '1.3rem',
            fontWeight: 800,
            letterSpacing: '-0.5px'
          }}>
            Smart<span style={{ color: 'var(--primary)' }}>Estate</span>
          </span>
        </div>

        {/* Sidebar Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {navItems
            .filter(item => item.roles.includes(user.role))
            .map(item => {
              const active = currentView === item.view || (item.view === 'properties' && currentView === 'property-details');
              return (
                <button
                  key={item.view}
                  onClick={() => setView(item.view)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: active ? 'var(--primary)' : 'transparent',
                    color: active ? 'var(--text-white)' : 'var(--text-light)',
                    cursor: 'pointer',
                    fontWeight: active ? 700 : 500,
                    textAlign: 'left',
                    transition: 'var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = 'var(--text-white)';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = 'var(--text-light)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Icon name={item.icon} style={{ width: '20px', height: '20px' }} />
                  <span className="nav-text">{item.label}</span>
                </button>
              );
            })}
        </nav>

        {/* User Card */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: '24px',
          marginTop: 'auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-hover)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--bg-sidebar)',
              fontWeight: 800,
              fontSize: '1.1rem'
            }}>
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="nav-text" style={{ minWidth: 0, flex: 1 }}>
              <div style={{
                fontWeight: 700,
                fontSize: '0.95rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {user.firstName} {user.lastName}
              </div>
              <div className="badge badge-success" style={{
                fontSize: '0.65rem',
                padding: '2px 6px',
                marginTop: '4px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#10B981'
              }}>
                {user.role}
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              width: '100%',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: 'transparent',
              color: '#EF4444',
              cursor: 'pointer',
              fontWeight: 600,
              textAlign: 'left',
              transition: 'var(--transition-fast)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Icon name="logout" style={{ width: '20px', height: '20px' }} />
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Wrapper */}
      <div className="main-wrapper">
        {/* Main Header */}
        <header className="main-header">
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, textTransform: 'capitalize' }}>
              {currentView === 'property-details' ? 'Property Details' : currentView}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Notification Bell */}
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: 'var(--radius-full)',
                  transition: 'var(--transition-fast)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: showNotifications ? 'var(--bg-hover)' : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (!showNotifications) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                }}
                onMouseLeave={(e) => {
                  if (!showNotifications) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Icon name="bell" style={{ width: '22px', height: '22px' }} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    backgroundColor: 'var(--danger)',
                    color: 'white',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    borderRadius: 'var(--radius-full)',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid var(--bg-card)'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '12px',
                  width: '320px',
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-xl)',
                  zIndex: 200,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '16px',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{
                        padding: '24px',
                        textAlign: 'center',
                        color: 'var(--text-light)',
                        fontSize: '0.85rem'
                      }}>
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map(item => {
                        const isRead = item.IsRead || item.isRead;
                        return (
                          <div
                            key={item.Id || item.id}
                            onClick={() => !isRead && handleMarkAsRead(item.Id || item.id)}
                            style={{
                              padding: '14px 16px',
                              borderBottom: '1px solid var(--border-color)',
                              cursor: 'pointer',
                              backgroundColor: isRead ? 'transparent' : 'rgba(37, 99, 235, 0.03)',
                              transition: 'var(--transition-fast)',
                              display: 'flex',
                              gap: '10px',
                              alignItems: 'flex-start'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isRead ? 'transparent' : 'rgba(37, 99, 235, 0.03)'}
                          >
                            <div style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: isRead ? 'transparent' : 'var(--primary)',
                              marginTop: '6px',
                              flexShrink: 0
                            }} />
                            <div style={{ flex: 1 }}>
                              <p style={{
                                fontSize: '0.85rem',
                                color: isRead ? 'var(--text-muted)' : 'var(--text-main)',
                                fontWeight: isRead ? 500 : 600,
                                lineHeight: 1.4,
                                margin: 0
                              }}>
                                {item.Message || item.message}
                              </p>
                              <span style={{
                                fontSize: '0.7rem',
                                color: 'var(--text-light)',
                                display: 'block',
                                marginTop: '4px'
                              }}>
                                {new Date(item.CreatedAt || item.createdAt).toLocaleDateString()} at{' '}
                                {new Date(item.CreatedAt || item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            <div style={{
              height: '24px',
              width: '1px',
              backgroundColor: 'var(--border-color)'
            }} />

            {/* Profile trigger */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Hi, {user.firstName}</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
