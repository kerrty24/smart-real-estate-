const API_BASE_URL = ''; // Proxied via Vite config to http://localhost:5265

// LocalStorage helpers
export const getAuthToken = () => localStorage.getItem('access_token');
export const getRefreshToken = () => localStorage.getItem('refresh_token');
export const getUserData = () => {
  const user = localStorage.getItem('user_data');
  return user ? JSON.parse(user) : null;
};

export const setAuthSession = (authResponse) => {
  localStorage.setItem('access_token', authResponse.accessToken);
  localStorage.setItem('refresh_token', authResponse.refreshToken);
  localStorage.setItem('user_data', JSON.stringify({
    id: authResponse.id,
    username: authResponse.username,
    email: authResponse.email,
    role: authResponse.role,
    firstName: authResponse.firstName,
    lastName: authResponse.lastName
  }));
};

export const clearAuthSession = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_data');
};

// Queue to hold requests while refreshing token
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token) => {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
};

// Generic fetch wrapper
const request = async (url, options = {}) => {
  // Inject authorization header
  const token = getAuthToken();
  const headers = { ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config);

    // If unauthorized, attempt token refresh
    if (response.status === 401 && getRefreshToken() && !url.includes('/auth/login') && !url.includes('/auth/refresh')) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const newTokens = await refreshSessionTokens();
          isRefreshing = false;
          onRefreshed(newTokens.accessToken);
        } catch (refreshError) {
          isRefreshing = false;
          clearAuthSession();
          window.location.reload(); // Force relogin
          throw refreshError;
        }
      }

      // Return a promise that resolves with the retried request once refreshed
      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken) => {
          config.headers['Authorization'] = `Bearer ${newToken}`;
          resolve(fetch(`${API_BASE_URL}${url}`, config).then(res => handleResponse(res)));
        });
      });
    }

    return await handleResponse(response);
  } catch (error) {
    console.error(`API Request Error [${url}]:`, error);
    throw error;
  }
};

const handleResponse = async (response) => {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const errorMsg = data?.message || data?.Message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  // Preserve headers if necessary (e.g. X-Total-Count)
  if (response.headers.get('X-Total-Count')) {
    return {
      data,
      totalCount: parseInt(response.headers.get('X-Total-Count'), 10)
    };
  }

  return data;
};

// Refresh token call
const refreshSessionTokens = async () => {
  const currentToken = getAuthToken();
  const currentRefreshToken = getRefreshToken();

  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      token: currentToken,
      refreshToken: currentRefreshToken
    })
  });

  if (!response.ok) {
    throw new Error('Refresh token expired or invalid');
  }

  const authData = await response.json();
  setAuthSession(authData);
  return authData;
};

// API Endpoints object
export const api = {
  get: (url, options) => request(url, { method: 'GET', ...options }),
  post: (url, body, options) => request(url, { method: 'POST', body: JSON.stringify(body), ...options }),
  put: (url, body, options) => request(url, { method: 'PUT', body: JSON.stringify(body), ...options }),
  delete: (url, options) => request(url, { method: 'DELETE', ...options }),
  
  // Custom upload helper for FormData (images, etc)
  upload: (url, formData, options) => request(url, { method: 'POST', body: formData, ...options }),

  // Auth Specific
  auth: {
    login: (usernameOrEmail, password) => 
      request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ usernameOrEmail, password })
      }).then(data => {
        setAuthSession(data);
        return data;
      }),

    register: (username, email, password, firstName, lastName, phoneNumber, role) => 
      request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password, firstName, lastName, phoneNumber, role })
      }).then(data => {
        setAuthSession(data);
        return data;
      }),

    logout: () => {
      clearAuthSession();
      return Promise.resolve();
    }
  },

  // Inquiries
  inquiries: {
    getAll: () => request('/api/inquiry'),
    create: (data) => request('/api/inquiry', { method: 'POST', body: JSON.stringify(data) }),
    reply: (id, replyMessage) => request(`/api/inquiry/${id}/reply`, { method: 'PUT', body: JSON.stringify({ reply: replyMessage }) })
  },

  // Agreements
  agreements: {
    getAll: () => request('/api/rentalagreement'),
    create: (data) => request('/api/rentalagreement', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id, status) => request(`/api/rentalagreement/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) })
  }
};
