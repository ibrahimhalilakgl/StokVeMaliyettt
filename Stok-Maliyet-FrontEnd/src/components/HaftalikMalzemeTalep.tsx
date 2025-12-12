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
  Checkbox
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useLocation } from 'react-router-dom';

interface MalzemeTalep {
  id: number;
  malzemeAdi: string;
  miktar: number;
  birim: string;
  talepTarihi: string;
  aciklama: string;
  onayDurumu: '19.mad' | '2f';
  secildi: boolean;
}

const HaftalikMalzemeTalep: React.FC = () => {
  const location = useLocation();
  const [talepler, setTalepler] = useState<MalzemeTalep[]>([
    {
      id: 1,
      malzemeAdi: "Et",
      miktar: 50,
      birim: "Kg",
      talepTarihi: "2024-03-20",
      aciklama: "Haftalık et ihtiyacı",
      onayDurumu: "19.mad",
      secildi: false
    },
    {
      id: 2,
      malzemeAdi: "Süt",
      miktar: 30,
      birim: "Lt",
      talepTarihi: "2024-03-20",
      aciklama: "Haftalık süt ihtiyacı",
      onayDurumu: "2f",
      secildi: false
    }
  ]);

  useEffect(() => {
    // Stok durumundan gelen malzemeleri kontrol et
    const onaylananMalzemeler = location.state?.onaylananMalzemeler;
    if (onaylananMalzemeler) {
      // Yeni ID'ler için mevcut en yüksek ID'yi bul
      const maxId = Math.max(...talepler.map(t => t.id), 0);
      
      // Yeni malzemeleri ekle
      const yeniTalepler = onaylananMalzemeler.map((m: any, index: number) => ({
        ...m,
        id: maxId + index + 1
      }));

      setTalepler(prevTalepler => [...prevTalepler, ...yeniTalepler]);
      
      // State'i temizle
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSecim = (id: number) => {
    setTalepler(talepler.map(talep => 
      talep.id === id ? { ...talep, secildi: !talep.secildi } : talep
    ));
  };

  const handleTumunuSec = () => {
    const tumSecili = talepler.every(talep => talep.secildi);
    setTalepler(talepler.map(talep => ({ ...talep, secildi: !tumSecili })));
  };

  const handlePDFIndir = () => {
    try {
      const doc = new jsPDF();
      
      // Başlık
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text('Haftalık Malzeme Talep Formu', 14, 20);
      
      // Tarih
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      const tarih = new Date().toLocaleDateString('tr-TR');
      doc.text(`Tarih: ${tarih}`, 14, 30);

      // Seçili malzemeleri al
      const seciliTalepler = talepler.filter(talep => talep.secildi);
      
      // Tablo başlıkları
      const headers = [['Malzeme Adı', 'Miktar', 'Birim', 'Talep Tarihi', 'Açıklama', 'Onay Durumu']];
      
      // Tablo verileri
      const data = seciliTalepler.map(talep => [
        talep.malzemeAdi,
        talep.miktar.toString(),
        talep.birim,
        talep.talepTarihi,
        talep.aciklama,
        talep.onayDurumu
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
          3: { cellWidth: 25 },
          4: { cellWidth: 50 },
          5: { cellWidth: 25, halign: 'center' }
        },
        margin: { top: 40 }
      });

      // PDF'i indir
      doc.save('haftalik-malzeme-talep-formu.pdf');
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      alert('PDF oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ 
          color: '#006C7F', 
          fontWeight: 600,
          textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
          letterSpacing: '0.5px'
        }}>
          Haftalık Malzeme Talep
        </Typography>
        <Button
          variant="contained"
          startIcon={<FileDownloadIcon />}
          onClick={handlePDFIndir}
          disabled={!talepler.some(talep => talep.secildi)}
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
          Seçili Talepleri İndir
        </Button>
      </Box>

      <TableContainer 
        component={Paper} 
        sx={{ 
          maxWidth: '95%',
          mx: 'auto',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          borderRadius: '12px',
          overflow: 'hidden',
          '& .MuiTableCell-root': {
            padding: '12px 16px',
            fontSize: '0.875rem',
            borderColor: '#e0e0e0'
          }
        }}
      >
        <Table size="small">
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
                  checked={talepler.length > 0 && talepler.every(talep => talep.secildi)}
                  indeterminate={talepler.some(talep => talep.secildi) && !talepler.every(talep => talep.secildi)}
                  onChange={handleTumunuSec}
                />
              </TableCell>
              <TableCell>Malzeme Adı</TableCell>
              <TableCell align="right">Miktar</TableCell>
              <TableCell>Birim</TableCell>
              <TableCell>Talep Tarihi</TableCell>
              <TableCell>Açıklama</TableCell>
              <TableCell>Onay Durumu</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {talepler.map((talep) => (
              <TableRow 
                key={talep.id}
                sx={{
                  backgroundColor: 
                    talep.onayDurumu === '2f' ? '#e8f5e9' :
                    '#fff3e0',
                  '&:hover': {
                    backgroundColor: 
                      talep.onayDurumu === '2f' ? '#c8e6c9' :
                      '#ffe0b2',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={talep.secildi}
                    onChange={() => handleSecim(talep.id)}
                  />
                </TableCell>
                <TableCell>{talep.malzemeAdi}</TableCell>
                <TableCell align="right">{talep.miktar}</TableCell>
                <TableCell>{talep.birim}</TableCell>
                <TableCell>{talep.talepTarihi}</TableCell>
                <TableCell>{talep.aciklama}</TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 
                        talep.onayDurumu === '2f' ? '#4caf50' :
                        '#ff9800',
                      fontWeight: 500,
                      padding: '6px 12px',
                      borderRadius: '6px',
                      backgroundColor: 
                        talep.onayDurumu === '2f' ? '#e8f5e9' :
                        '#fff3e0',
                      display: 'inline-block',
                      transition: 'all 0.2s ease-in-out',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                  >
                    {talep.onayDurumu}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default HaftalikMalzemeTalep; 
