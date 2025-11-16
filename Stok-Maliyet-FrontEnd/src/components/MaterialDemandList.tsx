import React, { useEffect, useState } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Typography, Paper, Grid, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,IconButton
} from '@mui/material';
import axios from 'axios';

import dayjs from 'dayjs';

interface Demand {
  id: number;
  productName: string;
  quantity: number;
  approvedQuantity?: number; // Onaylama sırasında belirlenen miktar
  companyName: string;
  requestDate: string;
  productId: number;
  rejectionReason: string;
  demandStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  tenderType?: 'DIRECT_PROCUREMENT' | 'OPEN_TENDER'; // Doğrudan temin mi ihale mi
}

interface Budget {
  id: number;
  budgetName: string;
}

interface PurchaseType {
  id: number;
  name: string;
}

const MaterialDemandList: React.FC = () => {
  const [demands, setDemands] = useState<Demand[]>([]);
  const [selectedDemand, setSelectedDemand] = useState<Demand | null>(null);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [purchaseTypes, setPurchaseTypes] = useState<PurchaseType[]>([]);
  const [approveForm, setApproveForm] = useState({
    budgetId: '',
    description: '',
    expiryDate: '',
    entryDate: '',
    quantity: '',
    purchaseTypeId: ''
  });
  const [rejectForm, setRejectForm] = useState({
    rejectionReason: ''
  });

  useEffect(() => {
    axios.get('/v1/materialDemand/all')
      .then(res => setDemands(res.data.data))
      .catch(err => console.error(err));

    axios.get('/v1/budget/all')
      .then(res => setBudgets(res.data.data))
      .catch(err => console.error(err));

    axios.get('/v1/purchaseType/all')
      .then(res => setPurchaseTypes(res.data.data || []))
      .catch(err => console.error(err));
  }, []);
  console.log(budgets)

  const handleApproveClick = (demand: Demand) => {
    setSelectedDemand(demand);
    setApproveForm({
      budgetId: '',
      description: '',
      expiryDate: '',
      entryDate: '',
      quantity: demand.quantity.toString(), // Talep edilen miktarı varsayılan olarak göster
      purchaseTypeId: ''
    });
    setOpenApproveDialog(true);
  };

  const handleRejectClick = (demand: Demand) => {
    setSelectedDemand(demand);
    setOpenRejectDialog(true);
  };

  const handleApproveSubmit = () => {
    if (!selectedDemand) return;
    
    // Miktar kontrolü
    const quantity = approveForm.quantity ? parseFloat(approveForm.quantity) : selectedDemand.quantity;
    if (isNaN(quantity) || quantity <= 0) {
      alert('Lütfen geçerli bir miktar girin!');
      return;
    }

    // Doğrudan temin için purchaseTypeId kontrolü
    if (selectedDemand.tenderType === 'DIRECT_PROCUREMENT' && !approveForm.purchaseTypeId) {
      alert('Doğrudan temin için Alım Türü seçilmelidir!');
      return;
    }

    const requestBody: any = {
      materialDemandId: selectedDemand.id,
      budgetId: approveForm.budgetId,
      description: approveForm.description,
      expiryDate: approveForm.expiryDate,
      entryDate: approveForm.entryDate,
      quantity: quantity
    };

    // Sadece doğrudan temin için purchaseTypeId ekle
    if (selectedDemand.tenderType === 'DIRECT_PROCUREMENT' && approveForm.purchaseTypeId) {
      requestBody.purchaseTypeId = approveForm.purchaseTypeId;
    }

    axios.post('/v1/materialDemand/approve', requestBody).then(() => {
      // Listeyi yeniden yükle
      axios.get('/v1/materialDemand/all')
        .then(res => setDemands(res.data.data))
        .catch(err => console.error(err));
      setOpenApproveDialog(false);
      setApproveForm({ budgetId: '', description: '', expiryDate: '', entryDate: '', quantity: '', purchaseTypeId: '' });
      setSelectedDemand(null);
    }).catch((error) => {
      console.error("Onay işlemi sırasında hata:", error);
      alert(error.response?.data?.data || 'Onay işlemi sırasında bir hata oluştu!');
    });
  };

 const handleRejectSubmit = () => {
  if (!selectedDemand) return;

  axios.post(
    `/v1/materialDemand/reject/${selectedDemand.id}`,
    null, // body yok, çünkü @RequestParam ile çalışıyoruz
    {
      params: {
        rejectionReason: rejectForm.rejectionReason,
      },
    }
  )
  .then(() => {
    // Listeyi yeniden yükle
    axios.get('/v1/materialDemand/all')
      .then(res => setDemands(res.data.data))
      .catch(err => console.error(err));
    setOpenRejectDialog(false);
    setRejectForm({ rejectionReason: '' });
    setSelectedDemand(null);
  })
  .catch((error) => {
    console.error("Red işlemi sırasında hata:", error);
  });
};
   const formatDate = (dateStr: string) => {
      const parsed = dayjs(dateStr);
      return parsed.isValid() ? parsed.format('DD-MM-YYYY') : '-';
    };

  // Talepleri durumlarına göre ayır
  const pendingDemands = demands.filter(d => d.demandStatus === 'PENDING');
  const processedDemands = demands.filter(d => d.demandStatus !== 'PENDING');

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>Malzeme Talep Listesi</Typography>
      
      {/* İşlem Yapılmayanlar Tablosu */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 600, mb: 2 }}>
          İşlem Yapılmayan Talepler ({pendingDemands.length})
        </Typography>
        <TableContainer component={Paper} sx={{ maxHeight: '40vh' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Sıra No</strong></TableCell>
                <TableCell><strong>Ürün Adı</strong></TableCell>
                <TableCell><strong>Firma</strong></TableCell>
                <TableCell><strong>Talep Edilen Miktar</strong></TableCell>
                <TableCell><strong>Talep Tarihi</strong></TableCell>
                <TableCell><strong>Durum</strong></TableCell>
                <TableCell><strong>İşlem</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingDemands.length > 0 ? (
                pendingDemands.map((demand, index) => (
                  <TableRow key={demand.id} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{demand.productName}</TableCell>
                    <TableCell>{demand.companyName}</TableCell>
                    <TableCell>{demand.quantity}</TableCell>
                    <TableCell>{formatDate(demand.requestDate)}</TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#ff9800',
                          fontWeight: 500
                        }}
                      >
                        Beklemede
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <IconButton color="success" size="small" onClick={() => handleApproveClick(demand)}>
                          <span role="img" aria-label="check">✅</span>
                        </IconButton>
                        <IconButton color="error" size="small" onClick={() => handleRejectClick(demand)}>
                          <span role="img" aria-label="cross">❌</span>
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography variant="body2" color="textSecondary">
                      İşlem yapılmayan talep bulunmamaktadır.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* İşlem Yapılanlar Tablosu */}
      <Box>
        <Typography variant="h6" gutterBottom sx={{ color: '#2e7d32', fontWeight: 600, mb: 2 }}>
          İşlem Yapılan Talepler ({processedDemands.length})
        </Typography>
        <TableContainer component={Paper} sx={{ maxHeight: '40vh' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Sıra No</strong></TableCell>
                <TableCell><strong>Ürün Adı</strong></TableCell>
                <TableCell><strong>Firma</strong></TableCell>
                <TableCell><strong>Talep Edilen Miktar</strong></TableCell>
                <TableCell><strong>Onaylanan Miktar</strong></TableCell>
                <TableCell><strong>Talep Tarihi</strong></TableCell>
                <TableCell><strong>Durum</strong></TableCell>
                <TableCell><strong>Açıklama</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {processedDemands.length > 0 ? (
                processedDemands.map((demand, index) => (
                  <TableRow 
                    key={demand.id} 
                    hover
                    sx={{
                      backgroundColor: demand.demandStatus === 'APPROVED' ? '#e8f5e9' : '#ffebee',
                      '&:hover': {
                        backgroundColor: demand.demandStatus === 'APPROVED' ? '#c8e6c9' : '#ffcdd2'
                      }
                    }}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{demand.productName}</TableCell>
                    <TableCell>{demand.companyName}</TableCell>
                    <TableCell>{demand.quantity}</TableCell>
                    <TableCell>
                      {demand.demandStatus === 'APPROVED' ? (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: demand.approvedQuantity !== undefined && demand.approvedQuantity !== demand.quantity 
                              ? '#1976d2' 
                              : 'inherit',
                            fontWeight: demand.approvedQuantity !== undefined && demand.approvedQuantity !== demand.quantity 
                              ? 600 
                              : 'normal'
                          }}
                        >
                          {demand.approvedQuantity !== undefined ? demand.approvedQuantity : demand.quantity}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="textSecondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(demand.requestDate)}</TableCell>
                    <TableCell>
                      {demand.demandStatus === 'APPROVED' ? (
                        <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 500 }}>
                          Kabul Edildi
                        </Typography>
                      ) : (
                        <Typography variant="body2" sx={{ color: '#d32f2f', fontWeight: 500 }}>
                          Reddedildi
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{demand.rejectionReason || '-'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    <Typography variant="body2" color="textSecondary">
                      İşlem yapılan talep bulunmamaktadır.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Onayla Dialog */}
      <Dialog open={openApproveDialog} onClose={() => setOpenApproveDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Talep Onayla</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            {selectedDemand && (
              <Box sx={{ 
                p: 2, 
                bgcolor: '#f5f5f5', 
                borderRadius: 1,
                border: '1px solid #e0e0e0'
              }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Ürün: <strong>{selectedDemand.productName}</strong>
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Talep Edilen Miktar: <strong>{selectedDemand.quantity}</strong>
                </Typography>
              </Box>
            )}
            <TextField
            label="Onaylanacak Miktar"
            type="number"
            required
            value={approveForm.quantity}
            onChange={(e) => {
              const value = e.target.value;
              // Sadece pozitif sayılara izin ver
              if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) > 0)) {
                setApproveForm({ ...approveForm, quantity: value });
              }
            }}
            fullWidth
            inputProps={{ 
              min: 0.01,
              step: 0.01
            }}
            helperText={selectedDemand && `Talep edilen miktar: ${selectedDemand.quantity}`}
            />
            <TextField
            sx={{ mt: 2 }}
            select
            label="Bütçe Seç"
            value={approveForm.budgetId}
            onChange={(e) => setApproveForm({ ...approveForm, budgetId: e.target.value })}
            fullWidth
            required
            >
            {budgets && budgets.length > 0 ? (
                budgets.map(b => (
                <MenuItem key={b.id} value={b.id}>{b.budgetName}</MenuItem>
                ))
            ) : (
                <MenuItem disabled>Yükleniyor...</MenuItem>
            )}
            </TextField>
            {selectedDemand?.tenderType === 'DIRECT_PROCUREMENT' && (
              <TextField
                select
                label="Alım Türü"
                value={approveForm.purchaseTypeId}
                onChange={(e) => setApproveForm({ ...approveForm, purchaseTypeId: e.target.value })}
                fullWidth
                required
              >
                {purchaseTypes && purchaseTypes.length > 0 ? (
                  purchaseTypes.map(pt => (
                    <MenuItem key={pt.id} value={pt.id}>{pt.name}</MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>Yükleniyor...</MenuItem>
                )}
              </TextField>
            )}
            <TextField
            label="Açıklama"
            required
            value={approveForm.description}
            onChange={(e) => setApproveForm({ ...approveForm, description: e.target.value })}
            fullWidth
            multiline
            rows={3}
            />
            <Grid container spacing={2}>
               <Grid item xs={6}>
                <TextField
                label="Depoya Giriş Tarihi"
                type="date"
                required
                InputLabelProps={{ shrink: true }}
                value={approveForm.entryDate}
                onChange={(e) => setApproveForm({ ...approveForm, entryDate: e.target.value })}
                fullWidth
                />
            </Grid>
            <Grid item xs={6}>
                <TextField
                label="Son Kullanma Tarihi"
                type="date"
                required
                InputLabelProps={{ shrink: true }}
                value={approveForm.expiryDate}
                onChange={(e) => setApproveForm({ ...approveForm, expiryDate: e.target.value })}
                fullWidth
                />
            </Grid>
           
            </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => {
              setOpenApproveDialog(false);
              setApproveForm({ budgetId: '', description: '', expiryDate: '', entryDate: '', quantity: '', purchaseTypeId: '' });
              setSelectedDemand(null);
            }} color="inherit">İptal</Button>
            <Button onClick={handleApproveSubmit} variant="contained" color="success">Onayla</Button>
        </DialogActions>
        </Dialog>

        <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Talep Reddet</DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
            <TextField
            required
            label="Açıklama"
            value={rejectForm.rejectionReason}
            onChange={(e) => setRejectForm({ ...rejectForm, rejectionReason: e.target.value })}
            fullWidth
            multiline
            />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpenRejectDialog(false)} color="inherit">İptal</Button>
            <Button onClick={handleRejectSubmit} variant="contained" color="error">Reddet</Button>
        </DialogActions>
        </Dialog>
    </Box>
  );
};

export default MaterialDemandList;