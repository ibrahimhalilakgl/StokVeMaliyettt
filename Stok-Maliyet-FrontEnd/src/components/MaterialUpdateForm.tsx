import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Box, TextField, Button, Typography } from '@mui/material';
import axios from 'axios';

const UpdateMaterial = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { material } = location.state || {};

  const [formData, setFormData] = useState({
    id: material?.id || 0,
    name: material?.name || '',
    vatAmount: material?.vatAmount || 0,
    criticalLevel: material?.criticalLevel || 0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'vatAmount' || name === 'criticalLevel' ? Number(value) : value }));
  };

  const handleUpdate = async () => {
    try {
      await axios.put('/product/update', formData);
      alert("Malzeme başarıyla güncellendi!");
      navigate('/malzeme-olusturma'); // liste sayfasına geri yönlendirme
    } catch (err: any) {
      console.error("Güncelleme hatası:", err);
      alert("Güncelleme başarısız: " + (err.response?.data?.data || 'Bilinmeyen hata'));
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" align="center" sx={{ mb: 3, fontWeight: 'bold' }}>
          Malzeme Güncelle
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Malzeme Adı"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="KDV Oranı"
            name="vatAmount"
            type="number"
            value={formData.vatAmount}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Kritik Seviye"
            name="criticalLevel"
            type="number"
            value={formData.criticalLevel}
            onChange={handleChange}
            fullWidth
          />
          <Button variant="contained" color="primary" onClick={handleUpdate}>
            Güncelle
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default UpdateMaterial;
