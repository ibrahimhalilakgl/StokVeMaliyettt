import React, { useEffect, useState } from 'react';
import {
  IconButton,
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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

interface PurchaseTypeData {
  id: number;
  name: string;
}

const PurchaseType: React.FC = () => {
  const [list, setList] = useState<PurchaseTypeData[]>([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<PurchaseTypeData | null>(null);

  const fetchData = async () => {
    try {
      const res = await axios.get('/v1/purchaseType/all');
      setList(res.data.data);
    } catch (err) {
      console.error('Veriler alınamadı:', err);
    }
  };

  const handleSubmit = async () => {
    try {
      await axios.post('/v1/purchaseType/create', { name });
      setName('');
      setOpen(false);
      fetchData();
    } catch (err: any) {
        setErrorMessage(err.response?.data?.data || 'Beklenmeyen bir hata oluştu.');
        setShowError(true);
    }
  };

  const handleUpdate = async () => {
    if (selectedId === null) return;
    try {
      await axios.put(`/v1/purchaseType/update/${selectedId}`, { name });
      setName('');
      setEditOpen(false);
      setSelectedId(null);
      fetchData();
    } catch (err: any) {
      if (err.response && err.response.status === 409) {
        setErrorMessage(err.response.data.data || 'Bu isimde bir alım türü zaten mevcut.');
        setShowError(true);
      } else {
        setErrorMessage('Bir hata oluştu.');
        setShowError(true);
      }
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await axios.delete(`/v1/purchaseType/delete/${itemToDelete.id}`);
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
      fetchData();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.data || 'Silme işlemi sırasında bir hata oluştu.');
      setShowError(true);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Box sx={{ p: 3, position: 'relative' }}>
      <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
        Alım Türleri
      </Typography>

      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setName(''); // Formu boş başlat
            setOpen(true);
          }}
          sx={{ fontSize: '0.75rem', padding: '6px 12px', backgroundColor: '#007BFF' }}
          startIcon={<AddIcon />}
        >
          Yeni Alım Türü
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ mt: 4, borderRadius: '8px', overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Sıra No</TableCell>
              <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Alım Türü</TableCell>
              <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold' }}>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => {
                      setSelectedId(item.id);
                      setName(item.name);
                      setEditOpen(true);
                    }}
                    sx={{ color: '#D4AF37', mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      setItemToDelete(item);
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

      {/* Snackbar ile hata mesajı gösterme */}
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



      {/* Yeni Alım Türü Ekleme Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Yeni Alım Türü Ekle</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Alım Türü Adı"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            variant="outlined"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} color="inherit">
            İptal
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Güncelleme Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Alım Türünü Güncelle</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Alım Türü Adı"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            variant="outlined"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditOpen(false)} color="inherit">
            İptal
          </Button>
          <Button onClick={handleUpdate} variant="contained" sx={{ backgroundColor: '#D4AF37', color: '#000' }}>
            Güncelle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Silme Onay Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Alım Türünü Sil</DialogTitle>
        <DialogContent>
          <Typography>
            "{itemToDelete?.name}" alım türünü silmek istediğinizden emin misiniz? 
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

export default PurchaseType;
