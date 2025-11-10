import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import MaterialEntry from './components/MaterialEntry';
import MaterialExit from './components/MaterialExit';
import MaterialList from './components/MaterialList';
import StockSummary from './components/StockSummary';
import FisRaporu from './components/FisRaporu';
import LoginPage from './components/LoginPage';
import logo from './assets/inonulogo.png';
import { ThemeProvider, createTheme } from '@mui/material';
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  Button,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import DailyStockExitForm from './components/DailyStockExitForm';
import WeeklyMaterialRequest from './components/WeeklyMaterialRequest';
import HomeIcon from '@mui/icons-material/Home';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ListIcon from '@mui/icons-material/List';
import AddBoxIcon from '@mui/icons-material/AddBox';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddIcon from '@mui/icons-material/Add';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MaterialDefinition from './components/MaterialDefinition';
import AdminHomePage from './components/HomePage';
import YemekhaneHomePage from './components/YemekhaneHomePage';
import DepoHomePage from './components/DepoHomePage';
import SatinalmaHomePage from './components/SatinalmaHomePage';
import CreateMaterial from './components/createMaterial';
import MaterialDemandList from './components/MaterialDemandList';
import CreateTenderForm from './components/CreateTenderForm';
import TenderList from './components/TenderList';
import UpdateMaterial from './components/MaterialUpdateForm';
import TicketForm from './components/TicketCreate';
import TicketTypeList from './components/CreateTicketType';
import OtherActions from './components/OtherActions';
import BudgetForm from './components/BudgetList';
import PurchaseForm from './components/PurchaseForm';
import CategoryForm from './components/CategoryForm';
import PurchaseType from './components/PurchaseType';
import MeasurementTypeForm from './components/MeasurementTypeForm';
import PurchaseUnit from './components/PurcasedUnitForm';
import DirectProcurement from './components/CreateDirectProcurement';
import DirectProcurementTable from './components/directProcurementList';
import ReportList from './components/CreateReport';
import UserManagement from './components/UserManagement';
import YemekReceteleri from './components/YemekReceteleri';


const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
});

// Role göre ana sayfa seçimi
const getHomePageComponent = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return AdminHomePage;
    case 'YEMEKHANE':
      return YemekhaneHomePage;
    case 'DEPO':
      return DepoHomePage;
    case 'SATINALMA':
      return SatinalmaHomePage;
    default:
      return AdminHomePage;
  }
};

// Kullanıcı profil bileşeni
interface UserProfileProps {
  user: any;
  onLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onLogout }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    onLogout();
    handleClose();
  };

  // Role göre renk ve ikon belirle
  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return { color: '#006C7F', label: 'Yönetici', icon: 'A' };
      case 'SATINALMA':
        return { color: '#006C7F', label: 'Satınalma', icon: 'S' };
      case 'DEPO':
        return { color: '#006C7F', label: 'Depo', icon: 'D' };
      case 'YEMEKHANE':
        return { color: '#006C7F', label: 'Yemekhane', icon: 'Y' };
      default:
        return { color: '#006C7F', label: 'Kullanıcı', icon: 'U' };
    }
  };

  const roleInfo = getRoleInfo(user?.role || '');

  return (
    <>
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          cursor: 'pointer',
          padding: '8px 16px',
          borderRadius: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderColor: 'rgba(255, 255, 255, 0.25)'
          }
        }}
        onClick={handleClick}
      >
        <Avatar 
          sx={{ 
            width: 32, 
            height: 32, 
            bgcolor: roleInfo.color,
            color: 'white',
            fontSize: '14px',
            fontWeight: 700,
            border: '2px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          {roleInfo.icon}
        </Avatar>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'white', 
              fontWeight: 500, 
              lineHeight: 1.2,
              fontSize: '0.875rem'
            }}
          >
            {user?.username || 'Kullanıcı'}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.75rem',
              fontWeight: 400
            }}
          >
            {roleInfo.label}
          </Typography>
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            border: '1px solid rgba(0,0,0,0.1)',
            backgroundColor: 'white'
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem 
          onClick={handleClose}
          sx={{ 
            py: 2,
            px: 2,
            borderBottom: '1px solid rgba(0,0,0,0.1)',
            '&:hover': {
              backgroundColor: 'rgba(0, 108, 127, 0.08)'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
            <Avatar 
              sx={{ 
                width: 36, 
                height: 36, 
                bgcolor: roleInfo.color,
                fontSize: '14px',
                fontWeight: 700
              }}
            >
              {roleInfo.icon}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#333' }}>
                {user?.username || 'Kullanıcı'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#666' }}>
                {roleInfo.label}
              </Typography>
            </Box>
          </Box>
        </MenuItem>
        
        <MenuItem 
          onClick={handleLogout}
          sx={{ 
            py: 1.5,
            px: 2,
            color: '#006C7F',
            '&:hover': {
              backgroundColor: 'rgba(0, 108, 127, 0.08)'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              width: 24, 
              height: 24, 
              borderRadius: '4px', 
              backgroundColor: '#006C7F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Typography sx={{ fontSize: '12px', color: 'white', fontWeight: 'bold' }}>
                ×
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Çıkış Yap
            </Typography>
          </Box>
        </MenuItem>
      </Menu>
    </>
  );
};

// İçerik bileşeni
const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout, loading } = useAuth();

  // Loading durumunda spinner göster
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Typography>Yükleniyor...</Typography>
      </Box>
    );
  }

  // Kullanıcı giriş yapmamışsa login sayfasını göster
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Role göre menü butonlarını oluştur
  const getMenuButtons = (role: string) => {
    const HomePageComponent = getHomePageComponent(role);
    
    switch (role) {
      case 'ADMIN':
  return (
          <>
        <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
          {/* Sol Taraf Butonlar */}
          <Box sx={{ 
            width: '250px', 
            bgcolor: 'white',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            className: 'side-panel'
          }}>
            <nav>
              <ul style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '1rem', 
                listStyle: 'none', 
                margin: 0, 
                padding: 0
              }}>
                <li>
                  <Button
                    variant="contained"
                    startIcon={<HomeIcon />}
                    onClick={() => navigate('/')}
                    className={location.pathname === '/' ? 'active' : ''}
                  >
                    Ana Sayfa
                  </Button>
                </li>
                <li>
                  <Button
                    variant="contained"
                    startIcon={<AssessmentIcon />}
                    onClick={() => navigate('/stok-durumu')}
                    className={location.pathname === '/stok-durumu' ? 'active' : ''}
                  >
                    Stok Durumu
                  </Button>
                </li>
                <li>
                  <Button
                    variant="contained"
                    startIcon={<ListIcon />}
                    onClick={() => navigate('/malzeme-listesi')}
                    className={location.pathname === '/malzeme-listesi' ? 'active' : ''}
                  >
                        Stok Listesi
                  </Button>
                </li>
                <li>
                  <Button
                    variant="contained"
                    startIcon={<ReceiptIcon />}
                    onClick={() => navigate('/fis-raporu')}
                    className={location.pathname === '/fis-raporu' ? 'active' : ''}
                  >
                    Fiş Raporu
                  </Button>
                </li>
                <li>
                  <Button
                    variant="contained"
                    startIcon={<ReceiptIcon />}
                    onClick={() => navigate('/talep-listesi')}
                    className={location.pathname === '/talep-listesi' ? 'active' : ''}
                  >
                    Malzeme Talep Listesi
                  </Button>
                </li>
                <li>
                  <Button
                    variant="contained"
                    startIcon={<ReceiptIcon />}
                    onClick={() => navigate('/fiş-oluşturma')}
                    className={location.pathname === '/fiş-oluşturma' ? 'active' : ''}
                  >
                    Fiş Kayıt Formu
                  </Button>
                </li>
                <li>
                  <Button
                    variant="contained"
                    startIcon={<ReceiptIcon />}
                    onClick={() => navigate('/doğrudan-temin')}
                    className={location.pathname === '/doğrudan-temin' ? 'active' : ''}
                  >
                    Doğrudan Temin İle Malzeme Girişi
                  </Button>
                </li>
                <li>
                  <Button
                    variant="contained"
                    startIcon={<ReceiptIcon />}
                    onClick={() => navigate('/doğrudan-temin-listesi')}
                    className={location.pathname === '/doğrudan-temin-listesi' ? 'active' : ''}
                  >
                    Doğrudan Temin Malzeme Listesi
                  </Button>
                </li>
                <li>
                  <Button
                    variant="contained"
                    startIcon={<MenuBookIcon />}
                    onClick={() => navigate('/yemek-receteleri')}
                    className={location.pathname === '/yemek-receteleri' ? 'active' : ''}
                  >
                    Yemek Reçeteleri
                  </Button>
                </li>
              </ul>
            </nav>
          </Box>

          {/* Ana İçerik */}
          <Box sx={{ flexGrow: 1, p: 3 }}>
            <Routes>
                  <Route path="/" element={<HomePageComponent />} />
              <Route path="/fis-raporu" element={<FisRaporu />} />
              <Route path="/diğer-işlemler" element={<OtherActions />} />
              <Route path="/fiş-tipi-oluştur" element={<TicketTypeList />} />
              <Route path="/butce-olustur" element={<BudgetForm />} />
              <Route path="/alım-şekli-oluştur" element={<PurchaseForm />} />
              <Route path='/ölçü-birimi-oluştur' element={<MeasurementTypeForm />} />
              <Route path="/kategori-oluştur" element={<CategoryForm />} />
              <Route path="/alım-yapılan-birimi-olustur" element={<PurchaseUnit />} />
              <Route path="/alım-türü-oluştur" element={<PurchaseType />} />
              <Route path='/doğrudan-temin' element={<DirectProcurement/>}/>
              <Route path="/doğrudan-temin-listesi" element={<DirectProcurementTable />} />
              <Route path="/update-material" element={<UpdateMaterial/>} />
              <Route path="/stok-durumu" element={<StockSummary />} />
              <Route path="/rapor-listesi" element={<ReportList />} />
              <Route path="/malzeme-listesi" element={<MaterialList />} />
              <Route path="/malzeme-giris" element={<MaterialEntry />} />
              <Route path="/malzeme-cikis" element={<MaterialExit />} />
              <Route path="/gunluk-depo-cikis" element={<DailyStockExitForm />} />
              <Route path="/haftalik-malzeme-talep" element={<WeeklyMaterialRequest />} />
              <Route path="/create-material" element={<CreateMaterial />} />
              <Route path="/talep-listesi" element={<MaterialDemandList />} />
              <Route path="/ihale-oluşturma" element={<CreateTenderForm />} />
              <Route path="/fiş-oluşturma" element={<TicketForm />} />
              <Route path="/ihale-listesi" element={<TenderList />} />
              <Route path="/malzeme-olusturma" element={<MaterialDefinition />} />
              <Route path="/kullanici-yonetimi" element={<UserManagement />} />
              <Route path="/yemek-receteleri" element={<YemekReceteleri />} />
            </Routes>
          </Box>

          {/* Sağ Taraf Butonlar */}
          <Box sx={{ 
            width: '250px', 
            bgcolor: 'white',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            className: 'side-panel'
          }}>
            <nav>
              <ul style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '1rem', 
                listStyle: 'none', 
                margin: 0, 
                padding: 0
              }}>
                <li>
                  <Button
                    variant="contained"
                    startIcon={<RemoveCircleIcon />}
                    onClick={() => navigate('/malzeme-cikis')}
                    className={location.pathname === '/malzeme-cikis' ? 'active' : ''}
                  >
                    Malzeme Çıkış
                  </Button>
                </li>
                <li>
                  <Button
                    variant="contained"
                    startIcon={<ExitToAppIcon />}
                    onClick={() => navigate('/gunluk-depo-cikis')}
                    className={location.pathname === '/gunluk-depo-cikis' ? 'active' : ''}
                  >
                    Depo Çıkış
                  </Button>
                </li>
                <li>
                  <Button
                    variant="contained"
                    startIcon={<AssignmentIcon />}
                    onClick={() => navigate('/haftalik-malzeme-talep')}
                    className={location.pathname === '/haftalik-malzeme-talep' ? 'active' : ''}
                  >
                    Haftalık Malzeme Talep
                  </Button>
                </li>
                <li>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/malzeme-olusturma')}
                    className={location.pathname === '/malzeme-olusturma' ? 'active' : ''}
                  >
                    Malzeme Oluşturma
                  </Button>
                </li>
                <li>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/ihale-oluşturma')}
                    className={location.pathname === '/ihale-oluşturma' ? 'active' : ''}
                  >
                    İhale Oluşturma
                  </Button>
                </li>
                <li>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/ihale-listesi')}
                    className={location.pathname === '/ihale-listesi' ? 'active' : ''}
                  >
                    İhale Lİstesi
                  </Button>
                </li>
                <li>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/rapor-listesi')}
                    className={location.pathname === '/rapor-listesi' ? 'active' : ''}
                  >
                    Rapor İşlemleri
                  </Button>
                </li>
                 <li>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/diğer-işlemler')}
                    className={location.pathname === '/diğer-işlemler' ? 'active' : ''}
                  >
                      Diğer İşlemler
                   </Button>
                </li>
              </ul>
            </nav>
          </Box>
        </Box>
          </>
        );
      
      case 'YEMEKHANE':
        return (
          <>
            <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
              {/* Sol Taraf Butonlar */}
              <Box sx={{ 
                width: '250px', 
                bgcolor: 'white',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                className: 'side-panel'
              }}>
                <nav>
                  <ul style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '1rem', 
                    listStyle: 'none', 
                    margin: 0, 
                    padding: 0
                  }}>
                    <li>
                      <Button
                        variant="contained"
                        startIcon={<HomeIcon />}
                        onClick={() => navigate('/')}
                        className={location.pathname === '/' ? 'active' : ''}
                      >
                        Ana Sayfa
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="contained"
                        startIcon={<ReceiptIcon />}
                        onClick={() => navigate('/talep-listesi')}
                        className={location.pathname === '/talep-listesi' ? 'active' : ''}
                      >
                        Malzeme Talep Listesi
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="contained"
                        startIcon={<AssignmentIcon />}
                        onClick={() => navigate('/haftalik-malzeme-talep')}
                        className={location.pathname === '/haftalik-malzeme-talep' ? 'active' : ''}
                      >
                        Haftalık Malzeme Talep
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="contained"
                        startIcon={<ReceiptIcon />}
                        onClick={() => navigate('/fiş-oluşturma')}
                        className={location.pathname === '/fiş-oluşturma' ? 'active' : ''}
                      >
                        Fiş Kayıt Formu
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="contained"
                        startIcon={<ReceiptIcon />}
                        onClick={() => navigate('/fis-raporu')}
                        className={location.pathname === '/fis-raporu' ? 'active' : ''}
                      >
                        Fiş Raporu
                      </Button>
                    </li>
                  </ul>
                </nav>
              </Box>

              {/* Ana İçerik */}
              <Box sx={{ flexGrow: 1, p: 3 }}>
                <Routes>
                  <Route path="/" element={<HomePageComponent />} />
                  <Route path="/fis-raporu" element={<FisRaporu />} />
                  <Route path="/fiş-tipi-oluştur" element={<TicketTypeList />} />
                  <Route path="/gunluk-depo-cikis" element={<DailyStockExitForm />} />
                  <Route path="/haftalik-malzeme-talep" element={<WeeklyMaterialRequest />} />
                  <Route path="/talep-listesi" element={<MaterialDemandList />} />
                  <Route path="/fiş-oluşturma" element={<TicketForm />} />
                </Routes>
              </Box>
            </Box>
          </>
        );

      case 'DEPO':
        return (
          <>
            <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
              {/* Sol Taraf Butonlar */}
              <Box sx={{ 
                width: '250px', 
                bgcolor: 'white',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                className: 'side-panel'
              }}>
                <nav>
                  <ul style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '1rem', 
                    listStyle: 'none', 
                    margin: 0, 
                    padding: 0
                  }}>
                    <li>
                      <Button
                        variant="contained"
                        startIcon={<HomeIcon />}
                        onClick={() => navigate('/')}
                        className={location.pathname === '/' ? 'active' : ''}
                      >
                        Ana Sayfa
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/malzeme-olusturma')}
                        className={location.pathname === '/malzeme-olusturma' ? 'active' : ''}
                      >
                        Malzeme Tanımlama
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="contained"
                        startIcon={<AddBoxIcon />}
                        onClick={() => navigate('/malzeme-giris')}
                        className={location.pathname === '/malzeme-giris' ? 'active' : ''}
                      >
                        Malzeme Girişi
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="contained"
                        startIcon={<RemoveCircleIcon />}
                        onClick={() => navigate('/malzeme-cikis')}
                        className={location.pathname === '/malzeme-cikis' ? 'active' : ''}
                      >
                        Malzeme Çıkışı
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="contained"
                        startIcon={<ListIcon />}
                        onClick={() => navigate('/malzeme-listesi')}
                        className={location.pathname === '/malzeme-listesi' ? 'active' : ''}
                      >
                        Malzeme Listesi
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="contained"
                        startIcon={<AssessmentIcon />}
                        onClick={() => navigate('/stok-durumu')}
                        className={location.pathname === '/stok-durumu' ? 'active' : ''}
                      >
                        Stok Durumu
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="contained"
                        startIcon={<AssessmentIcon />}
                        onClick={() => navigate('/rapor-listesi')}
                        className={location.pathname === '/rapor-listesi' ? 'active' : ''}
                      >
                        Stok Raporu
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="contained"
                        startIcon={<ExitToAppIcon />}
                        onClick={() => navigate('/gunluk-depo-cikis')}
                        className={location.pathname === '/gunluk-depo-cikis' ? 'active' : ''}
                      >
                        Günlük Stok Çıkış
                      </Button>
                    </li>
                  <li>
                    <Button
                      variant="contained"
                      startIcon={<AssignmentIcon />}
                      onClick={() => navigate('/haftalik-malzeme-talep')}
                      className={location.pathname === '/haftalik-malzeme-talep' ? 'active' : ''}
                    >
                      Haftalık Malzeme Talep
                    </Button>
                  </li>
                  </ul>
                </nav>
              </Box>

              {/* Ana İçerik */}
              <Box sx={{ flexGrow: 1, p: 3 }}>
                <Routes>
                  <Route path="/" element={<HomePageComponent />} />
                  <Route path="/stok-durumu" element={<StockSummary />} />
                  <Route path="/rapor-listesi" element={<ReportList />} />
                  <Route path="/malzeme-listesi" element={<MaterialList />} />
                  <Route path="/malzeme-giris" element={<MaterialEntry />} />
                  <Route path="/malzeme-cikis" element={<MaterialExit />} />
                  <Route path="/gunluk-depo-cikis" element={<DailyStockExitForm />} />
                  <Route path="/haftalik-malzeme-talep" element={<WeeklyMaterialRequest />} />
                  <Route path="/create-material" element={<CreateMaterial />} />
                  <Route path="/malzeme-olusturma" element={<MaterialDefinition />} />
                </Routes>
              </Box>
            </Box>
          </>
        );

      case 'SATINALMA':
        return (
          <>
            <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
              {/* Sol Taraf Butonlar */}
              <Box sx={{ 
                width: '250px', 
                bgcolor: 'white',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                className: 'side-panel'
              }}>
                <nav>
                  <ul style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '1rem', 
                    listStyle: 'none', 
                    margin: 0, 
                    padding: 0
                  }}>
                    <li>
                      <Button
                        variant="contained"
                        startIcon={<HomeIcon />}
                        onClick={() => navigate('/')}
                        className={location.pathname === '/' ? 'active' : ''}
                      >
                        Ana Sayfa
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="contained"
                        startIcon={<ListIcon />}
                        onClick={() => navigate('/malzeme-listesi')}
                        className={location.pathname === '/malzeme-listesi' ? 'active' : ''}
                      >
                        Malzeme Listesi
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="contained"
                        startIcon={<AssessmentIcon />}
                        onClick={() => navigate('/stok-durumu')}
                        className={location.pathname === '/stok-durumu' ? 'active' : ''}
                      >
                        Stok Durumu
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="contained"
                        startIcon={<AssessmentIcon />}
                        onClick={() => navigate('/rapor-listesi')}
                        className={location.pathname === '/rapor-listesi' ? 'active' : ''}
                      >
                        Stok Raporu
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/ihale-oluşturma')}
                        className={location.pathname === '/ihale-oluşturma' ? 'active' : ''}
                      >
                        İhale Oluşturma
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/ihale-listesi')}
                        className={location.pathname === '/ihale-listesi' ? 'active' : ''}
                      >
                        İhale Listesi
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/doğrudan-temin')}
                        className={location.pathname === '/doğrudan-temin' ? 'active' : ''}
                      >
                        Doğrudan Temin
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/doğrudan-temin-listesi')}
                        className={location.pathname === '/doğrudan-temin-listesi' ? 'active' : ''}
                      >
                        Doğrudan Temin Listesi
                      </Button>
                    </li>
                  </ul>
                </nav>
              </Box>

              {/* Ana İçerik */}
              <Box sx={{ flexGrow: 1, p: 3 }}>
                <Routes>
                  <Route path="/" element={<HomePageComponent />} />
                  <Route path="/stok-durumu" element={<StockSummary />} />
                  <Route path="/rapor-listesi" element={<ReportList />} />
                  <Route path="/malzeme-listesi" element={<MaterialList />} />
                  <Route path="/ihale-oluşturma" element={<CreateTenderForm />} />
                  <Route path="/ihale-listesi" element={<TenderList />} />
                  <Route path='/doğrudan-temin' element={<DirectProcurement/>}/>
                  <Route path="/doğrudan-temin-listesi" element={<DirectProcurementTable />} />
                </Routes>
              </Box>
            </Box>
          </>
        );

      default:
        return <HomePageComponent />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <AppBar position="static" sx={{ bgcolor: '#006C7F', mb: 3 }}>
          <Toolbar>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <img src={logo} alt="İnönü Üniversitesi Logo" style={{ height: 40, marginRight: 16 }} />
                <Typography variant="h6" component="div">
                  İnönü Üniversitesi Yemekhane Stok-Maliyet Otomasyonu
                </Typography>
              </Box>
              
              {/* Kullanıcı profil alanı */}
              <UserProfile user={user} onLogout={logout} />
            </Box>
          </Toolbar>
        </AppBar>

        {/* Role göre menü ve içerik */}
        {getMenuButtons(user?.role || 'ADMIN')}
      </div>
    </ThemeProvider>
  );
};

// Ana uygulama bileşeni
const App: React.FC = () => {
  return (
    <AuthProvider>
    <Router>
      <AppContent />
    </Router>
    </AuthProvider>
  );
};

export default App;
