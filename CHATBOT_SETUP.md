# 🤖 Smart Real Estate - Gemini Chatbot Setup Guide

This guide walks you through setting up the Google Gemini-powered chatbot for property inquiries in your Smart Real Estate application.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Backend Setup (C#)](#backend-setup)
- [Frontend Setup (React)](#frontend-setup)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Usage Examples](#usage-examples)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required
- **.NET 6.0+** or **.NET Core 3.1+**
- **Node.js 14+** and **npm** or **yarn**
- **Google Cloud Account** with Gemini API access
- **Visual Studio Code** or **Visual Studio 2019+**

### Google Gemini API Setup
1. Go to [Google AI Studio](https://ai.google.dev/)
2. Sign up or log in with your Google account
3. Create a new API key
4. Copy your API key (keep it secure!)

---

## Backend Setup

### Step 1: Install NuGet Dependencies

```bash
dotnet add package System.Net.Http
dotnet add package System.Text.Json
```

### Step 2: Add Gemini Configuration

Update your `appsettings.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  },
  "Gemini": {
    "ApiKey": "YOUR_GEMINI_API_KEY_HERE"
  }
}
```

**⚠️ IMPORTANT:** Never commit your API key to version control. Use environment variables in production:

```bash
# .env (local development only)
GEMINI_API_KEY=your_api_key_here

# Then in your appsettings, reference it:
"Gemini": {
  "ApiKey": "${GEMINI_API_KEY}"
}
```

### Step 3: Register Service in Startup.cs

The service is already registered in the provided `Startup.cs`:

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddControllers();
    services.AddHttpClient();
    services.AddScoped<IGeminiChatbotService, GeminiChatbotService>();
    services.AddCors(options => { /* ... */ });
}
```

### Step 4: Run the Backend

```bash
cd SmartRealEstate
dotnet run
```

The API should be available at `https://localhost:5001` or `http://localhost:5000`

---

## Frontend Setup

### Step 1: Install React Dependencies

```bash
cd frontend
npm install
```

### Step 2: Add PropertyChatbot Component

The `PropertyChatbot.js` component is already provided in `frontend/src/components/`

### Step 3: Import and Use Component

In your main app file (e.g., `App.js`):

```javascript
import PropertyChatbot from './components/PropertyChatbot';

function App() {
  return (
    <div className="App">
      <PropertyChatbot />
    </div>
  );
}

export default App;
```

### Step 4: Configure API Base URL

If your backend runs on a different address, update the fetch URLs in `PropertyChatbot.js`:

```javascript
const API_BASE_URL = 'http://localhost:5000/api/chatbot';

// Then use it like:
const response = await fetch(`${API_BASE_URL}/inquiry`, {
  // ...
});
```

### Step 5: Run the Frontend

```bash
npm start
```

Frontend should open at `http://localhost:3000`

---

## Configuration

### Environment Variables

**Backend (.env or appsettings.json):**
```
GEMINI_API_KEY=your_actual_api_key
```

**Frontend (.env):**
```
REACT_APP_API_URL=http://localhost:5000
```

### CORS Settings

The backend allows all origins by default (suitable for development):

```csharp
options.AddPolicy("AllowAll", builder =>
{
    builder.AllowAnyOrigin()
           .AllowAnyMethod()
           .AllowAnyHeader();
});
```

For production, restrict to specific origins:

```csharp
builder.WithOrigins("https://yourdomain.com")
       .AllowAnyMethod()
       .AllowAnyHeader();
```

---

## API Endpoints

### 1. Property Inquiry
**POST** `/api/chatbot/inquiry`

Request:
```json
{
  "message": "Find 2-bedroom apartments under $2000"
}
```

Response:
```json
{
  "success": true,
  "message": "Based on your criteria, I found...",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 2. Generate Property Description
**POST** `/api/chatbot/generate-description`

Request:
```json
{
  "features": "- 3 bedrooms\n- 2 bathrooms\n- Pool\n- Rooftop terrace"
}
```

Response:
```json
{
  "success": true,
  "message": "Welcome to this stunning 3-bedroom property...",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 3. Analyze Property Image
**POST** `/api/chatbot/analyze-image`

Request:
```json
{
  "imageBase64": "iVBORw0KGgoAAAANSUhEUgAAAAEA..."
}
```

Response:
```json
{
  "success": true,
  "features": [
    "Living room with hardwood floors",
    "Modern kitchen with stainless steel appliances",
    "Large windows with natural lighting",
    "Spacious bedroom"
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Usage Examples

### Example 1: Property Search Query
```javascript
const userQuery = "Find luxury homes with ocean views under $5M in California";

const response = await fetch('/api/chatbot/inquiry', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: userQuery })
});

const result = await response.json();
console.log(result.message); // AI-powered property recommendations
```

### Example 2: Generate Listing Description
```javascript
const features = `
- 4 bedrooms, 3 bathrooms
- Modern architecture
- Infinity pool overlooking the city
- Smart home automation
- Located in prestigious neighborhood
`;

const response = await fetch('/api/chatbot/generate-description', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ features })
});

const result = await response.json();
console.log(result.message); // Professional listing description
```

### Example 3: Image Analysis
```javascript
const fileInput = document.getElementById('imageInput');
const file = fileInput.files[0];

const reader = new FileReader();
reader.onload = async (event) => {
  const base64 = event.target.result.split(',')[1];
  
  const response = await fetch('/api/chatbot/analyze-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64: base64 })
  });

  const result = await response.json();
  console.log(result.features); // Property features extracted from image
};

reader.readAsDataURL(file);
```

---

## Troubleshooting

### Issue: "Invalid API Key" Error
- **Solution**: Double-check your API key in `appsettings.json`
- Ensure the API key has Gemini API access enabled in Google Cloud Console

### Issue: CORS Error in Frontend
- **Solution**: Verify CORS policy is correctly configured in `Startup.cs`
- Check that the backend is running and accessible from the frontend

### Issue: Image Analysis Returns Empty Features
- **Solution**: Ensure image is in JPEG format and properly base64 encoded
- Try with a clearer, well-lit property image

### Issue: Slow API Responses
- **Solution**: Gemini API calls can take 2-5 seconds
- Consider implementing request timeouts and user feedback for long operations

### Issue: 500 Internal Server Error
- **Solution**: Check the backend logs in the console
- Verify all required NuGet packages are installed: `dotnet restore`

---

## Best Practices

### Security
1. **Never commit API keys** to version control
2. **Use environment variables** for sensitive data
3. **Implement rate limiting** on the backend
4. **Validate all user inputs** before sending to Gemini API

### Performance
1. **Cache responses** when possible
2. **Implement request timeouts** (typically 30-60 seconds)
3. **Use pagination** for large result sets
4. **Monitor API usage** and costs

### User Experience
1. Show **loading indicators** during API calls
2. Display **error messages** clearly
3. Provide **suggested queries** for first-time users
4. Implement **conversation history** for better context

---

## Next Steps

1. **Customize** property search logic based on your database
2. **Integrate** with your real estate database/MLS
3. **Add authentication** to the chatbot endpoints
4. **Deploy** to production (ensure secure API key handling)
5. **Monitor** API usage and implement cost controls

---

## Support & Resources

- **Google Gemini Documentation**: [https://ai.google.dev/](https://ai.google.dev/)
- **Google Cloud Vertex AI**: [https://cloud.google.com/vertex-ai](https://cloud.google.com/vertex-ai)
- **.NET Documentation**: [https://docs.microsoft.com/dotnet/](https://docs.microsoft.com/dotnet/)
- **React Documentation**: [https://react.dev/](https://react.dev/)

---

Happy coding! 🚀
