import React, { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Divider, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Paper, Grid, Container, Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
  Snackbar, Alert, AlertColor, IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { usePDF } from 'react-to-pdf';
import dayjs from 'dayjs';

interface TenderProduct {
  id: number;
  tenderQuantity: number;
  remainingQuantityInTender: number;
  startDate: string;
  endDate: string;
  unitPrice: number;
  totalAmount: number;
  companyName: string;
  productId: number;
  productName: string;
  purchasedUnitId: number;
  purchaseTypeId: number;
  measurementTypeName: string;
  tenderType: string;
}

interface DirectProcurementProduct {
  id: number;
  quantity: number;
  remainingQuantity: number;
  startDate: string;
  endDate: string;
  unitPrice: number;
  totalAmount: number;
  companyName: string;
  productId: number;
  productName: string;
  measurementTypeName: string;
  purchasedUnitName: string;
  purchaseTypeName: string;
  tenderType: string;
  active: boolean;
}

interface FormData {
  id?: string;
  tenderId: string;
  directProcurementId: string;
  quantity: string;
  userName: string;
  requestDate: string;
  productName?: string;
  companyName?: string;
  measurementTypeName?: string;
  requestType?: string;
  productId?: number;
}

const WeeklyMaterialRequest = () => {
  const { toPDF, targetRef } = usePDF({
    filename: 'haftalik-malzeme-talep-formu.pdf',
    page: { format: 'a4' }
  });

  const [open, setOpen] = useState(false);
  const [openDirect, setOpenDirect] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [products, setProducts] = useState<TenderProduct[]>([]);
  const [directProducts, setDirectProducts] = useState<DirectProcurementProduct[]>([]);
  const [formData, setFormData] = useState<FormData>({
    tenderId: '',
    directProcurementId: '',
    quantity: '',
    userName: '',
    requestDate: ''
  });
  const [demands, setDemands] = useState<FormData[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as AlertColor,
    duration: 3000
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const parsed = dayjs(dateStr);
    return parsed.isValid() ? parsed.format('DD.MM.YYYY') : '-';
  };

  const formatDateRange = () => {
    if (!dateRange.startDate && !dateRange.endDate) return '';
    if (dateRange.startDate && dateRange.endDate) {
      return `${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}`;
    }
    if (dateRange.startDate) {
      return `${formatDate(dateRange.startDate)} -`;
    }
    if (dateRange.endDate) {
      return `- ${formatDate(dateRange.endDate)}`;
    }
    return '';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tenderRes, directRes] = await Promise.all([
          axios.get<{ data: TenderProduct[] }>('/v1/tender/getTendersByProductsAndCompany'),
          axios.get<{ data: DirectProcurementProduct[] }>('/v1/directProcurement/getDirectsByCompanyAndProducts')
        ]);
        setProducts(tenderRes.data.data);
        setDirectProducts(directRes.data.data);
      } catch (err) {
        showNotification('error', 'Ürün bilgileri alınamadı. Lütfen daha sonra tekrar deneyiniz.');
      }
    };
    
    fetchData();
  }, []);

 const showNotification = (severity: AlertColor, message: string, duration?: number) => {
  setNotification({
    open: true,
    message,
    severity,
    duration: duration || (severity === 'error' ? 4000 : 3000) // Varsayılan değerler
  });
};

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    const selectedTender = products.find(p => p.id === Number(formData.tenderId));
    if (!selectedTender) {
      showNotification('error', "Seçilen ihale kaydı bulunamadı!",  3000);
      return;
    }

    const requestedQty = Number(formData.quantity);
    if (requestedQty > selectedTender.remainingQuantityInTender) {
      showNotification('warning', `Talep miktarı kalan miktardan fazla olamaz! (Kalan Miktar: ${selectedTender.remainingQuantityInTender})`, 3000);
      return;
    }

    if (editingIndex !== null) {
      // Düzenleme modu
      const updatedDemands = [...demands];
      updatedDemands[editingIndex] = {
        ...formData,
        productName: selectedTender.productName,
        companyName: selectedTender.companyName,
        measurementTypeName: selectedTender.measurementTypeName,
        requestType: 'İhale',
        productId: selectedTender.productId
      };
      setDemands(updatedDemands);
      setEditingIndex(null);
      showNotification('success', "Talep başarıyla güncellendi.");
    } else {
      // Yeni ekleme
      setDemands(prev => [
        ...prev,
        {
          ...formData,
          id: `tender-${Date.now()}-${Math.random()}`,
          productName: selectedTender.productName,
          companyName: selectedTender.companyName,
          measurementTypeName: selectedTender.measurementTypeName,
          requestType: 'İhale',
          productId: selectedTender.productId
        }
      ]);
      showNotification('success', "Talep listeye eklendi. Onaylamak için 'Talepleri Onayla' butonuna tıklayın.");
    }

    setFormData({ tenderId: '', directProcurementId: '', quantity: '', userName: '', requestDate: '' });
    setOpen(false);
  };

  const handleDirectSubmit = () => {
    const selectedDirect = directProducts.find(p => p.id === Number(formData.directProcurementId));
    if (!selectedDirect) {
      showNotification('error', "Seçilen doğrudan temin kaydı bulunamadı!", 3000);
      return;
    }

    const requestedQty = Number(formData.quantity);
    if (requestedQty > selectedDirect.remainingQuantity) {
      showNotification('warning', `Talep miktarı kalan miktardan fazla olamaz! (Kalan: ${selectedDirect.remainingQuantity})`, 3000);
      return;
    }

    if (editingIndex !== null) {
      // Düzenleme modu
      const updatedDemands = [...demands];
      updatedDemands[editingIndex] = {
        ...formData,
        productName: selectedDirect.productName,
        companyName: selectedDirect.companyName,
        measurementTypeName: selectedDirect.measurementTypeName,
        requestType: 'Doğrudan Temin',
        productId: selectedDirect.productId
      };
      setDemands(updatedDemands);
      setEditingIndex(null);
      showNotification('success', "Talep başarıyla güncellendi.");
    } else {
      // Yeni ekleme
      setDemands(prev => [
        ...prev,
        {
          ...formData,
          id: `direct-${Date.now()}-${Math.random()}`,
          productName: selectedDirect.productName,
          companyName: selectedDirect.companyName,
          measurementTypeName: selectedDirect.measurementTypeName,
          requestType: 'Doğrudan Temin',
          productId: selectedDirect.productId
        }
      ]);
      showNotification('success', "Talep listeye eklendi. Onaylamak için 'Talepleri Onayla' butonuna tıklayın.");
    }

    setFormData({ tenderId: '', directProcurementId: '', quantity: '', userName: '', requestDate: '' });
    setOpenDirect(false);
  };

  const handleEdit = (index: number) => {
    const demand = demands[index];
    setFormData({
      tenderId: demand.tenderId || '',
      directProcurementId: demand.directProcurementId || '',
      quantity: demand.quantity,
      userName: demand.userName,
      requestDate: demand.requestDate
    });
    setEditingIndex(index);
    if (demand.requestType === 'İhale') {
      setOpen(true);
    } else {
      setOpenDirect(true);
    }
  };

  const handleDelete = (index: number) => {
    if (window.confirm('Bu talebi silmek istediğinize emin misiniz?')) {
      setDemands(prev => prev.filter((_, i) => i !== index));
      showNotification('success', "Talep başarıyla silindi.");
    }
  };

  const handleApproveAll = async () => {
    if (demands.length === 0) {
      showNotification('warning', "Onaylanacak talep bulunamadı.", 3000);
      return;
    }

    try {
      const tenderDemands = demands.filter(d => d.requestType === 'İhale');
      const directDemands = demands.filter(d => d.requestType === 'Doğrudan Temin');

      // İhale taleplerini gönder
      for (const demand of tenderDemands) {
        await axios.post('/v1/materialDemand/create', {
          tenderId: Number(demand.tenderId),
          productId: demand.productId,
          quantity: demand.quantity,
          userName: '',
          requestDate: demand.requestDate,
          directProcurementId: null
        });
      }

      // Doğrudan temin taleplerini gönder
      for (const demand of directDemands) {
        await axios.post('/v1/materialDemand/create/directProcurement', {
          directProcurementId: Number(demand.directProcurementId),
          productId: demand.productId,
          quantity: demand.quantity,
          userName: '',
          requestDate: demand.requestDate,
          tenderId: null
        });
      }

      const totalCount = demands.length;
      setDemands([]);
      showNotification('success', `${totalCount} talep başarıyla onaylandı ve gönderildi.`, 4000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.data || "Talepler onaylanırken bir hata oluştu.";
      showNotification('error', errorMessage, 4000);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>Haftalık Malzeme Talepleri</Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3, flexWrap: 'wrap' }}>
          <Button variant="outlined" onClick={() => {
            setEditingIndex(null);
            setFormData({ tenderId: '', directProcurementId: '', quantity: '', userName: '', requestDate: '' });
            setOpen(true);
          }}>İhaleden Talep Oluştur</Button>
          <Button variant="outlined" onClick={() => {
            setEditingIndex(null);
            setFormData({ tenderId: '', directProcurementId: '', quantity: '', userName: '', requestDate: '' });
            setOpenDirect(true);
          }}>Doğrudan Teminden Talep Oluştur</Button>
          <Button 
            variant="contained" 
            color="success"
            onClick={handleApproveAll}
            disabled={demands.length === 0}
            sx={{ minWidth: 200 }}
          >
            Talepleri Onayla ({demands.length})
          </Button>
        </Box>
        {demands.length > 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {demands.length} adet talep bekliyor. Düzenleme veya silme yapabilir, ardından "Talepleri Onayla" butonuna tıklayarak gönderebilirsiniz.
          </Alert>
        )}
      </Paper>

      <div ref={targetRef}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={3}>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 1 }}>
                <img src="/images/inu-logo.png" alt="İnönü Üniversitesi Logo" style={{ width: '100%', maxWidth: '140px', height: 'auto', objectFit: 'contain' }} />
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>T.C.</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>İNÖNÜ ÜNİVERSİTESİ</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>HAFTALIK MALZEME TALEP FORMU</Typography>
                {dateRange.startDate || dateRange.endDate ? (
                  <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
                    Tarih Aralığı: {formatDateRange()}
                  </Typography>
                ) : null}
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1, height: '100%', justifyContent: 'center' }}>
                <Typography variant="body2"><strong>Doküman No:</strong> İNÜ-KYS-FRM-637</Typography>
                <Typography variant="body2"><strong>Yayın Tarihi:</strong> {new Date().toISOString().split('T')[0]}</Typography>
                <Typography variant="body2"><strong>Revizyon No:</strong> 00</Typography>
                <Typography variant="body2"><strong>Revizyon Tarihi:</strong> {new Date().toISOString().split('T')[0]}</Typography>
                <Typography variant="body2"><strong>Sayfa No:</strong> 1/1</Typography>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 4 }} />

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Başlangıç Tarihi"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                inputProps={{ max: dateRange.endDate || new Date().toISOString().split('T')[0] }}
                error={Boolean(dateRange.startDate && dateRange.endDate && new Date(dateRange.startDate) > new Date(dateRange.endDate))}
                helperText={dateRange.startDate && dateRange.endDate && new Date(dateRange.startDate) > new Date(dateRange.endDate) ? 'Başlangıç tarihi bitiş tarihinden büyük olamaz' : ''}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bitiş Tarihi"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: dateRange.startDate, max: new Date().toISOString().split('T')[0] }}
                error={Boolean(dateRange.startDate && dateRange.endDate && new Date(dateRange.startDate) > new Date(dateRange.endDate))}
              />
            </Grid>
            {dateRange.startDate || dateRange.endDate ? (
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                  <Typography variant="body1">
                    <strong>Tarih Aralığı:</strong> {formatDateRange() || 'Tarih aralığı seçilmedi'}
                  </Typography>
                </Box>
              </Grid>
            ) : null}
          </Grid>

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>S.NO</TableCell>
                  <TableCell>Talep Tipi</TableCell>
                  <TableCell>Malzeme</TableCell>
                  <TableCell>Firma</TableCell>
                  <TableCell>Ölçü Birimi</TableCell>
                  <TableCell>Miktar</TableCell>
                  <TableCell>Talep Tarihi</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {demands.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Henüz talep eklenmedi. Yukarıdaki butonlardan talep oluşturabilirsiniz.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  demands.map((item, idx) => (
                    <TableRow key={item.id || idx}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{item.requestType}</TableCell>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell>{item.companyName}</TableCell>
                      <TableCell>{item.measurementTypeName}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{formatDate(item.requestDate)}</TableCell>
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

          <Grid container spacing={2} sx={{ mt: 3 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Onaylayan"
                defaultValue=""
              />
            </Grid>
          </Grid>
        </Paper>
      </div>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button 
          variant="contained" 
          onClick={() => toPDF()} 
          disabled={demands.length === 0}
          sx={{ backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}
        >
          PDF Oluştur
        </Button>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>İhaleden Malzeme Talebi</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            sx={{ mt: 2 }}  
            select
            label="Ürün (Firma - Kalan Miktar)"
            name="tenderId"
            value={formData.tenderId}
            onChange={handleChange}
            fullWidth
          >
            {products.map((prod) => (
              <MenuItem key={prod.id} value={prod.id}>
                {prod.productName} - {prod.companyName}  (Kalan: {prod.remainingQuantityInTender.toFixed(2)})
              </MenuItem>
            ))}
          </TextField>
          <TextField 
            label="Miktar" 
            name="quantity" 
            value={formData.quantity} 
            onChange={handleChange} 
            type="number" 
            InputProps={{ inputProps: { min: 0 } }}
          />
          <TextField
            label="Talep Tarihi"
            name="requestDate"
            type="date"
            value={formData.requestDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpen(false);
            setEditingIndex(null);
            setFormData({ tenderId: '', directProcurementId: '', quantity: '', userName: '', requestDate: '' });
          }}>İptal</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingIndex !== null ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDirect} onClose={() => setOpenDirect(false)} fullWidth maxWidth="sm">
        <DialogTitle>Doğrudan Teminden Malzeme Talebi</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            sx={{ mt: 2 }}  
            select
            label="Ürün (Firma - Kalan Miktar)"
            name="directProcurementId"
            value={formData.directProcurementId}
            onChange={handleChange}
            fullWidth
          >
            {directProducts.map((prod) => (
              <MenuItem key={prod.id} value={prod.id}>
                {prod.productName} - {prod.companyName} (Kalan: {prod.remainingQuantity.toFixed(2)})
              </MenuItem>
            ))}
          </TextField>
          <TextField 
            label="Miktar" 
            name="quantity" 
            value={formData.quantity} 
            onChange={handleChange} 
            type="number" 
            InputProps={{ inputProps: { min: 0 } }}
          />
          <TextField
            label="Talep Tarihi"
            name="requestDate"
            type="date"
            value={formData.requestDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenDirect(false);
            setEditingIndex(null);
            setFormData({ tenderId: '', directProcurementId: '', quantity: '', userName: '', requestDate: '' });
          }}>İptal</Button>
          <Button variant="contained" onClick={handleDirectSubmit}>
            {editingIndex !== null ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default WeeklyMaterialRequest;