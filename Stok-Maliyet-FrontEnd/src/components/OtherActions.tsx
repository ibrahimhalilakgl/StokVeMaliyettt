import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const OtherActions = () => {
  const navigate = useNavigate();

  const navigationButtons = [
    {
      title: "Bütçe İşlemleri",
      path: "/butce-olustur",
      bgcolor: '#E8F5E9',
      hoverbg: '#C8E6C9',
      color: '#2E7D32'
    },
    {
      title: "Alım Tipi İşlemleri",
      path: "/alım-türü-oluştur",
      bgcolor: '#FFF3E0',
      hoverbg: '#FFE0B2',
      color: '#EF6C00'
    },
    {
      title: "Alım Birimi İşlemleri",
      path: "/alım-yapılan-birimi-olustur",
      bgcolor: '#F3E5F5',
      hoverbg: '#E1BEE7',
      color: '#7B1FA2'
    },
    {
      title: "Kategori İşlemleri",
      path: "/kategori-oluştur",
      bgcolor: '#FFEBEE',
      hoverbg: '#FFCDD2',
      color: '#D32F2F'
    },
    {
      title: "Ölçü Birimi İşlemleri",
      path: "/ölçü-birimi-oluştur",
      bgcolor: '#EFEBE9',
      hoverbg: '#D7CCC8',
      color: '#6D4C41'
    },
    {
      title: "Fiş Türü İşlemleri",
      path: "/fiş-tipi-oluştur",
      bgcolor: '#E0F7FA',
      hoverbg: '#B2EBF2',
      color: '#00838F'
    },
    {
      title: "Kullanıcı Yönetimi",
      path: "/kullanici-yonetimi",
      bgcolor: '#F8BBD9',
      hoverbg: '#F48FB1',
      color: '#AD1457'
    },
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ mb: 8, fontWeight: 'bold', color: '#37474F' }}
      >
        Diğer İşlemler
      </Typography>

      <Grid container spacing={2}>
        {navigationButtons.map((button, index) => (
          <Grid item xs={12} sm={6} md={2} key={index} sx={{ display: 'flex' }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: button.bgcolor,
                cursor: 'pointer',
                transition: 'background-color 0.3s ease',
                height: 100,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': {
                  bgcolor: button.hoverbg,
                },
              }}
              onClick={() => navigate(button.path)}
            >
              <Typography
                variant="h6"
                sx={{
                  color: button.color,
                  fontWeight: 'bold',
                  textAlign: 'center',
                  fontSize: '0.9rem'
                }}
              >
                {button.title}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default OtherActions;
