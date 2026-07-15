const API_BASE_URL = 'http://127.0.0.1:3000/api';

/**
 * Helper function to handle standard fetch responses
 */
async function apiFetch(endpoint, options = {}) {
  try {
    // Build headers: always JSON, + JWT token if stored
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    const token = localStorage.getItem('admin_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    const result = await response.json();
    if (!response.ok || !result.success) {
      let errorMsg = result.error?.message || result.error || 'API Error';
      
      // Extract detailed validation errors from Zod if present
      if (result.error?.details) {
        const details = result.error.details;
        const messages = [];
        for (const [key, value] of Object.entries(details)) {
          if (value?._errors?.length) {
            messages.push(`${key}: ${value._errors.join(', ')}`);
          }
        }
        if (messages.length > 0) {
          errorMsg += '\nDetails:\n- ' + messages.join('\n- ');
        }
      }
      throw new Error(errorMsg);
    }
    
    return result.data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

const api = {
  // Utility
  getBaseUrl: () => API_BASE_URL.replace('/api', ''),

  // Projects
  getProjects: (featuredOnly = false) => apiFetch(`/projects${featuredOnly ? '?featured=true' : ''}`),
  getProjectBySlug: (slug) => apiFetch(`/projects/${slug}`),

  // Skills
  getSkills: (grouped = false) => apiFetch(`/skills${grouped ? '?grouped=true' : ''}`),

  // Certificates
  getCertificates: () => apiFetch('/certificates'),

  // Resume
  getResumeUrl: () => apiFetch('/resume'),
  downloadResume: async (data) => {
    const result = await apiFetch('/resume/download', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    // Ensure the returned URL is an absolute URL pointing to the backend
    const baseUrl = API_BASE_URL.replace('/api', '');
    if (result && result.url && result.url.startsWith('/')) {
      result.url = baseUrl + result.url;
    }
    return result;
  },

  // Contact / Messages
  sendMessage: (data) => apiFetch('/contact', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Visitors
  logVisitor: (data) => apiFetch('/visitor', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Admin Auth
  loginAdmin: async (data) => {
    const result = await apiFetch('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
      credentials: 'include'
    });
    // Store JWT in localStorage as fallback for cross-origin cookie issues
    if (result && result.token) {
      localStorage.setItem('admin_token', result.token);
    }
    return result;
  },
  checkAuth: () => apiFetch('/admin/auth/me', {
    credentials: 'include'
  }),
  logoutAdmin: async () => {
    localStorage.removeItem('admin_token');
    return apiFetch('/admin/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
  },

  // Admin Dashboard
  getAdminAnalytics: () => apiFetch('/admin/analytics/dashboard', {
    credentials: 'include'
  }),

  // Admin Projects
  getAdminProjects: () => apiFetch(`/admin/projects?_t=${Date.now()}`, {
    credentials: 'include'
  }),
  createProject: (data) => apiFetch('/admin/projects', {
    method: 'POST',
    body: JSON.stringify(data),
    credentials: 'include'
  }),
  updateProject: (id, data) => apiFetch(`/admin/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    credentials: 'include'
  }),
  deleteProject: (id) => apiFetch(`/admin/projects/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  }),

  // Admin Skills
  getAdminSkills: () => apiFetch(`/admin/skills?_t=${Date.now()}`, {
    credentials: 'include'
  }),
  createSkill: (data) => apiFetch('/admin/skills', {
    method: 'POST',
    body: JSON.stringify(data),
    credentials: 'include'
  }),
  updateSkill: (id, data) => apiFetch(`/admin/skills/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    credentials: 'include'
  }),
  deleteSkill: (id) => apiFetch(`/admin/skills/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  }),

  // Admin Certificates
  getAdminCertificates: () => apiFetch(`/admin/certificates?_t=${Date.now()}`, {
    credentials: 'include'
  }),
  createCertificate: (data) => apiFetch('/admin/certificates', {
    method: 'POST',
    body: JSON.stringify(data),
    credentials: 'include'
  }),
  updateCertificate: (id, data) => apiFetch(`/admin/certificates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    credentials: 'include'
  }),
  deleteCertificate: (id) => apiFetch(`/admin/certificates/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  }),

  // Admin Messages
  getAdminMessages: () => apiFetch(`/admin/messages?_t=${Date.now()}`, {
    credentials: 'include'
  }),
  markMessageRead: (id) => apiFetch(`/admin/messages/${id}/read`, {
    method: 'PATCH',
    credentials: 'include'
  }),
  deleteMessage: (id) => apiFetch(`/admin/messages/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  }),

  // Admin Resume Files
  getAdminResumeFiles: () => apiFetch(`/admin/resume?_t=${Date.now()}`, {
    credentials: 'include'
  }),
  uploadResumeFile: async (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type); // 'PDF' or 'VIDEO'
    const token = localStorage.getItem('admin_token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}/admin/resume/upload`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: formData,
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.error?.message || result.error || 'Upload failed');
    }
    return result.data;
  },
  deleteResumeFile: (id) => apiFetch(`/admin/resume/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  }),
  // Admin Media (Images)
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('admin_token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}/admin/media/upload`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: formData,
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.error?.message || result.error || 'Upload failed');
    }
    
    // Ensure the returned URL is an absolute URL pointing to the backend
    const baseUrl = API_BASE_URL.replace('/api', '');
    if (result.data && result.data.url && result.data.url.startsWith('/')) {
      result.data.url = baseUrl + result.data.url;
    }

    return result.data;
  }
};

// Expose to window for global access
window.api = api;

// Automatically log visitor on script load
const logCurrentPageVisitor = () => {
  // Try not to block the main thread or throw uncaught errors
  setTimeout(() => {
    try {
      const page = window.location.pathname.split('/').pop() || 'index.html';
      // Optional: Parse basic browser info if desired, or let backend use IP
      api.logVisitor({ page }).catch(err => { /* silent fail for tracking */ });
    } catch(e) {}
  }, 1000);
};

if (document.readyState === 'complete') {
  logCurrentPageVisitor();
} else {
  window.addEventListener('load', logCurrentPageVisitor);
}
