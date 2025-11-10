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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';

interface Budget {
  id: number;
  budgetName: string;
  budgetAmount: number;
  startDate: string;
  endDate: string;
}

const BudgetForm: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [open, setOpen] = useState(false);
  const [budgetName, setBudgetName] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);

  const fetchBudgets = async () => {
    try {
      const response = await axios.get('/v1/budget/all');
      setBudgets(response.data.data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  };

  const handleCreate = async () => {
    try {
      await axios.post('/v1/budget/create', {
        budgetName,
        startDate,
        endDate,
      });
      setOpen(false);
      setBudgetName('');
      setStartDate(null);
      setEndDate(null);
      fetchBudgets();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.data || 'Beklenmeyen bir hata oluştu.');
      setShowError(true);
    }
  };

  const handleDelete = async () => {
    if (!budgetToDelete) return;
    try {
      await axios.delete(`/v1/budget/delete/${budgetToDelete.id}`);
      setDeleteConfirmOpen(false);
      setBudgetToDelete(null);
      fetchBudgets();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.data || 'Silme işlemi sırasında bir hata oluştu.');
      setShowError(true);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3, position: 'relative' }}>
        <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
          Bütçeler
        </Typography>

        <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpen(true)}
            sx={{ fontSize: '0.75rem', padding: '6px 12px', backgroundColor: '#007BFF' }}
            startIcon={<AddIcon />}
          >
            Yeni Bütçe
          </Button>
        </Box>

        <TableContainer component={Paper} sx={{ mt: 4, borderRadius: '8px', overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Sıra No</TableCell>
                <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Bütçe Adı</TableCell>
                <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Tutar</TableCell>
                <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Başlangıç Tarihi</TableCell>
                <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Bitiş Tarihi</TableCell>
                <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold' }}>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {budgets.map((budget, index) => (
                <TableRow key={budget.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{budget.budgetName}</TableCell>
                   <TableCell>{budget.budgetAmount.toLocaleString('tr-TR')} ₺</TableCell>
                  <TableCell>
                    {format(new Date(budget.startDate), 'dd-MM-yyyy')}
                  </TableCell>
                  <TableCell>
                    {format(new Date(budget.endDate), 'dd-MM-yyyy')}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => {
                        setBudgetToDelete(budget);
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

        {/* Yeni Bütçe Dialog */}
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Yeni Bütçe Oluştur</DialogTitle>
          <DialogContent dividers>
            <TextField
              fullWidth
              label="Bütçe Adı"
              value={budgetName}
              onChange={(e) => setBudgetName(e.target.value)}
              margin="normal"
              variant="outlined"
            />
            <DatePicker
              label="Başlangıç Tarihi"
              value={startDate}
              onChange={(date) => setStartDate(date)}
              slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
            />
            <DatePicker
              label="Bitiş Tarihi"
              value={endDate}
              onChange={(date) => setEndDate(date)}
              slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
            />
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
          <DialogTitle>Bütçeyi Sil</DialogTitle>
          <DialogContent>
            <Typography>
              "{budgetToDelete?.budgetName}" bütçesini silmek istediğinizden emin misiniz? 
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
    </LocalizationProvider>
  );
};

export default BudgetForm;
