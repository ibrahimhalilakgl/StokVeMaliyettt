import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Paper, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Card, CardContent
} from '@mui/material';
import axios from 'axios';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { useNavigate } from 'react-router-dom';

interface TicketType {
  id: number;
  name: string;
  unitPrice: number;
}

interface TicketSales {
  ticketTypeName: string;
  unitPrice: number;
  totalSalesCount: number;
  totalPrice: number;
}

// MenuPlan interface'i kaldırıldı - backend'de yok

interface CriticalStock {
  productName: string;
  currentStock: number;
  criticalLevel: number;
  unit: string;
}

interface WeeklySalesTrend {
  date: string;
  totalTicketsSold: number;
  totalRevenue: number;
}

interface PendingMaterialDemand {
  id: number;
  demandDate: string;
  productName: string;
  quantity: number;
  status: string;
}

const YemekhaneHomePage: React.FC = () => {
  const navigate = useNavigate();
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [todaySales, setTodaySales] = useState<TicketSales[]>([]);
  const [criticalStocks, setCriticalStocks] = useState<CriticalStock[]>([]);
  const [weeklySalesTrend, setWeeklySalesTrend] = useState<WeeklySalesTrend[]>([]);
  const [pendingDemands, setPendingDemands] = useState<PendingMaterialDemand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fiş türleri - gerçek database verisi
      const ticketTypesResponse = await axios.get('/v1/ticketType/all');
      setTicketTypes(ticketTypesResponse.data.data || []);

      // Bugünkü satışlar - gerçek database verisi
      const today = new Date().toISOString().split('T')[0];
      const todaySalesResponse = await axios.get('/v1/ticketSalesDetail/getTicketByDate', {
        params: {
          startDate: today,
          endDate: today
        }
      });
      setTodaySales(todaySalesResponse.data.data || []);

      // Kritik stoklar - stok verilerinden hesapla
      const stockResponse = await axios.get('/v1/materialEntry/getAllProductDetail');
      const stockData = stockResponse.data.data || [];
      
      let criticalStocks;
      if (stockData.length === 0) {
        // Mock data - kritik stok örneği
        criticalStocks = [
          {
            productName: 'Mercimek',
            currentStock: 5,
            criticalLevel: 10,
            unit: 'Kilogram'
          }
        ];
      } else {
        criticalStocks = stockData.filter((item: any) => 
          item.totalStockQuantity && item.criticalLevel && 
          item.totalStockQuantity <= item.criticalLevel
        ).map((item: any) => ({
          productName: item.productName || 'Bilinmiyor',
          currentStock: item.totalStockQuantity || 0,
          criticalLevel: item.criticalLevel || 0,
          unit: item.measurementUnitName || 'Adet'
        }));
      }
      
      setCriticalStocks(criticalStocks);
      
      // Haftalık satış trendi
      await fetchWeeklySalesTrend();
      
      // Bekleyen malzeme talepleri
      await fetchPendingDemands();
      
    } catch (error) {
      console.error('Veri çekme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklySalesTrend = async () => {
    try {
      const weeklyData: WeeklySalesTrend[] = [];
      const today = new Date();
      
      // Son 7 günün verilerini çek
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        try {
          const response = await axios.get('/v1/ticketSalesDetail/getTicketByDate', {
            params: {
              startDate: dateStr,
              endDate: dateStr
            }
          });
          
          const daySales = response.data.data || [];
          const totalTickets = daySales.reduce((sum: number, sale: any) => sum + (sale.totalSalesCount || 0), 0);
          const totalRevenue = daySales.reduce((sum: number, sale: any) => sum + (sale.totalPrice || 0), 0);
          
          weeklyData.push({
            date: dateStr,
            totalTicketsSold: totalTickets,
            totalRevenue: totalRevenue
          });
        } catch (error) {
          // Eğer o gün için veri yoksa 0 değerleri ekle
          weeklyData.push({
            date: dateStr,
            totalTicketsSold: 0,
            totalRevenue: 0
          });
        }
      }
      
      setWeeklySalesTrend(weeklyData);
    } catch (error) {
      console.error('Haftalık satış trendi çekme hatası:', error);
    }
  };

  const fetchPendingDemands = async () => {
    try {
      const response = await axios.get('/v1/materialDemand/all');
      const allDemands = response.data.data || [];
      
      // Bekleyen talepleri filtrele (PENDING durumundaki)
      const pending = allDemands
        .filter((demand: any) => demand.demandStatus === 'PENDING')
        .map((demand: any) => ({
          id: demand.id,
          demandDate: demand.requestDate,
          productName: demand.productName || 'Bilinmiyor',
          quantity: demand.quantity || 0,
          status: demand.demandStatus || 'PENDING'
        }))
        .slice(0, 10); // Son 10 talep
      
      setPendingDemands(pending);
    } catch (error) {
      console.error('Bekleyen talepler çekme hatası:', error);
    }
  };

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return '0,00 ₺';
    return value.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true
    }) + ' ₺';
  };

  const totalTodayRevenue = todaySales.reduce((sum, sale) => sum + (sale.totalPrice || 0), 0);
  const totalTodayTickets = todaySales.reduce((sum, sale) => sum + (sale.totalSalesCount || 0), 0);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Yükleniyor...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#006C7F', fontWeight: 600, mb: 4 }}>
        🍽️ Yemekhane Operasyon Paneli - Günlük İşlemler
      </Typography>

      {/* İstatistik Kartları */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <RestaurantIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Aktif Fiş Türleri
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {ticketTypes.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ReceiptIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Bugün Satılan Fiş
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {totalTodayTickets}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachMoneyIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Bugünkü Gelir
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {formatCurrency(totalTodayRevenue)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Ortalama Fiyat
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {totalTodayTickets > 0 ? formatCurrency(totalTodayRevenue / totalTodayTickets) : '0 ₺'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Hızlı Erişim Butonları kaldırıldı */}

      {/* Kritik Stok Uyarıları */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, color: '#006C7F', fontWeight: 600 }}>
              ⚠️ Kritik Stok Uyarıları
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {criticalStocks.length > 0 ? criticalStocks.map((item: any, index: number) => (
                <Box key={index} sx={{ 
                  p: 2, 
                  border: '1px solid #ffcdd2', 
                  borderRadius: 2,
                  backgroundColor: '#ffebee'
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#d32f2f' }}>
                    {item.productName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mevcut: {item.currentStock} {item.unit} | Kritik Seviye: {item.criticalLevel} {item.unit}
                  </Typography>
                </Box>
              )) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  Kritik stok bulunmuyor
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Haftalık Satış Trendi ve Bekleyen Talepler */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Haftalık Satış Trendi */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 3, color: '#006C7F', fontWeight: 600 }}>
              📈 Haftalık Satış Trendi
            </Typography>
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', minWidth: 100 }}>Tarih</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', minWidth: 100 }}>Satılan Fiş</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', minWidth: 120 }}>Toplam Gelir</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {weeklySalesTrend.length > 0 ? (
                    weeklySalesTrend.map((trend, index) => (
                      <TableRow key={index} hover>
                        <TableCell sx={{ fontSize: '0.875rem' }}>
                          {new Date(trend.date).toLocaleDateString('tr-TR')}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', fontWeight: 'medium' }}>
                          {trend.totalTicketsSold}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#4CAF50' }}>
                          {formatCurrency(trend.totalRevenue)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>
                        Haftalık satış verisi bulunmuyor
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Bekleyen Malzeme Talepleri */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 3, color: '#006C7F', fontWeight: 600 }}>
              📋 Bekleyen Malzeme Talepleri
            </Typography>
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', minWidth: 100 }}>Talep Tarihi</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', minWidth: 120 }}>Malzeme</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', minWidth: 80 }}>Miktar</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', minWidth: 100 }}>Durum</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingDemands.length > 0 ? (
                    pendingDemands.map((demand, index) => (
                      <TableRow key={index} hover>
                        <TableCell sx={{ fontSize: '0.875rem' }}>
                          {new Date(demand.demandDate).toLocaleDateString('tr-TR')}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', fontWeight: 'medium' }}>
                          {demand.productName}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem' }}>
                          {demand.quantity}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem' }}>
                          <Box sx={{ 
                            display: 'inline-block',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            backgroundColor: demand.status === 'PENDING' ? '#fff3cd' : '#d4edda',
                            color: demand.status === 'PENDING' ? '#856404' : '#155724',
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                          }}>
                            {demand.status === 'PENDING' ? 'Bekliyor' : demand.status}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>
                        Bekleyen talep bulunmuyor
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Bugünkü Satışlar Tablosu */}
      {todaySales.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, color: '#006C7F', fontWeight: 600 }}>
            📊 Bugünkü Satışlar
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Fiş Türü</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Birim Fiyat</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Satılan Adet</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Toplam Tutar</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {todaySales.map((sale, index) => (
                  <TableRow key={index}>
                    <TableCell>{sale.ticketTypeName}</TableCell>
                    <TableCell align="right">{formatCurrency(sale.unitPrice)}</TableCell>
                    <TableCell align="right">{sale.totalSalesCount}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(sale.totalPrice)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default YemekhaneHomePage;
