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
  Avatar,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  ListSubheader,
  IconButton,
  Tooltip,
  useMediaQuery,
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
import MenuIcon from '@mui/icons-material/Menu';
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
import Footer from './components/Footer';

type NavItem = {
  label: string;
  path: string;
  icon: React.ReactNode;
};

type NavigationConfig = {
  main: NavItem[];
  actions?: NavItem[];
};

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

const buildNavigation = (role: string): NavigationConfig => {
  switch (role) {
    case 'ADMIN':
      return {
        main: [
          { label: 'Ana Sayfa', path: '/', icon: <HomeIcon /> },
          { label: 'Stok Durumu', path: '/stok-durumu', icon: <AssessmentIcon /> },
          { label: 'Stok Listesi', path: '/malzeme-listesi', icon: <ListIcon /> },
          { label: 'Fiş Raporu', path: '/fis-raporu', icon: <ReceiptIcon /> },
          { label: 'Malzeme Talep Listesi', path: '/talep-listesi', icon: <AssignmentIcon /> },
          { label: 'Fiş Kaydı', path: '/fis-olusturma', icon: <AddBoxIcon /> },
          { label: 'Doğrudan Temin Girişi', path: '/dogrudan-temin', icon: <AddBoxIcon /> },
          { label: 'Doğrudan Temin Listesi', path: '/dogrudan-temin-listesi', icon: <ListIcon /> },
          { label: 'Yemek Reçeteleri', path: '/yemek-receteleri', icon: <MenuBookIcon /> },
        ],
        actions: [
          { label: 'Malzeme Çıkış', path: '/malzeme-cikis', icon: <RemoveCircleIcon /> },
          { label: 'Depo Çıkış', path: '/gunluk-depo-cikis', icon: <ExitToAppIcon /> },
          { label: 'Haftalık Talep', path: '/haftalik-malzeme-talep', icon: <AssignmentIcon /> },
          { label: 'Malzeme Oluşturma', path: '/malzeme-olusturma', icon: <AddIcon /> },
          { label: 'İhale Oluşturma', path: '/ihale-olusturma', icon: <AddIcon /> },
          { label: 'İhale Listesi', path: '/ihale-listesi', icon: <ListIcon /> },
          { label: 'Rapor İşlemleri', path: '/rapor-listesi', icon: <AssessmentIcon /> },
          { label: 'Diğer İşlemler', path: '/diger-islemler', icon: <MenuBookIcon /> },
        ],
      };
    case 'YEMEKHANE':
      return {
        main: [
          { label: 'Ana Sayfa', path: '/', icon: <HomeIcon /> },
          { label: 'Malzeme Talep Listesi', path: '/talep-listesi', icon: <AssignmentIcon /> },
          { label: 'Haftalık Malzeme Talep', path: '/haftalik-malzeme-talep', icon: <AssignmentIcon /> },
          { label: 'Fiş Kaydı', path: '/fis-olusturma', icon: <AddBoxIcon /> },
          { label: 'Fiş Raporu', path: '/fis-raporu', icon: <ReceiptIcon /> },
        ],
      };
    case 'DEPO':
      return {
        main: [
          { label: 'Ana Sayfa', path: '/', icon: <HomeIcon /> },
          { label: 'Malzeme Tanımlama', path: '/malzeme-olusturma', icon: <AddIcon /> },
          { label: 'Malzeme Girişi', path: '/malzeme-giris', icon: <AddBoxIcon /> },
          { label: 'Malzeme Çıkışı', path: '/malzeme-cikis', icon: <RemoveCircleIcon /> },
          { label: 'Malzeme Listesi', path: '/malzeme-listesi', icon: <ListIcon /> },
          { label: 'Stok Durumu', path: '/stok-durumu', icon: <AssessmentIcon /> },
          { label: 'Stok Raporu', path: '/rapor-listesi', icon: <AssessmentIcon /> },
          { label: 'Günlük Stok Çıkış', path: '/gunluk-depo-cikis', icon: <ExitToAppIcon /> },
          { label: 'Haftalık Malzeme Talep', path: '/haftalik-malzeme-talep', icon: <AssignmentIcon /> },
        ],
      };
    case 'SATINALMA':
      return {
        main: [
          { label: 'Ana Sayfa', path: '/', icon: <HomeIcon /> },
          { label: 'Malzeme Listesi', path: '/malzeme-listesi', icon: <ListIcon /> },
          { label: 'Stok Durumu', path: '/stok-durumu', icon: <AssessmentIcon /> },
          { label: 'Stok Raporu', path: '/rapor-listesi', icon: <AssessmentIcon /> },
          { label: 'İhale Oluşturma', path: '/ihale-olusturma', icon: <AddIcon /> },
          { label: 'İhale Listesi', path: '/ihale-listesi', icon: <ListIcon /> },
          { label: 'Doğrudan Temin', path: '/dogrudan-temin', icon: <AddBoxIcon /> },
          { label: 'Doğrudan Temin Listesi', path: '/dogrudan-temin-listesi', icon: <ListIcon /> },
        ],
      };
    default:
      return { main: [{ label: 'Ana Sayfa', path: '/', icon: <HomeIcon /> }] };
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
                Ç
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

const drawerWidth = 260;

interface ShellLayoutProps {
  navigation: NavigationConfig;
  user: any;
  onLogout: () => void;
  onNavigate: (path: string) => void;
  currentPath: string;
  children: React.ReactNode;
}

const ShellLayout: React.FC<ShellLayoutProps> = ({
  navigation,
  user,
  onLogout,
  onNavigate,
  currentPath,
  children,
}) => {
  const isDesktop = useMediaQuery('(min-width:960px)');
  const [open, setOpen] = React.useState(true);

  React.useEffect(() => {
    setOpen(isDesktop);
  }, [isDesktop]);

  const renderNavSection = (title: string, items: NavItem[]) => (
    <List
      subheader={
        <ListSubheader component="div" sx={{ bgcolor: 'transparent', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
          {title}
        </ListSubheader>
      }
    >
      {items.map((item) => {
        const active = currentPath === item.path;
        return (
          <ListItemButton
            key={item.path}
            onClick={() => onNavigate(item.path)}
            sx={{
              my: 0.5,
              borderRadius: 1.5,
              color: active ? '#00424f' : 'rgba(255,255,255,0.85)',
              backgroundColor: active ? 'rgba(255,255,255,0.9)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.15)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <ListItemIcon sx={{ color: active ? '#00424f' : 'rgba(255,255,255,0.85)' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        );
      })}
    </List>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fb 0%, #e5ecf5 100%)' }}>
      <AppBar
        position="fixed"
        sx={{
          background: 'linear-gradient(90deg, #006C7F 0%, #004c5a 100%)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          zIndex: (muiTheme) => muiTheme.zIndex.drawer + 1,
          transition: 'width 0.2s ease, margin 0.2s ease',
          width: { md: `calc(100% - ${open && isDesktop ? drawerWidth : 0}px)` },
          ml: { md: open && isDesktop ? `${drawerWidth}px` : 0 },
        }}
      >
        <Toolbar sx={{ display: 'flex', gap: 2 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setOpen((prev) => !prev)}
            sx={{ mr: 1, display: { md: 'none' } }}
            size="large"
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <img src={logo} alt="İnönü Üniversitesi Logo" style={{ height: 40 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>
                İnönü Üniversitesi
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Yemekhane Stok-Maliyet Otomasyonu
              </Typography>
            </Box>
          </Box>
          <Box sx={{ ml: 'auto' }}>
            <UserProfile user={user} onLogout={onLogout} />
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isDesktop ? 'permanent' : 'temporary'}
        open={open}
        onClose={() => setOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, #0f2d3a 0%, #0a1f29 100%)',
            color: 'white',
            borderRight: 'none',
            boxShadow: '4px 0 20px rgba(0,0,0,0.25)',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ px: 2, pt: 2, pb: 3, display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: '#17a2b8', width: 36, height: 36, fontWeight: 700 }}>SV</Avatar>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Stok & Maliyet</Typography>
              <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>Kontrol Paneli</Typography>
            </Box>
          </Box>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />
          {(() => {
            const allItems = [
              ...navigation.main,
              ...(navigation.actions || [])
            ];
            return allItems.length > 0 && renderNavSection('Menü', allItems);
          })()}
          <Box sx={{ mt: 'auto' }}>
            <Tooltip title="Çıkış" placement="right">
              <ListItemButton
                onClick={onLogout}
                sx={{
                  borderRadius: 1.5,
                  color: 'rgba(255,255,255,0.85)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' },
                }}
              >
                <ListItemIcon sx={{ color: 'rgba(255,255,255,0.85)' }}>
                  <ExitToAppIcon />
                </ListItemIcon>
                <ListItemText primary="Çıkış Yap" />
              </ListItemButton>
            </Tooltip>
          </Box>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          mt: 8,
          minHeight: 'calc(100vh - 64px)',
          width: '100%',
          overflow: 'hidden',
          maxWidth: '100%',
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            p: { xs: 2, md: 4 },
            width: '100%',
            maxWidth: '100%',
            overflowX: 'hidden',
            boxSizing: 'border-box',
          }}
        >
          {children}
        </Box>
        {currentPath === '/' && <Footer />}
      </Box>
    </Box>
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

  const navigation = buildNavigation(user?.role || 'ADMIN');
  const HomePageComponent = getHomePageComponent(user?.role || 'ADMIN');

  const renderRoutes = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <Routes>
            <Route path="/" element={<HomePageComponent />} />
            <Route path="/fis-raporu" element={<FisRaporu />} />
            <Route path="/diger-islemler" element={<OtherActions />} />
            <Route path="/fis-tipi-olustur" element={<TicketTypeList />} />
            <Route path="/butce-olustur" element={<BudgetForm />} />
            <Route path="/alim-sekli-olustur" element={<PurchaseForm />} />
            <Route path="/olcu-birimi-olustur" element={<MeasurementTypeForm />} />
            <Route path="/kategori-olustur" element={<CategoryForm />} />
            <Route path="/alim-yapilan-birimi-olustur" element={<PurchaseUnit />} />
            <Route path="/alim-turu-olustur" element={<PurchaseType />} />
            <Route path="/dogrudan-temin" element={<DirectProcurement/>}/>
            <Route path="/dogrudan-temin-listesi" element={<DirectProcurementTable />} />
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
            <Route path="/ihale-olusturma" element={<CreateTenderForm />} />
            <Route path="/fis-olusturma" element={<TicketForm />} />
            <Route path="/ihale-listesi" element={<TenderList />} />
            <Route path="/malzeme-olusturma" element={<MaterialDefinition />} />
            <Route path="/kullanici-yonetimi" element={<UserManagement />} />
            <Route path="/yemek-receteleri" element={<YemekReceteleri />} />
          </Routes>
        );
      case 'YEMEKHANE':
        return (
          <Routes>
            <Route path="/" element={<HomePageComponent />} />
            <Route path="/fis-raporu" element={<FisRaporu />} />
            <Route path="/fis-tipi-olustur" element={<TicketTypeList />} />
            <Route path="/gunluk-depo-cikis" element={<DailyStockExitForm />} />
            <Route path="/haftalik-malzeme-talep" element={<WeeklyMaterialRequest />} />
            <Route path="/talep-listesi" element={<MaterialDemandList />} />
            <Route path="/fis-olusturma" element={<TicketForm />} />
          </Routes>
        );
      case 'DEPO':
        return (
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
        );
      case 'SATINALMA':
        return (
          <Routes>
            <Route path="/" element={<HomePageComponent />} />
            <Route path="/stok-durumu" element={<StockSummary />} />
            <Route path="/rapor-listesi" element={<ReportList />} />
            <Route path="/malzeme-listesi" element={<MaterialList />} />
            <Route path="/ihale-olusturma" element={<CreateTenderForm />} />
            <Route path="/ihale-listesi" element={<TenderList />} />
            <Route path="/dogrudan-temin" element={<DirectProcurement/>}/>
            <Route path="/dogrudan-temin-listesi" element={<DirectProcurementTable />} />
          </Routes>
        );
      default:
        return (
          <Routes>
            <Route path="/" element={<HomePageComponent />} />
          </Routes>
        );
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <ShellLayout
        navigation={navigation}
        user={user}
        onLogout={logout}
        onNavigate={(path) => navigate(path)}
        currentPath={location.pathname}
      >
        {renderRoutes(user?.role || 'ADMIN')}
      </ShellLayout>
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
