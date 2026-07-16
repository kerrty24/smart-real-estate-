import React, { useState, useEffect } from 'react';
import './PropertyComparison.css';

const PropertyComparison = ({ properties = [] }) => {
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Toggle property selection
  const togglePropertySelection = (propertyId) => {
    setSelectedProperties(prev => {
      if (prev.includes(propertyId)) {
        return prev.filter(id => id !== propertyId);
      } else {
        return [...prev, propertyId];
      }
    });
  };

  // Fetch comparison data
  const handleCompare = async () => {
    if (selectedProperties.length < 2) {
      setError('Please select at least 2 properties to compare');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/comparison/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyIds: selectedProperties })
      });

      const data = await response.json();
      if (data.success) {
        setComparisonData(data.data);
      } else {
        setError(data.error || 'Error fetching comparison data');
      }
    } catch (err) {
      setError('Failed to fetch comparison data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Clear comparison
  const handleClear = () => {
    setSelectedProperties([]);
    setComparisonData(null);
    setError(null);
  };

  return (
    <div className="comparison-container">
      <div className="comparison-header">
        <h1>🏠 Property Comparison Tool</h1>
        <p>Compare multiple properties side by side</p>
      </div>

      {/* Property Selection Panel */}
      <div className="selection-panel">
        <h2>Select Properties to Compare</h2>
        <div className="property-list">
          {properties && properties.length > 0 ? (
            properties.map(property => (
              <div
                key={property.id}
                className={`property-card ${selectedProperties.includes(property.id) ? 'selected' : ''}`}
                onClick={() => togglePropertySelection(property.id)}
              >
                <div className="property-image">
                  <img src={property.imageUrls?.[0] || '/placeholder.png'} alt={property.address} />
                </div>
                <div className="property-info">
                  <h3>{property.address}</h3>
                  <p className="city">{property.city}, {property.state}</p>
                  <p className="price">${property.price.toLocaleString()}</p>
                  <div className="specs">
                    <span>🛏️ {property.bedrooms} bed</span>
                    <span>🚿 {property.bathrooms} bath</span>
                    <span>📐 {property.squareFeet.toLocaleString()} sqft</span>
                  </div>
                </div>
                <div className="checkbox">
                  {selectedProperties.includes(property.id) && '✓'}
                </div>
              </div>
            ))
          ) : (
            <p>No properties available</p>
          )}
        </div>

        <div className="action-buttons">
          <button
            className="compare-btn"
            onClick={handleCompare}
            disabled={selectedProperties.length < 2 || loading}
          >
            {loading ? 'Comparing...' : `Compare ${selectedProperties.length} Properties`}
          </button>
          {selectedProperties.length > 0 && (
            <button className="clear-btn" onClick={handleClear}>
              Clear Selection
            </button>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>

      {/* Comparison Results */}
      {comparisonData && (
        <div className="comparison-results">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`tab ${activeTab === 'price' ? 'active' : ''}`}
              onClick={() => setActiveTab('price')}
            >
              Price Analysis
            </button>
            <button
              className={`tab ${activeTab === 'size' ? 'active' : ''}`}
              onClick={() => setActiveTab('size')}
            >
              Size Comparison
            </button>
            <button
              className={`tab ${activeTab === 'amenities' ? 'active' : ''}`}
              onClick={() => setActiveTab('amenities')}
            >
              Amenities
            </button>
            <button
              className={`tab ${activeTab === 'location' ? 'active' : ''}`}
              onClick={() => setActiveTab('location')}
            >
              Location
            </button>
            <button
              className={`tab ${activeTab === 'scores' ? 'active' : ''}`}
              onClick={() => setActiveTab('scores')}
            >
              Scores
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="tab-content">
              <OverviewTab data={comparisonData} />
            </div>
          )}

          {/* Price Analysis Tab */}
          {activeTab === 'price' && (
            <div className="tab-content">
              <PriceAnalysisTab data={comparisonData.priceAnalysis} properties={comparisonData.properties} />
            </div>
          )}

          {/* Size Comparison Tab */}
          {activeTab === 'size' && (
            <div className="tab-content">
              <SizeComparisonTab data={comparisonData.sizeAnalysis} properties={comparisonData.properties} />
            </div>
          )}

          {/* Amenities Tab */}
          {activeTab === 'amenities' && (
            <div className="tab-content">
              <AmenitiesTab data={comparisonData.amenitiesAnalysis} properties={comparisonData.properties} />
            </div>
          )}

          {/* Location Tab */}
          {activeTab === 'location' && (
            <div className="tab-content">
              <LocationTab data={comparisonData.locationAnalysis} properties={comparisonData.properties} />
            </div>
          )}

          {/* Scores Tab */}
          {activeTab === 'scores' && (
            <div className="tab-content">
              <ScoresTab data={comparisonData.overallScores} properties={comparisonData.properties} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Overview Component
const OverviewTab = ({ data }) => (
  <div className="overview-grid">
    {data.properties.map(property => (
      <div key={property.id} className="overview-card">
        <img src={property.imageUrls?.[0] || '/placeholder.png'} alt={property.address} />
        <h3>{property.address}</h3>
        <p>{property.city}, {property.state} {property.zipCode}</p>
        <div className="overview-details">
          <p><strong>Price:</strong> ${property.price.toLocaleString()}</p>
          <p><strong>Size:</strong> {property.squareFeet.toLocaleString()} sqft</p>
          <p><strong>Bedrooms:</strong> {property.bedrooms}</p>
          <p><strong>Bathrooms:</strong> {property.bathrooms}</p>
          <p><strong>Year Built:</strong> {property.yearBuilt}</p>
          <p><strong>Type:</strong> {property.propertyType}</p>
        </div>
      </div>
    ))}
  </div>
);

// Price Analysis Component
const PriceAnalysisTab = ({ data, properties }) => (
  <div className="analysis-content">
    <div className="metrics-grid">
      <div className="metric-card">
        <h3>Lowest Price</h3>
        <p className="metric-value">${data.minPrice.toLocaleString()}</p>
      </div>
      <div className="metric-card">
        <h3>Highest Price</h3>
        <p className="metric-value">${data.maxPrice.toLocaleString()}</p>
      </div>
      <div className="metric-card">
        <h3>Average Price</h3>
        <p className="metric-value">${data.averagePrice.toLocaleString()}</p>
      </div>
      <div className="metric-card">
        <h3>Price Range</h3>
        <p className="metric-value">${data.priceRange.toLocaleString()}</p>
      </div>
    </div>

    <div className="comparison-table">
      <table>
        <thead>
          <tr>
            <th>Property</th>
            <th>Price</th>
            <th>Price/sqft</th>
            <th>vs Average</th>
          </tr>
        </thead>
        <tbody>
          {properties.map(prop => {
            const metrics = data.propertyPrices[prop.id];
            return (
              <tr key={prop.id}>
                <td>{prop.address}</td>
                <td>${metrics.price.toLocaleString()}</td>
                <td>${metrics.pricePerSquareFoot.toFixed(2)}</td>
                <td className={metrics.priceDifferenceFromAverage > 0 ? 'negative' : 'positive'}>
                  {metrics.priceDifferenceFromAverage > 0 ? '+' : ''}{metrics.percentageDifferenceFromAverage.toFixed(2)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

// Size Comparison Component
const SizeComparisonTab = ({ data, properties }) => (
  <div className="analysis-content">
    <div className="metrics-grid">
      <div className="metric-card">
        <h3>Smallest</h3>
        <p className="metric-value">{data.minSize.toLocaleString()} sqft</p>
      </div>
      <div className="metric-card">
        <h3>Largest</h3>
        <p className="metric-value">{data.maxSize.toLocaleString()} sqft</p>
      </div>
      <div className="metric-card">
        <h3>Average Size</h3>
        <p className="metric-value">{data.averageSize.toLocaleString()} sqft</p>
      </div>
    </div>

    <div className="comparison-table">
      <table>
        <thead>
          <tr>
            <th>Property</th>
            <th>Square Feet</th>
            <th>Bedrooms</th>
            <th>Bathrooms</th>
          </tr>
        </thead>
        <tbody>
          {properties.map(prop => {
            const metrics = data.propertySizes[prop.id];
            return (
              <tr key={prop.id}>
                <td>{prop.address}</td>
                <td>{metrics.squareFeet.toLocaleString()}</td>
                <td>{metrics.bedrooms}</td>
                <td>{metrics.bathrooms}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

// Amenities Component
const AmenitiesTab = ({ data, properties }) => (
  <div className="analysis-content">
    <div className="amenities-section">
      <h3>Common Amenities</h3>
      <div className="amenity-list">
        {data.commonAmenities.length > 0 ? (
          data.commonAmenities.map((amenity, idx) => (
            <span key={idx} className="amenity-tag common">✓ {amenity}</span>
          ))
        ) : (
          <p>No common amenities</p>
        )}
      </div>
    </div>

    <div className="amenities-section">
      <h3>Unique Amenities</h3>
      {properties.map(prop => (
        <div key={prop.id} className="property-amenities">
          <h4>{prop.address}</h4>
          <div className="amenity-list">
            {prop.amenities.filter(a => !data.commonAmenities.includes(a)).length > 0 ? (
              prop.amenities.filter(a => !data.commonAmenities.includes(a)).map((amenity, idx) => (
                <span key={idx} className="amenity-tag unique">★ {amenity}</span>
              ))
            ) : (
              <p>No unique amenities</p>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Location Component
const LocationTab = ({ data, properties }) => (
  <div className="analysis-content">
    <div className="location-info">
      <p><strong>Center Point:</strong> {data.centerLatitude.toFixed(4)}, {data.centerLongitude.toFixed(4)}</p>
      <h3>Properties by City:</h3>
      <ul>
        {Object.entries(data.propertyCountByCity).map(([city, count]) => (
          <li key={city}>{city}: {count} property/ies</li>
        ))}
      </ul>
    </div>

    <div className="comparison-table">
      <table>
        <thead>
          <tr>
            <th>Property</th>
            <th>Distance from Center</th>
          </tr>
        </thead>
        <tbody>
          {properties.map(prop => (
            <tr key={prop.id}>
              <td>{prop.address}</td>
              <td>{data.distancesFromCenter[prop.id]?.toFixed(2)} km</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Scores Component
const ScoresTab = ({ data, properties }) => (
  <div className="analysis-content">
    <div className="scores-grid">
      {properties.map(prop => {
        const score = data.propertyScores[prop.id];
        return (
          <div key={prop.id} className="score-card">
            <h3>{prop.address}</h3>
            <div className="score-display">
              <div className="overall-score">
                <div className="score-value">{score.overallScore.toFixed(1)}</div>
                <div className="score-label">Overall Score</div>
              </div>
            </div>
            <div className="individual-scores">
              <div className="score-bar">
                <label>Price</label>
                <div className="bar" style={{ width: `${score.priceScore}%` }}></div>
                <span>{score.priceScore.toFixed(1)}</span>
              </div>
              <div className="score-bar">
                <label>Size</label>
                <div className="bar" style={{ width: `${score.sizeScore}%` }}></div>
                <span>{score.sizeScore.toFixed(1)}</span>
              </div>
              <div className="score-bar">
                <label>Amenities</label>
                <div className="bar" style={{ width: `${score.amenityScore}%` }}></div>
                <span>{score.amenityScore.toFixed(1)}</span>
              </div>
              <div className="score-bar">
                <label>Location</label>
                <div className="bar" style={{ width: `${score.locationScore}%` }}></div>
                <span>{score.locationScore.toFixed(1)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default PropertyComparison;
