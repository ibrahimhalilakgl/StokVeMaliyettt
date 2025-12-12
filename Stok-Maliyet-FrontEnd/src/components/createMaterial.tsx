import React, { useEffect, useState } from 'react'; 
import {
  Paper, Typography, TextField, Button, Grid, Select,
  MenuItem, FormControl, InputLabel, Container,
  Snackbar, Alert
} from '@mui/material';
import axios from 'axios';

interface MaterialDefinition {
  id: string;
  name: string;
  vatAmount: number;
  criticalLevel: number;
  measurementType: string;
  category: string;
}

interface Category {
  id: number;
  name: string;
}

interface MeasurementType {
  id: number;
  name: string;
}

const CreateMaterial: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [measurementTypes, setMeasurementTypes] = useState<MeasurementType[]>([]);
  const [editingMaterial, setEditingMaterial] = useState<MaterialDefinition | null>(null);
  const [materials, setMaterials] = useState<MaterialDefinition[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    vatAmount: 0,
    criticalLevel: 0,
    measurementTypeId: '',
    categoryId: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [showDeleteError, setShowDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Kategorileri çek
        const categoriesResponse = await axios.get('/category/all');
        setCategories(categoriesResponse.data.data || []);

        // Ölçü birimlerini çek
        const measurementTypesResponse = await axios.get('/measurementType/all');
        setMeasurementTypes(measurementTypesResponse.data.data || []);

        // Mevcut malzemeleri çek (silme için seçim)
        const materialsResponse = await axios.get('/product/all');
        setMaterials(materialsResponse.data.data || []);
      } catch (error) {
        console.error('Veri çekme hatası:', error);
        setCategories([]);
        setMeasurementTypes([]);
        setMaterials([]);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Form validasyonu
    if (!formData.name.trim()) {
      alert('Malzeme adı boş olamaz!');
      return;
    }
    if (!formData.measurementTypeId) {
      alert('Ölçü birimi seçilmelidir!');
      return;
    }
    if (!formData.categoryId) {
      alert('Kategori seçilmelidir!');
      return;
    }

    const { name, vatAmount, criticalLevel, measurementTypeId, categoryId } = formData;

    const productCreateRequest = {
      name: name.trim(),
      vatAmount: vatAmount / 100, // Yüzde olarak gönder
      criticalLevel,
      measurementTypeId: Number(measurementTypeId),
      categoryId: Number(categoryId)
    };

    try {
      await axios.post('/product/create', productCreateRequest);
      setShowSuccess(true);
      resetForm();
    } catch (error: any) {
      console.error('Malzeme oluşturma hatası:', error);
      const errorMessage = error.response?.data?.message || 'Malzeme oluşturulurken bir hata oluştu!';
      alert(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      vatAmount: 0,
      criticalLevel: 0,
      measurementTypeId: '',
      categoryId: ''
    });
    setEditingMaterial(null);
    setSelectedMaterialId('');
  };

  const handleDelete = async () => {
    if (!selectedMaterialId) {
      alert('Silmek için bir malzeme seçiniz.');
      return;
    }
    try {
      await axios.delete(`/product/delete/${selectedMaterialId}`);
      setShowDeleteSuccess(true);
      // listeleri yenile
      const materialsResponse = await axios.get('/product/all');
      setMaterials(materialsResponse.data.data || []);
      setSelectedMaterialId('');
    } catch (error: any) {
      const msg = error.response?.data?.data || error.response?.data?.message || 'Silme işlemi sırasında bir hata oluştu';
      setShowDeleteError(msg);
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ color: '#006C7F', fontWeight: 600, mb: 4 }}>
          Malzeme Oluşturma
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Malzeme Adı"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="KDV Değeri"
                type='number'
                value={formData.vatAmount}
                onChange={(e) => setFormData({ ...formData, vatAmount: Number(e.target.value) })}
                inputProps={{ min: 1, max: 100 }} 
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Kritik Nokta"
                type="number"
                value={formData.criticalLevel}
                onChange={(e) => setFormData({ ...formData, criticalLevel: Number(e.target.value) })}
                inputProps={{ min: 1 }}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Ölçü Birimi</InputLabel>
                <Select
                  value={formData.measurementTypeId}
                  onChange={(e) => setFormData({ ...formData, measurementTypeId: e.target.value })}
                  label="Ölçü Birimi"
                >
                  {measurementTypes.map((mt) => (
                    <MenuItem key={mt.id} value={mt.id}>
                      {mt.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Kategori</InputLabel>
                <Select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  label="Kategori"
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Silme Alanı */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Silinecek Malzeme</InputLabel>
                <Select
                  value={selectedMaterialId}
                  label="Silinecek Malzeme"
                  onChange={(e) => setSelectedMaterialId(String(e.target.value))}
                >
                  {materials.map((m) => (
                    <MenuItem key={m.id} value={m.id}>
                      {m.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Snackbar open={showSuccess} autoHideDuration={3000} onClose={() => setShowSuccess(false)}>
              <Alert severity="success" onClose={() => setShowSuccess(false)}>
                Malzeme başarıyla eklendi
              </Alert>
            </Snackbar>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                sx={{ bgcolor: '#006C7F', '&:hover': { bgcolor: '#005A6B' }, mr: 2 }}
              >
                Kaydet
              </Button>
              {editingMaterial && (
                <Button variant="outlined" onClick={resetForm}>
                  İptal
                </Button>
                
              )}
              <Button
                variant="outlined"
                color="error"
                onClick={handleDelete}
                sx={{ ml: 2 }}
                disabled={!selectedMaterialId}
              >
                Seçili Malzemeyi Sil
              </Button>
            </Grid>
            
          </Grid>
        </form>

        {/* Silme Snackbari */}
        <Snackbar open={showDeleteSuccess} autoHideDuration={3000} onClose={() => setShowDeleteSuccess(false)}>
          <Alert severity="success" onClose={() => setShowDeleteSuccess(false)}>
            Malzeme başarıyla silindi
          </Alert>
        </Snackbar>
        <Snackbar open={!!showDeleteError} autoHideDuration={3500} onClose={() => setShowDeleteError(null)}>
          <Alert severity="error" onClose={() => setShowDeleteError(null)}>
            {showDeleteError}
          </Alert>
        </Snackbar>

        

        
      </Paper>
    </Container>
  );
};

export default CreateMaterial;
