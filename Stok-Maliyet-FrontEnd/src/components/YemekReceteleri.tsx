import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Grid,
  Alert
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';

interface YemekRecetesi {
  id: number;
  adi: string;
  aciklama: string;
  receteDetaylari: string;
  tipi: 'ANA_YEMEK' | 'YARDIMCI_YEMEK';
}

interface GunlukMenu {
  id: number;
  tarih: string;
  anaYemek: YemekRecetesi;
  yardimciYemekler: YemekRecetesi[];
}

const YemekReceteleri: React.FC = () => {
  const [yemekReceteleri, setYemekReceteleri] = useState<YemekRecetesi[]>([]);
  const [gunlukMenuler, setGunlukMenuler] = useState<GunlukMenu[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [raporYili, setRaporYili] = useState<number>(new Date().getFullYear());
  const [raporData, setRaporData] = useState<any>(null);
  const [raporDialogOpen, setRaporDialogOpen] = useState(false);
  
  // Reçete form state
  const [receteDialogOpen, setReceteDialogOpen] = useState(false);
  const [editingRecete, setEditingRecete] = useState<YemekRecetesi | null>(null);
  const [receteForm, setReceteForm] = useState({
    adi: '',
    aciklama: '',
    receteDetaylari: '',
    tipi: 'ANA_YEMEK' as 'ANA_YEMEK' | 'YARDIMCI_YEMEK'
  });

  // Menü form state
  const [menuDialogOpen, setMenuDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<GunlukMenu | null>(null);
  const [menuForm, setMenuForm] = useState({
    tarih: '',
    anaYemekId: '',
    yardimciYemekIdleri: [] as string[]
  });

  const token = localStorage.getItem('token') || localStorage.getItem('authToken') || sessionStorage.getItem('token') || '';

  useEffect(() => {
    fetchYemekReceteleri();
    fetchGunlukMenuler();
  }, []);

  const fetchYemekReceteleri = async () => {
    try {
      setLoading(true);
      const response = await axios.get<{ data: YemekRecetesi[] }>('/v1/yemek-recetesi/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setYemekReceteleri(response.data.data);
    } catch (err: any) {
      setError('Yemek reçeteleri yüklenirken hata oluştu: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchGunlukMenuler = async () => {
    try {
      const response = await axios.get<{ data: GunlukMenu[] }>('/v1/gunluk-menu/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGunlukMenuler(response.data.data);
    } catch (err: any) {
      console.error('Günlük menüler yüklenirken hata:', err);
    }
  };

  const handleReceteSubmit = async () => {
    try {
      setError(null);
      setSuccess(null);
      
      const requestData = {
        adi: receteForm.adi,
        aciklama: receteForm.aciklama,
        receteDetaylari: receteForm.receteDetaylari,
        tipi: receteForm.tipi
      };

      if (editingRecete) {
        await axios.put(`/v1/yemek-recetesi/update/${editingRecete.id}`, requestData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Yemek reçetesi başarıyla güncellendi');
      } else {
        await axios.post('/v1/yemek-recetesi/create', requestData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Yemek reçetesi başarıyla oluşturuldu');
      }

      setReceteDialogOpen(false);
      setEditingRecete(null);
      setReceteForm({ adi: '', aciklama: '', receteDetaylari: '', tipi: 'ANA_YEMEK' });
      fetchYemekReceteleri();
    } catch (err: any) {
      setError('İşlem sırasında hata oluştu: ' + (err.response?.data?.data || err.message));
    }
  };

  const handleMenuSubmit = async () => {
    try {
      setError(null);
      setSuccess(null);

      const requestData = {
        tarih: menuForm.tarih,
        anaYemekId: Number(menuForm.anaYemekId),
        yardimciYemekIdleri: menuForm.yardimciYemekIdleri.map(id => Number(id))
      };

      if (editingMenu) {
        await axios.put(`/v1/gunluk-menu/update/${editingMenu.id}`, requestData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Günlük menü başarıyla güncellendi');
      } else {
        await axios.post('/v1/gunluk-menu/create', requestData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Günlük menü başarıyla oluşturuldu');
      }

      setMenuDialogOpen(false);
      setEditingMenu(null);
      setMenuForm({ tarih: '', anaYemekId: '', yardimciYemekIdleri: [] });
      fetchGunlukMenuler();
    } catch (err: any) {
      setError('İşlem sırasında hata oluştu: ' + (err.response?.data?.data || err.message));
    }
  };

  const handleDeleteRecete = async (id: number) => {
    if (!window.confirm('Bu yemek reçetesini silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await axios.delete(`/v1/yemek-recetesi/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Yemek reçetesi başarıyla silindi');
      fetchYemekReceteleri();
    } catch (err: any) {
      setError('Silme işlemi sırasında hata oluştu: ' + (err.response?.data?.data || err.message));
    }
  };

  const handleDeleteMenu = async (id: number) => {
    if (!window.confirm('Bu günlük menüyü silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await axios.delete(`/v1/gunluk-menu/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Günlük menü başarıyla silindi');
      fetchGunlukMenuler();
    } catch (err: any) {
      setError('Silme işlemi sırasında hata oluştu: ' + (err.response?.data?.data || err.message));
    }
  };

  const openReceteDialog = (recete?: YemekRecetesi) => {
    if (recete) {
      setEditingRecete(recete);
      setReceteForm({
        adi: recete.adi,
        aciklama: recete.aciklama || '',
        receteDetaylari: recete.receteDetaylari || '',
        tipi: recete.tipi
      });
    } else {
      setEditingRecete(null);
      setReceteForm({ adi: '', aciklama: '', receteDetaylari: '', tipi: 'ANA_YEMEK' });
    }
    setReceteDialogOpen(true);
  };

  const openMenuDialog = (menu?: GunlukMenu) => {
    if (menu) {
      setEditingMenu(menu);
      setMenuForm({
        tarih: menu.tarih,
        anaYemekId: menu.anaYemek.id.toString(),
        yardimciYemekIdleri: menu.yardimciYemekler.map(y => y.id.toString())
      });
    } else {
      setEditingMenu(null);
      setMenuForm({ tarih: '', anaYemekId: '', yardimciYemekIdleri: [] });
    }
    setMenuDialogOpen(true);
  };

  const fetchYillikRapor = async (yil: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<{ data: any }>(`/v1/gunluk-menu/rapor/${yil}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRaporData(response.data.data);
      setRaporDialogOpen(true);
    } catch (err: any) {
      setError('Rapor yüklenirken hata oluştu: ' + (err.response?.data?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const anaYemekler = yemekReceteleri.filter(r => r.tipi === 'ANA_YEMEK');
  const yardimciYemekler = yemekReceteleri.filter(r => r.tipi === 'YARDIMCI_YEMEK');

  return (
      <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Yemek Reçeteleri ve Günlük Menüler
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Yıl"
            type="number"
            value={raporYili}
            onChange={(e) => setRaporYili(Number(e.target.value))}
            size="small"
            sx={{ width: 100 }}
          />
          <Button
            variant="outlined"
            onClick={() => fetchYillikRapor(raporYili)}
            disabled={loading}
          >
            Yıllık Rapor
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Yemek Reçeteleri */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Yemek Reçeteleri</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => openReceteDialog()}
              >
                Yeni Reçete
              </Button>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Adı</TableCell>
                    <TableCell>Tipi</TableCell>
                    <TableCell>İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {yemekReceteleri.map((recete) => (
                    <TableRow key={recete.id}>
                      <TableCell>{recete.adi}</TableCell>
                      <TableCell>
                        <Chip
                          label={recete.tipi === 'ANA_YEMEK' ? 'Ana Yemek' : 'Yardımcı Yemek'}
                          color={recete.tipi === 'ANA_YEMEK' ? 'primary' : 'secondary'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => openReceteDialog(recete)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteRecete(recete.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Günlük Menüler */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Günlük Menüler</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => openMenuDialog()}
              >
                Yeni Menü
              </Button>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Tarih</TableCell>
                    <TableCell>Ana Yemek</TableCell>
                    <TableCell>Yardımcı Yemekler</TableCell>
                    <TableCell>İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {gunlukMenuler.map((menu) => (
                    <TableRow key={menu.id}>
                      <TableCell>{new Date(menu.tarih).toLocaleDateString('tr-TR')}</TableCell>
                      <TableCell>{menu.anaYemek.adi}</TableCell>
                      <TableCell>
                        {menu.yardimciYemekler.map(y => y.adi).join(', ') || '-'}
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => openMenuDialog(menu)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteMenu(menu.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Reçete Dialog */}
      <Dialog open={receteDialogOpen} onClose={() => setReceteDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingRecete ? 'Reçete Düzenle' : 'Yeni Reçete Ekle'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Yemek Adı"
              value={receteForm.adi}
              onChange={(e) => setReceteForm({ ...receteForm, adi: e.target.value })}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Tipi</InputLabel>
              <Select
                value={receteForm.tipi}
                onChange={(e) => setReceteForm({ ...receteForm, tipi: e.target.value as 'ANA_YEMEK' | 'YARDIMCI_YEMEK' })}
                label="Tipi"
              >
                <MenuItem value="ANA_YEMEK">Ana Yemek</MenuItem>
                <MenuItem value="YARDIMCI_YEMEK">Yardımcı Yemek</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Açıklama"
              value={receteForm.aciklama}
              onChange={(e) => setReceteForm({ ...receteForm, aciklama: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              label="Reçete Detayları (Malzemeler, Miktarlar vb.)"
              value={receteForm.receteDetaylari}
              onChange={(e) => setReceteForm({ ...receteForm, receteDetaylari: e.target.value })}
              fullWidth
              multiline
              rows={5}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReceteDialogOpen(false)}>İptal</Button>
          <Button onClick={handleReceteSubmit} variant="contained">Kaydet</Button>
        </DialogActions>
      </Dialog>

      {/* Menü Dialog */}
      <Dialog open={menuDialogOpen} onClose={() => setMenuDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingMenu ? 'Menü Düzenle' : 'Yeni Menü Ekle'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Tarih"
              type="date"
              value={menuForm.tarih}
              onChange={(e) => setMenuForm({ ...menuForm, tarih: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Ana Yemek</InputLabel>
              <Select
                value={menuForm.anaYemekId}
                onChange={(e) => setMenuForm({ ...menuForm, anaYemekId: e.target.value })}
                label="Ana Yemek"
                required
              >
                {anaYemekler.map((yemek) => (
                  <MenuItem key={yemek.id} value={yemek.id.toString()}>
                    {yemek.adi}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Yardımcı Yemekler</InputLabel>
              <Select
                multiple
                value={menuForm.yardimciYemekIdleri}
                onChange={(e) => setMenuForm({ ...menuForm, yardimciYemekIdleri: e.target.value as string[] })}
                label="Yardımcı Yemekler"
              >
                {yardimciYemekler.map((yemek) => (
                  <MenuItem key={yemek.id} value={yemek.id.toString()}>
                    {yemek.adi}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMenuDialogOpen(false)}>İptal</Button>
          <Button onClick={handleMenuSubmit} variant="contained">Kaydet</Button>
        </DialogActions>
      </Dialog>

      {/* Rapor Dialog */}
      <Dialog open={raporDialogOpen} onClose={() => setRaporDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Yıllık Menü Raporu - {raporData?.yil}</DialogTitle>
        <DialogContent>
          {raporData && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Typography variant="h6" gutterBottom>Genel İstatistikler</Typography>
                    <Typography>Toplam Menü Sayısı: <strong>{raporData.toplamMenuSayisi}</strong></Typography>
                    <Typography>Farklı Ana Yemek Sayısı: <strong>{raporData.farkliAnaYemekSayisi}</strong></Typography>
                    <Typography>Farklı Yardımcı Yemek Sayısı: <strong>{raporData.farkliYardimciYemekSayisi}</strong></Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" gutterBottom>En Çok Kullanılan Ana Yemekler (Top 10)</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Yemek Adı</TableCell>
                          <TableCell align="right">Kullanım Sayısı</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {raporData.enCokKullanilanAnaYemekler?.map((item: any, index: number) => (
                          <TableRow key={item.yemekId}>
                            <TableCell>{item.yemekAdi}</TableCell>
                            <TableCell align="right">{item.kullanimSayisi}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                <Grid item xs={12} md={12}>
                  <Typography variant="h6" gutterBottom>En Çok Kullanılan Yardımcı Yemekler (Top 10)</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Yemek Adı</TableCell>
                          <TableCell align="right">Kullanım Sayısı</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {raporData.enCokKullanilanYardimciYemekler?.map((item: any, index: number) => (
                          <TableRow key={item.yemekId}>
                            <TableCell>{item.yemekAdi}</TableCell>
                            <TableCell align="right">{item.kullanimSayisi}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRaporDialogOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default YemekReceteleri;

