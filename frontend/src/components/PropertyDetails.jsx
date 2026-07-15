import React, { useState, useEffect } from 'react';
import { api } from '../api';
import Icon from '../Icon';

const PropertyDetails = ({ user, propertyId, setView, addToast }) => {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Booking Form State
  const [visitDate, setVisitDate] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [localReviews, setLocalReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);

  // Local Wishlist Mock State
  const [isWishlisted, setIsWishlisted] = useState(false);

  const fetchPropertyDetails = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/api/property/${propertyId}`);
      setProperty(data);
      setIsWishlisted(data.isWishlisted || data.IsWishlisted || false);
      setLocalReviews(data.reviews || []);
    } catch (err) {
      addToast('Failed to load property details.', 'danger');
      setView('properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (propertyId) {
      fetchPropertyDetails();
    }
  }, [propertyId]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (user.role !== 'Customer') {
      addToast('Only registered customers can book visit requests.', 'warning');
      return;
    }

    setBookingLoading(true);
    try {
      await api.post('/api/booking', {
        propertyId: property.id,
        visitDate: new Date(visitDate).toISOString(),
        notes: bookingNotes
      });
      addToast('Booking visit request submitted successfully!', 'success');
      setView('bookings'); // Go to bookings history
    } catch (err) {
      addToast(err.message || 'Failed to request booking.', 'danger');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      addToast('Please enter a comment.', 'warning');
      return;
    }

    setReviewLoading(true);
    // Mock review submission because database review controller isn't implemented.
    setTimeout(() => {
      const newReview = {
        id: Math.random(),
        rating,
        comment,
        customerName: `${user.firstName} ${user.lastName}`,
        createdAt: new Date().toISOString()
      };
      setLocalReviews(prev => [newReview, ...prev]);
      setComment('');
      setRating(5);
      addToast('Review submitted successfully!', 'success');
      setReviewLoading(false);
    }, 600);
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    addToast(!isWishlisted ? 'Listing added to your wishlist.' : 'Listing removed from your wishlist.', 'info');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '128px' }}>
        <Icon name="loader" style={{ width: '40px', height: '40px', color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const images = property.images && property.images.length > 0
    ? property.images.map(img => img.imageUrl)
    : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800'];

  const amenitiesList = property.amenities
    ? property.amenities.split(',').map(a => a.trim()).filter(Boolean)
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Back link */}
      <div>
        <button
          onClick={() => setView('properties')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary)',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          ← Back to Properties
        </button>
      </div>

      {/* Main Grid: Details + Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '32px', alignItems: 'flex-start' }} className="grid-responsive-parent">
        {/* Left Side: Images, Details, Reviews */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Main Card */}
          <div className="card" style={{ padding: '32px' }}>
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>{property.title}</h1>
                <p style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-light)', marginTop: '8px' }}>
                  <Icon name="mapPin" style={{ width: '16px', height: '16px' }} />
                  {property.address}, {property.city}, {property.state}, {property.country}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', display: 'block' }}>
                  ${property.price.toLocaleString()}
                </span>
                <span className={`badge ${property.status === 'Available' ? 'badge-success' : 'badge-warning'}`} style={{ marginTop: '8px' }}>
                  {property.status}
                </span>
              </div>
            </div>

            {/* Image Gallery Carousel */}
            <div style={{ position: 'relative', width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden', backgroundColor: '#e2e8f0', marginBottom: '16px' }}>
              <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                <img
                  src={images[activeImageIndex]}
                  alt={property.title}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Prev / Next buttons */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex(prev => (prev - 1 + images.length) % images.length)}
                    style={{
                      position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(15, 23, 42, 0.65)', border: 'none', color: 'white',
                      width: '40px', height: '40px', borderRadius: 'var(--radius-full)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
                    }}
                  >
                    ❮
                  </button>
                  <button
                    onClick={() => setActiveImageIndex(prev => (prev + 1) % images.length)}
                    style={{
                      position: 'absolute', top: '50%', right: '16px', transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(15, 23, 42, 0.65)', border: 'none', color: 'white',
                      width: '40px', height: '40px', borderRadius: 'var(--radius-full)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
                    }}
                  >
                    ❯
                  </button>
                </>
              )}
            </div>

            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '24px' }}>
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    style={{
                      width: '80px', height: '54px', padding: 0, border: 'none', borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden', cursor: 'pointer', flexShrink: 0,
                      boxShadow: activeImageIndex === idx ? '0 0 0 3px var(--primary)' : 'none',
                      opacity: activeImageIndex === idx ? 1 : 0.6,
                      transition: 'var(--transition-fast)'
                    }}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}

            {/* Specs Grid */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px',
              padding: '20px 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ backgroundColor: 'var(--bg-hover)', padding: '10px', borderRadius: 'var(--radius-md)', color: 'var(--primary)' }}>
                  <Icon name="home" style={{ width: '20px', height: '20px' }} />
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>TYPE</span>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{property.propertyType}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ backgroundColor: 'var(--bg-hover)', padding: '10px', borderRadius: 'var(--radius-md)', color: 'var(--primary)' }}>
                  <Icon name="user" style={{ width: '20px', height: '20px' }} />
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>BEDROOMS</span>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{property.bedrooms} Bed(s)</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ backgroundColor: 'var(--bg-hover)', padding: '10px', borderRadius: 'var(--radius-md)', color: 'var(--primary)' }}>
                  <Icon name="user" style={{ width: '20px', height: '20px' }} />
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>BATHROOMS</span>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{property.bathrooms} Bath(s)</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ backgroundColor: 'var(--bg-hover)', padding: '10px', borderRadius: 'var(--radius-md)', color: 'var(--primary)' }}>
                  <Icon name="filter" style={{ width: '20px', height: '20px' }} />
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>AREA</span>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{property.area} sq ft</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px' }}>Description</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{property.description}</p>
            </div>

            {/* Amenities */}
            {amenitiesList.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Amenities</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  {amenitiesList.map((amenity, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                      <Icon name="checkCircle" style={{ width: '16px', height: '16px', color: 'var(--secondary)' }} />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reviews Card */}
          <div className="card" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '24px' }}>
              Reviews ({localReviews.length})
            </h3>

            {/* Submit Review Form (only for Customers) */}
            {user.role === 'Customer' && (
              <form onSubmit={handleReviewSubmit} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '24px', marginBottom: '24px' }}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '12px' }}>Write a Review</h4>
                
                {/* Rating select */}
                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3, 4, 5].map(stars => (
                      <button
                        key={stars}
                        type="button"
                        onClick={() => setRating(stars)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer', padding: '4px'
                        }}
                      >
                        <Icon
                          name="star"
                          style={{
                            width: '24px', height: '24px',
                            fill: stars <= rating ? '#F59E0B' : 'none',
                            stroke: '#F59E0B'
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Review Comment</label>
                  <textarea
                    rows="3"
                    className="form-input"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience details..."
                    required
                    style={{ resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={reviewLoading}>
                  {reviewLoading ? 'Submitting...' : 'Post Review'}
                </button>
              </form>
            )}

            {/* Reviews List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {localReviews.length === 0 ? (
                <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '16px' }}>No reviews yet for this listing.</p>
              ) : (
                localReviews.map(r => (
                  <div key={r.id || r.Id} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '42px', height: '42px', borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, color: 'var(--primary)', flexShrink: 0
                    }}>
                      {r.customerName ? r.customerName[0] : 'U'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{r.customerName || 'Anonymous Customer'}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                          {new Date(r.createdAt || r.CreatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {/* Rating stars */}
                      <div style={{ display: 'flex', gap: '2px', margin: '4px 0 8px' }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Icon
                            key={i}
                            name="star"
                            style={{
                              width: '14px', height: '14px',
                              fill: i < r.rating ? '#F59E0B' : 'none',
                              stroke: '#F59E0B'
                            }}
                          />
                        ))}
                      </div>

                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                        {r.comment || r.Comment}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Booking Request Sidebar & Agent Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Booking card */}
          {user.role === 'Customer' && (
            <div className="card" style={{ padding: '28px', border: '1px solid var(--primary-light)', backgroundColor: 'var(--bg-card)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon name="calendar" style={{ width: '20px', height: '20px', color: 'var(--primary)' }} />
                Book a Visit
              </h3>

              <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Preferred Date & Time</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Special Notes</label>
                  <textarea
                    rows="3"
                    className="form-input"
                    placeholder="Ask about accessibility, specific rooms, etc..."
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    style={{ resize: 'none', fontFamily: 'inherit' }}
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={bookingLoading} style={{ width: '100%', marginTop: '8px' }}>
                  {bookingLoading ? 'Requesting...' : 'Request Tour Visit'}
                </button>
              </form>
            </div>
          )}

          {/* Agent Info card */}
          <div className="card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Listing Agent</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{
                width: '54px', height: '54px', borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-light)', color: 'var(--primary-hover)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '1.2rem'
              }}>
                {property.ownerName ? property.ownerName.split(' ').map(n => n[0]).join('') : 'AG'}
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{property.ownerName || 'Property Agent'}</h4>
                <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '2px 6px', marginTop: '4px' }}>Owner/Agent</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {property.ownerEmail && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon name="user" style={{ width: '16px', height: '16px' }} />
                  <span>{property.ownerEmail}</span>
                </div>
              )}
              {property.ownerPhone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon name="phone" style={{ width: '16px', height: '16px' }} />
                  <span>{property.ownerPhone}</span>
                </div>
              )}
            </div>

            {/* Local Wishlist Actions */}
            {user.role === 'Customer' && (
              <button
                className={`btn ${isWishlisted ? 'btn-primary' : 'btn-outline'}`}
                onClick={handleWishlistToggle}
                style={{ width: '100%', marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Icon name="star" style={{ width: '16px', height: '16px', fill: isWishlisted ? 'white' : 'none' }} />
                {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
