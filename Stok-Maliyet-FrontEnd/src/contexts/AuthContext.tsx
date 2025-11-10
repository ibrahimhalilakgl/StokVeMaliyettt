import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Sayfa yüklendiğinde token kontrolü
  useEffect(() => {
    const storedToken = localStorage.getItem('token') || 
                       localStorage.getItem('authToken') || 
                       sessionStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      
      // Axios default header'ına token'ı ekle
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    
    setLoading(false);
  }, []);

  // Axios interceptor ekle - her istekte token'ı kontrol et
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const currentToken = localStorage.getItem('token') || 
                           localStorage.getItem('authToken') || 
                           sessionStorage.getItem('token');
        if (currentToken) {
          config.headers.Authorization = `Bearer ${currentToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - 401 hatası durumunda logout yap
    const responseInterceptor = axios.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token süresi dolmuş veya geçersiz
          console.warn('401 Unauthorized - Token geçersiz veya süresi dolmuş');
          
          // State'i temizle
          setToken(null);
          setUser(null);
          
          // LocalStorage'dan sil
          localStorage.removeItem('token');
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          sessionStorage.removeItem('token');
          
          // Axios header'ından token'ı kaldır
          delete axios.defaults.headers.common['Authorization'];
          
          // Sayfayı yenile (login sayfasına yönlendirilecek)
          window.location.href = '/';
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password
      });

      const { token: newToken, role } = response.data;
      
      // State'i güncelle
      setToken(newToken);
      setUser({ username, role });
      
      // LocalStorage'a kaydet
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify({ username, role }));
      
      // Axios default header'ına token'ı ekle
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Backend'den gelen hata mesajını al
      let errorMessage = 'Giriş yapılırken bir hata oluştu';
      
      if (error.response) {
        // Sunucu yanıt verdi ama hata kodu döndü
        errorMessage = error.response.data?.message || 
                      error.response.data?.error || 
                      `Sunucu hatası: ${error.response.status}`;
      } else if (error.request) {
        // İstek gönderildi ama yanıt alınamadı
        errorMessage = 'Sunucuya bağlanılamadı. Backend çalışıyor mu?';
      } else {
        // İstek hazırlanırken hata oluştu
        errorMessage = error.message || 'Bilinmeyen bir hata oluştu';
      }
      
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    // State'i temizle
    setToken(null);
    setUser(null);
    
      // LocalStorage'dan sil
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      
      // Axios header'ından token'ı kaldır
      delete axios.defaults.headers.common['Authorization'];
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token && !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
