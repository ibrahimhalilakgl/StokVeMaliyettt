import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Paper, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Card, CardContent,
  Chip
} from '@mui/material';
import axios from 'axios';
import InventoryIcon from '@mui/icons-material/Inventory';
import AddBoxIcon from '@mui/icons-material/AddBox';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useNavigate } from 'react-router-dom';

interface StockItem {
  productName: string;
  productCategoryName: string;
  measurementUnitName: string;
  totalStockQuantity: number;
  averageUnitPrice: number;
  criticalLevel: number;
}

interface StockSummary {
  totalProducts: number;
  lowStockProducts: number;
  totalValue: number;
  criticalItems: number;
}

interface MaterialEntry {
  id: number;
  entryDate: string;
  productResponse: {
    name: string;
    measurementType: string;
  };
  quantity: number;
  totalPrice: number;
  companyName: string;
}

interface MaterialExit {
  id: number;
  exitDate: string;
  productId: number;
  quantity: number;
  recipient: string;
  description: string;
  totalPrice: number;
}

const DepoHomePage: React.FC = () => {
  const navigate = useNavigate();
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [stockSummary, setStockSummary] = useState<StockSummary>({
    totalProducts: 0,
    lowStockProducts: 0,
    totalValue: 0,
    criticalItems: 0
  });
  const [recentEntries, setRecentEntries] = useState<MaterialEntry[]>([]);
  const [recentExits, setRecentExits] = useState<MaterialExit[]>([]);
  // expiringItems ve pendingDeliveries kaldırıldı - backend'de yok
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStockData();
    fetchRecentEntries();
    fetchRecentExits();
  }, []);

  const fetchStockData = async () => {
    try {
      // Stok verilerini getir - doğru endpoint kullan
      const response = await axios.get('/materialEntry/getAllProductDetail');
      const stockData = response.data.data || [];
      
      // Eğer veri yoksa mock data kullan
      let formattedData;
      if (stockData.length === 0) {
        formattedData = [
          {
            productName: 'Bulgur',
            productCategoryName: 'Tahıl',
            measurementUnitName: 'Kilogram',
            totalStockQuantity: 150,
            averageUnitPrice: 12.50,
            criticalLevel: 20
          },
          {
            productName: 'Pirinç',
            productCategoryName: 'Tahıl',
            measurementUnitName: 'Kilogram',
            totalStockQuantity: 80,
            averageUnitPrice: 15.00,
            criticalLevel: 15
          },
          {
            productName: 'Mercimek',
            productCategoryName: 'Bakliyat',
            measurementUnitName: 'Kilogram',
            totalStockQuantity: 5,
            averageUnitPrice: 18.00,
            criticalLevel: 10
          }
        ];
      } else {
        // Veri formatını uyumlu hale getir
        formattedData = stockData.map((item: any) => ({
          productName: item.productName || 'Bilinmiyor',
          productCategoryName: item.productCategoryName || 'Bilinmiyor',
          measurementUnitName: item.measurementUnitName || 'Adet',
          totalStockQuantity: item.totalStockQuantity || 0,
          averageUnitPrice: item.averageUnitPrice || 0,
          criticalLevel: item.criticalLevel || 10
        }));
      }
      
      setStockItems(formattedData);
      
      // İstatistikleri hesapla
      const totalProducts = formattedData.length;
      const lowStockProducts = formattedData.filter((item: any) => 
        item.totalStockQuantity <= item.criticalLevel
      ).length;
      const criticalItems = formattedData.filter((item: any) => 
        item.totalStockQuantity <= item.criticalLevel * 0.5
      ).length;
      const totalValue = formattedData.reduce((sum: number, item: any) => 
        sum + (item.averageUnitPrice * item.totalStockQuantity), 0
      );
      
      // Stok özetini güncelle
      setStockSummary({
        totalProducts,
        lowStockProducts,
        totalValue,
        criticalItems
      });
      
    } catch (error) {
      console.error('Stok verisi çekme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentEntries = async () => {
    try {
      const response = await axios.get('/materialEntry/all');
      const entries = response.data.data || [];
      // Tarihe göre sırala (en yeni önce)
      const sortedEntries = entries.sort((a: any, b: any) => 
        new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
      );
      setRecentEntries(sortedEntries);
    } catch (error) {
      console.error('Son malzeme girişleri çekme hatası:', error);
    }
  };

  const fetchRecentExits = async () => {
    try {
      const response = await axios.get('/materialExit/all');
      const exits = response.data.data || [];
      // Tarihe göre sırala (en yeni önce)
      const sortedExits = exits.sort((a: any, b: any) => 
        new Date(b.exitDate).getTime() - new Date(a.exitDate).getTime()
      );
      setRecentExits(sortedExits);
    } catch (error) {
      console.error('Son malzeme çıkışları çekme hatası:', error);
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

  const formatQuantity = (number: number | undefined) => {
    if (number === undefined || number === null) return '0';
    return number.toLocaleString('tr-TR', {
      maximumFractionDigits: 0,
    });
  };

  const getStockStatus = (quantity: number | undefined, criticalLevel: number | undefined) => {
    if (quantity === undefined || criticalLevel === undefined || quantity === null || criticalLevel === null) {
      return { label: 'Bilinmiyor', color: 'default' as const };
    }
    if (quantity <= criticalLevel * 0.5) {
      return { label: 'Kritik', color: 'error' as const };
    } else if (quantity <= criticalLevel) {
      return { label: 'Düşük', color: 'warning' as const };
    } else {
      return { label: 'Normal', color: 'success' as const };
    }
  };

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
        📦 Depo Operasyon Paneli - Stok Yönetimi
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
                <InventoryIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Toplam Ürün
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stockSummary.totalProducts}
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
                <AssessmentIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Düşük Stok
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stockSummary.lowStockProducts}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <RemoveCircleIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Kritik Stok
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stockSummary.criticalItems}
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
                <AddBoxIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Toplam Değer
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {formatCurrency(stockSummary.totalValue)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Hızlı Erişim Butonları kaldırıldı */}

      {/* Son Malzeme Girişleri ve Çıkışları */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {/* Son Malzeme Girişleri */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 3, color: '#006C7F', fontWeight: 600 }}>
              📥 Son Malzeme Girişleri
            </Typography>
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', minWidth: 80 }}>Tarih</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', minWidth: 120 }}>Malzeme</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', minWidth: 80 }}>Miktar</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', minWidth: 100 }}>Firma</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', minWidth: 100 }}>Tutar</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentEntries.length > 0 ? (
                    recentEntries.slice(0, 10).map((entry, index) => (
                      <TableRow key={index} hover>
                        <TableCell sx={{ fontSize: '0.875rem' }}>
                          {new Date(entry.entryDate).toLocaleDateString('tr-TR')}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', fontWeight: 'medium' }}>
                          {entry.productResponse?.name || 'Bilinmiyor'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem' }}>
                          {entry.quantity} {entry.productResponse?.measurementType || ''}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem' }}>
                          {entry.companyName || '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#4CAF50' }}>
                          {formatCurrency(entry.totalPrice)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>
                        Henüz malzeme girişi yapılmamış
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Son Malzeme Çıkışları */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 3, color: '#006C7F', fontWeight: 600 }}>
              📤 Son Malzeme Çıkışları
            </Typography>
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', minWidth: 80 }}>Tarih</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', minWidth: 80 }}>Miktar</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', minWidth: 100 }}>Alıcı</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', minWidth: 120 }}>Açıklama</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', minWidth: 100 }}>Tutar</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentExits.length > 0 ? (
                    recentExits.slice(0, 10).map((exit, index) => (
                      <TableRow key={index} hover>
                        <TableCell sx={{ fontSize: '0.875rem' }}>
                          {new Date(exit.exitDate).toLocaleDateString('tr-TR')}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem' }}>
                          {exit.quantity}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', fontWeight: 'medium' }}>
                          {exit.recipient || '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem' }}>
                          {exit.description || '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#FF9800' }}>
                          {formatCurrency(exit.totalPrice)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>
                        Henüz malzeme çıkışı yapılmamış
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Stok Durumu Tablosu */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 3, color: '#006C7F', fontWeight: 600 }}>
          📊 Stok Durumu
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Ürün Adı</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Kategori</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Stok Miktarı</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Birim Fiyat</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Toplam Değer</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Durum</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stockItems.slice(0, 10).map((item, index) => {
                const status = getStockStatus(item.totalStockQuantity, item.criticalLevel);
                const totalValue = (item.averageUnitPrice || 0) * (item.totalStockQuantity || 0);
                return (
                  <TableRow key={index}>
                    <TableCell>{item.productName || 'Bilinmiyor'}</TableCell>
                    <TableCell>{item.productCategoryName || 'Bilinmiyor'}</TableCell>
                    <TableCell align="right">{formatQuantity(item.totalStockQuantity)} {item.measurementUnitName || ''}</TableCell>
                    <TableCell align="right">{formatCurrency(item.averageUnitPrice)}</TableCell>
                    <TableCell align="right">{formatCurrency(totalValue)}</TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={status.label} 
                        color={status.color} 
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button 
            variant="contained" 
            onClick={() => navigate('/stok-durumu')}
            sx={{ 
              bgcolor: '#006C7F',
              '&:hover': { bgcolor: '#004d5c' },
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600
            }}
          >
            Stok Durumu
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default DepoHomePage;
