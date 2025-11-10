import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, LinearProgress, Typography, Box, Tooltip, IconButton, Badge, Popover, List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import axios from 'axios';

interface DepotItem {
  productName: string;
  measurementType: string;
  totalCarryOver: number;
  totalTender: number;
  totalDirectProcurement: number;
  totalExit: number;
  remainingQuantity: number;
  productResponse?: {
    criticalLevel: number;
    measurementType: string;
    name: string;
    category: string;
  };
}

const formatNumber = (num: number | undefined | null): string => {
  if (num === undefined || num === null) return '0';
  return num.toLocaleString('tr-TR');
};

const getColor = (percentage: number): string => {
  const red = Math.min(255, Math.floor((100 - percentage) * 2.55));
  const green = Math.min(255, Math.floor(percentage * 2.55));
  return `rgb(${red}, ${green}, 50)`;
};

const DepotTable: React.FC = () => {
  const [data, setData] = useState<DepotItem[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
  const token =
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    sessionStorage.getItem('token') || '';

  axios.get<{ data: DepotItem[] }>('http://localhost:8080/v1/materialEntry/details', {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(response => {
      let items = response.data.data.map(item => ({
        ...item,
        productName: item.productResponse?.name || '',
        measurementType: item.productResponse?.measurementType || '',
      }));

      // Bildirimleri oluştur
      const newAlerts: string[] = [];
      const criticalItems: DepotItem[] = [];
      const nearCriticalItems: DepotItem[] = [];
      const normalItems: DepotItem[] = [];

      items.forEach(item => {
        const critical = item.productResponse?.criticalLevel || 0;
        if (item.remainingQuantity < critical) {
          newAlerts.push(`${item.productName} kritik seviyenin altında! (Kalan: ${item.remainingQuantity}, Kritik: ${critical})`);
          criticalItems.push(item);
        } else if (item.remainingQuantity < critical + 100) {
          newAlerts.push(`${item.productName} kritik seviyeye yaklaştı. (Kalan: ${item.remainingQuantity}, Kritik: ${critical})`);
          nearCriticalItems.push(item);
        } else {
          normalItems.push(item);
        }
      });

      // Önce kritik, sonra yaklaşan, sonra normal olanlar gösterilecek şekilde sırala
      const sortedItems = [...criticalItems, ...nearCriticalItems, ...normalItems];
      setData(sortedItems);
      setAlerts(newAlerts);

      // Otomatik bildirimi aç
      if (newAlerts.length > 0) {
        const fakeButton = document.getElementById('notify-button');
        if (fakeButton) {
          setAnchorEl(fakeButton as HTMLElement);
        }
      }
    })
    .catch(error => console.error('Veri alınamadı', error));
}, []);


  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Bildirim Butonu */}
      <Box sx={{ position: 'absolute', top: 8, right: 16, zIndex: 10 }}>
        <IconButton id="notify-button" onClick={handleClick} color="primary">
          <Badge badgeContent={alerts.length} color="error">
            <NotificationsActiveIcon />
          </Badge>
        </IconButton>
      </Box>

      {/* Bildirim Popup */}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { p: 2, width: 350, backgroundColor: '#fff3e0' }
        }}
      >
        <Typography variant="h6" gutterBottom>
          Kritik Stok Uyarıları
        </Typography>
        {alerts.length > 0 ? (
          <List dense>
            {alerts.map((msg, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <WarningAmberIcon color="warning" />
                </ListItemIcon>
                <ListItemText primary={msg} />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2">Uyarı yok.</Typography>
        )}
      </Popover>

      {/* Ana Tablo  21a silinecek */ }
      <TableContainer component={Paper} sx={{ backgroundColor: '#f5f5f5', borderRadius: 2 }}>
        <Typography variant="h5" align="center" gutterBottom sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
          ANA SAYFA DEPO TOPLAM TUTARLARI
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' , textAlign:"center" }}>Sıra No</TableCell>
              <TableCell sx={{ fontWeight: 'bold' , textAlign:"center" }}>Malzeme Adı</TableCell>
              <TableCell sx={{ fontWeight: 'bold' , textAlign:"center" }}>Ölçü Birimi</TableCell>
              <TableCell sx={{ fontWeight: 'bold' , textAlign:"center" }}>Kritik Seviye</TableCell>
              <TableCell sx={{ fontWeight: 'bold' , textAlign:"center" }}>Önceki Yıldan Devir ile Depoya Giren</TableCell>
              <TableCell sx={{ fontWeight: 'bold' , textAlign:"center" }}>22D ile Doğrudan Temin ile Depoya Giren </TableCell>
              <TableCell sx={{ fontWeight: 'bold' , textAlign:"center" }}>19.Madde Açık İhale ile Depoya Giren</TableCell>
              <TableCell sx={{ fontWeight: 'bold' , textAlign:"center" }}>İhale İle Alınan Toplam Miktar</TableCell>
              <TableCell sx={{ fontWeight: 'bold' , textAlign:"center" }}>Toplam Alınan Miktar</TableCell>
              <TableCell sx={{ fontWeight: 'bold' , textAlign:"center" }}>Toplam Çıkış</TableCell>
              <TableCell sx={{ fontWeight: 'bold' , textAlign:"center" }}>Depoda Kalan Miktar</TableCell>
              <TableCell sx={{ fontWeight: 'bold' , textAlign:"center" }}>Stok Durumu (%)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => {
              const toplamAlim = (row.totalCarryOver ?? 0) + (row.totalDirectProcurement ?? 0) + (row.totalTender ?? 0);
              const stokYuzdesi = toplamAlim > 0 ? ((row.remainingQuantity ?? 0) / toplamAlim) * 100 : 0;
              const color = getColor(stokYuzdesi);

              return (
                <TableRow key={index}>
                  <TableCell sx={{textAlign:'center'}}>{index + 1}</TableCell>
                  <TableCell sx={{textAlign:'center'}}>{row.productName}</TableCell>
                  <TableCell sx={{textAlign:'center'}}>{row.measurementType}</TableCell>
                  <TableCell sx={{textAlign:'center'}}>{row.productResponse?.criticalLevel}</TableCell>
                  <TableCell sx={{textAlign:'center'}}>{formatNumber(row.totalCarryOver ?? 0)}</TableCell>
                  <TableCell sx={{textAlign:'center'}}>{formatNumber(row.totalDirectProcurement ?? 0)}</TableCell>
                  <TableCell sx={{textAlign:'center'}}>{formatNumber(row.totalTender ?? 0)}</TableCell>
                  <TableCell sx={{textAlign:'center'}}>{formatNumber(row.totalTender ?? 0)}</TableCell>
                  <TableCell sx={{textAlign:'center'}}>{formatNumber(toplamAlim ?? 0)}</TableCell>
                  <TableCell sx={{textAlign:'center'}}>{formatNumber(row.totalExit ?? 0)}</TableCell>
                  <TableCell sx={{textAlign:'center'}}>{formatNumber(row.remainingQuantity ?? 0)}</TableCell>
                  <TableCell sx={{textAlign:'center'}}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {stokYuzdesi <= 20 && (
                        <Tooltip title="Stok %20'nin altına düştü!" arrow>
                          <WarningAmberIcon sx={{ color: '#FFA726' }} />
                        </Tooltip>
                      )}
                      <Box width="100%">
                        <Typography variant="body2">
                          {stokYuzdesi.toFixed(0)}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={stokYuzdesi}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: '#e0e0e0',
                            '& .MuiLinearProgress-bar': { backgroundColor: color }
                          }}
                        />
                      </Box>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default DepotTable;
