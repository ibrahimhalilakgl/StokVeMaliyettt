import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper,
  Chip, IconButton, Tooltip, TableContainer, TextField, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, Button, Tabs, Tab, TablePagination
} from '@mui/material';
import { AddCircle, CheckCircle, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';
import dayjs from 'dayjs';

interface Tender {
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
  measurementTypeName: string;
  purchasedUnitName: string;
  purchaseTypeName: string;
  purchaseFormName: string;
  increased?: boolean;
  increaseAmount?: number; // Yapılan arttırma miktarı (yüzde olarak)
  active?: boolean;
}

const formatNumber = (number: number) =>
  number.toLocaleString('tr-TR', { minimumFractionDigits: 2 });
const formatDate = (dateStr: string) => {
  const parsed = dayjs(dateStr);
  return parsed.isValid() ? parsed.format('DD-MM-YYYY') : '-';
};
const formatQuantity = (number: number) =>
  number.toLocaleString('tr-TR', {
    maximumFractionDigits: 0,
  });
const TenderList: React.FC = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTenderId, setSelectedTenderId] = useState<number | null>(null);
  const [increaseAmount, setIncreaseAmount] = useState<number | "">("");
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Tender>>({});

  const fetchTenders = () => {
    const url =
      tabIndex === 0
        ? '/v1/tender/activeTender'
        : '/v1/tender/all';

    axios
      .get(url)
      .then((res) => setTenders(res.data.data))
      .catch((err) => console.error('İhale listesi alınamadı:', err));
  };

  useEffect(() => {
    fetchTenders();
  }, [tabIndex]);

  const handleOpenDialog = (id: number) => {
    setSelectedTenderId(id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setIncreaseAmount("");
  };

  const openEdit = (item: Tender) => {
    setSelectedTenderId(item.id);
    setEditForm({
      id: item.id,
      tenderQuantity: item.tenderQuantity,
      unitPrice: item.unitPrice,
      startDate: item.startDate,
      endDate: item.endDate,
      companyName: item.companyName,
    });
    setEditOpen(true);
  };

  const openDelete = (item: Tender) => {
    setSelectedTenderId(item.id);
    setDeleteOpen(true);
  };

  const handleEditChange = (field: keyof Tender, value: any) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const submitEdit = async () => {
    if (!selectedTenderId) return;
    try {
      await axios.put(`/v1/tender/update/${selectedTenderId}`, {
        tenderQuantity: editForm.tenderQuantity,
        startDate: editForm.startDate,
        endDate: editForm.endDate,
        unitPrice: editForm.unitPrice,
        companyName: editForm.companyName,
        productId: 0,
        purchasedUnitId: 0,
        purchaseTypeId: 0,
      });
      setEditOpen(false);
      fetchTenders();
    } catch (e) {
      alert('Güncelleme başarısız');
    }
  };

  const submitDelete = async () => {
    if (!selectedTenderId) return;
    try {
      await axios.delete(`/v1/tender/delete/${selectedTenderId}`);
      setDeleteOpen(false);
      fetchTenders();
    } catch (e) {
      alert('Silme başarısız');
    }
  };

  const handleIncreaseTender = () => {
    if (increaseAmount === "" || increaseAmount === null || increaseAmount < 0 || increaseAmount > 20) {
      alert('Miktar 0 ile 20 arasında olmalıdır. (0 = Arttırma İptal)');
      return;
    }

    const selectedTender = tenders.find(t => t.id === selectedTenderId);
    const isUpdate = selectedTender?.increased;
    const isCancel = increaseAmount === 0;

    axios
      .post(`/v1/tender/increaseTender/${selectedTenderId}/${increaseAmount}`)
      .then((res) => {
        if (res.data.success) {
          if (isCancel) {
            alert('Arttırma başarıyla iptal edildi!');
          } else {
            alert(isUpdate 
              ? 'Arttırma miktarı başarıyla güncellendi!' 
              : 'İhale başarıyla arttırıldı!');
          }
          fetchTenders();
        }
        handleCloseDialog();
      })
      .catch((err) => {
        console.error('İhale arttırılamadı:', err);
        const errorMessage = err.response?.data?.data || err.response?.data?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.';
        alert(errorMessage);
      });
  };


  const filteredTenders = tenders.filter(tender => {
    return Object.keys(filters).every((key) =>
      String((tender as any)[key]).toLowerCase().includes(filters[key].toLowerCase())
    );
  });

  const paginatedTenders = filteredTenders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', fontSize: '35px' }}>
        İhale Yönetimi
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
                <TableCell>İhale Miktarı</TableCell>
                <TableCell>İhalede Kalan Miktar</TableCell>
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
              {paginatedTenders.map((tender) => {
                const isPassive = tabIndex === 1 && !tender.increased && new Date(tender.endDate) < new Date();
                return (
                  <TableRow key={tender.id}>
                    <TableCell>{tender.companyName}</TableCell>
                    <TableCell>{tender.productName}</TableCell>
                    <TableCell>{formatQuantity(tender.tenderQuantity)}</TableCell>
                    <TableCell>{formatQuantity(tender.remainingQuantityInTender)}</TableCell>
                    <TableCell>{tender.measurementTypeName}</TableCell>
                    <TableCell>{formatNumber(tender.unitPrice)} ₺</TableCell>
                    <TableCell>{formatNumber(tender.totalAmount)} ₺</TableCell>
                    <TableCell>
                      {tender.active ? <Chip label="Aktif" color="success" /> : <Chip label="Pasif" color="error" />}
                    </TableCell>
                    <TableCell>{formatDate(tender.startDate)}</TableCell>
                    <TableCell>{formatDate(tender.endDate)}</TableCell>
                    <TableCell>
                      {tender.increased ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
                          <Chip label="Arttırılmış" color="success" size="small" />
                          {tender.increaseAmount !== undefined && tender.increaseAmount !== null && (
                            <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                              %{tender.increaseAmount} arttırıldı
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Chip label="Arttırılabilir" color="warning" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Düzenle">
                        <IconButton color="primary" onClick={() => openEdit(tender)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sil">
                        <IconButton color="error" onClick={() => openDelete(tender)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                      {!tender.active ? (
                        <IconButton color="default" disabled>
                          <CheckCircle />
                        </IconButton>
                      ) : (
                        <Tooltip title={tender.increased ? "Arttırma Miktarını Güncelle" : "İhale Miktarını Arttır"}>
                          <IconButton 
                            color={tender.increased ? "secondary" : "primary"} 
                            onClick={() => handleOpenDialog(tender.id)}
                          >
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
          count={filteredTenders.length}
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
        <DialogTitle>
          {selectedTenderId && tenders.find(t => t.id === selectedTenderId)?.increased 
            ? "Arttırma Miktarını Güncelle veya İptal Et" 
            : "Miktar Arttırımı"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedTenderId && tenders.find(t => t.id === selectedTenderId)?.increased 
              ? "Yeni arttırma miktarını girin (0-20 arası, 0 = Arttırma İptal):" 
              : "Miktar girin (0-20 arası, 0 = Arttırma İptal):"}
          </DialogContentText>
          <TextField
            type="number"
            fullWidth
            value={increaseAmount}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0 && Number(value) <= 20)) {
                setIncreaseAmount(value === '' ? '' : Number(value));
              }
            }}
            inputProps={{ min: 0, max: 20, step: 0.01 }}
            sx={{ mt: 2 }}
            helperText="0 girerek arttırmayı iptal edebilirsiniz"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button 
            onClick={handleIncreaseTender} 
            color={increaseAmount === 0 ? "error" : "primary"}
          >
            {increaseAmount === 0 
              ? "Arttırmayı İptal Et" 
              : selectedTenderId && tenders.find(t => t.id === selectedTenderId)?.increased 
                ? "Güncelle" 
                : "Arttır"}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Edit */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>İhale Düzenle</DialogTitle>
        <DialogContent>
          <TextField label="Firma" fullWidth margin="dense" value={editForm.companyName || ''} onChange={(e) => handleEditChange('companyName', e.target.value)} />
          <TextField label="Miktar" type="number" fullWidth margin="dense" value={editForm.tenderQuantity ?? ''} onChange={(e) => handleEditChange('tenderQuantity', Number(e.target.value))} />
          <TextField label="Birim Fiyat" type="number" fullWidth margin="dense" value={editForm.unitPrice ?? ''} onChange={(e) => handleEditChange('unitPrice', Number(e.target.value))} />
          <TextField label="Başlangıç Tarihi" type="date" fullWidth margin="dense" value={editForm.startDate ? String(editForm.startDate).slice(0,10) : ''} onChange={(e) => handleEditChange('startDate', e.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField label="Bitiş Tarihi" type="date" fullWidth margin="dense" value={editForm.endDate ? String(editForm.endDate).slice(0,10) : ''} onChange={(e) => handleEditChange('endDate', e.target.value)} InputLabelProps={{ shrink: true }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>İptal</Button>
          <Button onClick={submitEdit} variant="contained">Kaydet</Button>
        </DialogActions>
      </Dialog>

      {/* Delete */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Silme Onayı</DialogTitle>
        <DialogContent><DialogContentText>Bu kaydı silmek istediğinize emin misiniz?</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>İptal</Button>
          <Button color="error" onClick={submitDelete} variant="contained">Sil</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TenderList;