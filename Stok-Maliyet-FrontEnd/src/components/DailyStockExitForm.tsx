import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Container,
  Grid,
  Divider,
  Button,
  Alert,
  Chip,
  Card,
  CardContent
} from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { usePDF } from 'react-to-pdf';
import axios from 'axios';
import Autocomplete from '@mui/material/Autocomplete';


interface ProductDetailResponse {
  name: string;
  vatAmount: number;
  criticalLevel: number;
  measurementType: string;
  category: string;
}

interface ExitItem {
  id: number;
  productDetailResponse: ProductDetailResponse;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  exitDate: string;
}

interface ExitFormData {
  documentNo: string;
  publishDate: string;
  revisionNo: string;
  revisionDate: string;
  exitItems: ExitItem[];
  explanation: string;
  delivererName: string;
  receiverName: string;
}

const DailyStockExitForm: React.FC = () => {
  const { toPDF, targetRef } = usePDF({
    filename: 'depo-cikis-formu.pdf',
    page: { format: 'a4' }
  });

  const [formData, setFormData] = useState<ExitFormData>({
    documentNo: 'SKS-FR-017',
    publishDate: new Date().toISOString().split('T')[0],
    revisionNo: '00',
    revisionDate: new Date().toISOString().split('T')[0],
    exitItems: [],
    explanation: '',
    delivererName: '',
    receiverName: ''
  });

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterText, setFilterText] = useState('');
  const [bugununMenusu, setBugununMenusu] = useState<any>(null);

  useEffect(() => {
    const fetchExitRecords = async () => {
      if (startDate && endDate) {
        try {
          const response = await axios.post<{
            data: ExitItem[];
            success: boolean;
            message: string | null;
          }>(
            `/v1/materialExit/between-dates`,
            {
              startDate: startDate,
              endDate: endDate
            }
          );

          setFormData(prev => ({
            ...prev,
            exitItems: response.data.data
          }));
        } catch (error) {
          console.error('API verisi alınırken hata oluştu:', error);
          // Hata durumunda boş array set et ve kullanıcıya bilgi ver
          setFormData(prev => ({
            ...prev,
            exitItems: []
          }));
          
          // Kullanıcıya bilgi ver
          alert('Seçilen tarih aralığında veri bulunamadı. Lütfen farklı bir tarih aralığı deneyin.');
        }
      }
    };

    fetchExitRecords();
  }, [startDate, endDate]);

  useEffect(() => {
    const fetchBugununMenusu = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken') || sessionStorage.getItem('token') || '';
        const response = await axios.get<{
          data: any;
          success: boolean;
        }>('http://localhost:8080/v1/gunluk-menu/bugun', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.data) {
          setBugununMenusu(response.data.data);
        }
      } catch (error) {
        // Bugün için menü yoksa sessizce devam et
        console.log('Bugün için menü bulunamadı');
      }
    };

    fetchBugununMenusu();
  }, []);

  const calculateDailyTotal = () => {
    const filteredItems = formData.exitItems.filter(item =>
      item.productDetailResponse.name.toLowerCase().includes(filterText.toLowerCase())
    );
    return filteredItems.reduce((total, item) => total + item.totalPrice, 0);
  };
  const filteredExitItems = formData.exitItems.filter(item =>
    filterText === '' || item.productDetailResponse.name === filterText
  );
  const calculateTotalQuantity = () =>{
    const filteredItems = formData.exitItems.filter(item =>
      item.productDetailResponse.name.toLowerCase().includes(filterText.toLowerCase())
    );
    return filteredItems.reduce((total, item) => total + item.quantity, 0);
  };
const formatCurrency = (value: number) => {
  return value.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  }) + ' ₺';
};

const formatNumber = (value) =>
  new Intl.NumberFormat('tr-TR').format(value);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {bugununMenusu && (
        <Card 
          elevation={3} 
          sx={{ 
            mb: 3, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <RestaurantIcon sx={{ fontSize: 32, mr: 1.5 }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Bugünün Menüsü
              </Typography>
              <Typography variant="body2" sx={{ ml: 2, opacity: 0.9 }}>
                ({new Date(bugununMenusu.tarih).toLocaleDateString('tr-TR', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })})
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.2)', 
                  p: 1.5, 
                  borderRadius: 1,
                  backdropFilter: 'blur(10px)'
                }}>
                  <Typography variant="subtitle2" sx={{ mb: 0.5, opacity: 0.9 }}>
                    Ana Yemek
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {bugununMenusu.anaYemek?.adi || 'Belirtilmemiş'}
                  </Typography>
                </Box>
              </Grid>
              {bugununMenusu.yardimciYemekler && bugununMenusu.yardimciYemekler.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.2)', 
                    p: 1.5, 
                    borderRadius: 1,
                    backdropFilter: 'blur(10px)'
                  }}>
                    <Typography variant="subtitle2" sx={{ mb: 0.5, opacity: 0.9 }}>
                      Yardımcı Yemekler
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {bugununMenusu.yardimciYemekler.map((y: any) => y.adi).join(', ')}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" mb={3} gutterBottom>Depo Çıkış Raporu</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Başlangıç Tarihi"
              type="date"
              size="small"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: endDate || new Date().toISOString().split('T')[0] }}
              error={Boolean(startDate && endDate && new Date(startDate) > new Date(endDate))}
              helperText={startDate && endDate && new Date(startDate) > new Date(endDate) ? 'Başlangıç tarihi bitiş tarihinden büyük olamaz' : ''}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Bitiş Tarihi"
              type="date"
              size="small"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: startDate, max: new Date().toISOString().split('T')[0] }}
              error={Boolean(startDate && endDate && new Date(startDate) > new Date(endDate))}
            />
          </Grid>
        </Grid>
         {formData.exitItems.length > 0 && (
        <Paper elevation={3} sx={{ p: 2, mb: 3, backgroundColor: '#e3f2fd' }}>
          <Typography variant="body1">{filteredExitItems.length} adet çıkış kaydı bulundu.</Typography>
        </Paper>
      )}{formData.exitItems.length > 0 && (
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Autocomplete
          fullWidth
          options={Array.from(new Set(formData.exitItems.map((item) => item.productDetailResponse.name)))}
          value={filterText || null}
          onChange={(event, newValue) => setFilterText(newValue || '')}
          isOptionEqualToValue={(option, value) => option === value}
          renderInput={(params) => (
            <TextField {...params} label="Malzeme adına göre filtrele" variant="outlined" size="small" />
          )}
        />

      </Paper>
    )}
      </Paper>

     
      <div ref={targetRef}>
        <Paper elevation={3} sx={{ p: 3 }}>
          {/* Başlık ve Logo */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={3}>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 1 }}>
                <img src="/images/inu-logo.png" alt="İnönü Üniversitesi Logo" style={{ width: '100%', maxWidth: '140px', height: 'auto', objectFit: 'contain' }} />
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>T.C.</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>İNÖNÜ ÜNİVERSİTESİ</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>DEPO ÇIKIŞ FORMU</Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1, height: '100%', justifyContent: 'center' }}>
                <Typography variant="body2"><strong>Doküman No:</strong> {formData.documentNo}</Typography>
                <Typography variant="body2"><strong>Yayın Tarihi:</strong> {formData.publishDate}</Typography>
                <Typography variant="body2"><strong>Revizyon No:</strong> {formData.revisionNo}</Typography>
                <Typography variant="body2"><strong>Revizyon Tarihi:</strong> {formData.revisionDate}</Typography>
                <Typography variant="body2"><strong>Sayfa No:</strong> 1/1</Typography>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 4 }} />

          {/* Tablo */}
          <Table size="small" sx={{ mb: 4, border: '1px solid rgba(224, 224, 224, 1)' }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>Malzeme Adı</TableCell>
                <TableCell>Birim</TableCell>
                <TableCell>Miktar</TableCell>
                <TableCell>Birim Fiyat</TableCell>
                <TableCell>Toplam Tutar</TableCell>
                <TableCell>Çıkış Tarihi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredExitItems.length === 0 ? (
                <TableRow key="no-data">
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      Seçilen tarih aralığında malzeme çıkış kaydı bulunamadı.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredExitItems.map((item, index) => (
                  <TableRow key={item.id || `exit-item-${index}`}>
                    <TableCell>{item.productDetailResponse.name}</TableCell>
                    <TableCell>{item.productDetailResponse.measurementType}</TableCell>
                    <TableCell>{formatNumber(item.quantity)}</TableCell>
                    <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell>{formatCurrency(item.totalPrice)}</TableCell>
                    <TableCell>{new Date(item.exitDate).toLocaleDateString('tr-TR')}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', p: 2 }}>
          <Typography variant="h6">Toplam Miktar: {formatNumber(calculateTotalQuantity())}</Typography>
          <Typography variant="h6">Toplam Tutar: {formatCurrency(calculateDailyTotal())}</Typography>
        </Box>
          

          {/* Açıklama ve İmza */}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Açıklama"
                multiline
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Teslim Eden"
                value={formData.delivererName}
                onChange={(e) => setFormData({ ...formData, delivererName: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Teslim Alan"
                value={formData.receiverName}
                onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
              />
            </Grid>
          </Grid>
        </Paper>
      </div>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button variant="contained" onClick={() => toPDF()} disabled={formData.exitItems.length === 0}>
          PDF Oluştur
        </Button>
      </Box>
    </Container>
  );
};

export default DailyStockExitForm;
