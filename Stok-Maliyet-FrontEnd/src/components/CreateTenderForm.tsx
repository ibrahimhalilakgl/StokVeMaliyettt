import React, { useEffect, useState } from 'react';
import {
  Box, Button, TextField, Typography, Autocomplete
} from '@mui/material';
import axios from 'axios';
import SuccessMessage from './SuccessMessage';

interface SelectItem {
  id: number;
  name: string;
}

const CreateTenderForm: React.FC = () => {
  const [products, setProducts] = useState<SelectItem[]>([]);
  const [purchasedUnits, setPurchasedUnits] = useState<SelectItem[]>([]);
  const [purchaseTypes, setPurchaseTypes] = useState<SelectItem[]>([]);
  const [showMessage, setShowMessage] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'warning' | 'info'>('success');

  const [formData, setFormData] = useState({
    productId: '',
    tenderQuantity: '',
    startDate: '',
    endDate: '',
    unitPrice: '',
    companyName: '',
    purchasedUnitId: '',
    purchaseTypeId: '',
  });

  useEffect(() => {
    axios.get('/v1/product/all').then(res => setProducts(res.data.data));
    axios.get('/v1/purchasedUnit/all').then(res => setPurchasedUnits(res.data.data));
    axios.get('/v1/purchaseType/all').then(res => setPurchaseTypes(res.data.data));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      productId: parseInt(formData.productId),
      tenderQuantity: parseInt(formData.tenderQuantity),
      startDate: formData.startDate,
      endDate: formData.endDate,
      unitPrice: parseFloat(formData.unitPrice.replace(',', '.')),
      companyName: formData.companyName,
      purchasedUnitId: parseInt(formData.purchasedUnitId),
      purchaseTypeId: parseInt(formData.purchaseTypeId),
    };

    try {
      await axios.post('/v1/tender/create', payload);
      setMessageText('İhale başarıyla oluşturuldu!');
      setMessageType('success');
      setShowMessage(true);

      setFormData({
        productId: '',
        tenderQuantity: '',
        startDate: '',
        endDate: '',
        unitPrice: '',
        companyName: '',
        purchasedUnitId: '',
        purchaseTypeId: ''
      });
    } catch (error: any) {
      console.error('İhale oluşturulurken hata:', error);
      setMessageText('Bir hata oluştu: ' + (error.response?.data?.data || 'Bilinmeyen hata'));
      setMessageType('error');
      setShowMessage(true);
    }
  };

  const renderAutocomplete = (
    label: string,
    options: SelectItem[],
    name: keyof typeof formData
  ) => (
    <Autocomplete
      options={options}
      getOptionLabel={(option) => option.name}
      value={options.find((opt) => opt.id === Number(formData[name])) || null}
      onChange={(_, newValue) => {
        setFormData({ ...formData, [name]: newValue ? newValue.id.toString() : '' });
      }}
      renderInput={(params) => (
        <TextField {...params} label={label} fullWidth margin="normal" />
      )}
      isOptionEqualToValue={(option, value) => option.id === value.id}
    />
  );

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 2, p: 3, boxShadow: 3, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom>
        İhale Oluştur
      </Typography>

      {renderAutocomplete("Malzeme", products, "productId")}

      <TextField
        label="Miktar"
        name="tenderQuantity"
        type="number"
        value={formData.tenderQuantity}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />

      <TextField
        label="Başlangıç Tarihi"
        name="startDate"
        type="date"
        value={formData.startDate}
        onChange={handleChange}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        label="Bitiş Tarihi"
        name="endDate"
        type="date"
        value={formData.endDate}
        onChange={handleChange}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        label="Birim Fiyat"
        name="unitPrice"
        value={formData.unitPrice}
        onChange={handleChange}
        fullWidth
        margin="normal"
        placeholder="örnek: 123.45 veya 123,45"
      />

      <TextField
        label="Firma Adı"
        name="companyName"
        value={formData.companyName}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />

      {renderAutocomplete("Satın Alma Birimi", purchasedUnits, "purchasedUnitId")}
      {renderAutocomplete("Satın Alma Türü", purchaseTypes, "purchaseTypeId")}

      <Button variant="contained" color="primary" fullWidth sx={{ mt: 3 }} onClick={handleSubmit}>
        İhaleyi Oluştur
      </Button>
      
      <SuccessMessage
        open={showMessage}
        onClose={() => setShowMessage(false)}
        message={messageText}
        type={messageType}
      />
    </Box>
  );
};

export default CreateTenderForm;
