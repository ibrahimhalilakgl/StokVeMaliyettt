import React, { useState, useEffect } from 'react';
import {
  TextField, Button, Grid, Typography, MenuItem,
  Select, InputLabel, FormControl, Alert
} from '@mui/material';
import axios from 'axios';

const MaterialEntry: React.FC = () => {
  const [formData, setFormData] = useState({
    quantity: '',
    unitPrice: '',
    startDate: '',
    endDate: '',
    companyName: '',
    productId: '',
    purchaseUnitId: ''
  });

  const [materials, setMaterials] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [purchaseUnits, setPurchaseUnits] = useState<any[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [productRes, unitRes] = await Promise.all([
          axios.get('/v1/product/all'),
          axios.get('/v1/purchasedUnit/all'),
        ]);

        setProducts(productRes.data.data || []);
        setPurchaseUnits(unitRes.data.data || []);
      } catch (err) {
        console.error('Dropdown verileri alınamadı:', err);
      }
    };
    fetchOptions();
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      quantity: '',
      unitPrice: '',
      startDate: '',
      endDate: '',
      companyName: '',
      productId: '',
      purchaseUnitId: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post('/v1/directProcurement/create', formData);
      
      setMaterials((prev) => [...prev, response.data.data]);
      resetForm();
      setShowSuccess(true);
      setShowError(false);
      console.log('Yeni malzeme:', response.data.data);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.data || 'İstek gönderilirken hata oluştu');
      setShowError(true);
      setShowSuccess(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="h5" gutterBottom>Doğrudan Temin İle Malzeme Giriş Formu</Typography>

      {showSuccess && <Alert severity="success">Malzeme girişi başarıyla kaydedildi.</Alert>}
      {showError && <Alert severity="error">{errorMessage}</Alert>}

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <FormControl fullWidth required>
            <InputLabel>Ürün</InputLabel>
            <Select
              value={formData.productId}
              onChange={(e) => handleInputChange('productId', e.target.value)}
              label="Ürün"
            >
              {products.map((p: any) => (
                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

      

        <Grid item xs={6}>
          <FormControl fullWidth required>
            <InputLabel>Alım Birimi</InputLabel>
            <Select
              value={formData.purchaseUnitId}
              onChange={(e) => handleInputChange('purchaseUnitId', e.target.value)}
              label="Alım Birimi"
            >
              {purchaseUnits.map((u: any) => (
                <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

     
        <Grid item xs={6}>
          <TextField
            label="Miktar"
            fullWidth
            required
            type="number"
            value={formData.quantity}
            onChange={(e) => handleInputChange('quantity', e.target.value)}
          />
        </Grid>
        
        

        <Grid item xs={6}>
          <TextField
            label="Birim Fiyat"
            fullWidth
            required
            type="number"
            value={formData.unitPrice}
            onChange={(e) => handleInputChange('unitPrice', e.target.value)}
          />
        </Grid>

        <Grid item xs={6}>
          <TextField
            label="Başlangıç Tarihi"
            fullWidth
            required
            type="date"
            InputLabelProps={{ shrink: true }}
            value={formData.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
          />
        </Grid>

        <Grid item xs={6}>
          <TextField
            label="Bitiş Tarihi"
            fullWidth
            required
            type="date"
            InputLabelProps={{ shrink: true }}
            value={formData.endDate}
            onChange={(e) => handleInputChange('endDate', e.target.value)}
          />
        </Grid>

        <Grid item xs={6}>
          <TextField
            label="Firma"
            required
            fullWidth
            value={formData.companyName}
            onChange={(e) => handleInputChange('companyName', e.target.value)}
          />
        </Grid>

        <Grid item xs={12}>
          <Button variant="contained" color="primary" type="submit">Kaydet</Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default MaterialEntry;
