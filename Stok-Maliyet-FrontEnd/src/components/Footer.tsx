import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  Divider,
  IconButton,
} from '@mui/material';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import YouTubeIcon from '@mui/icons-material/YouTube';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#0a1f29',
        color: 'rgba(255, 255, 255, 0.85)',
        width: '100%',
        pt: 4,
        pb: 2,
        mt: 'auto',
        flexShrink: 0,
      }}
    >
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 }, width: '100%', maxWidth: '100%' }}>
        <Grid container spacing={4}>
          {/* Sol Sütun - Stok ve Maliyet Sistemi */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                color: '##a0a0a0',
                mb: 2,
                fontSize: '1.2rem',
              }}
            >
              Stok ve Maliyet Sistemi
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                mb: 3,
                lineHeight: 1.8,
                fontSize: '0.95rem',
              }}
            >
              Dijital teknolojileri etkin kullanarak stok takibi, maliyet yönetimi ve 
              yemekhane süreçlerinde yenilikçi ve kullanıcı odaklı çözümler üretmeyi 
              hedefler. Üniversite yemekhanesinin stok ve maliyet yönetimini 
              modernize ederek verimliliği artırmayı amaçlar.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, mt: 3 }}>
              <Link
                href="https://www.linkedin.com/school/inonu-university/"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: 'white',
                  '&:hover': { 
                    color: '#0077b5',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
                aria-label="LinkedIn"
              >
                <IconButton
                  size="small"
                  sx={{
                    color: 'inherit',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '&:hover': { 
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <LinkedInIcon fontSize="small" />
                </IconButton>
              </Link>
              <Link
                href="https://twitter.com/inonu_universitesi"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: 'white',
                  '&:hover': { 
                    color: '#1DA1F2',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
                aria-label="Twitter"
              >
                <IconButton
                  size="small"
                  sx={{
                    color: 'inherit',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '&:hover': { 
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <TwitterIcon fontSize="small" />
                </IconButton>
              </Link>
              <Link
                href="https://www.youtube.com/user/inonuuniversitesi"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: 'white',
                  '&:hover': { 
                    color: '#FF0000',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
                aria-label="YouTube"
              >
                <IconButton
                  size="small"
                  sx={{
                    color: 'inherit',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '&:hover': { 
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <YouTubeIcon fontSize="small" />
                </IconButton>
              </Link>
              <Link
                href="https://www.instagram.com/inonu_universitesi"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: 'white',
                  '&:hover': { 
                    color: '#E4405F',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
                aria-label="Instagram"
              >
                <IconButton
                  size="small"
                  sx={{
                    color: 'inherit',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '&:hover': { 
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <InstagramIcon fontSize="small" />
                </IconButton>
              </Link>
              <Link
                href="https://www.facebook.com/inonu.edu.tr"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: 'white',
                  '&:hover': { 
                    color: '#1877F2',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
                aria-label="Facebook"
              >
                <IconButton
                  size="small"
                  sx={{
                    color: 'inherit',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '&:hover': { 
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <FacebookIcon fontSize="small" />
                </IconButton>
              </Link>
            </Box>
          </Grid>

          {/* Sağ Sütun - İletişim */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                color: '##a0a0a0',
                mb: 2,
                fontSize: '1.2rem',
              }}
            >
              İletişim
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <LocationOnIcon
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '1.2rem',
                    mt: 0.5,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                  }}
                >
                  İnönü Üniversitesi Merkez Kampüsü (Elazığ Yolu 15.km) Eski TED Koleji Binası
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '1.2rem',
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.9rem',
                  }}
                >
                  Telefon: 0422 377 32 22
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '1.2rem',
                  }}
                />
                <Link
                  href="mailto:ddoiletisim@inonu.edu.tr"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    '&:hover': {
                      color: 'white',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  E-posta: ddoiletisim@inonu.edu.tr
                </Link>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '1.2rem',
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.9rem',
                  }}
                >
                  Çalışma Saatleri: Pazartesi - Cuma 8:00 - 17:00
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider
          sx={{
            borderColor: 'rgba(255, 255, 255, 0.1)',
            my: 3,
          }}
        />

        {/* Copyright ve Scroll to Top */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.85rem',
            }}
          >
            © {new Date().getFullYear()} Stok ve Maliyet Sistemi. Tüm hakları saklıdır.
          </Typography>
          <IconButton
            onClick={scrollToTop}
            sx={{
              position: 'absolute',
              right: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              },
            }}
            aria-label="Yukarı çık"
          >
            <KeyboardArrowUpIcon />
          </IconButton>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;

