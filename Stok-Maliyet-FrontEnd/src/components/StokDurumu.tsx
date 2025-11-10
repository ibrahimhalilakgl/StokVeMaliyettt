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
  LinearProgress
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
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

      const response = await axios.get('http://localhost:8080/v1/materialEntry/details', {
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
              <TableCell align="right">İhale İle Alınan Toplam Miktar</TableCell>
              <TableCell align="right">Toplam Alınan Miktar</TableCell>
              <TableCell align="right">Toplam Çıkış</TableCell>
              <TableCell align="right">Depoda Kalan Miktar</TableCell>
              <TableCell align="center">Stok Durumu (%)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stoklar.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} align="center" sx={{ py: 4 }}>
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
                const stokYuzdesi = stok.kritikSeviye > 0 ? (stok.remaining / stok.kritikSeviye) * 100 : 0;
                const stokDurumu = stokYuzdesi <= 50 ? 'Kritik' : stokYuzdesi <= 100 ? 'Düşük' : 'Normal';
                
                return (
                  <TableRow 
                    key={stok.id}
                    sx={{
                      backgroundColor: stok.remaining <= stok.kritikSeviye ? '#fff3e0' : 'inherit'
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
                    <TableCell align="right">{stok.tender}</TableCell>
                    <TableCell align="right">{stok.totalReceived}</TableCell>
                    <TableCell align="right">{stok.totalExit}</TableCell>
                    <TableCell align="right">{stok.remaining}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ 
                          color: stokYuzdesi <= 50 ? '#d32f2f' : stokYuzdesi <= 100 ? '#f57c00' : '#2e7d32',
                          fontWeight: 600
                        }}>
                          {stokYuzdesi.toFixed(0)}%
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min(stokYuzdesi, 100)} 
                          sx={{ 
                            width: 60, 
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: '#e0e0e0',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: stokYuzdesi <= 50 ? '#d32f2f' : stokYuzdesi <= 100 ? '#f57c00' : '#2e7d32',
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