import React from 'react';
import { Dialog, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

interface SuccessMessageProps {
  open: boolean;
  onClose: () => void;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ 
  open, 
  onClose, 
  message, 
  type = 'success' 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: 40 }} />;
      case 'error':
        return <ErrorIcon sx={{ color: '#F44336', fontSize: 40 }} />;
      case 'warning':
        return <WarningIcon sx={{ color: '#FF9800', fontSize: 40 }} />;
      case 'info':
        return <InfoIcon sx={{ color: '#2196F3', fontSize: 40 }} />;
      default:
        return <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: 40 }} />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'success':
        return 'Başarılı';
      case 'error':
        return 'Hata';
      case 'warning':
        return 'Uyarı';
      case 'info':
        return 'Bilgi';
      default:
        return 'Başarılı';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          backgroundColor: '#2C2C2C',
          color: 'white',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }
      }}
    >
      <DialogContent sx={{ textAlign: 'center', py: 4 }}>
        <Box sx={{ mb: 2 }}>
          {getIcon()}
        </Box>
        <Typography variant="h6" sx={{ color: 'white', mb: 1, fontWeight: 600 }}>
          {getTitle()}
        </Typography>
        <Typography variant="body1" sx={{ color: '#E0E0E0' }}>
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            backgroundColor: '#9C27B0',
            color: 'white',
            borderRadius: 2,
            px: 4,
            py: 1,
            '&:hover': {
              backgroundColor: '#7B1FA2',
            }
          }}
        >
          Tamam
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SuccessMessage;
