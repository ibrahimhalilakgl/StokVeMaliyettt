import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Alert
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import WarningIcon from '@mui/icons-material/Warning';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface StokItem {
  id: number;
  malzemeAdi: string;
  birim: string;
  kritikSeviye: number;
  carryOver: number; // Önceki Yıldan Devir
  directProcurement: number; // 22D Doğrudan Temin
  tender: number; // 19. Madde Açık İhale / İhale
  totalReceived: number; // Toplam Alınan
  totalExit: number; // Toplam Çıkış
  remaining: number; // Depoda Kalan
  sonGuncelleme: string;
  secildi: boolean;
  onayDurumu: '19.mad' | '2f';
}

const StokDurumu: React.FC = () => {
  const navigate = useNavigate();
  const [stoklar, setStoklar] = useState<StokItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStockData();
  }, []);

  const fetchStockData = async () => {
    try {
      setLoading(true);
      // Ürün bazında konsolide edilmiş detaylar (backend 8080)
      const token =
        localStorage.getItem('token') ||
        localStorage.getItem('authToken') ||
        sessionStorage.getItem('token') || '';

      const response = await axios.get('/v1/materialEntry/details', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const stockData = response.data.data || [];
      
      if (stockData.length === 0) {
        // Veri yoksa boş array set et
        setStoklar([]);
        return;
      }
      
      // Gerçek veriyi formatla (her ürün tek satır)
      const formattedData = stockData.map((item: any, index: number) => {
        const product = item.productResponse || {};
        const carryOver = item.totalCarryOver || 0;
        const tender = item.totalTender || 0;
        const direct = item.totalDirectProcurement || 0;
        const totalReceived = carryOver + tender + direct;
        const totalExit = item.totalExit || 0;
        const remaining = item.remainingQuantity || 0;

        return {
          id: index + 1,
          malzemeAdi: product.name || 'Bilinmiyor',
          birim: product.measurementTypeName || 'Adet',
          kritikSeviye: product.criticalLevel || 0,
          carryOver,
          directProcurement: direct,
          tender,
          totalReceived,
          totalExit,
          remaining,
          sonGuncelleme: new Date().toISOString().split('T')[0],
          secildi: false,
          onayDurumu: '19.mad' as const,
        } as StokItem;
      });
      
      setStoklar(formattedData);
    } catch (error) {
      console.error('Stok verisi çekme hatası:', error);
      // Hata durumunda boş array set et
      setStoklar([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSecim = (id: number) => {
    setStoklar(stoklar.map(stok => 
      stok.id === id ? { ...stok, secildi: !stok.secildi } : stok
    ));
  };

  const handleTumunuSec = () => {
    const tumSecili = stoklar.every(stok => stok.secildi);
    setStoklar(stoklar.map(stok => ({ ...stok, secildi: !tumSecili })));
  };

  const handleOnayDurumuDegistir = (id: number, yeniDurum: '19.mad' | '2f') => {
    setStoklar(stoklar.map(stok => 
      stok.id === id ? { ...stok, onayDurumu: yeniDurum } : stok
    ));
  };

  const handleKaydet = () => {
    // Seçili ve onaylanmış malzemeleri haftalık malzeme talebe aktar
    const onaylananMalzemeler = stoklar.filter(stok => 
      stok.secildi && stok.onayDurumu === '2f'
    );

    if (onaylananMalzemeler.length > 0) {
      // Haftalık malzeme talebe yönlendir
      navigate('/haftalik-malzeme-talep', { 
        state: { 
          onaylananMalzemeler: onaylananMalzemeler.map(m => ({
            id: m.id,
            malzemeAdi: m.malzemeAdi,
            miktar: m.remaining,
            birim: m.birim,
            talepTarihi: new Date().toISOString().split('T')[0],
            aciklama: `${m.malzemeAdi} için stok takibi sonucu talep`,
            onayDurumu: '19.mad',
            secildi: false
          }))
        }
      });
    } else {
      alert('Lütfen en az bir malzeme seçin ve onaylayın.');
    }
  };

  const handlePDFIndir = () => {
    try {
      const doc = new jsPDF();
      
      // Başlık
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text('Stok Durumu Raporu', 14, 20);
      
      // Tarih
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      const tarih = new Date().toLocaleDateString('tr-TR');
      doc.text(`Tarih: ${tarih}`, 14, 30);

      // Seçili malzemeleri al
      const seciliMalzemeler = stoklar.filter(stok => stok.secildi);
      
      // Tablo başlıkları
      const headers = [['Malzeme Adı', 'Mevcut Miktar', 'Birim', 'Kritik Seviye', 'Son Güncelleme', 'Onay Durumu']];
      
      // Tablo verileri
      const data = seciliMalzemeler.map(stok => [
        stok.malzemeAdi,
        String(stok.remaining),
        stok.birim,
        String(stok.kritikSeviye),
        stok.sonGuncelleme,
        stok.onayDurumu
      ]);

      // @ts-ignore
      doc.autoTable({
        head: headers,
        body: data,
        startY: 40,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 3,
          font: 'helvetica',
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0],
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: [0, 108, 127],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 20, halign: 'right' },
          2: { cellWidth: 20 },
          3: { cellWidth: 20, halign: 'right' },
          4: { cellWidth: 25 },
          5: { cellWidth: 25, halign: 'center' }
        },
        margin: { top: 40 }
      });

      // PDF'i indir
      doc.save('stok-durumu-raporu.pdf');
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      alert('PDF oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  // Kritik seviye kontrolü - depoda kalan miktar ile kritik seviye karşılaştırması
  // Yüzdelik hesaplama: (Depoda Kalan / Kritik Seviye) * 100
  const criticalItems = stoklar.filter(stok => {
    if (stok.kritikSeviye <= 0) return false;
    const yuzde = (stok.remaining / stok.kritikSeviye) * 100;
    return yuzde < 100; // %100'ün altındakiler kritik
  });

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ 
          color: '#006C7F', 
          fontWeight: 600,
          mb: 3
        }}>
          Stok Durumu
        </Typography>
        <LinearProgress sx={{ mb: 3 }} />
        <Typography>Veriler yükleniyor...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ 
          color: '#006C7F', 
          fontWeight: 600,
          textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
          letterSpacing: '0.5px'
        }}>
          ANA SAYFA DEPO TOPLAM TUTARLARI
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={handlePDFIndir}
            disabled={!stoklar.some(stok => stok.secildi)}
            sx={{
              backgroundColor: '#006C7F',
              color: 'white',
              padding: '10px 20px',
              fontSize: '0.9rem',
              fontWeight: 500,
              textTransform: 'none',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              '&:hover': {
                backgroundColor: '#005566',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            Seçili Malzemeleri İndir
          </Button>
          <Button
            variant="contained"
            onClick={handleKaydet}
            disabled={!stoklar.some(stok => stok.secildi && stok.onayDurumu === '2f')}
            sx={{
              backgroundColor: '#4caf50',
              color: 'white',
              padding: '10px 20px',
              fontSize: '0.9rem',
              fontWeight: 500,
              textTransform: 'none',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              '&:hover': {
                backgroundColor: '#388e3c',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            Seçili Malzemeleri Kaydet
          </Button>
        </Box>
      </Box>

      {/* Kritik Stok Uyarısı */}
      {criticalItems.length > 0 && (
        <Box mb={2}>
          <Alert 
            severity="error" 
            icon={<WarningIcon />}
            sx={{ mb: 1 }}
          >
            <strong>{criticalItems.length}</strong> malzeme kritik seviyenin altında bulunmaktadır!
            <Box component="ul" sx={{ mt: 1, mb: 0, pl: 3 }}>
              {criticalItems.map((item) => {
                const yuzde = item.kritikSeviye > 0 ? (item.remaining / item.kritikSeviye) * 100 : 0;
                const eksik = item.kritikSeviye - item.remaining;
                return (
                  <li key={item.id}>
                    <strong>{item.malzemeAdi}</strong>: Depoda Kalan: {item.remaining} {item.birim}, 
                    Kritik Seviye: {item.kritikSeviye} {item.birim}
                    <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>
                      {' '}(%{yuzde.toFixed(1)} - Eksik: {eksik} {item.birim})
                    </span>
                  </li>
                );
              })}
            </Box>
          </Alert>
        </Box>
      )}

      <TableContainer 
        component={Paper} 
        sx={{ 
          maxWidth: '95%',
          mx: 'auto',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          borderRadius: '12px',
          maxHeight: '70vh',
          overflow: 'auto',
          '& .MuiTableCell-root': {
            padding: '12px 16px',
            fontSize: '0.875rem',
            borderColor: '#e0e0e0'
          }
        }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow sx={{ 
              backgroundColor: '#f8f9fa',
              '& .MuiTableCell-root': {
                fontWeight: 600,
                color: '#006C7F',
                fontSize: '0.9rem',
                padding: '16px'
              }
            }}>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={stoklar.length > 0 && stoklar.every(stok => stok.secildi)}
                  indeterminate={stoklar.some(stok => stok.secildi) && !stoklar.every(stok => stok.secildi)}
                  onChange={handleTumunuSec}
                />
              </TableCell>
              <TableCell>Sıra No</TableCell>
              <TableCell>Malzeme Adı</TableCell>
              <TableCell>Ölçü Birimi</TableCell>
              <TableCell align="right">Kritik Seviye</TableCell>
              <TableCell align="right">Önceki Yıldan Devir ile Depoya Giren</TableCell>
              <TableCell align="right">22D ile Doğrudan Temin ile Depoya Giren</TableCell>
              <TableCell align="right">19.Madde Açık İhale ile Depoya Giren</TableCell>
              <TableCell align="right">Toplam Alınan Miktar</TableCell>
              <TableCell align="right">Toplam Çıkış</TableCell>
              <TableCell align="right">Depoda Kalan Miktar</TableCell>
              <TableCell align="center">Stok Durumu (%)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stoklar.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} align="center" sx={{ py: 4 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Henüz stok verisi bulunmuyor
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Stok verilerini görmek için önce malzeme girişi yapmanız gerekiyor.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              stoklar.map((stok, index) => {
                // Yüzdelik hesaplama: (Depoda Kalan / Kritik Seviye) * 100
                // %100 = Kritik Seviyeye Eşit
                // %100'ün altı = Kritik (Kırmızı)
                // %100'ün üstü = Normal (Yeşil)
                
                // Kritik seviye 0 veya undefined ise yüzde hesaplanamaz
                if (!stok.kritikSeviye || stok.kritikSeviye <= 0) {
                  return (
                    <TableRow key={stok.id}>
                      <TableCell colSpan={12} align="center">
                        <Typography variant="body2" color="text.secondary">
                          {stok.malzemeAdi} için kritik seviye tanımlı değil
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                }
                
                // Yüzdelik hesaplama: (Depoda Kalan / Kritik Seviye) * 100
                // Debug: Değerleri kontrol et
                console.log(`${stok.malzemeAdi}: Remaining=${stok.remaining}, KritikSeviye=${stok.kritikSeviye}`);
                
                const stokYuzdesi = (stok.remaining / stok.kritikSeviye) * 100;
                const isCritical = stokYuzdesi < 100; // %100'ün altındakiler kritik
                
                console.log(`${stok.malzemeAdi}: Yüzde=${stokYuzdesi.toFixed(1)}%, Kritik=${isCritical}`);
                
                // Progress bar için değer: %100'den fazla olsa bile maksimum 100 göster
                // Ama yüzde değeri gerçek değeri gösterir
                const progressBarValue = Math.min(stokYuzdesi, 100);
                
                return (
                  <TableRow 
                    key={stok.id}
                    sx={{
                      backgroundColor: isCritical ? '#ffebee' : 'inherit',
                      '&:hover': {
                        backgroundColor: isCritical ? '#ffcdd2' : '#f5f5f5'
                      }
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={stok.secildi}
                        onChange={() => handleSecim(stok.id)}
                      />
                    </TableCell>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{stok.malzemeAdi}</TableCell>
                    <TableCell>{stok.birim}</TableCell>
                    <TableCell align="right">{stok.kritikSeviye}</TableCell>
                    <TableCell align="right">{stok.carryOver}</TableCell>
                    <TableCell align="right">{stok.directProcurement}</TableCell>
                    <TableCell align="right">{stok.tender}</TableCell>
                    <TableCell align="right">{stok.totalReceived}</TableCell>
                    <TableCell align="right">{stok.totalExit}</TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ 
                        color: isCritical ? '#d32f2f' : 'inherit',
                        fontWeight: isCritical ? 700 : 400
                      }}>
                        {stok.remaining}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: isCritical ? '#d32f2f' : '#2e7d32',
                            fontWeight: 600,
                            minWidth: '45px',
                            textAlign: 'right'
                          }}
                        >
                          {stokYuzdesi.toFixed(1)}%
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={progressBarValue}
                          sx={{ 
                            width: 80, 
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: '#e0e0e0',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: isCritical ? '#d32f2f' : '#2e7d32',
                              borderRadius: 4
                            }
                          }} 
                        />
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default StokDurumu; 