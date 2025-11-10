import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Paper, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Card, CardContent,
  Chip, LinearProgress, IconButton
} from '@mui/material';
import axios from 'axios';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AssessmentIcon from '@mui/icons-material/Assessment';
import GavelIcon from '@mui/icons-material/Gavel';
import InventoryIcon from '@mui/icons-material/Inventory';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate } from 'react-router-dom';

interface ProcurementData {
  totalTenders: number;
  totalDirectProcurements: number;
  totalBudget: number;
  pendingApprovals: number;
  spentAmount: number;
  remainingBudget: number;
  budgetUtilization: number;
}

interface StockItem {
  productName: string;
  productCategoryName: string;
  measurementUnitName: string;
  totalStockQuantity: number;
  averageUnitPrice: number;
}

const SatinalmaHomePage: React.FC = () => {
  const navigate = useNavigate();
  const [procurementData, setProcurementData] = useState<ProcurementData>({
    totalTenders: 0,
    totalDirectProcurements: 0,
    totalBudget: 0,
    pendingApprovals: 0,
    spentAmount: 0,
    remainingBudget: 0,
    budgetUtilization: 0
  });
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [budgetItems, setBudgetItems] = useState<{ name: string; amount: number; color: string; used?: number }[]>([]);
  const [lastTenders, setLastTenders] = useState<any[]>([]);
  const [lastDirectProcurements, setLastDirectProcurements] = useState<any[]>([]);
  const [lastPendingDemands, setLastPendingDemands] = useState<any[]>([]);
  // supplierPerformance kaldırıldı - backend'de yok
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // İhale verilerini getir
      const tenderResponse = await axios.get('/v1/tender/all');
      const tenders = tenderResponse.data.data || [];
      setLastTenders([...tenders].slice(-3).reverse());
      
      // Doğrudan temin verilerini getir
      const directProcurementResponse = await axios.get('/v1/directProcurement/all');
      const directProcurements = directProcurementResponse.data.data || [];
      setLastDirectProcurements([...directProcurements].slice(-3).reverse());
      
      // Bütçe verilerini getir
      const budgetResponse = await axios.get('/v1/budget/all');
      const budgets = budgetResponse.data.data || [];
      const palette = ['#1976D2', '#2E7D32', '#D32F2F', '#F57C00', '#6A1B9A'];
      setBudgetItems(
        budgets.map((b: any, idx: number) => ({
          name: b.budgetName || 'Bütçe',
          amount: b.budgetAmount || 0,
          color: palette[idx % palette.length],
          used: b.usedAmount || 0
        }))
      );
      
      // Stok verilerini getir (sadece görüntüleme) - gerçek database verisi
      const stockResponse = await axios.get('/v1/materialEntry/getAllProductDetail');
      const stockData = stockResponse.data.data || [];
      
      // Eğer veri yoksa mock data kullan
      let formattedStockData;
      if (stockData.length === 0) {
        formattedStockData = [
          {
            productName: 'Bulgur',
            productCategoryName: 'Tahıl',
            measurementUnitName: 'Kilogram',
            totalStockQuantity: 150,
            averageUnitPrice: 12.50
          },
          {
            productName: 'Pirinç',
            productCategoryName: 'Tahıl',
            measurementUnitName: 'Kilogram',
            totalStockQuantity: 80,
            averageUnitPrice: 15.00
          },
          {
            productName: 'Mercimek',
            productCategoryName: 'Bakliyat',
            measurementUnitName: 'Kilogram',
            totalStockQuantity: 5,
            averageUnitPrice: 18.00
          }
        ];
      } else {
        // Veri formatını uyumlu hale getir
        formattedStockData = stockData.map((item: any) => ({
          productName: item.productName || 'Bilinmiyor',
          productCategoryName: item.productCategoryName || 'Bilinmiyor',
          measurementUnitName: item.measurementUnitName || 'Adet',
          totalStockQuantity: item.totalStockQuantity || 0,
          averageUnitPrice: item.averageUnitPrice || 0
        }));
      }
      
      setStockItems(formattedStockData);
      
      // Bekleyen onay sayısı (PENDING talepler)
      let pendingApprovalsCount = 0;
      try {
        const demandsResp = await axios.get('/v1/materialDemand/all');
        const allDemands = demandsResp.data?.data || [];
        const pendingArr = allDemands.filter((d: any) => d.demandStatus === 'PENDING');
        pendingApprovalsCount = pendingArr.length;
        setLastPendingDemands([...pendingArr].slice(-3).reverse());
      } catch {}
      
      // Bütçe ve harcama verileri (backend)
      const totalBudget = budgets.reduce((sum: number, budget: any) => sum + (budget.budgetAmount || 0), 0);
      const spendResp = await axios.get('/v1/materialEntry/spend-by-budget');
      const spendList = spendResp.data?.data || [];
      const spentAmount = spendList.reduce((sum: number, item: any) => sum + (item.totalSpent || 0), 0);
      const remainingBudget = Math.max(0, totalBudget - spentAmount);
      const budgetUtilization = totalBudget > 0 ? (spentAmount / totalBudget) * 100 : 0;
      
      // Satınalma verilerini güncelle
      setProcurementData({
        totalTenders: tenders.length,
        totalDirectProcurements: directProcurements.length,
        totalBudget,
        // Bekleyen onay sayısı backend verisi
        pendingApprovals: pendingApprovalsCount,
        spentAmount,
        remainingBudget,
        budgetUtilization
      });
      
    } catch (error) {
      console.error('Veri çekme hatası:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Yükleniyor...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ 
          color: '#006C7F', 
          fontWeight: 700
        }}>
          💰 Satınalma Yönetim Paneli
      </Typography>
        <IconButton 
          onClick={fetchData}
          sx={{ 
            bgcolor: '#006C7F', 
            color: 'white',
            '&:hover': { bgcolor: '#004d5c' }
          }}
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* İstatistik Kartları */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: '#006C7F',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0,108,127,0.3)',
            borderRadius: 2,
            transition: 'transform 0.3s ease',
            '&:hover': { transform: 'translateY(-3px)' },
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CardContent sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              height: '100%',
              p: 2
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                mb: 2,
                flex: 1
              }}>
                <GavelIcon sx={{ fontSize: 32, mr: 1.5, mt: 0.5 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" sx={{ 
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    mb: 1
                  }}>
                    Toplam İhale
                  </Typography>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700,
                    fontSize: '1.8rem',
                    lineHeight: 1.2
                  }}>
                    {procurementData.totalTenders}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 1 }}>
                {lastTenders.slice(0,3).map((t, i) => (
                  <Box key={i} sx={{ mb: 0.75 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'white' }}>
                        {t.tenderName || t.name || 'İhale'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                        {t.startDate || t.createdAt || ''}
                      </Typography>
                    </Box>
                    <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.25)', mt: 0.5 }} />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: '#2E7D32',
            color: 'white',
            boxShadow: '0 4px 12px rgba(46,125,50,0.3)',
            borderRadius: 2,
            transition: 'transform 0.3s ease',
            '&:hover': { transform: 'translateY(-3px)' },
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CardContent sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              height: '100%',
              p: 2
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                mb: 2,
                flex: 1
              }}>
                <ShoppingCartIcon sx={{ fontSize: 32, mr: 1.5, mt: 0.5 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" sx={{ 
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    mb: 1
                  }}>
                    Doğrudan Temin
                  </Typography>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700,
                    fontSize: '1.8rem',
                    lineHeight: 1.2
                  }}>
                    {procurementData.totalDirectProcurements}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 1 }}>
                {lastDirectProcurements.slice(0,3).map((d, i) => (
                  <Box key={i} sx={{ mb: 0.75 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'white' }}>
                        {d.productName || d.name || 'Temin'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                        {d.startDate || d.createdAt || ''}
                      </Typography>
                    </Box>
                    <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.25)', mt: 0.5 }} />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: '#1976D2',
            color: 'white',
            boxShadow: '0 4px 12px rgba(25,118,210,0.3)',
            borderRadius: 2,
            transition: 'transform 0.3s ease',
            '&:hover': { transform: 'translateY(-3px)' },
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CardContent sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              height: '100%',
              p: 2
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                mb: 2,
                flex: 1
              }}>
                <AssessmentIcon sx={{ fontSize: 32, mr: 1.5, mt: 0.5 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" sx={{ 
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    mb: 1
                  }}>
                    Bütçeler
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {budgetItems.length === 0 ? (
                      <Typography variant="body2">Bütçe verisi yok</Typography>
                    ) : (
                      budgetItems.map((b, idx) => {
                        const used = b.used ?? 0;
                        const percent = b.amount > 0 ? Math.min(100, (used / b.amount) * 100) : 0;
                        return (
                          <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#fff' }}>
                                {b.name}
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#fff' }}>
                                {formatCurrency(b.amount)}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                              <Typography variant="caption" sx={{ opacity: 0.9, color: '#fff' }}>Kullanım: {formatCurrency(used)}</Typography>
                              <Typography variant="caption" sx={{ opacity: 0.9, color: '#fff' }}>{percent.toFixed(0)}%</Typography>
                            </Box>
                            <Box sx={{ width: '100%', height: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4, overflow: 'hidden' }}>
                              <Box sx={{ width: `${percent}%`, height: '100%', backgroundColor: b.color }} />
                            </Box>
                          </Box>
                        );
                      })
                    )}
                    {budgetItems.length > 1 && (
                      <Box sx={{ mt: 0.5, pt: 0.5, borderTop: '1px solid rgba(255,255,255,0.3)', display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Toplam</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {formatCurrency(procurementData.totalBudget)}
                  </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
              <Chip 
                label="Yıllık Bütçe" 
                size="small" 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  height: 24,
                  alignSelf: 'flex-start'
                }} 
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: '#D32F2F',
            color: 'white',
            boxShadow: '0 4px 12px rgba(211,47,47,0.3)',
            borderRadius: 2,
            transition: 'transform 0.3s ease',
            '&:hover': { transform: 'translateY(-3px)' },
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CardContent sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              height: '100%',
              p: 2
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                mb: 2,
                flex: 1
              }}>
                <InventoryIcon sx={{ fontSize: 32, mr: 1.5, mt: 0.5 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" sx={{ 
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    mb: 1
                  }}>
                    Bekleyen Onay
                  </Typography>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700,
                    fontSize: '1.8rem',
                    lineHeight: 1.2
                  }}>
                    {procurementData.pendingApprovals}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 1 }}>
                {lastPendingDemands.slice(0,3).map((p, i) => (
                  <Box key={i} sx={{ mb: 0.75 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'white' }}>
                        {p.productName || 'Talep'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                        {p.requestDate || p.createdAt || ''}
                      </Typography>
                    </Box>
                    <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.25)', mt: 0.5 }} />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Hızlı Erişim Butonları kaldırıldı (Satınalma rolünde ana sayfada görünmesin) */}

      {/* Bütçe Analizi */}
      <Grid container spacing={3} sx={{ mb: 8, alignItems: 'stretch' }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            background: 'white',
            border: '1px solid #e0e0e0',
            height: '100%'
          }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#006C7F', display: 'flex', alignItems: 'center' }}>
              <AssessmentIcon sx={{ mr: 1 }} />
              Bütçe Analizi ve Kullanım Durumu
            </Typography>
            
            {/* Bütçe Kullanım Progress Bar */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#006C7F' }}>
                  Bütçe Kullanımı
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#006C7F' }}>
                  %{procurementData.budgetUtilization.toFixed(1)}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={procurementData.budgetUtilization} 
                sx={{ 
                  height: 12, 
                  borderRadius: 6,
                  bgcolor: '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: '#006C7F',
                    borderRadius: 6
                  }
                }} 
              />
            </Box>

            <Grid container spacing={2}>
              {budgetItems.map((b, idx) => {
                const used = b.used ?? 0;
                const remaining = Math.max(0, (b.amount ?? 0) - used);
                const percent = b.amount > 0 ? Math.min(100, (used / b.amount) * 100) : 0;
                return (
                  <Grid key={idx} item xs={12} sm={4}>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e0e0e0'
                }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: b.color }}>
                        {b.name}
                  </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                        <Typography variant="caption">Harcanan</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#D32F2F' }}>{formatCurrency(used)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption">Kalan</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#2E7D32' }}>{formatCurrency(remaining)}</Typography>
                </Box>
                      <Box sx={{ width: '100%', height: 10, backgroundColor: '#e0e0e0', borderRadius: 5, overflow: 'hidden', mt: 0.5 }}>
                        <Box sx={{ width: `${percent}%`, height: '100%', backgroundColor: b.color }} />
                </Box>
                </Box>
              </Grid>
                );
              })}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
          <Paper sx={{ 
            p: 2, 
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            background: 'white',
            border: '1px solid #e0e0e0',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            flex: 1
          }}>
            <Typography variant="h6" sx={{ 
              mb: 2, 
              fontWeight: 600, 
              color: '#006C7F', 
              display: 'flex', 
              alignItems: 'center',
              fontSize: '1.1rem'
            }}>
              <TrendingUpIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
              Performans Özeti
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 1.5,
              flex: 1,
              overflow: 'hidden'
            }}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 2,
                backgroundColor: '#f8f9fa',
                textAlign: 'center',
                border: '1px solid #e0e0e0',
                minHeight: '60px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <Typography variant="subtitle2" sx={{ 
                  fontWeight: 600, 
                  color: '#006C7F',
                  fontSize: '0.85rem',
                  mb: 0.5
                }}>
                  Toplam İşlem
                </Typography>
                <Typography variant="h5" sx={{ 
                  fontWeight: 700, 
                  color: '#006C7F',
                  fontSize: '1.5rem'
                }}>
                  {procurementData.totalTenders + procurementData.totalDirectProcurements}
                </Typography>
              </Box>
              
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 2,
                backgroundColor: '#f8f9fa',
                textAlign: 'center',
                border: '1px solid #e0e0e0',
                minHeight: '60px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <Typography variant="subtitle2" sx={{ 
                  fontWeight: 600, 
                  color: '#006C7F',
                  fontSize: '0.85rem',
                  mb: 0.5
                }}>
                  Ortalama İşlem Değeri
                </Typography>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700, 
                  color: '#1976D2',
                  fontSize: '1.1rem',
                  wordBreak: 'break-word'
                }}>
                  {formatCurrency(procurementData.totalBudget / Math.max(1, procurementData.totalTenders + procurementData.totalDirectProcurements))}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Stok Durumu (Sadece Görüntüleme) */}
      <Paper sx={{ 
        p: 3, 
        borderRadius: 2,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        background: 'white',
        border: '1px solid #e0e0e0',
        mt: 4
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ 
            color: '#006C7F', 
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center'
          }}>
            <InventoryIcon sx={{ mr: 1 }} />
            Stok Durumu (Görüntüleme)
        </Typography>
          <Chip 
            label={`${stockItems.length} Ürün`} 
            color="primary" 
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        </Box>
        
        <TableContainer sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ 
                background: '#006C7F',
                color: 'white'
              }}>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Ürün Adı</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Kategori</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'white' }}>Stok Miktarı</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'white' }}>Birim Fiyat</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'white' }}>Toplam Değer</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stockItems.slice(0, 10).map((item, index) => {
                const totalValue = (item.averageUnitPrice || 0) * (item.totalStockQuantity || 0);
                return (
                  <TableRow 
                    key={index}
                    sx={{ 
                      '&:nth-of-type(odd)': { backgroundColor: '#f8f9fa' },
                      '&:hover': { backgroundColor: '#e3f2fd' }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600 }}>{item.productName || 'Bilinmiyor'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={item.productCategoryName || 'Bilinmiyor'} 
                        size="small" 
                        variant="outlined"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {formatQuantity(item.totalStockQuantity)} {item.measurementUnitName || ''}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {formatCurrency(item.averageUnitPrice)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                      {formatCurrency(totalValue)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        
        {stockItems.length > 10 && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
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
              Tüm Stok Durumunu Görüntüle
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default SatinalmaHomePage;
