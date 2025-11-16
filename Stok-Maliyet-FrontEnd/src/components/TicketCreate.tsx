import React, { useEffect, useState } from 'react'; 
import { Box, Button, Container, FormControl, InputLabel, TextField, Typography } from '@mui/material';
import axios from 'axios';
import SuccessMessage from './SuccessMessage';

interface TicketType {
  id: number;
  name: string;
  unitPrice: number;
}

const TicketForm: React.FC = () => {
  const [ticketDate, setTicketDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [ticketMap, setTicketMap] = useState<{ [key: number]: number }>({});
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [ticketInputs, setTicketInputs] = useState<{ [key: number]: string }>({});
  const [totalPerson, setTotalPerson] = useState<string>('');
  const [showMessage, setShowMessage] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'warning' | 'info'>('success');

  useEffect(() => {
    axios.get('/v1/ticketType/all')
      .then(res => setTicketTypes(res.data.data || []))
      .catch(err => console.error("Ticket type fetch error:", err));
  }, []);


const handleQuantityChange = (ticketTypeId: number, value: string) => {
  // Boşsa sil
  if (value === '') {
    setTicketInputs(prev => {
      const newInputs = { ...prev };
      delete newInputs[ticketTypeId];
      return newInputs;
    });
    setTicketMap(prev => {
      const newMap = { ...prev };
      delete newMap[ticketTypeId];
      return newMap;
    });
    return;
  }

  // Başta sıfır var mı kontrol et
  let newValue = value;
  if (value.length > 1 && value.startsWith('0')) {
    newValue = value.replace(/^0+/, '');
    if (newValue === '') newValue = '0'; // Mesela "000" yazılırsa 0 olsun
  }

  // Sadece rakamlara izin ver (isteğe bağlı)
  if (!/^\d*$/.test(newValue)) {
    // Eğer rakam değilse hiçbir şey yapma
    return;
  }

  setTicketInputs(prev => ({ ...prev, [ticketTypeId]: newValue }));

  // Sayısal değere çevir ve ticketMap'e yaz
  const quantity = parseInt(newValue);
  if (!isNaN(quantity) && quantity >= 0) {
    setTicketMap(prev => ({ ...prev, [ticketTypeId]: quantity }));
  }
};

  const handleSubmit = async () => {
    if (!ticketDate) {
      setMessageText('Lütfen bir tarih seçin.');
      setMessageType('warning');
      setShowMessage(true);
      return;
    }

    if (!totalPerson || parseInt(totalPerson) <= 0) {
      setMessageText('Kaç kişilik yemek yapıldığı girilmelidir.');
      setMessageType('error');
      setShowMessage(true);
      return;
    }

    const requestBody = {
      ticketMap,
      ticketDate,
      totalPerson: parseInt(totalPerson),
    };

    try {
      const response = await axios.post('/v1/ticketSalesDetail/create', requestBody);
      
      setMessageText('Fiş başarıyla kaydedildi.');
      setMessageType('success');
      setShowMessage(true);
      setTicketMap({});
      setTicketInputs({});
      setTotalPerson('');
      setTicketDate(new Date().toISOString().slice(0, 10));
    } catch (error: any) {
      console.error('Sunucu hatası:', error);
      setMessageText('Fiş kaydedilemedi: ' + (error.response?.data?.data || 'Sunucu hatası'));
      setMessageType('error');
      setShowMessage(true);
    }
  };

  const handleResetByDate = async () => {
    if (!ticketDate) {
      setMessageText('Lütfen bir tarih seçin.');
      setMessageType('warning');
      setShowMessage(true);
      return;
    }

    if (!window.confirm(`Seçilen tarih (${ticketDate}) için tüm fiş kayıtları silinecek. Emin misiniz?`)) {
      return;
    }

    try {
      await axios.delete(`/v1/ticketSalesDetail/deleteByDate?date=${ticketDate}`);
      setMessageText('Seçilen tarih için tüm fiş kayıtları başarıyla silindi.');
      setMessageType('success');
      setShowMessage(true);
      setTicketMap({});
      setTicketInputs({});
      setTotalPerson('');
    } catch (error: any) {
      console.error('Sunucu hatası:', error);
      setMessageText('Fiş kayıtları silinemedi: ' + (error.response?.data?.data || 'Sunucu hatası'));
      setMessageType('error');
      setShowMessage(true);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 5, p: 4, boxShadow: 3, borderRadius: 3, bgcolor: '#fafafa' }}>
        <Typography variant="h5" align="center" fontWeight={600} mb={3}>
          Fiş Giriş Formu
        </Typography>

        <TextField
          label="Fiş Tarihi"
          type="date"
          value={ticketDate}
          onChange={(e) => setTicketDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
          sx={{ mb: 3 }}
        />

        <Box sx={{ 
          mb: 3, 
          p: 2, 
          bgcolor: '#e3f2fd', 
          borderRadius: 2, 
          border: '2px solid #2196f3',
          borderStyle: 'dashed'
        }}>
          <TextField
            label="Kaç Kişilik Yemek Yapıldığı"
            type="number"
            value={totalPerson}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || /^\d+$/.test(value)) {
                setTotalPerson(value);
              }
            }}
            required
            fullWidth
            InputProps={{ inputProps: { min: 1 } }}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                bgcolor: 'white',
                '&:hover fieldset': {
                  borderColor: '#2196f3',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#2196f3',
                },
              },
            }}
          />
        </Box>

        {ticketTypes.map((type) => (
          <Box key={type.id} sx={{ mb: 2 }}>
            <Typography>{type.name} - {type.unitPrice}₺</Typography>
            <TextField
              type="number"
              label="Adet"
              value={ticketInputs[type.id] ?? ''}
              onChange={(e) => handleQuantityChange(type.id, e.target.value)}
              fullWidth
              inputProps={{ min: 0 }}
            />
          </Box>
        ))}

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Kaydet
          </Button>
          <Button variant="outlined" color="error" onClick={handleResetByDate}>
            Seçilen Günü Sıfırla
          </Button>
        </Box>
      </Box>
      
      <SuccessMessage
        open={showMessage}
        onClose={() => setShowMessage(false)}
        message={messageText}
        type={messageType}
      />
    </Container>
  );
};

export default TicketForm;
