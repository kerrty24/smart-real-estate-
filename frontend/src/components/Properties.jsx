import React, { useState, useEffect } from 'react';
import { api } from '../api';
import Icon from '../Icon';

const Properties = ({ user, setView, setSelectedPropertyId, addToast }) => {
  const [properties, setProperties] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [city, setCity] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [parking, setParking] = useState(null);
  const [furnished, setFurnished] = useState(null);
  
  // View toggle: 'all' or 'mine' (Agent/Admin only)
  const [viewScope, setViewScope] = useState('all'); 
  
  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 6;

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Listing Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [formCity, setFormCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [formPropertyType, setFormPropertyType] = useState('Apartment');
  const [price, setPrice] = useState('');
  const [area, setArea] = useState('');
  const [formBedrooms, setFormBedrooms] = useState('1');
  const [formBathrooms, setFormBathrooms] = useState('1');
  const [formParking, setFormParking] = useState(false);
  const [formFurnished, setFormFurnished] = useState(false);
  const [amenities, setAmenities] = useState('');
  const [imageFiles, setImageFiles] = useState([]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = {
        PageNumber: page,
        PageSize: pageSize,
        SortBy: 'createddate',
        SortDescending: true
      };

      if (searchTerm) params.SearchTerm = searchTerm;
      if (propertyType) params.PropertyType = propertyType;
      if (city) params.City = city;
      if (minPrice) params.MinPrice = parseFloat(minPrice);
      if (maxPrice) params.MaxPrice = parseFloat(maxPrice);
      if (bedrooms) params.Bedrooms = parseInt(bedrooms, 10);
      if (bathrooms) params.Bathrooms = parseInt(bathrooms, 10);
      if (parking !== null) params.Parking = parking;
      if (furnished !== null) params.Furnished = furnished;

      // Filter own properties
      if (viewScope === 'mine') {
        params.Status = null; // Show all statuses (Available, Booked) for own listings
      }

      // Convert params to query string
      const query = Object.keys(params)
        .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
        .join('&');

      const response = await api.get(`/api/property?${query}`);
      
      let dataList = [];
      if (response && response.data) {
        dataList = response.data;
        setTotalCount(response.totalCount || response.data.length);
      } else {
        dataList = response || [];
        setTotalCount(dataList.length);
      }

      // If scope is 'mine', filter locally just in case backend query returns everything
      if (viewScope === 'mine') {
        dataList = dataList.filter(p => p.ownerId === user.id);
      }

      setProperties(dataList);
    } catch (err) {
      console.error(err);
      addToast('Failed to load properties.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [page, propertyType, city, minPrice, maxPrice, bedrooms, bathrooms, parking, furnished, viewScope]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProperties();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setPropertyType('');
    setCity('');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
    setBathrooms('');
    setParking(null);
    setFurnished(null);
    setPage(1);
  };

  // AI Description Generator
  const handleGenerateAiDescription = async () => {
    if (!title || !formPropertyType || !area) {
      addToast('Please fill in Title, Type, and Area first to guide the AI.', 'warning');
      return;
    }

    setAiGenerating(true);
    try {
      const response = await api.post('/api/ai/generate-description', {
        title,
        propertyType: formPropertyType,
        bedrooms: parseInt(formBedrooms, 10),
        bathrooms: parseInt(formBathrooms, 10),
        amenities,
        location: `${address}, ${formCity}, ${state}`
      });
      setDescription(response.description || response.Description || '');
      addToast('AI Description generated successfully!', 'success');
    } catch (err) {
      addToast('AI generation failed.', 'danger');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleCreateProperty = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newProperty = await api.post('/api/property', {
        title,
        description,
        address,
        city: formCity,
        state,
        country,
        propertyType: formPropertyType,
        price: parseFloat(price),
        area: parseFloat(area),
        bedrooms: parseInt(formBedrooms, 10),
        bathrooms: parseInt(formBathrooms, 10),
        parking: formParking,
        furnished: formFurnished,
        amenities,
        latitude: 0,
        longitude: 0
      });

      // Upload images if any
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const formData = new FormData();
          formData.append('file', file);
          await api.upload(`/api/property/${newProperty.id}/images`, formData);
        }
      }

      addToast('Property listing created successfully!', 'success');
      setShowAddModal(false);
      resetForm();
      fetchProperties();
    } catch (err) {
      addToast(err.message || 'Failed to create listing.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (property) => {
    setEditingProperty(property);
    setTitle(property.title);
    setDescription(property.description);
    setAddress(property.address);
    setFormCity(property.city);
    setState(property.state);
    setCountry(property.country);
    setFormPropertyType(property.propertyType);
    setPrice(property.price.toString());
    setArea(property.area.toString());
    setFormBedrooms(property.bedrooms.toString());
    setFormBathrooms(property.bathrooms.toString());
    setFormParking(property.parking);
    setFormFurnished(property.furnished);
    setAmenities(property.amenities);
    setShowEditModal(true);
  };

  const handleUpdateProperty = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put(`/api/property/${editingProperty.id}`, {
        title,
        description,
        address,
        city: formCity,
        state,
        country,
        propertyType: formPropertyType,
        price: parseFloat(price),
        area: parseFloat(area),
        bedrooms: parseInt(formBedrooms, 10),
        bathrooms: parseInt(formBathrooms, 10),
        parking: formParking,
        furnished: formFurnished,
        amenities,
        latitude: 0,
        longitude: 0,
        status: editingProperty.status // preserve status
      });

      // Upload new images if any
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const formData = new FormData();
          formData.append('file', file);
          await api.upload(`/api/property/${editingProperty.id}/images`, formData);
        }
      }

      addToast('Listing updated successfully!', 'success');
      setShowEditModal(false);
      resetForm();
      fetchProperties();
    } catch (err) {
      addToast(err.message || 'Failed to update listing.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property listing permanently?')) return;

    try {
      await api.delete(`/api/property/${id}`);
      addToast('Listing deleted successfully.', 'success');
      fetchProperties();
    } catch (err) {
      addToast('Failed to delete listing.', 'danger');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setAddress('');
    setFormCity('');
    setState('');
    setCountry('');
    setFormPropertyType('Apartment');
    setPrice('');
    setArea('');
    setFormBedrooms('1');
    setFormBathrooms('1');
    setFormParking(false);
    setFormFurnished(false);
    setAmenities('');
    setImageFiles([]);
    setEditingProperty(null);
  };

  return (
    <div>
      {/* Header buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Toggle Scope (All / Mine) */}
        {(user.role === 'Agent' || user.role === 'Admin') && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className={`btn ${viewScope === 'all' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => { setViewScope('all'); setPage(1); }}
            >
              Browse All
            </button>
            <button
              className={`btn ${viewScope === 'mine' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => { setViewScope('mine'); setPage(1); }}
            >
              My Listings
            </button>
          </div>
        )}

        {/* Add Listing Button */}
        {(user.role === 'Agent' || user.role === 'Admin') && (
          <button
            className="btn btn-primary"
            onClick={() => { resetForm(); setShowAddModal(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Icon name="plus" style={{ width: '18px', height: '18px' }} />
            List a Property
          </button>
        )}
      </div>

      {/* Main Grid: Filters + Listings */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '32px', alignItems: 'flex-start' }} className="grid-responsive-parent">
        {/* Filters Sidebar */}
        <aside className="card" style={{ padding: '24px', position: 'sticky', top: '100px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="filter" style={{ width: '18px', height: '18px' }} />
              Filters
            </h3>
            <button
              onClick={handleClearFilters}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Clear All
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Search Input */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Search Text</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Title, city, address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Property Type */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Property Type</label>
              <select
                className="form-input"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="Apartment">Apartment</option>
                <option value="House">House</option>
                <option value="Condo">Condo</option>
                <option value="Townhouse">Townhouse</option>
                <option value="Land">Land</option>
              </select>
            </div>

            {/* City */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">City</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. New York"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            {/* Price Range */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Price Range</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <span style={{ color: 'var(--text-light)' }}>-</span>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            {/* Bedrooms & Bathrooms */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Beds</label>
                <select
                  className="form-input"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Baths</label>
                <select
                  className="form-input"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                </select>
              </div>
            </div>

            {/* Toggles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                <input
                  type="checkbox"
                  checked={parking === true}
                  onChange={(e) => setParking(e.target.checked ? true : null)}
                />
                Requires Parking
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                <input
                  type="checkbox"
                  checked={furnished === true}
                  onChange={(e) => setFurnished(e.target.checked ? true : null)}
                />
                Requires Furnished
              </label>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
              Apply Filters
            </button>
          </form>
        </aside>

        {/* Listings Content */}
        <div style={{ flex: 1 }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
              <Icon name="loader" style={{ width: '40px', height: '40px', color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : properties.length === 0 ? (
            <div className="card" style={{ padding: '64px', textAlign: 'center', color: 'var(--text-light)' }}>
              <Icon name="search" style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.5 }} />
              <h4>No Properties Found</h4>
              <p style={{ marginTop: '8px' }}>Try clearing some filters or searching for another location.</p>
            </div>
          ) : (
            <>
              {/* Properties Grid */}
              <div className="grid grid-3">
                {properties.map(p => {
                  const primaryImage = p.images?.find(img => img.isPrimary || img.IsPrimary)?.imageUrl || 
                    (p.images?.length > 0 ? p.images[0].imageUrl : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=600');
                  
                  return (
                    <article className="card" key={p.id} style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
                      {/* Image Block */}
                      <div style={{ position: 'relative', paddingTop: '65%', overflow: 'hidden', background: '#e2e8f0' }}>
                        <img
                          src={primaryImage}
                          alt={p.title}
                          style={{
                            position: 'absolute',
                            top: 0, left: 0, width: '100%', height: '100%',
                            objectFit: 'cover',
                            transition: 'var(--transition-slow)'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        />
                        <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '8px', flexDirection: 'column' }}>
                          <span className={`badge ${p.status === 'Available' ? 'badge-success' : 'badge-warning'}`}>
                            {p.status}
                          </span>
                          <span className="badge badge-info">{p.propertyType}</span>
                        </div>
                        {p.averageRating > 0 && (
                          <div style={{
                            position: 'absolute', bottom: '12px', right: '12px',
                            backgroundColor: 'rgba(15, 23, 42, 0.75)', color: 'white',
                            padding: '4px 8px', borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem', fontWeight: 700,
                            display: 'flex', alignItems: 'center', gap: '4px',
                            backdropFilter: 'blur(4px)'
                          }}>
                            <Icon name="star" style={{ width: '12px', height: '12px', fill: '#F59E0B', stroke: '#F59E0B' }} />
                            {p.averageRating}
                          </div>
                        )}
                      </div>

                      {/* Info Block */}
                      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                          <h4 style={{
                            fontSize: '1rem',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            margin: 0
                          }}>
                            {p.title}
                          </h4>
                          <p style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-light)', fontSize: '0.8rem', marginTop: '4px' }}>
                            <Icon name="mapPin" style={{ width: '12px', height: '12px' }} />
                            {p.city}, {p.state}
                          </p>
                        </div>

                        {/* Specs Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', padding: '10px 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
                          <div style={{ textAlign: 'center' }}>
                            <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: 600 }}>BEDS</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{p.bedrooms}</span>
                          </div>
                          <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)' }}>
                            <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: 600 }}>BATHS</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{p.bathrooms}</span>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: 600 }}>SQ FT</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{p.area}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '4px' }}>
                          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
                            ${p.price.toLocaleString()}
                          </span>
                          
                          {/* Actions */}
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {viewScope === 'mine' ? (
                              <>
                                <button
                                  className="btn btn-outline"
                                  onClick={(e) => { e.stopPropagation(); handleEditClick(p); }}
                                  style={{ padding: '6px', borderRadius: 'var(--radius-sm)' }}
                                >
                                  <Icon name="edit" style={{ width: '14px', height: '14px' }} />
                                </button>
                                <button
                                  className="btn btn-outline"
                                  onClick={(e) => { e.stopPropagation(); handleDeleteProperty(p.id); }}
                                  style={{ padding: '6px', borderRadius: 'var(--radius-sm)', color: 'var(--danger)' }}
                                >
                                  <Icon name="trash" style={{ width: '14px', height: '14px' }} />
                                </button>
                              </>
                            ) : null}
                            <button
                              className="btn btn-primary"
                              onClick={() => { setSelectedPropertyId(p.id); setView('property-details'); }}
                              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalCount > pageSize && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '32px' }}>
                  <button
                    className="btn btn-outline"
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                  >
                    Previous
                  </button>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                    Page {page} of {Math.ceil(totalCount / pageSize)}
                  </span>
                  <button
                    className="btn btn-outline"
                    disabled={page >= Math.ceil(totalCount / pageSize)}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* CREATE PROPERTY MODAL */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
          padding: '24px'
        }}>
          <div className="card" style={{
            maxWidth: '650px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
            padding: '32px', boxShadow: 'var(--shadow-xl)', position: 'relative'
          }}>
            <button
              onClick={() => setShowAddModal(false)}
              style={{
                position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none',
                color: 'var(--text-light)', cursor: 'pointer', fontSize: '1.2rem'
              }}
            >
              ✕
            </button>
            <h3 style={{ marginBottom: '24px' }}>List New Property</h3>

            <form onSubmit={handleCreateProperty}>
              <div className="form-group">
                <label className="form-label">Property Title</label>
                <input type="text" className="form-input" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Modern Spacious Apartment" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Property Type</label>
                  <select className="form-input" value={formPropertyType} onChange={(e) => setFormPropertyType(e.target.value)}>
                    <option value="Apartment">Apartment</option>
                    <option value="House">House</option>
                    <option value="Condo">Condo</option>
                    <option value="Townhouse">Townhouse</option>
                    <option value="Land">Land</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Price (USD)</label>
                  <input type="number" className="form-input" required value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 250000" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Area (sq ft)</label>
                  <input type="number" className="form-input" required value={area} onChange={(e) => setArea(e.target.value)} placeholder="1200" />
                </div>
                <div className="form-group">
                  <label className="form-label">Beds</label>
                  <input type="number" className="form-input" required value={formBedrooms} onChange={(e) => setFormBedrooms(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Baths</label>
                  <input type="number" className="form-input" required value={formBathrooms} onChange={(e) => setFormBathrooms(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Amenities (comma-separated)</label>
                <input type="text" className="form-input" value={amenities} onChange={(e) => setAmenities(e.target.value)} placeholder="Pool, Gym, Elevator, Garage, Garden" />
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <input type="text" className="form-input" required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input type="text" className="form-input" required value={formCity} onChange={(e) => setFormCity(e.target.value)} placeholder="Chicago" />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input type="text" className="form-input" required value={state} onChange={(e) => setState(e.target.value)} placeholder="IL" />
                </div>
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input type="text" className="form-input" required value={country} onChange={(e) => setCountry(e.target.value)} placeholder="USA" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '24px', margin: '8px 0 20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                  <input type="checkbox" checked={formParking} onChange={(e) => setFormParking(e.target.checked)} />
                  Parking Available
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                  <input type="checkbox" checked={formFurnished} onChange={(e) => setFormFurnished(e.target.checked)} />
                  Fully Furnished
                </label>
              </div>

              {/* AI Description Helper */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label" style={{ margin: 0 }}>Description</label>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleGenerateAiDescription}
                  disabled={aiGenerating}
                  style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: 'var(--primary)', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {aiGenerating ? (
                    <Icon name="loader" style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <Icon name="sparkles" style={{ width: '14px', height: '14px' }} />
                  )}
                  AI Auto-Write
                </button>
              </div>
              <div className="form-group">
                <textarea
                  className="form-input"
                  required
                  rows="4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your listing details..."
                  style={{ resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>

              {/* Upload Images */}
              <div className="form-group">
                <label className="form-label">Upload Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setImageFiles(Array.from(e.target.files))}
                  style={{
                    display: 'block', width: '100%', padding: '12px',
                    border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '24px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PROPERTY MODAL */}
      {showEditModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
          padding: '24px'
        }}>
          <div className="card" style={{
            maxWidth: '650px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
            padding: '32px', boxShadow: 'var(--shadow-xl)', position: 'relative'
          }}>
            <button
              onClick={() => setShowEditModal(false)}
              style={{
                position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none',
                color: 'var(--text-light)', cursor: 'pointer', fontSize: '1.2rem'
              }}
            >
              ✕
            </button>
            <h3 style={{ marginBottom: '24px' }}>Edit Property Listing</h3>

            <form onSubmit={handleUpdateProperty}>
              <div className="form-group">
                <label className="form-label">Property Title</label>
                <input type="text" className="form-input" required value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Property Type</label>
                  <select className="form-input" value={formPropertyType} onChange={(e) => setFormPropertyType(e.target.value)}>
                    <option value="Apartment">Apartment</option>
                    <option value="House">House</option>
                    <option value="Condo">Condo</option>
                    <option value="Townhouse">Townhouse</option>
                    <option value="Land">Land</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Price (USD)</label>
                  <input type="number" className="form-input" required value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Area (sq ft)</label>
                  <input type="number" className="form-input" required value={area} onChange={(e) => setArea(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Beds</label>
                  <input type="number" className="form-input" required value={formBedrooms} onChange={(e) => setFormBedrooms(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Baths</label>
                  <input type="number" className="form-input" required value={formBathrooms} onChange={(e) => setFormBathrooms(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Amenities (comma-separated)</label>
                <input type="text" className="form-input" value={amenities} onChange={(e) => setAmenities(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <input type="text" className="form-input" required value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input type="text" className="form-input" required value={formCity} onChange={(e) => setFormCity(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input type="text" className="form-input" required value={state} onChange={(e) => setState(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input type="text" className="form-input" required value={country} onChange={(e) => setCountry(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '24px', margin: '8px 0 20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                  <input type="checkbox" checked={formParking} onChange={(e) => setFormParking(e.target.checked)} />
                  Parking Available
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                  <input type="checkbox" checked={formFurnished} onChange={(e) => setFormFurnished(e.target.checked)} />
                  Fully Furnished
                </label>
              </div>

              {/* AI Description Helper */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label" style={{ margin: 0 }}>Description</label>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleGenerateAiDescription}
                  disabled={aiGenerating}
                  style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: 'var(--primary)', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {aiGenerating ? (
                    <Icon name="loader" style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <Icon name="sparkles" style={{ width: '14px', height: '14px' }} />
                  )}
                  AI Rewrite
                </button>
              </div>
              <div className="form-group">
                <textarea
                  className="form-input"
                  required
                  rows="4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>

              {/* Upload More Images */}
              <div className="form-group">
                <label className="form-label">Add More Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setImageFiles(Array.from(e.target.files))}
                  style={{
                    display: 'block', width: '100%', padding: '12px',
                    border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '24px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Properties;
