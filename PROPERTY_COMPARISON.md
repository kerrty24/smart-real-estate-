# 🏠 Property Comparison Feature

## Overview

The Property Comparison feature allows users to compare multiple properties side by side with comprehensive analysis including:

- **Price Analysis** - Compare pricing, price per sqft, and value metrics
- **Size Comparison** - Compare square footage, bedrooms, bathrooms
- **Amenities Analysis** - Identify common and unique amenities
- **Location Comparison** - Analyze geographic distribution and distances
- **Overall Scoring** - AI-powered scoring system with weighted metrics

---

## Architecture

### Backend Components

#### 1. **Models** (`Models/PropertyModels.cs`)
- `Property` - Represents a real estate property
- `PropertyComparison` - Stores comparison metadata
- `ComparisonMetrics` - Complete comparison analysis
- `PriceComparison` - Price analysis metrics
- `SizeComparison` - Size analysis metrics
- `AmenitiesComparison` - Amenities analysis
- `LocationComparison` - Location analysis
- `OverallScore` - Scoring system

#### 2. **Service** (`Services/PropertyComparisonService.cs`)

**Interface: `IPropertyComparisonService`**

```csharp
Task<ComparisonMetrics> ComparePropertiesAsync(List<int> propertyIds);
Task<PriceComparison> ComparePricesAsync(List<Property> properties);
Task<SizeComparison> CompareSizesAsync(List<Property> properties);
Task<AmenitiesComparison> CompareAmenitiesAsync(List<Property> properties);
Task<LocationComparison> CompareLocationsAsync(List<Property> properties);
Task<OverallScore> CalculateOverallScoresAsync(ComparisonMetrics metrics);
```

**Key Features:**
- Calculates min, max, average, and range for prices and sizes
- Identifies common and unique amenities across properties
- Computes geographic distances using Haversine formula
- Generates weighted overall scores (25% each: Price, Size, Amenities, Location)

#### 3. **Controller** (`Controllers/ComparisonController.cs`)

**Endpoints:**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/comparison/compare` | POST | Full comparison for multiple properties |
| `/api/comparison/price-analysis` | POST | Price analysis only |
| `/api/comparison/size-analysis` | POST | Size comparison only |
| `/api/comparison/amenities-analysis` | POST | Amenities comparison only |
| `/api/comparison/location-analysis` | POST | Location analysis only |
| `/api/comparison/overall-scores` | POST | Calculate overall scores |

---

### Frontend Components

#### 1. **PropertyComparison Component** (`frontend/src/components/PropertyComparison.js`)

**Features:**
- Property selection with visual feedback
- Multi-tab interface for different analysis views
- Real-time comparison calculations
- Responsive design for mobile and desktop

**Tabs:**
1. **Overview** - Side-by-side property cards
2. **Price Analysis** - Pricing metrics and comparisons
3. **Size Comparison** - Size and bedroom/bathroom details
4. **Amenities** - Common and unique features
5. **Location** - Geographic information
6. **Scores** - Overall scoring with breakdown

#### 2. **Styling** (`frontend/src/components/PropertyComparison.css`)
- Modern gradient design
- Responsive grid layouts
- Interactive hover effects
- Mobile-friendly interfaces

---

## API Documentation

### Request Format

```json
{
  "propertyIds": [1, 2, 3]
}
```

### Response Format

```json
{
  "success": true,
  "data": {
    "properties": [...],
    "priceAnalysis": {...},
    "sizeAnalysis": {...},
    "amenitiesAnalysis": {...},
    "locationAnalysis": {...},
    "overallScores": {...}
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Usage Examples

### Basic Comparison

```csharp
var propertyIds = new List<int> { 1, 2, 3 };
var metrics = await comparisonService.ComparePropertiesAsync(propertyIds);
```

### Frontend Usage

```javascript
const response = await fetch('/api/comparison/compare', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ propertyIds: [1, 2, 3] })
});

const result = await response.json();
setComparisonData(result.data);
```

---

## Scoring System

### Score Breakdown

Each property receives scores in four categories (0-100):

1. **Price Score** - Lower price = higher score (inverse scale)
2. **Size Score** - Larger property = higher score
3. **Amenity Score** - More amenities = higher score
4. **Location Score** - Closer to center = higher score

### Overall Score Calculation

```
Overall Score = (Price × 0.25) + (Size × 0.25) + (Amenities × 0.25) + (Location × 0.25)
```

**To adjust weights**, modify the calculation in `CalculateOverallScoresAsync()`:

```csharp
score.OverallScore = (score.PriceScore * 0.25) +      // Change weight here
                     (score.SizeScore * 0.25) +        // Change weight here
                     (score.AmenityScore * 0.25) +     // Change weight here
                     (score.LocationScore * 0.25);     // Change weight here
```

---

## Installation

### Backend Setup

1. **Register Service in Startup.cs:**

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddControllers();
    services.AddScoped<IPropertyComparisonService, PropertyComparisonService>();
}
```

2. **Run the application:**

```bash
dotnet run
```

### Frontend Setup

1. **Install React component:**

```bash
npm install
```

2. **Import and use:**

```javascript
import PropertyComparison from './components/PropertyComparison';

function App() {
  const properties = [/* ... */];
  return <PropertyComparison properties={properties} />;
}
```

---

## Features

### ✅ Implemented

- [x] Multi-property comparison
- [x] Price analysis with per-sqft calculations
- [x] Size comparison with bedroom/bathroom metrics
- [x] Amenities identification (common vs unique)
- [x] Geographic distance calculations
- [x] Weighted overall scoring
- [x] Responsive UI with tabbed interface
- [x] Real-time analysis
- [x] Error handling

### 🚀 Future Enhancements

- [ ] Historical price tracking
- [ ] Market trend analysis
- [ ] Investment potential scoring
- [ ] Mortgage calculator integration
- [ ] PDF export reports
- [ ] Map visualization
- [ ] Saved comparisons
- [ ] User comparison history
- [ ] ML-based recommendations
- [ ] Market data integration

---

## Performance Considerations

- Comparison calculations run asynchronously
- Distance calculations use Haversine formula (optimized for accuracy)
- Scores calculated in-memory for fast results
- Frontend pagination for large result sets (future)

---

## Error Handling

```json
{
  "success": false,
  "error": "At least 2 property IDs are required for comparison",
  "details": "Exception message here"
}
```

---

## Best Practices

1. **Always select 2+ properties** before comparing
2. **Cache results** on frontend to avoid redundant API calls
3. **Use TypeScript** for type safety (future enhancement)
4. **Implement user authentication** before saving comparisons
5. **Add database persistence** for user's comparison history

---

## Testing

### Sample Test Data

```csharp
var property1 = new Property 
{
    Id = 1,
    Address = "123 Main St",
    Price = 500000,
    Bedrooms = 3,
    Bathrooms = 2,
    SquareFeet = 2000,
    Latitude = 40.7128,
    Longitude = -74.0060
};
```

---

## Support & Troubleshooting

### Issue: "At least 2 properties required"
- **Solution**: Ensure you select 2 or more properties before comparing

### Issue: No amenities showing
- **Solution**: Verify property data includes amenities in the database

### Issue: Location distances are 0
- **Solution**: Ensure properties have valid latitude/longitude coordinates

---

## Resources

- [C# Async/Await](https://docs.microsoft.com/dotnet/csharp/asynchronous-programming)
- [React Hooks](https://react.dev/reference/react)
- [Haversine Formula](https://en.wikipedia.org/wiki/Haversine_formula)
- [REST API Design](https://restfulapi.net/)

---

## Contributing

To add new comparison metrics:

1. Add new model in `PropertyModels.cs`
2. Add method in `IPropertyComparisonService`
3. Implement calculation in `PropertyComparisonService`
4. Create API endpoint in `ComparisonController`
5. Add UI tab in `PropertyComparison.js`

---

**Created:** 2024  
**Status:** Ready for Production  
**Version:** 1.0.0
