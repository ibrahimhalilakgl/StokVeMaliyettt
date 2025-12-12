import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Container,
  Alert,
  Snackbar
} from '@mui/material';
import { Material } from '../types/MaterialTypes';

interface YearEndTransferProps {
  materials: Material[];
  onTransfer: (updatedMaterials: Material[]) => void;
}

const YearEndTransfer: React.FC<YearEndTransferProps> = ({ materials, onTransfer }) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleTransfer = () => {
    try {
      if (!startDate || !endDate) {
        setErrorMessage('Lütfen tarih aralığı seçin');
        setShowError(true);
        return;
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start > end) {
        setErrorMessage('Başlangıç tarihi bitiş tarihinden sonra olamaz');
        setShowError(true);
        return;
      }

      // Seçilen tarih aralığındaki malzemeleri filtrele
      const materialsToTransfer = materials.filter(material => {
        const entryDate = new Date(material.entryDate);
        return entryDate >= start && entryDate <= end;
      });

      if (materialsToTransfer.length === 0) {
        setErrorMessage('Seçilen tarih aralığında devredilecek malzeme bulunamadı');
        setShowError(true);
        return;
      }

      // Malzemeleri gelecek yıla devret
      const updatedMaterials = materials.map(material => {
        const shouldTransfer = materialsToTransfer.some(m => m.id === material.id);
        if (shouldTransfer) {
          return {
            ...material,
            year: material.year + 1,
            entryDate: new Date().toISOString().split('T')[0],
            yearlyEntries: 0,
            totalReceived: material.currentStock,
            totalExited: 0,
            exitHistory: [],
            entryHistory: [{
              date: new Date().toISOString().split('T')[0],
              quantity: material.currentStock,
              unitPrice: material.unitPrice,
              supplier: 'Yıl Sonu Devir'
            }]
          };
        }
        return material;
      });

      onTransfer(updatedMaterials);
      setShowSuccess(true);
    } catch (error) {
      setErrorMessage('Devir işlemi sırasında bir hata oluştu');
      setShowError(true);
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ color: '#006C7F', fontWeight: 600, mb: 4 }}>
          Yıl Sonu Devir İşlemi
        </Typography>

        <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
          <TextField
            label="Başlangıç Tarihi"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="Bitiş Tarihi"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Malzeme Adı</TableCell>
                <TableCell>Kategori</TableCell>
                <TableCell align="right">Mevcut Stok</TableCell>
                <TableCell align="right">Birim Fiyat</TableCell>
                <TableCell align="right">Toplam Değer</TableCell>
                <TableCell>Giriş Tarihi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {materials
                .filter(material => {
                  if (!startDate || !endDate) return true;
                  const entryDate = new Date(material.entryDate);
                  return entryDate >= new Date(startDate) && entryDate <= new Date(endDate);
                })
                .map((material) => (
                  <TableRow key={material.id}>
                    <TableCell>{material.name}</TableCell>
                    <TableCell>{material.category}</TableCell>
                    <TableCell align="right">{material.currentStock}</TableCell>
                    <TableCell align="right">{material.unitPrice.toFixed(2)} ₺</TableCell>
                    <TableCell align="right">
                      {(material.currentStock * material.unitPrice).toFixed(2)} ₺
                    </TableCell>
                    <TableCell>{new Date(material.entryDate).toLocaleDateString('tr-TR')}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={handleTransfer}
            sx={{
              bgcolor: '#006C7F',
              '&:hover': {
                bgcolor: '#005A6B',
              },
            }}
          >
            Devir İşlemini Gerçekleştir
          </Button>
        </Box>

        <Snackbar
          open={showSuccess}
          autoHideDuration={3000}
          onClose={() => setShowSuccess(false)}
        >
          <Alert severity="success" onClose={() => setShowSuccess(false)}>
            Devir işlemi başarıyla tamamlandı
          </Alert>
        </Snackbar>

        <Snackbar
          open={showError}
          autoHideDuration={3000}
          onClose={() => setShowError(false)}
        >
          <Alert severity="error" onClose={() => setShowError(false)}>
            {errorMessage}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
};

export default YearEndTransfer; 
