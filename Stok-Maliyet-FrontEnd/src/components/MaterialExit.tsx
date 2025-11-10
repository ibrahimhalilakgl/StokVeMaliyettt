import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Container,
  Grid,
  TableContainer,
  Divider,
  Snackbar,
  Alert
} from '@mui/material';
import axios from 'axios';
import { usePDF } from 'react-to-pdf';
import dayjs from 'dayjs';
import './MaterialExit.css';

interface Material {
  productId: number;
  productName: string;
  productCategoryName: string;
  measurementTypeName: string;
  totalRemainingStockQuantity: number;
}

interface ExitRecord {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  exitDate: string;
  recipient: string;
  description: string;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  totalPerson: number;
}

interface Notification {
  open: boolean;
  message: string;
  severity: "error" | "success" | "info" | "warning";
  duration: number;
}

const MaterialExit: React.FC = () => {
  const { toPDF, targetRef } = usePDF({
    filename: 'malzeme-cikis-formu.pdf',
    page: {
      format: 'a4',
      margin: {
        top: 5,
        bottom: 5,
        left: 5,
        right: 5
      },
      orientation: 'portrait'
    }
  });

  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [exitQuantity, setExitQuantity] = useState<string>('');
  const [formData, setFormData] = useState({
    totalPerson: '',
    description: '',
    exitDate: new Date().toISOString().split('T')[0],
  });
  const [exitRecords, setExitRecords] = useState<ExitRecord[]>([]);
  const [notification, setNotification] = useState<Notification>({
    open: false,
    message: '',
    severity: 'success',
    duration: 3000,
  });
  const [signatureData, setSignatureData] = useState({
    preparedBy: '',
    approvedBy: ''
  });
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [filteredExitRecords, setFilteredExitRecords] = useState<ExitRecord[]>([]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const parsed = dayjs(dateStr);
    return parsed.isValid() ? parsed.format('DD.MM.YYYY') : '-';
  };

  const formatDateRange = () => {
    if (!dateRange.startDate && !dateRange.endDate) return '';
    if (dateRange.startDate && dateRange.endDate) {
      return `${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}`;
    }
    if (dateRange.startDate) {
      return `${formatDate(dateRange.startDate)} -`;
    }
    if (dateRange.endDate) {
      return `- ${formatDate(dateRange.endDate)}`;
    }
    return '';
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  useEffect(() => {
    const fetchExitRecordsByDate = async () => {
      if (dateRange.startDate && dateRange.endDate) {
        try {
          const response = await axios.post<{
            data: any[];
            success: boolean;
            message: string | null;
          }>(
            `/v1/materialExit/list-between-dates`,
            {
              startDate: dateRange.startDate,
              endDate: dateRange.endDate
            }
          );

          if (response.data.success && response.data.data) {
            const mappedRecords: ExitRecord[] = response.data.data.map((item: any, index: number) => {
              // productId'ye göre materials listesinden productName'i bul
              const material = materials.find(m => m.productId === item.productId);
              return {
                id: item.id || `filtered-${item.productId}-${index}-${Date.now()}`,
                productId: item.productId,
                productName: material?.productName || 'Bilinmeyen',
                quantity: item.quantity,
                exitDate: item.exitDate,
                recipient: item.recipient || '',
                description: item.description || '',
                unit: material?.measurementTypeName || '',
                unitPrice: item.unitPrice || 0,
                totalPrice: item.totalPrice || 0,
                totalPerson: item.totalPerson || 0,
              };
            });
            setFilteredExitRecords(mappedRecords);
          } else {
            setFilteredExitRecords([]);
          }
        } catch (error) {
          console.error('API verisi alınırken hata oluştu:', error);
          setFilteredExitRecords([]);
        }
      } else {
        setFilteredExitRecords([]);
      }
    };

    fetchExitRecordsByDate();
  }, [dateRange.startDate, dateRange.endDate, materials]);

  const fetchMaterials = () => {
    axios.get("/v1/materialEntry/for-exit")
      .then((res) => {
        if (res.data.success) {
          // Kalan miktarı 0'dan büyük olan malzemeleri filtrele
          const filteredMaterials = res.data.data.filter((material: Material) => 
            material.totalRemainingStockQuantity > 0
          );
          setMaterials(filteredMaterials);
        } else {
          showNotification('error', 'Malzeme listesi alınamadı');
        }
      })
      .catch(err => {
        showNotification('error', 'Malzeme listesi alınamadı');
        console.error("API hatası:", err);
      });
  };

  const showNotification = (severity: "error" | "success" | "info" | "warning", message: string) => {
    setNotification({
      open: true,
      message,
      severity,
      duration: 3000
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.exitDate) {
      showNotification("error", "Çıkış tarihi girilmelidir.");
      return;
    }

    const formattedExitDate = new Date(formData.exitDate).toISOString().split('T')[0];
    if (isNaN(new Date(formattedExitDate).getTime())) {
      showNotification("error", "Geçersiz çıkış tarihi.");
      return;
    }

    const parsedQuantity = parseFloat(exitQuantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      showNotification("error", "Geçerli bir miktar girilmelidir.");
      return;
    }

    if (!selectedMaterial) {
      showNotification("error", "Malzeme seçilmelidir.");
      return;
    }

    const selectedMaterialData = materials.find(m => m.productId === parseInt(selectedMaterial));
    if (!selectedMaterialData) {
      showNotification("error", "Seçilen malzeme bulunamadı.");
      return;
    }

    if (parsedQuantity > selectedMaterialData.totalRemainingStockQuantity) {
      showNotification("error", `Talep miktarı kalan stoktan fazla olamaz! (Kalan: ${selectedMaterialData.totalRemainingStockQuantity})`);
      return;
    }

    const requestBody = {
      productQuantities: {
        [selectedMaterial]: parsedQuantity,
      },
      recipient: formData.totalPerson,
      description: formData.description,
      exitDate: formattedExitDate,
    };

    axios.post("/v1/materialExit/exit", requestBody)
      .then((res) => {
        if (res.data.data && res.data.data.length > 0) {
          const apiResponse = res.data.data[0];
          const newExitRecord: ExitRecord = {
            id: apiResponse.id || `exit-${apiResponse.productId}-${Date.now()}-${Math.random()}`,
            productId: apiResponse.productId,
            productName: selectedMaterialData.productName,
            quantity: apiResponse.quantity,
            exitDate: apiResponse.exitDate,
            recipient: apiResponse.recipient,
            description: apiResponse.description,
            unit: selectedMaterialData.measurementTypeName,
            unitPrice: apiResponse.unitPrice,
            totalPrice: apiResponse.totalPrice,
            totalPerson: apiResponse.totalPerson,
          };
          setExitRecords(prev => [...prev, newExitRecord]);
          setFormData({
            totalPerson: '',
            description: '',
            exitDate: new Date().toISOString().split('T')[0],
          });
          setSelectedMaterial('');
          setExitQuantity('');
          showNotification('success', 'Çıkış başarıyla kaydedildi!');
          fetchMaterials(); // Stok güncellemesi için malzemeleri yeniden çek
        } else {
          showNotification('error', 'API yanıtı beklenen formatta değil');
        }
      })
      .catch((err) => {
        console.error("Kayıt başarısız:", err);
        showNotification('error', 'Kayıt başarısız oldu!');
      });
  };

  const handleReset = () => {
    setFormData({
      totalPerson: '',
      description: '',
      exitDate: new Date().toISOString().split('T')[0],
    });
    setSelectedMaterial('');
    setExitQuantity('');
  };


  const documentInfo = {
    documentNo: "DOC-001",
    revisionNo: "00",
    pageNo: "1",
    publicationDate: new Date().toISOString().split('T')[0],
    revisionDate: new Date().toISOString().split('T')[0],
    department: "T.C. İNÖNÜ ÜNİVERSİTESİ SAĞLIK, KÜLTÜR VE SPOR DAİRE BAŞKANLIĞI"
  };
    const displayRecords = dateRange.startDate && dateRange.endDate ? filteredExitRecords : exitRecords;
    const totalAmount = displayRecords.reduce((acc, record) => acc + record.totalPrice, 0).toFixed(2);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setSignatureData((prev) => ({ ...prev, [name]: value }));
    };
  return (
     <Container maxWidth="xl">
      <Snackbar
        open={notification.open}
        autoHideDuration={notification.duration}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} variant="filled">
          {notification.message}
        </Alert>
      </Snackbar>

      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, color: '#006C7F', fontWeight: 600 }}>
          Malzeme Çıkış İşlemi
        </Typography>

        {/* Tarih Aralığı Filtresi */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
            Tarih Aralığına Göre Listeleme
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label="Başlangıç Tarihi"
                type="date"
                size="small"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                inputProps={{ max: dateRange.endDate || new Date().toISOString().split('T')[0] }}
                error={Boolean(dateRange.startDate && dateRange.endDate && new Date(dateRange.startDate) > new Date(dateRange.endDate))}
                helperText={dateRange.startDate && dateRange.endDate && new Date(dateRange.startDate) > new Date(dateRange.endDate) ? 'Başlangıç tarihi bitiş tarihinden büyük olamaz' : ''}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label="Bitiş Tarihi"
                type="date"
                size="small"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: dateRange.startDate, max: new Date().toISOString().split('T')[0] }}
                error={Boolean(dateRange.startDate && dateRange.endDate && new Date(dateRange.startDate) > new Date(dateRange.endDate))}
              />
            </Grid>
            {dateRange.startDate || dateRange.endDate ? (
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 1, mt: 1 }}>
                  <Typography variant="body1">
                    <strong>Tarih Aralığı:</strong> {formatDateRange() || 'Tarih aralığı seçilmedi'}
                  </Typography>
                  {dateRange.startDate && dateRange.endDate && (
                    <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
                      {filteredExitRecords.length} adet çıkış kaydı bulundu.
                    </Typography>
                  )}
                </Box>
              </Grid>
            ) : null}
          </Grid>
        </Paper>

        <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Form Bölümü */}
          <Paper elevation={0} sx={{ flex: 1, p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
              Çıkış Formu
            </Typography>

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Malzeme Seçin</InputLabel>
                  <Select
                    value={selectedMaterial}
                    onChange={(e) => setSelectedMaterial(e.target.value)}
                    label="Malzeme Seçin"
                    required
                  >
                    <MenuItem value="">Seçiniz...</MenuItem>
                    {materials.map(material => (
                      <MenuItem key={material.productId} value={material.productId.toString()}>
                        {material.productName} - Kalan: {material.totalRemainingStockQuantity} {material.measurementTypeName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Çıkış Miktarı"
                  value={exitQuantity}
                  onChange={(e) => setExitQuantity(String(e.target.value))}
                  required
                  fullWidth
                  type="number"
                  InputProps={{ inputProps: { min: 0 } }}
                />

                <TextField
                  label="Çıkış Tarihi"
                  type="date"
                  value={formData.exitDate}
                  onChange={(e) => setFormData({ ...formData, exitDate: e.target.value })}
                  required
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  label="Toplam Kişi Sayısı"
                  value={formData.totalPerson}
                  type="number"
                  onChange={(e) => setFormData({ ...formData, totalPerson: e.target.value })}
                  required
                  fullWidth
                />
                
                <TextField
                  label="Açıklama"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  fullWidth
                  multiline
                />

                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button type="button" variant="outlined" onClick={handleReset} fullWidth sx={{ py: 2 }}>
                    Formu Temizle
                  </Button>
                  <Button type="submit" variant="contained" fullWidth sx={{ py: 2, bgcolor: '#006C7F' }}>
                    Çıkış Yap
                  </Button>
                </Box>
              </Box>
            </form>
          </Paper>

          {/* Çıkış Kayıtları ve PDF Bölümü */}
          <Container maxWidth="lg">
            <Box sx={{ py: 4 }}>
              <div ref={targetRef}>
                <Paper elevation={3} sx={{ p: 3 }}>
                  <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item xs={3}>
                     <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        p: 1,
                      }}
                    >
                      <img
                        src="/images/inu-logo.png"
                        alt="Logo"
                        style={{ width: '80px', height: 'auto' }}
                      />
                      <Typography variant="caption" sx={{ mt: 1 }}>
                        {documentInfo.department}
                      </Typography>
                    </Box>
                    </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', mt: 5 }}> 
                      <Typography variant="subtitle2">
                        DEPO GÜNLÜK ÇIKIŞ ve MALİYET FORMU
                      </Typography>
                      {dateRange.startDate || dateRange.endDate ? (
                        <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
                          Tarih Aralığı: {formatDateRange()}
                        </Typography>
                      ) : null}
                    </Box>
                  </Grid>
                  <Grid item xs={3}>
                    <Box sx={{ textAlign: 'right', fontSize: '0.75rem', mt: 2 }}>
                      <Box>
                        <Typography sx={{ fontSize: '0.75rem' }}>Doküman No: {documentInfo.documentNo}</Typography>
                        <Typography sx={{ fontSize: '0.75rem' }}>Yayın Tarihi: {documentInfo.publicationDate}</Typography>
                        <Typography sx={{ fontSize: '0.75rem' }}>Revizyon No: {documentInfo.revisionNo}</Typography>
                        <Typography sx={{ fontSize: '0.75rem' }}>Revizyon Tarihi: {documentInfo.revisionDate}</Typography>
                        <Typography sx={{ fontSize: '0.75rem' }}>Sayfa No: {documentInfo.pageNo}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ mb: 4 }} />

                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>S.NO</TableCell>
                        <TableCell>Malzeme Adı</TableCell>
                        <TableCell>Ölçü Birimi</TableCell>
                        <TableCell>Miktar</TableCell>
                        <TableCell>Birim Fiyat (₺)</TableCell>
                        <TableCell>Tutar (₺)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {displayRecords.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                            <Typography variant="body1" color="text.secondary">
                              {dateRange.startDate && dateRange.endDate 
                                ? 'Seçilen tarih aralığında çıkış kaydı bulunamadı.'
                                : 'Henüz çıkış kaydı eklenmedi.'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        displayRecords.map((record, idx) => (
                          <TableRow key={`${record.id}-${record.productId}-${idx}`}>
                            <TableCell>{idx + 1}</TableCell>
                            <TableCell>{record.productName}</TableCell>
                            <TableCell>{record.unit}</TableCell>
                            <TableCell>{record.quantity}</TableCell>
                            <TableCell>{record.unitPrice.toFixed(2)}</TableCell>
                            <TableCell>{record.totalPrice.toFixed(2)}</TableCell>
                          </TableRow>
                        ))
                      )}
                      <TableRow>
                        <TableCell colSpan={5} align="right"><strong>Toplam Tutar:</strong></TableCell>
                        <TableCell>{totalAmount} ₺</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                <Divider sx={{ mt: 4, mb: 2 }} />
                  <Grid container spacing={2} sx={{ mt: 4 }}>
                    <Grid item xs={6}>
                      <TextField 
                        fullWidth
                        label="Teslim Eden"
                        name="delivererName"
                        onChange={handleInputChange}
                      />
                        <TextField 
                        fullWidth
                        label="İmza "
                        name="delivererSignature"
                        disabled
                        sx={{ mt: 1 }}
                      />
                    </Grid>
                  <Grid item xs={6}>
                    <TextField 
                      fullWidth
                      label="Teslim Alan"
                      name="recipientName"
                      onChange={handleInputChange}
                    />
                    <TextField 
                      fullWidth
                      label="İmza "
                      name="recipientSignature"
                      disabled
                      sx={{ mt: 1 }}
                    />
                  </Grid>
                  </Grid>
                </Paper>
              </div>  
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button 
                variant="contained" 
                onClick={() => toPDF()} 
                sx={{ backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}
              >
              PDF Oluştur
              </Button>
            </Box>
          </Container>
        </Box>
      </Box>
    </Container>
  );
};
export default MaterialExit;