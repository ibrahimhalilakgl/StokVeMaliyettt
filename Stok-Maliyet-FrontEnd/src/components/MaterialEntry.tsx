import React, { useState, useEffect } from 'react';
import {
  TextField, Button, Grid, Typography, MenuItem,
  Select, InputLabel, FormControl, Alert, FormHelperText
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const MaterialEntry: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    quantity: '',
    unitPrice: '',
    entryDate: '',
    expiryDate: '',
    companyName: '',
    description: '',
    productId: '',
    budgetId: '',
    entrySourceType: 'DOGRUDAN_TEMIN',
    purchaseUnitId: '',
    purchaseTypeId: '',
    purchaseFormId: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [products, setProducts] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [purchaseUnits, setPurchaseUnits] = useState([]);
  const [purchaseTypes, setPurchaseTypes] = useState([]);
  const [purchaseForms, setPurchaseForms] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [productRes, budgetRes, unitRes, typeRes] = await Promise.all([
          axios.get('/product/all'),
          axios.get('/budget/all'),
          axios.get('/purchasedUnit/all'),
          axios.get('/purchaseType/all'),
        ]);

        setProducts(productRes.data.data || []);
        setBudgets(budgetRes.data.data || []);
        setPurchaseUnits(unitRes.data.data || []);
        setPurchaseTypes(typeRes.data.data || []);
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
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    Object.entries(formData).forEach(([key, value]) => {
      // DEPO rolü için purchaseFormId alanını zorunlu olmaktan çıkar
      if (user?.role === 'DEPO' && key === 'purchaseFormId') {
        return;
      }
      
      if (!value) {
        newErrors[key] = 'Bu alan zorunludur.';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      quantity: '',
      unitPrice: '',
      entryDate: '',
      expiryDate: '',
      companyName: '',
      description: '',
      productId: '',
      budgetId: '',
      entrySourceType: 'DOGRUDAN_TEMIN',
      purchaseUnitId: '',
      purchaseTypeId: '',
      purchaseFormId: ''
    });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setErrorMessage('Lütfen tüm zorunlu alanları doldurunuz.');
      setShowError(true);
      setShowSuccess(false);
      return;
    }

    try {
      const response = await axios.post('/materialEntry/create', formData);
      
      resetForm();
      setShowSuccess(true);
      setShowError(false);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.data || 'İstek gönderilirken hata oluştu');
      setShowError(true);
      setShowSuccess(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="h5" gutterBottom>Doğrudan Temin Malzeme Giriş Formu</Typography>

      {showSuccess && <Alert severity="success">Malzeme girişi başarıyla kaydedildi.</Alert>}
      {showError && <Alert severity="error">{errorMessage}</Alert>}

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <FormControl fullWidth error={!!errors.productId} required>
            <InputLabel>Malzeme</InputLabel>
            <Select
              value={formData.productId}
              onChange={(e) => handleInputChange('productId', e.target.value)}
              label="Ürün"
            >
              {products.map((p: any) => (
                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
              ))}
            </Select>
            {errors.productId && <FormHelperText>{errors.productId}</FormHelperText>}
          </FormControl>
        </Grid>

        <Grid item xs={6}>
          <FormControl fullWidth error={!!errors.budgetId} required>
            <InputLabel>Bütçe</InputLabel>
            <Select
              value={formData.budgetId}
              onChange={(e) => handleInputChange('budgetId', e.target.value)}
              label="Bütçe"
            >
              {budgets.map((b: any) => (
                <MenuItem key={b.id} value={b.id}>{b.budgetName}</MenuItem>
              ))}
            </Select>
            {errors.budgetId && <FormHelperText>{errors.budgetId}</FormHelperText>}
          </FormControl>
        </Grid>

        <Grid item xs={6}>
          <FormControl fullWidth error={!!errors.purchaseTypeId} required>
            <InputLabel>Alım Türü</InputLabel>
            <Select
              value={formData.purchaseTypeId}
              onChange={(e) => handleInputChange('purchaseTypeId', e.target.value)}
              label="Alım Türü"
            >
              {purchaseTypes.map((t: any) => (
                <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
              ))}
            </Select>
            {errors.purchaseTypeId && <FormHelperText>{errors.purchaseTypeId}</FormHelperText>}
          </FormControl>
        </Grid>

        <Grid item xs={6}>
          <FormControl fullWidth error={!!errors.purchaseUnitId} required>
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
            {errors.purchaseUnitId && <FormHelperText>{errors.purchaseUnitId}</FormHelperText>}
          </FormControl>
        </Grid>

        {/* Alım Şekli - Sadece SATINALMA ve ADMIN rolleri için göster */}
        {user?.role !== 'DEPO' && (
          <Grid item xs={6}>
            <FormControl fullWidth error={!!errors.purchaseFormId} required>
              <InputLabel>Alım Şekli</InputLabel>
              <Select
                value={formData.purchaseFormId}
                onChange={(e) => handleInputChange('purchaseFormId', e.target.value)}
                label="Alım Şekli"
              >
                {purchaseForms.map((u: any) => (
                  <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
                ))}
              </Select>
              {errors.purchaseFormId && <FormHelperText>{errors.purchaseFormId}</FormHelperText>}
            </FormControl>
          </Grid>
        )}

        <Grid item xs={6}>
          <TextField
            label="Miktar"
            fullWidth
            required
            type="number"
            value={formData.quantity}
            onChange={(e) => handleInputChange('quantity', e.target.value)}
            error={!!errors.quantity}
            helperText={errors.quantity}
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
            error={!!errors.unitPrice}
            helperText={errors.unitPrice}
          />
        </Grid>

        <Grid item xs={6}>
          <TextField
            label="Giriş Tarihi"
            fullWidth
            required
            type="date"
            InputLabelProps={{ shrink: true }}
            value={formData.entryDate}
            onChange={(e) => handleInputChange('entryDate', e.target.value)}
            error={!!errors.entryDate}
            helperText={errors.entryDate}
          />
        </Grid>

        <Grid item xs={6}>
          <TextField
            label="Son Kullanma Tarihi"
            fullWidth
            required
            type="date"
            InputLabelProps={{ shrink: true }}
            value={formData.expiryDate}
            onChange={(e) => handleInputChange('expiryDate', e.target.value)}
            error={!!errors.expiryDate}
            helperText={errors.expiryDate}
          />
        </Grid>

        <Grid item xs={6}>
          <TextField
            label="Firma"
            fullWidth
            required
            value={formData.companyName}
            onChange={(e) => handleInputChange('companyName', e.target.value)}
            error={!!errors.companyName}
            helperText={errors.companyName}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Açıklama"
            fullWidth
            required
            multiline
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            error={!!errors.description}
            helperText={errors.description}
          />
        </Grid>

        <Grid item xs={12}>
          <Button variant="contained" color="primary" type="submit">
            Kaydet
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default MaterialEntry;
