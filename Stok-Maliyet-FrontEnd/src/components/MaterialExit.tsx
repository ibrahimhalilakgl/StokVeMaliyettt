import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Container,
  Grid,
  TableContainer,
  Divider,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import './MaterialExit.css';

interface Material {
  productId: number;
  productName: string;
  productCategoryName: string;
  measurementTypeName: string;
  totalRemainingStockQuantity: number;
}

interface PendingExit {
  id: string;
  productId: number;
  productName: string;
  quantity: number;
  exitDate: string;
  unit: string;
  unitPrice?: number;
  totalPrice?: number;
}

interface ExitRecord {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  exitDate: string;
  recipient: string;
  description: string;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  totalPerson: number;
}

interface Notification {
  open: boolean;
  message: string;
  severity: "error" | "success" | "info" | "warning";
  duration: number;
}

const MaterialExit: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [exitQuantity, setExitQuantity] = useState<string>('');
  const [formData, setFormData] = useState({
    exitDate: new Date().toISOString().split('T')[0],
  });
  const [pendingExits, setPendingExits] = useState<PendingExit[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [approveForm, setApproveForm] = useState({
    description: ''
  });
  const [notification, setNotification] = useState<Notification>({
    open: false,
    message: '',
    severity: 'success',
    duration: 3000,
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = () => {
    axios.get("/materialEntry/for-exit")
      .then((res) => {
        if (res.data.success) {
          // Kalan miktarı 0'dan büyük olan malzemeleri filtrele
          const filteredMaterials = res.data.data.filter((material: Material) => 
            material.totalRemainingStockQuantity > 0
          );
          setMaterials(filteredMaterials);
        } else {
          showNotification('error', 'Malzeme listesi alınamadı');
        }
      })
      .catch(err => {
        showNotification('error', 'Malzeme listesi alınamadı');
        console.error("API hatası:", err);
      });
  };

  const showNotification = (severity: "error" | "success" | "info" | "warning", message: string, duration?: number) => {
    setNotification({
      open: true,
      message,
      severity,
      duration: duration || 3000
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.exitDate) {
      showNotification("error", "Çıkış tarihi girilmelidir.");
      return;
    }

    const formattedExitDate = new Date(formData.exitDate).toISOString().split('T')[0];
    if (isNaN(new Date(formattedExitDate).getTime())) {
      showNotification("error", "Geçersiz çıkış tarihi.");
      return;
    }

    const parsedQuantity = parseFloat(exitQuantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      showNotification("error", "Geçerli bir miktar girilmelidir.");
      return;
    }

    if (!selectedMaterial) {
      showNotification("error", "Malzeme seçilmelidir.");
      return;
    }

    const selectedMaterialData = materials.find(m => m.productId === parseInt(selectedMaterial));
    if (!selectedMaterialData) {
      showNotification("error", "Seçilen malzeme bulunamadı.");
      return;
    }

    if (parsedQuantity > selectedMaterialData.totalRemainingStockQuantity) {
      showNotification("error", `Talep miktarı kalan stoktan fazla olamaz! (Kalan: ${selectedMaterialData.totalRemainingStockQuantity})`);
      return;
    }

    // Aynı ürün için toplam miktar kontrolü
    const existingExit = pendingExits.find(exit => exit.productId === parseInt(selectedMaterial) && exit.exitDate === formattedExitDate);
    const totalQuantity = existingExit 
      ? existingExit.quantity + parsedQuantity
      : parsedQuantity;

    if (totalQuantity > selectedMaterialData.totalRemainingStockQuantity) {
      showNotification("error", `Toplam miktar kalan stoktan fazla olamaz! (Kalan: ${selectedMaterialData.totalRemainingStockQuantity})`);
      return;
    }

    if (editingIndex !== null) {
      // Düzenleme modu
      const updatedExits = [...pendingExits];
      updatedExits[editingIndex] = {
        id: updatedExits[editingIndex].id,
        productId: parseInt(selectedMaterial),
        productName: selectedMaterialData.productName,
        quantity: parsedQuantity,
        exitDate: formattedExitDate,
        unit: selectedMaterialData.measurementTypeName,
      };
      setPendingExits(updatedExits);
      setEditingIndex(null);
      showNotification('success', "Malzeme çıkışı başarıyla güncellendi.");
    } else {
      // Yeni ekleme
      const newPendingExit: PendingExit = {
        id: `exit-${Date.now()}-${Math.random()}`,
        productId: parseInt(selectedMaterial),
        productName: selectedMaterialData.productName,
        quantity: parsedQuantity,
        exitDate: formattedExitDate,
        unit: selectedMaterialData.measurementTypeName,
      };
      setPendingExits(prev => [...prev, newPendingExit]);
      showNotification('success', "Malzeme çıkışı listeye eklendi. Onaylamak için 'Çıkışları Onayla' butonuna tıklayın.");
    }

    setFormData({
      exitDate: new Date().toISOString().split('T')[0],
    });
    setSelectedMaterial('');
    setExitQuantity('');
  };

  const handleReset = () => {
    setFormData({
      exitDate: new Date().toISOString().split('T')[0],
    });
    setSelectedMaterial('');
    setExitQuantity('');
    setEditingIndex(null);
    setPendingExits([]); // Bekleyen çıkış kayıtlarını da temizle
  };

  const handleEdit = (index: number) => {
    const exit = pendingExits[index];
    setSelectedMaterial(exit.productId.toString());
    setExitQuantity(exit.quantity.toString());
    setFormData({
      exitDate: exit.exitDate,
    });
    setEditingIndex(index);
  };

  const handleDelete = (index: number) => {
    if (window.confirm('Bu çıkış kaydını silmek istediğinize emin misiniz?')) {
      setPendingExits(prev => prev.filter((_, i) => i !== index));
      showNotification('success', "Çıkış kaydı başarıyla silindi.");
    }
  };

  const handleApproveAll = async () => {
    if (pendingExits.length === 0) {
      showNotification('warning', "Onaylanacak çıkış kaydı bulunamadı.", 3000);
      return;
    }


    try {
      // Tüm çıkışları tarihe göre grupla
      const exitsByDate = pendingExits.reduce((acc, exit) => {
        if (!acc[exit.exitDate]) {
          acc[exit.exitDate] = [];
        }
        acc[exit.exitDate].push(exit);
        return acc;
      }, {} as Record<string, PendingExit[]>);

      // Her tarih için ayrı istek gönder
      for (const [exitDate, exits] of Object.entries(exitsByDate)) {
        const productQuantities: Record<string, number> = {};
        exits.forEach(exit => {
          productQuantities[exit.productId] = (productQuantities[exit.productId] || 0) + exit.quantity;
        });

        const requestBody = {
          productQuantities,
          recipient: '',
          description: approveForm.description || '',
          exitDate: exitDate,
        };

        await axios.post("/materialExit/exit", requestBody);
      }

      const totalCount = pendingExits.length;
      setPendingExits([]);
      setOpenApproveDialog(false);
      setApproveForm({ description: '' });
      showNotification('success', `${totalCount} çıkış kaydı başarıyla onaylandı ve kaydedildi.`, 4000);
      fetchMaterials(); // Stok güncellemesi için malzemeleri yeniden çek
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.data || "Çıkış kayıtları onaylanırken bir hata oluştu.";
      showNotification('error', errorMessage, 4000);
    }
  };


  return (
     <Container maxWidth="xl">
      <Snackbar
        open={notification.open}
        autoHideDuration={notification.duration}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} variant="filled">
          {notification.message}
        </Alert>
      </Snackbar>

      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, color: '#006C7F', fontWeight: 600 }}>
          Malzeme Çıkış İşlemi
        </Typography>

        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
            Çıkış Formu
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3, flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              color="success"
              onClick={() => setOpenApproveDialog(true)}
              disabled={pendingExits.length === 0}
              sx={{ minWidth: 200 }}
            >
              Çıkışları Onayla ({pendingExits.length})
            </Button>
          </Box>
          {pendingExits.length > 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              {pendingExits.length} adet çıkış kaydı bekliyor. Düzenleme veya silme yapabilir, ardından "Çıkışları Onayla" butonuna tıklayarak kaydedebilirsiniz.
            </Alert>
          )}
        </Paper>

        <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Form Bölümü */}
          <Paper elevation={0} sx={{ flex: 1, p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
              {editingIndex !== null ? 'Çıkış Düzenle' : 'Yeni Çıkış Ekle'}
            </Typography>

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Malzeme Seçin</InputLabel>
                  <Select
                    value={selectedMaterial}
                    onChange={(e) => setSelectedMaterial(e.target.value)}
                    label="Malzeme Seçin"
                    required
                  >
                    <MenuItem value="">Seçiniz...</MenuItem>
                    {materials.map(material => (
                      <MenuItem key={material.productId} value={material.productId.toString()}>
                        {material.productName} - Kalan: {material.totalRemainingStockQuantity} {material.measurementTypeName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Çıkış Miktarı"
                  value={exitQuantity}
                  onChange={(e) => setExitQuantity(String(e.target.value))}
                  required
                  fullWidth
                  type="number"
                  InputProps={{ inputProps: { min: 0 } }}
                />

                <TextField
                  label="Çıkış Tarihi"
                  type="date"
                  value={formData.exitDate}
                  onChange={(e) => setFormData({ ...formData, exitDate: e.target.value })}
                  required
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />

                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button type="button" variant="outlined" onClick={handleReset} fullWidth sx={{ py: 2 }}>
                    {editingIndex !== null ? 'İptal' : 'Formu Temizle'}
                  </Button>
                  <Button type="submit" variant="contained" fullWidth sx={{ py: 2, bgcolor: '#006C7F' }}>
                    {editingIndex !== null ? 'Güncelle' : 'Listeye Ekle'}
                  </Button>
                </Box>
              </Box>
            </form>
          </Paper>

          {/* Bekleyen Çıkış Kayıtları Listesi */}
          <Paper elevation={3} sx={{ flex: 1, p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
              Bekleyen Çıkış Kayıtları
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>S.NO</TableCell>
                    <TableCell>Malzeme Adı</TableCell>
                    <TableCell>Ölçü Birimi</TableCell>
                    <TableCell>Miktar</TableCell>
                    <TableCell>Çıkış Tarihi</TableCell>
                    <TableCell>İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingExits.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          Henüz çıkış kaydı eklenmedi. Yukarıdaki formdan çıkış ekleyebilirsiniz.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingExits.map((exit, idx) => (
                      <TableRow key={exit.id}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{exit.productName}</TableCell>
                        <TableCell>{exit.unit}</TableCell>
                        <TableCell>{exit.quantity}</TableCell>
                        <TableCell>{exit.exitDate}</TableCell>
                        <TableCell>
                          <IconButton 
                            size="small" 
                            color="primary" 
                            onClick={() => handleEdit(idx)}
                            title="Düzenle"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => handleDelete(idx)}
                            title="Sil"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

        </Box>

        {/* Onay Dialog */}
        <Dialog open={openApproveDialog} onClose={() => setOpenApproveDialog(false)} fullWidth maxWidth="sm">
          <DialogTitle>Çıkışları Onayla</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {pendingExits.length} adet çıkış kaydı onaylanacak. Lütfen aşağıdaki bilgileri doldurun.
            </Typography>
            <TextField
              label="Açıklama"
              value={approveForm.description}
              onChange={(e) => setApproveForm({ ...approveForm, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => {
              setOpenApproveDialog(false);
              setApproveForm({ description: '' });
            }} color="inherit">
              İptal
            </Button>
            <Button onClick={handleApproveAll} variant="contained" color="success">
              Onayla
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default MaterialExit;
