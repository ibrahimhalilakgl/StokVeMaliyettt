import React, { useEffect, useState } from 'react'; 
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import  AddCircleIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

interface TicketType {
  id: number;
  name: string;
  unitPrice: number;
}

const TicketTypeList: React.FC = () => {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [newType, setNewType] = useState({ name: '', unitPrice: '' });
  const [editType, setEditType] = useState<TicketType | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<TicketType | null>(null);

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      const response = await axios.get('/ticketType/all');
      setTicketTypes(response.data.data || []);
    } catch (error) {
      console.error('Fiş türleri çekme hatası:', error);
    }
  };

  const handleOpenDialog = () => {
    setNewType({ name: '', unitPrice: '' });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleCreateType = async () => {
    // Form validasyonu
    if (!newType.name.trim()) {
      alert('Fiş türü adı boş olamaz!');
      return;
    }
    const unitPriceValue = parseFloat(newType.unitPrice);
    if (newType.unitPrice === '' || newType.unitPrice === null || isNaN(unitPriceValue) || unitPriceValue < 0) {
      alert('Birim fiyat 0 veya 0\'dan büyük olmalıdır!');
      return;
    }

    try {
      await axios.post('/ticketType/create', {
        name: newType.name.trim(),
        unitPrice: parseFloat(newType.unitPrice),
      });
      handleCloseDialog();
      fetchTypes();
      alert('Fiş türü başarıyla oluşturuldu!');
    } catch (error: any) {
      console.error('Fiş türü oluşturma hatası:', error);
      const errorMessage = error.response?.data?.message || 'Fiş türü oluşturulurken bir hata oluştu!';
      alert(errorMessage);
    }
  };

  const handleOpenEditDialog = (type: TicketType) => {
    setEditType({ ...type });
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditType(null);
  };

  const handleUpdateType = async () => {
    if (!editType) return;

    // Form validasyonu
    if (!editType.name.trim()) {
      alert('Fiş türü adı boş olamaz!');
      return;
    }
    if (editType.unitPrice === null || editType.unitPrice === undefined || editType.unitPrice < 0) {
      alert('Birim fiyat 0 veya 0\'dan büyük olmalıdır!');
      return;
    }

    try {
      await axios.put('/ticketType/update', {
        id: editType.id,
        name: editType.name.trim(),
        unitPrice: editType.unitPrice,
      });
      handleCloseEditDialog();
      fetchTypes();
      alert('Fiş türü başarıyla güncellendi!');
    } catch (error: any) {
      console.error('Fiş türü güncelleme hatası:', error);
      const errorMessage = error.response?.data?.message || 'Fiş türü güncellenirken bir hata oluştu!';
      alert(errorMessage);
    }
  };

  const handleDeleteType = async () => {
    if (!ticketToDelete) return;
    try {
      await axios.delete(`/ticketType/delete/${ticketToDelete.id}`);
      setDeleteConfirmOpen(false);
      setTicketToDelete(null);
      fetchTypes();
      alert('Fiş türü başarıyla silindi!');
    } catch (error: any) {
      console.error('Fiş türü silme hatası:', error);
      const errorMessage = error.response?.data?.message || 'Fiş türü silinirken bir hata oluştu!';
      alert(errorMessage);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 4, mb: 3, position: 'relative' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
          Fiş Türleri
        </Typography>
        <Box sx={{ position: 'absolute', right: 0 }}>
          <Button
            variant="contained"
            startIcon={<AddCircleIcon />}
            sx={{
              bgcolor: '#1976d2',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '8px',
              '&:hover': {
                bgcolor: '#115293'
              }
            }}
            onClick={handleOpenDialog}
          >
            Fiş Türü Oluştur
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>İsim</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Birim Fiyat</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ticketTypes.map((type) => (
              <TableRow key={type.id}>
                <TableCell>{type.name}</TableCell>
                <TableCell>{type.unitPrice.toFixed(2)} ₺</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleOpenEditDialog(type)}
                    sx={{ mr: 1 }}
                  >
                    <EditOutlinedIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => {
                      setTicketToDelete(type);
                      setDeleteConfirmOpen(true);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Yeni Fiş Türü Oluştur</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="İsim"
            value={newType.name}
            onChange={(e) => setNewType({ ...newType, name: e.target.value })}
            required
            fullWidth
            helperText="Fiş türü adını girin (örn: Öğrenci, Akademik)"
          />
          <TextField
            label="Birim Fiyat"
            type="number"
            value={newType.unitPrice}
            onChange={(e) => setNewType({ ...newType, unitPrice: e.target.value })}
            required
            fullWidth
            inputProps={{ min: 0, step: 0.01 }}
            helperText="Fiş türü birim fiyatını girin (TL). Ücretsiz fiş için 0 girebilirsiniz."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button variant="contained" onClick={handleCreateType}>
            Oluştur
          </Button>
        </DialogActions>
      </Dialog>


      <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
      <DialogTitle>Fiş Türünü Güncelle</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
        <TextField
          label="İsim"
          value={editType?.name || ''}
          onChange={(e) =>
            setEditType((prev) => (prev ? { ...prev, name: e.target.value } : null))
          }
          required
          fullWidth
          helperText="Fiş türü adını girin (örn: Öğrenci, Akademik)"
        />
        <TextField
          label="Birim Fiyat"
          type="number"
          value={editType?.unitPrice.toString() || ''}
          onChange={(e) =>
            setEditType((prev) =>
              prev ? { ...prev, unitPrice: parseFloat(e.target.value) } : null
            )
          }
          required
          fullWidth
          inputProps={{ min: 0, step: 0.01 }}
          helperText="Fiş türü birim fiyatını girin (TL)"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseEditDialog}>İptal</Button>
        <Button variant="contained" onClick={handleUpdateType}>
          Güncelle
        </Button>
      </DialogActions>
    </Dialog>

    {/* Silme Onay Dialog */}
    <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
      <DialogTitle>Fiş Türünü Sil</DialogTitle>
      <DialogContent>
        <Typography>
          "{ticketToDelete?.name}" fiş türünü silmek istediğinizden emin misiniz? 
          Bu işlem geri alınamaz.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">
          İptal
        </Button>
        <Button onClick={handleDeleteType} color="error" variant="contained">
          Sil
        </Button>
      </DialogActions>
    </Dialog>

    </Box>
  );
};

export default TicketTypeList;
