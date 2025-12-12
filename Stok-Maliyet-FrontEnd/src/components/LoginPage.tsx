import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/inonulogo.png';

interface LoginFormData {
  username: string;
  password: string;
}

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Hata mesajını temizle
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Frontend validasyonu
    if (formData.username.length < 3) {
      setError('Kullanıcı adı en az 3 karakter olmalıdır');
      setLoading(false);
      return;
    }

    if (formData.password.length < 5) {
      setError('Şifre en az 5 karakter olmalıdır');
      setLoading(false);
      return;
    }

    try {
      // AuthContext'teki login fonksiyonunu kullan
      await login(formData.username, formData.password);
      
      // Ana sayfaya yönlendir
      if (onLoginSuccess) {
        onLoginSuccess();
      }
      navigate('/');

    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Giriş yapılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #006C7F 0%, #004D5A 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            padding: 4,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* Logo ve Başlık */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 4
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mb: 2
              }}
            >
              <img 
                src={logo} 
                alt="İnönü Üniversitesi Logo" 
                style={{ 
                  height: 80, 
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                }} 
              />
            </Box>
            
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 'bold',
                color: '#006C7F',
                textAlign: 'center',
                mb: 1,
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              Giriş Yap
            </Typography>
            
            <Typography
              variant="subtitle1"
              sx={{
                color: '#666',
                textAlign: 'center',
                maxWidth: '400px'
              }}
            >
              İnönü Üniversitesi Yemekhane Stok-Maliyet Otomasyonu
            </Typography>
          </Box>

          {/* Hata Mesajı */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                '& .MuiAlert-message': {
                  fontSize: '0.9rem'
                }
              }}
            >
              {error}
            </Alert>
          )}

          {/* Login Formu */}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Kullanıcı Adı"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              disabled={loading}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#006C7F',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#006C7F',
                    borderWidth: 2,
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#006C7F',
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LoginIcon sx={{ color: '#006C7F' }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Şifre"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={loading}
              sx={{
                mb: 4,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#006C7F',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#006C7F',
                    borderWidth: 2,
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#006C7F',
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                      disabled={loading}
                      sx={{ color: '#006C7F' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || !formData.username || !formData.password}
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                borderRadius: 2,
                background: 'linear-gradient(45deg, #006C7F 30%, #004D5A 90%)',
                boxShadow: '0 4px 8px rgba(0, 108, 127, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #004D5A 30%, #006C7F 90%)',
                  boxShadow: '0 6px 12px rgba(0, 108, 127, 0.4)',
                  transform: 'translateY(-1px)',
                },
                '&:disabled': {
                  background: '#ccc',
                  boxShadow: 'none',
                  transform: 'none',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} sx={{ color: 'white' }} />
                  <span>Giriş Yapılıyor...</span>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
                  <LoginIcon />
                  <span>Giriş Yap</span>
                </Box>
              )}
            </Button>
          </Box>

          {/* Alt Bilgi */}
          <Box
            sx={{
              mt: 4,
              pt: 3,
              borderTop: '1px solid #e0e0e0',
              textAlign: 'center'
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: '#666',
                fontSize: '0.85rem'
              }}
            >
              © 2024 İnönü Üniversitesi - Tüm hakları saklıdır
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
