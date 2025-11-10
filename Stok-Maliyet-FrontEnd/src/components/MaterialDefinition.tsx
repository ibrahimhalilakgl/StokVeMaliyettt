import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, Button, Container, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface MaterialDefinition {
  name: string;
  vatAmount: number;
  criticalLevel: number;
  measurementTypeName: string;
  categoryName: string;
}

const MaterialDefinition: React.FC = () => {
  const [materials, setMaterials] = useState<MaterialDefinition[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await axios.get('/v1/product/all');
        setMaterials(response.data.data || []);
      } catch (error) {
        console.error('Malzemeler çekme hatası:', error);
        setMaterials([]);
      }
    };
    fetchMaterials();
  }, []);

  const handleCreateMaterial = () => {
    navigate('/create-material');
  };

  const handleUpdateMaterial = (material: MaterialDefinition) => {
    navigate('/update-material', { state: { material } });

  };
 
  return (
    <Container maxWidth="lg">
      {/* Başlık ve Buton */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 4, mb: 3, position: 'relative' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
          Malzeme Listesi
        </Typography>
        <Box sx={{ position: 'absolute', right: 0 }}>
          <Button
            variant="contained"
            startIcon={<AddCircleIcon />}
            sx={{
              bgcolor: '#1976d2',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '8px',
              '&:hover': {
                bgcolor: '#115293'
              }
            }}
            onClick={handleCreateMaterial}
          >
            Malzeme Oluştur
          </Button>
        </Box>
      </Box>

      {/* Tablo */}
      <Paper elevation={3}>
        <TableContainer sx={{ maxHeight: '70vh' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' ,textAlign:'center'}}>Malzeme Adı</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' ,textAlign:'center'}}>KDV Değeri</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', textAlign:'center' }}>Kritik Nokta</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' ,textAlign:'center' }}>Ölçü Birimi</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem',textAlign:'center'  }}>Kategori</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' ,textAlign:'center' }}>Aksiyonlar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {materials.map((material, index) => (
                <TableRow key={index} hover>
                  <TableCell align='center'>{material.name}</TableCell>
                  <TableCell align='center'>{material.vatAmount*100}</TableCell>
                  <TableCell align='center'>{material.criticalLevel}</TableCell>
                  <TableCell align='center'>{material.measurementTypeName}</TableCell>
                  <TableCell align='center'>{material.categoryName}</TableCell>
                  <TableCell align='center'>
                    <IconButton
                      onClick={() => handleUpdateMaterial(material)}
                      sx={{
                        bgcolor: '#e3f2fd',
                        color: '#1976d2',
                        '&:hover': {
                          bgcolor: '#bbdefb'
                        },
                        borderRadius: '8px',
                        p: 1
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default MaterialDefinition;
