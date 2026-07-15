import React, { useState, useEffect } from 'react';
import { api } from '../api';
import Icon from '../Icon';

const AiPanel = ({ user, setView, setSelectedPropertyId, addToast }) => {
  const [activeTab, setActiveTab] = useState('chat');

  // Chatbot State
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { sender: 'ai', message: 'Hello! I am your AI Real Estate Assistant. Ask me anything about property prices, visit tour bookings, amenities, or what to look for when renting or buying!' }
  ]);
  const [loadingChat, setLoadingChat] = useState(false);

  // Recommendations State
  const [preferences, setPreferences] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userText = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { sender: 'user', message: userText }]);
    setLoadingChat(true);

    try {
      const response = await api.post('/api/ai/chat', userText);
      const reply = response.message || response.Message || 'I am sorry, I could not process your query.';
      setChatHistory(prev => [...prev, { sender: 'ai', message: reply }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { sender: 'ai', message: 'Error: Failed to connect to AI server.' }]);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleGetRecommendations = async (e) => {
    e.preventDefault();
    if (!preferences.trim()) {
      addToast('Please enter your home preferences.', 'warning');
      return;
    }

    setLoadingRecs(true);
    setRecommendations([]);

    try {
      const response = await api.post('/api/ai/recommendations', preferences);
      const ids = response.recommendedPropertyIds || response.RecommendedPropertyIds || [];
      
      if (ids.length === 0) {
        addToast('No recommendations matching your query found.', 'info');
        setLoadingRecs(false);
        return;
      }

      // Fetch details of recommended properties
      const fetchedProperties = [];
      for (const id of ids) {
        try {
          const prop = await api.get(`/api/property/${id}`);
          if (prop) fetchedProperties.push(prop);
        } catch (propErr) {
          console.warn(`Property ID ${id} failed to fetch for recommendation.`);
        }
      }

      setRecommendations(fetchedProperties);
      if (fetchedProperties.length > 0) {
        addToast(`Found ${fetchedProperties.length} AI matches!`, 'success');
      } else {
        addToast('Recommended properties are no longer active.', 'warning');
      }
    } catch (err) {
      addToast(err.message || 'Failed to fetch recommendations.', 'danger');
    } finally {
      setLoadingRecs(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '32px', alignItems: 'flex-start' }} className="grid-responsive-parent">
      {/* AI Navigation Cards */}
      <aside className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon name="sparkles" style={{ width: '18px', height: '18px', color: 'var(--primary)' }} />
          AI Hub
        </h3>

        <button
          className={`btn ${activeTab === 'chat' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('chat')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', justifyContent: 'flex-start' }}
        >
          <Icon name="chat" style={{ width: '18px', height: '18px' }} />
          AI Assistant Chat
        </button>

        {user.role === 'Customer' && (
          <button
            className={`btn ${activeTab === 'recommendations' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('recommendations')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', justifyContent: 'flex-start' }}
          >
            <Icon name="sparkles" style={{ width: '18px', height: '18px' }} />
            AI Matcher
          </button>
        )}
      </aside>

      {/* AI Panel View */}
      <div style={{ flex: 1 }}>
        {activeTab === 'chat' ? (
          /* CHATBOT PANELS */
          <div className="card" style={{ height: '600px', display: 'flex', flexDirection: 'column', padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
              Real Estate AI Assistant
            </h3>

            {/* Chat Messages Log */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '6px', marginBottom: '20px' }}>
              {chatHistory.map((chat, idx) => {
                const isAi = chat.sender === 'ai';
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: isAi ? 'flex-start' : 'flex-end',
                      alignItems: 'flex-start',
                      gap: '12px'
                    }}
                  >
                    {isAi && (
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        backgroundColor: 'var(--primary-light)', color: 'var(--primary)',
                        display: 'flex', alignItems: 'center', justifySelf: 'center',
                        justifyContent: 'center', flexShrink: 0
                      }}>
                        <Icon name="sparkles" style={{ width: '16px', height: '16px' }} />
                      </div>
                    )}
                    <div style={{
                      backgroundColor: isAi ? 'var(--bg-hover)' : 'var(--primary)',
                      color: isAi ? 'var(--text-main)' : 'var(--text-white)',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      maxWidth: '75%',
                      fontSize: '0.9rem',
                      lineHeight: 1.5,
                      fontWeight: 500,
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      {chat.message}
                    </div>
                  </div>
                );
              })}
              {loadingChat && (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    backgroundColor: 'var(--primary-light)', color: 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Icon name="loader" style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontStyle: 'italic' }}>AI is typing...</span>
                </div>
              )}
            </div>

            {/* Chat Send Form */}
            <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Ask me a question (e.g. How can I schedule a visit?)"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                disabled={loadingChat}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary" disabled={loadingChat || !chatMessage.trim()}>
                Send
              </button>
            </form>
          </div>
        ) : (
          /* RECOMMENDATION PANEL */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div className="card" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>AI Property Matcher</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', marginBottom: '24px' }}>
                Describe what your dream home looks like in detail. Our recommendation engine will search the listings database and present the closest matches!
              </p>

              <form onSubmit={handleGetRecommendations}>
                <div className="form-group">
                  <label className="form-label">Tell us your preferences</label>
                  <textarea
                    rows="3"
                    className="form-input"
                    value={preferences}
                    onChange={(e) => setPreferences(e.target.value)}
                    placeholder="e.g. I am looking for a quiet 2 bedroom apartment in Chicago with parking, a gym facility, and is close to local transit."
                    required
                    style={{ resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={loadingRecs} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {loadingRecs ? (
                    <Icon name="loader" style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <Icon name="sparkles" style={{ width: '18px', height: '18px' }} />
                  )}
                  Find My Matches
                </button>
              </form>
            </div>

            {/* Recommendations Results list */}
            {loadingRecs && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
                <Icon name="loader" style={{ width: '32px', height: '32px', color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
              </div>
            )}

            {!loadingRecs && recommendations.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Your AI Personalized Matches</h3>
                
                <div className="grid grid-3">
                  {recommendations.map(p => {
                    const primaryImage = p.images?.find(img => img.isPrimary || img.IsPrimary)?.imageUrl || 
                      (p.images?.length > 0 ? p.images[0].imageUrl : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=600');
                    
                    return (
                      <article className="card" key={p.id} style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ position: 'relative', paddingTop: '65%', overflow: 'hidden', background: '#e2e8f0' }}>
                          <img src={primaryImage} alt={p.title} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                          <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                            <span className="badge badge-success">{p.status}</span>
                          </div>
                        </div>

                        <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div>
                            <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{p.title}</h4>
                            <p style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-light)', fontSize: '0.8rem', marginTop: '4px' }}>
                              <Icon name="mapPin" style={{ width: '12px', height: '12px' }} />
                              {p.city}, {p.state}
                            </p>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '4px' }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
                              ${p.price.toLocaleString()}
                            </span>
                            <button
                              className="btn btn-primary"
                              onClick={() => { setSelectedPropertyId(p.id); setView('property-details'); }}
                              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AiPanel;
