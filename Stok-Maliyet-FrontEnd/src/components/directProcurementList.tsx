import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper,
  Chip, IconButton, Tooltip, TableContainer, TextField, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, Button, Tabs, Tab, TablePagination
} from '@mui/material';
import { AddCircle, CheckCircle, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';
import SuccessMessage from './SuccessMessage';
import dayjs from 'dayjs';

interface DirectProcurement {
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
  purchaseFormName: string;
  increased?: boolean;
  active?: boolean;
}

const formatNumber = (number: number | undefined | null) => {
  if (number === undefined || number === null) return '0,00';
  return number.toLocaleString('tr-TR', { minimumFractionDigits: 2 });
};
const formatDate = (dateStr: string) => {
  const parsed = dayjs(dateStr);
  return parsed.isValid() ? parsed.format('DD-MM-YYYY') : '-';
};
const formatQuantity = (number: number | undefined | null) => {
  if (number === undefined || number === null) return '0';
  return number.toLocaleString('tr-TR', {
    maximumFractionDigits: 0,
  });
};
const DirectProcurementList: React.FC = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [directProcurements, setdirectProcurements] = useState<DirectProcurement[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDirectProcuremntId, setSelectedDirectProcuremntId] = useState<number | null>(null);
  const [increaseAmount, setIncreaseAmount] = useState<number | "">("");
  const [showMessage, setShowMessage] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<DirectProcurement>>({});

  const fetchDirectProcurements = () => {
    const url =
      tabIndex === 0
        ? '/directProcurement/activeDirectProcurement'
        : '/directProcurement/all';

    axios
      .get(url)
      .then((res) => setdirectProcurements(res.data.data))
      .catch((err) => console.error('Doğrudan Temin listesi alınamadı:', err));
      console.log('Doğrudan Temin listesi:', directProcurements);
  };

  useEffect(() => {
    fetchDirectProcurements();
  }, [tabIndex]);

  const handleOpenDialog = (id: number) => {
    setSelectedDirectProcuremntId(id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setIncreaseAmount("");
  };

  const openEdit = (item: DirectProcurement) => {
    setSelectedDirectProcuremntId(item.id);
    setEditForm({
      id: item.id,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      startDate: item.startDate,
      endDate: item.endDate,
      companyName: item.companyName,
    });
    setEditOpen(true);
  };

  const openDelete = (item: DirectProcurement) => {
    setSelectedDirectProcuremntId(item.id);
    setDeleteOpen(true);
  };

  const handleEditChange = (field: keyof DirectProcurement, value: any) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const submitEdit = async () => {
    if (!selectedDirectProcuremntId) return;
    try {
      await axios.put(`/directProcurement/update/${selectedDirectProcuremntId}`, {
        quantity: editForm.quantity,
        startDate: editForm.startDate,
        endDate: editForm.endDate,
        unitPrice: editForm.unitPrice,
        companyName: editForm.companyName,
        productId: 0,
        purchaseUnitId: 0,
        purchaseTypeId: 0,
        entryDate: null,
        expiryDate: null,
      });
      setEditOpen(false);
      fetchDirectProcurements();
      setMessageText('Kayıt güncellendi');
      setMessageType('success');
      setShowMessage(true);
    } catch (e) {
      setMessageText('Güncelleme başarısız');
      setMessageType('error');
      setShowMessage(true);
    }
  };

  const submitDelete = async () => {
    if (!selectedDirectProcuremntId) return;
    try {
      await axios.delete(`/directProcurement/delete/${selectedDirectProcuremntId}`);
      setDeleteOpen(false);
      fetchDirectProcurements();
      setMessageText('Kayıt silindi');
      setMessageType('success');
      setShowMessage(true);
    } catch (e) {
      setMessageText('Silme başarısız');
      setMessageType('error');
      setShowMessage(true);
    }
  };

  const handleIncreaseDirectProcurement = () => {
    if (increaseAmount < 1 || increaseAmount > 20) {
      setMessageText('Miktar 1 ile 20 arasında olmalıdır.');
      setMessageType('warning');
      setShowMessage(true);
      return;
    }

    axios
      .post(`/directProcurement/increaseDirectProcurement/${selectedDirectProcuremntId}/${increaseAmount}`)
      .then((res) => {
        if (res.data.success) {
          setMessageText('Doğrudan Temin başarıyla arttırıldı!');
          setMessageType('success');
          setShowMessage(true);
          fetchDirectProcurements();
        }
        handleCloseDialog();
      })
      .catch((err) => {
        console.error('Doğrudan Temin arttırılamadı:', err);
        setMessageText('Bir hata oluştu. Lütfen tekrar deneyin.');
        setMessageType('error');
        setShowMessage(true);
      });
  };


  const filteredDirectProcuremnts = directProcurements.filter(directProcurement => {
    return Object.keys(filters).every((key) =>
      String((directProcurement as any)[key]).toLowerCase().includes(filters[key].toLowerCase())
    );
  });

  const paginatedDirectProcuremnts = filteredDirectProcuremnts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', fontSize: '35px' }}>
        Doğrudan Temin Yönetimi
      </Typography>

      <Tabs value={tabIndex} onChange={(_, newIndex) => setTabIndex(newIndex)} sx={{ mb: 2 }}>
        <Tab label="Aktif İhaleler" />
        <Tab label="Tüm İhaleler" />
      </Tabs>

       <Paper elevation={3}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
              <TableRow>
                <TableCell>Firma</TableCell>
                <TableCell>Malzeme</TableCell>
                <TableCell>Miktarı</TableCell>
                <TableCell>Kalan Miktar</TableCell>
                <TableCell>Ölçü Birimi</TableCell>
                <TableCell>Birim Fiyatı</TableCell>
                <TableCell>Toplam Tutar</TableCell>
                <TableCell>Aktif</TableCell>
                <TableCell>Başlangıç Tarihi</TableCell>
                <TableCell>Bitiş Tarihi</TableCell>
                <TableCell>Arttırılmış</TableCell>
                <TableCell>İşlem</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedDirectProcuremnts.map((directProcurement) => {
                const isPassive = tabIndex === 1 && !directProcurement.increased && new Date(directProcurement.endDate) < new Date();
                return (
                  <TableRow key={directProcurement.id}>
                    <TableCell>{directProcurement.companyName}</TableCell>
                    <TableCell>{directProcurement.productName}</TableCell>
                    <TableCell>{formatQuantity(directProcurement.quantity)}</TableCell>
                    <TableCell>{formatQuantity(directProcurement.remainingQuantity)}</TableCell>
                    <TableCell>{directProcurement.measurementTypeName}</TableCell>
                    <TableCell>{formatNumber(directProcurement.unitPrice)} ₺</TableCell>
                    <TableCell>{formatNumber(directProcurement.totalAmount)} ₺</TableCell>
                    <TableCell>
                      {directProcurement.active ? <Chip label="Aktif" color="success" /> : <Chip label="Pasif" color="error" />}
                    </TableCell>
                    <TableCell>{formatDate(directProcurement.startDate)}</TableCell>
                    <TableCell>{formatDate(directProcurement.endDate)}</TableCell>
                    <TableCell>
                      {directProcurement.increased ? (
                        <Chip label="Arttırılmış" color="success" />
                      ) : (
                        <Chip label="Arttırılabilir" color="warning" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Düzenle">
                        <IconButton color="primary" onClick={() => openEdit(directProcurement)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sil">
                        <IconButton color="error" onClick={() => openDelete(directProcurement)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                      {directProcurement.increased || !directProcurement.active ? (
                        <IconButton color="default" disabled>
                          <CheckCircle />
                        </IconButton>
                      ) : (
                        <Tooltip title="Doğrudan Temin Miktarını Arttır">
                          <IconButton color="primary" onClick={() => handleOpenDialog(directProcurement.id)}>
                            <AddCircle />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredDirectProcuremnts.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          sx={{ display: 'flex', justifyContent: 'center' }}
        />
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Miktar Arttırımı</DialogTitle>
        <DialogContent>
          <DialogContentText>Miktar girin (1-20 arası):</DialogContentText>
          <TextField
            type="number"
            fullWidth
            value={increaseAmount}
            onChange={(e) => setIncreaseAmount(Number(e.target.value))}
            inputProps={{ min: 1, max: 20 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button onClick={handleIncreaseDirectProcurement} color="primary">Arttır</Button>
        </DialogActions>
      </Dialog>
      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Doğrudan Temin Düzenle</DialogTitle>
        <DialogContent>
          <TextField label="Firma" fullWidth margin="dense" value={editForm.companyName || ''} onChange={(e) => handleEditChange('companyName', e.target.value)} />
          <TextField label="Miktar" type="number" fullWidth margin="dense" value={editForm.quantity ?? ''} onChange={(e) => handleEditChange('quantity', Number(e.target.value))} />
          <TextField label="Birim Fiyat" type="number" fullWidth margin="dense" value={editForm.unitPrice ?? ''} onChange={(e) => handleEditChange('unitPrice', Number(e.target.value))} />
          <TextField label="Başlangıç Tarihi" type="date" fullWidth margin="dense" value={editForm.startDate ? String(editForm.startDate).slice(0,10) : ''} onChange={(e) => handleEditChange('startDate', e.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField label="Bitiş Tarihi" type="date" fullWidth margin="dense" value={editForm.endDate ? String(editForm.endDate).slice(0,10) : ''} onChange={(e) => handleEditChange('endDate', e.target.value)} InputLabelProps={{ shrink: true }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>İptal</Button>
          <Button onClick={submitEdit} variant="contained">Kaydet</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Silme Onayı</DialogTitle>
        <DialogContent><DialogContentText>Bu kaydı silmek istediğinize emin misiniz?</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>İptal</Button>
          <Button color="error" onClick={submitDelete} variant="contained">Sil</Button>
        </DialogActions>
      </Dialog>
      
      <SuccessMessage
        open={showMessage}
        onClose={() => setShowMessage(false)}
        message={messageText}
        type={messageType}
      />
    </Box>
  );
};

export default DirectProcurementList;
