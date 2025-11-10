import React, { useState } from 'react';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Container,
  Grid,
  Typography,
  Paper,
  SelectChangeEvent,
  Box,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import tr from 'date-fns/locale/tr';

interface MaterialFormData {
  product: string;
  budget: string;
  purchaseMethod: string;
  purchaseType: string;
  purchaseUnit: string;
  quantity: string;
  unitPrice: string;
  expiryDate: Date | null;
  supplier: string;
  description: string;
}

const MaterialForm: React.FC = () => {
  const [formData, setFormData] = useState<MaterialFormData>({
    product: '',
    budget: '',
    purchaseMethod: '',
    purchaseType: '',
    purchaseUnit: '',
    quantity: '',
    unitPrice: '',
    expiryDate: null,
    supplier: '',
    description: '',
  });

  const handleSelectChange = (field: keyof MaterialFormData) => (event: SelectChangeEvent) => {
    setFormData({
      ...formData,
      [field]: event.target.value as string,
    });
  };

  const handleInputChange = (field: keyof MaterialFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log(formData);
    // API'ye gönderme işlemi burada yapılacak
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Depoya Ürün Girişi Formu
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'grid', gap: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Ürün</InputLabel>
              <Select
                value={formData.product}
                onChange={handleSelectChange('product')}
                label="Ürün"
              >
                <MenuItem value="urun1">Ürün 1</MenuItem>
                <MenuItem value="urun2">Ürün 2</MenuItem>
                <MenuItem value="urun3">Ürün 3</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Bütçe</InputLabel>
              <Select
                value={formData.budget}
                onChange={handleSelectChange('budget')}
                label="Bütçe"
              >
                <MenuItem value="butce1">Bütçe 1</MenuItem>
                <MenuItem value="butce2">Bütçe 2</MenuItem>
                <MenuItem value="butce3">Bütçe 3</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Alım Şekli</InputLabel>
                <Select
                  value={formData.purchaseMethod}
                  onChange={handleSelectChange('purchaseMethod')}
                  label="Alım Şekli"
                >
                  <MenuItem value="dogrudan">Doğrudan Temin</MenuItem>
                  <MenuItem value="ihale">İhale</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Alım Türü</InputLabel>
                <Select
                  value={formData.purchaseType}
                  onChange={handleSelectChange('purchaseType')}
                  label="Alım Türü"
                >
                  <MenuItem value="mal">Mal Alımı</MenuItem>
                  <MenuItem value="hizmet">Hizmet Alımı</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <FormControl fullWidth>
              <InputLabel>Alım Yapılan Birim</InputLabel>
              <Select
                value={formData.purchaseUnit}
                onChange={handleSelectChange('purchaseUnit')}
                label="Alım Yapılan Birim"
              >
                <MenuItem value="birim1">Birim 1</MenuItem>
                <MenuItem value="birim2">Birim 2</MenuItem>
                <MenuItem value="birim3">Birim 3</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <TextField
                fullWidth
                label="Alınan Ürün Miktarı"
                type="number"
                value={formData.quantity}
                onChange={handleInputChange('quantity')}
              />

              <TextField
                fullWidth
                label="Ürün Birim Fiyatı"
                type="number"
                value={formData.unitPrice}
                onChange={handleInputChange('unitPrice')}
              />
            </Box>

            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
              <DatePicker
                label="Ürün Son Kullanma Tarihi"
                value={formData.expiryDate}
                onChange={(newValue) => {
                  setFormData({
                    ...formData,
                    expiryDate: newValue,
                  });
                }}
                sx={{ width: '100%' }}
              />
            </LocalizationProvider>

            <TextField
              fullWidth
              label="Ürünün Alındığı Firma"
              value={formData.supplier}
              onChange={handleInputChange('supplier')}
            />

            <TextField
              fullWidth
              label="Ürün Açıklaması"
              multiline
              rows={4}
              value={formData.description}
              onChange={handleInputChange('description')}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              sx={{ mt: 2 }}
            >
              Kaydet
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default MaterialForm; 