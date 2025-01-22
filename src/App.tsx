// src/App.tsx
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes';
import './styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const user = await authService.getProfile();
          setUser(user);
        }
      } catch (error) {
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    localStorage.setItem('token', response.token);
    setUser(response.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// src/routes/index.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import LoginPage from '../pages/Login';
import DashboardPage from '../pages/Dashboard';
import ProjectsPage from '../pages/Projects';
import StandsPage from '../pages/Stands';
import ToursPage from '../pages/Tours';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AppRoutes() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects/*" element={<ProjectsPage />} />
        <Route path="/stands/*" element={<StandsPage />} />
        <Route path="/tours/*" element={<ToursPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// src/components/Layout.tsx
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// src/services/api.service.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// src/services/auth.service.ts
import api from './api.service';
import { User } from '../types';

export const authService = {
  async login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async getProfile() {
    const response = await api.get<User>('/users/profile');
    return response.data;
  },

  async updateProfile(data: Partial<User>) {
    const response = await api.put('/users/profile', data);
    return response.data;
  }
};

// src/types/index.ts
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'USER';
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

export interface Stand {
  id: number;
  name: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
  condition: string;
  currentPoster?: string;
  nextPoster?: string;
}

export interface Tour {
  id: number;
  name: string;
  description?: string;
  projectId: number;
  stands: TourStand[];
}

export interface TourStand {
  id: number;
  standId: number;
  sequence: number;
  stand: Stand;
}
