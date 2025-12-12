import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Button,
  Snackbar,
  Alert,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

interface User {
  id: number;
  username: string;
  role: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('DEPO');
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      // Auth endpoint'leri /v1 prefix'i kullanmıyor, bu yüzden baseURL'i override ediyoruz
      const response = await axios.get('/api/auth/users', {
        baseURL: process.env.REACT_APP_API_URL ? '' : 'http://localhost:8080'
      });
      // Backend direkt array döndürüyor (RestResponse wrapper yok)
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      const errorMsg = error.response?.data?.message || error.response?.data || 'Kullanıcılar yüklenirken bir hata oluştu.';
      setErrorMessage(errorMsg);
      setShowError(true);
      setUsers([]); // Hata durumunda boş array set et
    }
  };

  const handleCreate = async () => {
    if (!username.trim()) {
      setErrorMessage('Kullanıcı adı boş olamaz.');
      setShowError(true);
      return;
    }
    if (!password.trim() || password.length < 5) {
      setErrorMessage('Şifre en az 5 karakter olmalıdır.');
      setShowError(true);
      return;
    }
    try {
      await axios.post('/api/auth/register', {
        username,
        password,
        role,
      }, {
        baseURL: '' // baseURL'i override et
      });
      setOpen(false);
      setUsername('');
      setPassword('');
      setRole('DEPO');
      fetchUsers();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.response?.data?.data || 'Beklenmeyen bir hata oluştu.');
      setShowError(true);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await axios.delete(`/api/auth/delete/${userToDelete.id}`, {
        baseURL: '' // baseURL'i override et
      });
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.response?.data?.data || 'Silme işlemi sırasında bir hata oluştu.');
      setShowError(true);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'ADMIN': 'Yönetici',
      'DEPO': 'Depo',
      'SATINALMA': 'Satın Alma',
      'YEMEKHANE': 'Yemekhane'
    };
    return roleMap[role] || role;
  };

  return (
    <Box sx={{ p: 3, position: 'relative' }}>
      <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
        Kullanıcı Yönetimi
      </Typography>

      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpen(true)}
          sx={{ fontSize: '0.75rem', padding: '6px 12px', backgroundColor: '#007BFF' }}
          startIcon={<AddIcon />}
        >
          Yeni Kullanıcı
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ mt: 4, borderRadius: '8px', overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Sıra No</TableCell>
              <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Kullanıcı Adı</TableCell>
              <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Rol</TableCell>
              <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold' }}>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user, index) => (
              <TableRow key={user.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{getRoleDisplayName(user.role)}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => {
                      setUserToDelete(user);
                      setDeleteConfirmOpen(true);
                    }}
                    sx={{ color: '#d32f2f' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Snackbar Hata Bildirimi */}
      <Snackbar
        open={showError}
        autoHideDuration={4000}
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowError(false)} severity="error" variant="filled">
          {errorMessage}
        </Alert>
      </Snackbar>

      {/* Yeni Kullanıcı Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Yeni Kullanıcı Oluştur</DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Kullanıcı Adı"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            variant="outlined"
          />
          <TextField
            fullWidth
            label="Şifre"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            variant="outlined"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Rol</InputLabel>
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              label="Rol"
            >
              <MenuItem value="ADMIN">Yönetici</MenuItem>
              <MenuItem value="DEPO">Depo</MenuItem>
              <MenuItem value="SATINALMA">Satın Alma</MenuItem>
              <MenuItem value="YEMEKHANE">Yemekhane</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} color="inherit">
            İptal
          </Button>
          <Button onClick={handleCreate} variant="contained" color="primary">
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Silme Onay Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Kullanıcıyı Sil</DialogTitle>
        <DialogContent>
          <Typography>
            "{userToDelete?.username}" kullanıcısını silmek istediğinizden emin misiniz? 
            Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">
            İptal
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
