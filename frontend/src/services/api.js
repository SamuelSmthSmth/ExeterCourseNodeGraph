import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error.response?.data || error);
  }
);

export const courseService = {
  // Get all courses
  getAllCourses: (params = {}) => {
    return api.get('/courses', { params });
  },

  // Get specific course
  getCourse: (courseCode) => {
    return api.get(`/courses/${courseCode}`);
  },

  // Get course graph data
  getCourseGraph: (courseCode) => {
    return api.get(`/courses/${courseCode}/graph`);
  },

  // Search courses
  searchCourses: (searchTerm) => {
    return api.get('/courses', { params: { search: searchTerm } });
  }
};

export const moduleService = {
  // Get all modules
  getAllModules: (params = {}) => {
    return api.get('/modules', { params });
  },

  // Get specific module
  getModule: (moduleCode) => {
    return api.get(`/modules/${moduleCode}`);
  },

  // Get module prerequisites
  getModulePrerequisites: (moduleCode) => {
    return api.get(`/modules/${moduleCode}/prerequisites`);
  },

  // Search modules
  searchModules: (searchTerm) => {
    return api.get('/modules', { params: { search: searchTerm } });
  }
};

export const healthService = {
  // Check API health
  checkHealth: () => {
    return api.get('/health');
  }
};

export default api;
