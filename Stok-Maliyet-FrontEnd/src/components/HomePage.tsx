import React, { useEffect, useState, useRef } from 'react';
import {
  Box, Grid, Paper, Typography, Table, TableBody, TableCell,Chip,
  TableContainer, TableHead, TableRow, Card, CardContent, Button
} from '@mui/material';
import axios from 'axios';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptIcon from '@mui/icons-material/Receipt';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import BarChartIcon from '@mui/icons-material/BarChart';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { Pagination } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

interface DetailResponse {
  criticalLevel: number;
  lastEntryDate: string;
  vatAmount: number;
  totalRecordCount: number;
  totalPrice: number;
}
interface BudgetSpendingResponse {
  budgetName: string;
  totalAmount: number;
}


interface ProductResponse {
  productName: string;
  productCategoryName: string;
  measurementUnitName: string;
  averageUnitPrice: number;
  totalStockQuantity: number;
  detailResponse: DetailResponse;
}

interface PurchaseFormData {
  tenderTypeName: string;
  totalAmount: number;
  productResponses: ProductResponse[];
}
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return '0,00 ₺';
    return value.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true
    }) + ' ₺';
  };

// Yeni: Tarihi "19 Mayıs 2025" gibi Türkçe okunabilir forma çevirme fonksiyonu
const formatDateLong = (date: Date) => {
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const styleMap: Record<string, { bg: string; hover: string; color: string }> = {
  '22. Madde ile Doğrudan Temin': {
    bg: '#FFF3E0',
    hover: '#FFE0B2',
    color: '#EF6C00',
  },
  '19. Madde ile Açık İhale': {
    bg: '#E8F5E9',
    hover: '#C8E6C9',
    color: '#2E7D32',
  },
  '21A': {
    bg: '#FFF3E0',
    hover: '#FFE0B2',
    color: '#EF6C00',
  },
};



const pastelColors = [
  { bg: '#FFF8E1', text: '#4E342E' }, // Krem zemin, koyu kahve yazı
  { bg: '#F0EDE5', text: '#5D4037' }, // Ekru zemin, sıcak kahverengi yazı
  { bg: '#F9E79F', text: '#7D6608' }, // Hardal sarısı zemin, koyu hardal yazı
  { bg: '#FBEAEC', text: '#880E4F' }, // Gül kurusu zemin, koyu pembe yazı
];



const AdminHomePage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<PurchaseFormData[]>([]);
  const [selectedForm, setSelectedForm] = useState<PurchaseFormData | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
  const [budgetSpending, setBudgetSpending] = useState<BudgetSpendingResponse[]>([]);
  const [monthlyReport, setMonthlyReport] = useState<any>(null);
  const [ticketReport, setTicketReport] = useState<any[]>([]);
  const [yesterdayDate, setYesterdayDate] = useState<Date>(new Date());

  // useRef kullanarak sonsuz döngüyü önle
  const lastValidTicketReportRef = useRef<any[]>([]);

  // Sayfa başına gösterilecek ürün sayısı
  const itemsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);




  const getPreviousMonthName = (dateString: string) => {
  const date = new Date();
  const previousMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  return previousMonth.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
};


  useEffect(() => {
    axios.get('/materialEntry/all')
      .then((res) => {
        console.log('Veri çekme başarılı:', res.data);
        // MaterialEntry verisini ana sayfa formatına çevir
        if (res.data.data && res.data.data.length > 0) {
          const groupedData = res.data.data.reduce((acc: any, item: any) => {
            const tenderType = item.tenderType || 'Bilinmeyen';
            if (!acc[tenderType]) {
              acc[tenderType] = {
                tenderTypeName: tenderType,
                totalAmount: 0,
                productResponses: []
              };
            }
            acc[tenderType].totalAmount += item.totalPriceIncludingVat || 0;
            acc[tenderType].productResponses.push({
              productName: item.productResponse?.name || '',
              productCategoryName: item.productResponse?.category || '',
              measurementUnitName: item.productResponse?.measurementType || '',
              averageUnitPrice: item.unitPrice || 0,
              totalStockQuantity: item.quantity || 0,
              detailResponse: {
                criticalLevel: item.productResponse?.criticalLevel || 100,
                lastEntryDate: item.entryDate || new Date().toISOString(),
                vatAmount: item.productResponse?.vatAmount || 0.18,
                totalRecordCount: 1,
                totalPrice: item.totalPriceIncludingVat || 0
              }
            });
            return acc;
          }, {});
          
          const formattedData = Object.values(groupedData) as PurchaseFormData[];
          setData(formattedData);
        } else {
          setData([]);
        }
      })
      .catch((err) => console.error('Veri çekme hatası:', err));
  }, []);


const handleCategoryClick = (formName: string) => {
  if (selectedForm?.tenderTypeName === formName) {
    setSelectedForm(null); // Aynı form tekrar tıklanırsa kapat
    setSelectedProduct(null);
  } else {
    const selected = data.find(d => d.tenderTypeName === formName) || null;
    setSelectedForm(selected);
    setSelectedProduct(null);
  }
};

  useEffect(() => {
    axios.get('/materialEntry/spend-by-budget')
      .then(res => {
        console.log('Bütçe verileri başarılı:', res.data);
        setBudgetSpending(res.data.data);
      })
      .catch(err => {
        console.error("Bütçe harcamaları alınamadı:", err);
        console.error('Bütçe hata detayı:', err.response?.data);
      });
  }, []);




  useEffect(() => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  setYesterdayDate(yesterday);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const formattedDate = formatDate(firstDayOfCurrentMonth);

  // Aylık rapor verisi - mock data ile aktif edelim
  setMonthlyReport({
    reportDate: formattedDate,
    totalPersonQuantity: 150,
    ticketQuantity: 100,
    totalMaterialPrice: 5752,
    totalTicketPrice: 3000,
    averageTicketCost: 30,
    averagePersonCost: 20
  });

  const formattedYesterday = formatDate(yesterday);
  axios
    .get(`/ticketSalesDetail/getTicketByDate?startDate=${formattedYesterday}&endDate=${formattedYesterday}`)
    .then((res) => {
      if (res.data.data.length > 0) {
        setTicketReport(res.data.data);
        lastValidTicketReportRef.current = res.data.data; // Ref'e kaydet
      } else {
        // Eğer veri yoksa son geçerli veriyi kullan
        setTicketReport(lastValidTicketReportRef.current);
      }
    })
    .catch((err) => {
      console.error("Fiş raporu alınamadı:", err);
      setTicketReport(lastValidTicketReportRef.current); // Hata durumunda da son geçerli veri
    });
}, []); // Boş dependency array - sadece component mount olduğunda çalışır


  const StatBox = ({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) => (
    <Paper sx={{ 
      p: 2,
      backgroundColor: '#fff',
      borderRadius: 2,
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      borderLeft: `4px solid ${color}`
    }}>
      <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ 
          mr: 1.5,
          width: 36,
          height: 36,
          borderRadius: '50%',
          backgroundColor: `${color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {value}
        </Typography>
      </Box>
    </Paper>
  );


  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const paginatedProducts = selectedForm
    ? selectedForm.productResponses.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      )
    : [];



    const formatDate = (dateStr: string) => {
      const parsed = dayjs(dateStr);
      return parsed.isValid() ? parsed.format('DD-MM-YYYY') : '-';
    };
    const formatQuantity = (number: number | undefined) => {
      if (number === undefined || number === null) return '0';
      return number.toLocaleString('tr-TR', {
        maximumFractionDigits: 0,
      });
    }

  return (
    <Box sx={{ p: 3, width: '100%', maxWidth: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#006C7F', fontWeight: 600, mb: 4 }}>
        Stok Takip Sistemi
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4, width: '100%', maxWidth: '100%', margin: 0 }}>
        {data.map((form) => {
          const style = styleMap[form.tenderTypeName] || {
            bg: '#F3E5F5',
            hover: '#E1BEE7',
            color: '#7B1FA2'
          };

          return (
            <Grid item xs={12} md={6} lg={6} key={form.tenderTypeName}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: style.bg,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: style.hover
                  }
                }}
                onClick={() => handleCategoryClick(form.tenderTypeName)}
              >
                <Typography variant="h6" gutterBottom sx={{ color: style.color }}>
                  {form.tenderTypeName} Toplam
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, color: style.color }}>
                  {formatCurrency(form.totalAmount)}
                </Typography>
              </Paper>
            </Grid>
          );
        })}
        
        {/* Yemek Reçeteleri Hızlı Erişim Kartı */}
        <Grid item xs={12} md={6} lg={6}>
          <Card
            elevation={3}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              cursor: 'pointer',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6
              }
            }}
            onClick={() => navigate('/yemek-receteleri')}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MenuBookIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Yemek Reçeteleri
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Menü Yönetimi ve Raporlama
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                sx={{
                  mt: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.3)'
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/yemek-receteleri');
                }}
              >
                Yemek Reçetelerine Git
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>


     {selectedForm && (
      <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#37474F' }}>
          {selectedForm.tenderTypeName} Kategorisindeki Ürünler
        </Typography>
        <TableContainer sx={{ maxHeight: '60vh' }}>
          <Table stickyHeader>
            <TableHead sx={{ backgroundColor: '#ECEFF1' }}>
              <TableRow>
                <TableCell align="center">Malzeme Adı</TableCell>
                <TableCell align="center">Kategori</TableCell>
                <TableCell align="center">Birim</TableCell>
                <TableCell align="center">Stok Miktarı</TableCell>
                <TableCell align="center">Birim Fiyat</TableCell>
                <TableCell align="center">Toplam Değer</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedProducts.map((product, index) => (
                <TableRow
                  key={index}
                  onClick={() =>
                    setSelectedProduct(
                      selectedProduct?.productName === product.productName ? null : product
                    )
                  }
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: '#F1F8E9',
                      transition: '0.3s'
                    }
                  }}
                >
                  <TableCell align="center">{product.productName}</TableCell>
                  <TableCell align="center">{product.productCategoryName}</TableCell>
                  <TableCell align="center">{product.measurementUnitName}</TableCell>
                  <TableCell align="center">{formatQuantity(product.totalStockQuantity)}</TableCell>
                  <TableCell align="center">{formatCurrency(product.averageUnitPrice)}</TableCell>
                  <TableCell align="center">
                    {formatCurrency(product.averageUnitPrice * product.totalStockQuantity)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {selectedForm.productResponses.length > itemsPerPage && (
          <Pagination
            count={Math.ceil(selectedForm.productResponses.length / itemsPerPage)}
            page={currentPage}
            onChange={handlePageChange}
            sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}
            color="primary"
          />
        )}
      </Paper>
    )}


      {selectedProduct && (
  <Paper elevation={2} sx={{ p: 4, mb: 3, borderRadius: 3, bgcolor: '#F9F9FB' }}>
    <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: '#3E4C59' }}>
      {selectedProduct.productName} Detayları
    </Typography>
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        <Typography variant="body1"><strong>Kategori:</strong> {selectedProduct.productCategoryName}</Typography>
        <Typography variant="body1"><strong>Birim:</strong> {selectedProduct.measurementUnitName}</Typography>
        <Typography variant="body1"><strong>Birim Fiyat:</strong> {formatCurrency(selectedProduct.averageUnitPrice)}</Typography>
        <Typography variant="body1"><strong>Stok Miktarı:</strong> {formatQuantity(selectedProduct.totalStockQuantity)}</Typography>
        <Typography variant="body1"><strong>KDV Oranı:</strong> %{selectedProduct.detailResponse.vatAmount *100}</Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <Typography variant="body1"><strong>Kritik Seviye:</strong> {selectedProduct.detailResponse.criticalLevel}</Typography>
        <Typography variant="body1"><strong>Son Giriş Tarihi:</strong> {formatDate(selectedProduct.detailResponse.lastEntryDate)}</Typography>
        <Typography variant="body1"><strong>Toplam Kayıt Sayısı:</strong> {selectedProduct.detailResponse.totalRecordCount}</Typography>
        <Typography variant="body1"><strong>Toplam Tutar:</strong> {formatCurrency(selectedProduct.detailResponse.totalPrice)}</Typography>
      </Grid>
    </Grid>
  </Paper>
)}


{budgetSpending.length > 0 && (
  <>
    <Typography
      variant="h6"
      sx={{ mt: 5, mb: 3, fontWeight: 700, color: '#006C7F' }}
    >
      Yıl İçindeki Bütçelere Göre Harcama
    </Typography>

    <Grid container spacing={3} sx={{ width: '100%', maxWidth: '100%', margin: 0 }}>
      {budgetSpending.map((item, index) => {
        const colSize = Math.floor(12 / Math.min(budgetSpending.length, 4));
        const color = pastelColors[index % pastelColors.length]; // döngüsel renk kullanımı

        return (
          <Grid item xs={12} sm={colSize} key={index}>
            <Paper
              elevation={4}
              sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: color.bg,
                transition: 'transform 0.3s, box-shadow 0.3s',
                border: `1px solid ${color.text}33`,
                textAlign: 'center',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: `0 6px 20px ${color.text}33`,
                },
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize:'20px', color: color.text, mb: 1, textAlign: 'center' }}>
                {item.budgetName}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: color.text, textAlign: 'center' }}>
                {formatCurrency(item.totalAmount)}
              </Typography>
            </Paper>
          </Grid>
        );
      })}

      {/* Genel Toplam Kutusu */}
      <Grid item xs={12}>
        <Paper
          elevation={6}
          sx={{
            p: 3,
            mt: 2,
            borderRadius: 3,
            bgcolor: '#E3F2FD',
            textAlign: 'center',
            border: '1px solid #BBDEFB',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#0D47A1' }}>
            Toplam Bütçe Harcaması
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#0D47A1' }}>
            {formatCurrency(
              budgetSpending.reduce((acc, cur) => acc + cur.totalAmount, 0)
            )}
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  </>
)}

      

  {monthlyReport && ticketReport.length > 0 && (
    <Box sx={{ 
      mt: 6,
      backgroundColor: '#f9fafb',
      p: 4,
      borderRadius: 3,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      {/* Başlık */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 4,
        borderBottom: '1px solid #e5e7eb',
        pb: 2
      }}>
        <TrendingUpIcon sx={{ 
          color: '#3b82f6', 
          fontSize: 32,
          mr: 2 
        }} />
        <Typography variant="h5" sx={{ 
          fontWeight: 600,
          color: '#111827'
        }}>
          Performans Analizi
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Aylık Özet */}
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600,
              color: '#374151',
              mb: 2,
              display: 'flex',
              alignItems: 'center'
            }}>
              <CalendarMonthIcon sx={{ color: '#6b7280', mr: 1 }} />
              {getPreviousMonthName(monthlyReport.reportDate)} Özeti
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <StatBox 
                  title="Toplam Yapılan Yemek Sayısı" 
                  value={monthlyReport.totalPersonQuantity.toLocaleString('tr-TR')} 
                  icon={<PeopleAltIcon sx={{ color: '#6366f1' }} />}
                  color="#6366f1"
                />
              </Grid>
              <Grid item xs={6}>
                <StatBox 
                  title="Toplam Satılan Yemek Sayısı" 
                  value={monthlyReport.ticketQuantity.toLocaleString('tr-TR')} 
                  icon={<ConfirmationNumberIcon sx={{ color: '#ec4899' }} />}
                  color="#ec4899"
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 3 }}>
             
              <Grid item xs={6}>
                <StatBox 
                  title="Malzeme Maliyeti" 
                  value={formatCurrency(monthlyReport.totalMaterialPrice)} 
                  icon={<ReceiptIcon sx={{color: '#f59e0b' }} />}
                  color="#f59e0b"
                />
              </Grid>
               <Grid item xs={6}>
                <StatBox 
                  title="Fiş Geliri" 
                  value={formatCurrency(monthlyReport.totalTicketPrice)} 
                  icon={<AttachMoneyIcon sx={{ color: '#10b981' }} />}
                  color="#10b981"
                />
              </Grid>
            </Grid>
           <Grid container spacing={2}>
            <Grid item xs={6}>
              <StatBox 
                title="Satılan Fiş Sayısına Göre Maliyet" 
                value={formatCurrency(monthlyReport.averageTicketCost)} 
                icon={<MoneyOffIcon sx={{ color: '#EF4444' }} />} 
                color="#EF4444" 
              />
            </Grid>
            <Grid item xs={6}>
              <StatBox 
                title="Satılan Fiş sayısına göre maliyet" 
                value={formatCurrency(monthlyReport.averagePersonCost)} 
                icon={<BarChartIcon  sx={{ color: '#3B82F6' }} />}  
                color="#3B82F6" 
              />
            </Grid>
          </Grid>
          </Box>

          {/* Kar Marjı */}
          <Paper sx={{ 
            p: 2,
            backgroundColor: '#fff',
            borderRadius: 2,
            borderLeft: '4px solid #ef4444',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#6b7280' }}>
                  Kar Marjı
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {formatCurrency(monthlyReport.totalTicketPrice - monthlyReport.totalMaterialPrice)}
                </Typography>
              </Box>
              <Chip 
                label={`${((monthlyReport.totalTicketPrice - monthlyReport.totalMaterialPrice) / monthlyReport.totalTicketPrice * 100).toFixed(1)}%`} 
                sx={{ 
                  backgroundColor: '#fee2e2',
                  color: '#b91c1c',
                  fontWeight: 600
                }} 
              />
            </Box>
          </Paper>
        </Grid>

        {/* Günlük Satışlar */}
        <Grid item xs={12} md={6}>
          <Box sx={{ 
            mt: 4,
            backgroundColor: 'white',
            p: 3,
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 700,
              color: '#1a237e',
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              fontSize: '1.1rem'
            }}>
              <ReceiptIcon sx={{ color: '#3d5afe', mr: 1.5 }} />
              {formatDateLong(yesterdayDate)} Fiş Satışları
            </Typography>

            <TableContainer>
              <Table size="medium">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{
                      fontWeight: 600,
                      color: '#424242',
                      fontSize: '0.95rem',
                      py: 1.5,
                      borderBottom: '2px solid #e0e0e0'
                    }}>Fiş Tipi</TableCell>
                    <TableCell align="right" sx={{
                      fontWeight: 600,
                      color: '#424242',
                      fontSize: '0.95rem',
                      py: 1.5,
                      borderBottom: '2px solid #e0e0e0'
                    }}>Birim Fiyat</TableCell>
                    <TableCell align="right" sx={{
                      fontWeight: 600,
                      color: '#424242',
                      fontSize: '0.95rem',
                      py: 1.5,
                      borderBottom: '2px solid #e0e0e0'
                    }}>Adet</TableCell>
                    <TableCell align="right" sx={{
                      fontWeight: 600,
                      color: '#424242',
                      fontSize: '0.95rem',
                      py: 1.5,
                      borderBottom: '2px solid #e0e0e0'
                    }}>Tutar</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ticketReport.map((ticket, index) => (
                    <TableRow 
                      key={index}
                      sx={{ 
                        '&:last-child td': { borderBottom: 0 },
                        '&:hover': { backgroundColor: '#fafafa' }
                      }}
                    >
                      <TableCell sx={{
                        fontWeight: 500,
                        color: '#212121',
                        fontSize: '0.9rem',
                        py: 1.5
                      }}>{ticket.ticketTypeName}</TableCell>
                      <TableCell align="right" sx={{
                        color: '#616161',
                        fontSize: '0.9rem',
                        py: 1.5
                      }}>{formatCurrency(ticket.unitPrice)}</TableCell>
                      <TableCell align="right" sx={{
                        color: '#616161',
                        fontSize: '0.9rem',
                        py: 1.5
                      }}>{ticket.totalSalesCount}</TableCell>
                      <TableCell align="right" sx={{
                        fontWeight: 600,
                        color: '#1a237e',
                        fontSize: '0.9rem',
                        py: 1.5
                      }}>{formatCurrency(ticket.totalPrice)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mt: 2,
              px: 1
            }}>
              <Typography variant="body2" sx={{ color: '#757575' }}>
                Toplam Satılan Fiş : <strong style={{color: '#1a237e'}}>{ticketReport.reduce((sum, t) => sum + t.totalSalesCount, 0)}</strong>
              </Typography>
              <Typography variant="body2" sx={{ color: '#757575' }}>
                Toplam Tutar: <strong style={{color: '#1a237e'}}>{formatCurrency(ticketReport.reduce((sum, t) => sum + t.totalPrice, 0))}</strong>
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )}
    </Box>
  );
};

export default AdminHomePage;
