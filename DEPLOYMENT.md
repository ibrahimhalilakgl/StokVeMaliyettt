# Ubuntu 22.04 Sunucuya Deployment Rehberi

## ⚠️ ÖNEMLİ: Proje Şu An Olduğu Gibi Çalışmaz!

Projeyi Ubuntu 22.04 sunucuya atmadan önce aşağıdaki yapılandırmaları yapmanız gerekiyor:

## Gereksinimler

### 1. Sistem Gereksinimleri
- Ubuntu 22.04 LTS
- En az 2GB RAM
- En az 10GB disk alanı
- Root veya sudo yetkisi

### 2. Yazılım Gereksinimleri

#### Backend için:
- Java 17 (OpenJDK)
- Maven 3.6+
- PostgreSQL 14+

#### Frontend için:
- Node.js 18+ (LTS önerilir)
- npm veya yarn

#### Web Server:
- Nginx (reverse proxy için)

## Kurulum Adımları

### 1. Sistem Güncellemesi
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Java 17 Kurulumu
```bash
sudo apt install openjdk-17-jdk -y
java -version  # Kontrol için
```

### 3. Maven Kurulumu
```bash
sudo apt install maven -y
mvn -version  # Kontrol için
```

### 4. PostgreSQL Kurulumu ve Yapılandırması
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql

# PostgreSQL kullanıcı ve veritabanı oluştur
sudo -u postgres psql
```

PostgreSQL içinde:
```sql
CREATE DATABASE "stok-takip";
CREATE USER stokuser WITH PASSWORD 'güvenli_şifre_buraya';
GRANT ALL PRIVILEGES ON DATABASE "stok-takip" TO stokuser;
\q
```

### 5. Node.js Kurulumu
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node -v  # Kontrol için
npm -v   # Kontrol için
```

### 6. Nginx Kurulumu
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Proje Kurulumu

### 1. Projeyi Sunucuya Kopyalama
```bash
# Örnek: /opt/stok-takip dizinine kopyalayın
sudo mkdir -p /opt/stok-takip
cd /opt/stok-takip
# Git ile clone veya dosyaları kopyalayın
```

### 2. Backend Kurulumu

```bash
cd /opt/stok-takip/StokMaliyetBackend

# Environment dosyası oluştur
cp env.example .env
nano .env  # veya vi .env
```

`.env` dosyasına şunları ekleyin:
```env
DB_USERNAME=stokuser
DB_PASSWORD=güvenli_şifre_buraya
JWT_SECRET=çok-güvenli-en-az-32-karakter-uzunluğunda-secret-key
JWT_EXPIRATION=3600000
CORS_ALLOWED_ORIGINS=http://your-domain.com,https://your-domain.com
SPRING_PROFILES_ACTIVE=prod
```

```bash
# Backend'i build et
mvn clean package -DskipTests

# JAR dosyası target/ klasöründe oluşacak
ls -lh target/stok-takip-0.0.1-SNAPSHOT.jar
```

### 3. Frontend Kurulumu

```bash
cd /opt/stok-takip/Stok-Maliyet-FrontEnd

# Environment dosyası oluştur
cp .env.production.example .env.production
nano .env.production  # veya vi .env.production
```

`.env.production` dosyasına şunları ekleyin:
```env
REACT_APP_API_URL=http://your-domain.com
# veya backend ayrı bir subdomain'de ise:
# REACT_APP_API_URL=https://api.your-domain.com
```

```bash
# Dependencies kur
npm install

# Production build oluştur
npm run build

# Build klasörü oluşacak: build/
ls -lh build/
```

**ÖNEMLİ:** Frontend'de bazı dosyalarda hardcoded `localhost:8080` var. Bunları düzeltmeniz gerekebilir:
- `Stok-Maliyet-FrontEnd/src/components/DailyStockExitForm.tsx`
- `Stok-Maliyet-FrontEnd/src/components/YemekReceteleri.tsx`
- `Stok-Maliyet-FrontEnd/src/components/StokDurumu.tsx`
- `Stok-Maliyet-FrontEnd/src/components/StockSummary.tsx`

Bu dosyalardaki `http://localhost:8080` kısımlarını environment variable veya relative path ile değiştirin.

## Systemd Service Dosyaları

### Backend Service

`/etc/systemd/system/stok-takip-backend.service` dosyası oluşturun:

```ini
[Unit]
Description=Stok Takip Backend Service
After=postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/stok-takip/StokMaliyetBackend
EnvironmentFile=/opt/stok-takip/StokMaliyetBackend/.env
ExecStart=/usr/bin/java -jar /opt/stok-takip/StokMaliyetBackend/target/stok-takip-0.0.1-SNAPSHOT.jar
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable stok-takip-backend
sudo systemctl start stok-takip-backend
sudo systemctl status stok-takip-backend
```

## Nginx Yapılandırması

### Tek Domain ile (Frontend ve Backend aynı domain)

`/etc/nginx/sites-available/stok-takip` dosyası oluşturun:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # veya IP adresi
    root /opt/stok-takip/Stok-Maliyet-FrontEnd/build;
    index index.html;

    # Frontend static dosyalar
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API isteklerini backend'e yönlendir
    location /v1 {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API auth endpoint
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Swagger UI
    location /swagger-ui {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Symlink oluştur
sudo ln -s /etc/nginx/sites-available/stok-takip /etc/nginx/sites-enabled/

# Default site'ı devre dışı bırak (opsiyonel)
sudo rm /etc/nginx/sites-enabled/default

# Nginx config test
sudo nginx -t

# Nginx'i yeniden başlat
sudo systemctl restart nginx
```

## Güvenlik Duvarı Yapılandırması

```bash
# UFW aktif et
sudo ufw enable

# Gerekli portları aç
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS (SSL sertifikası için)
# 8080 portunu açmayın - sadece localhost'tan erişilebilir olmalı

# Durumu kontrol et
sudo ufw status
```

## SSL Sertifikası (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

## Log Kontrolü

```bash
# Backend logları
sudo journalctl -u stok-takip-backend -f

# Nginx logları
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## Güncelleme İşlemi

```bash
# Backend güncelleme
cd /opt/stok-takip/StokMaliyetBackend
git pull  # veya yeni dosyaları kopyalayın
mvn clean package -DskipTests
sudo systemctl restart stok-takip-backend

# Frontend güncelleme
cd /opt/stok-takip/Stok-Maliyet-FrontEnd
git pull  # veya yeni dosyaları kopyalayın
npm install
npm run build
sudo systemctl reload nginx
```

## Sorun Giderme

### Backend başlamıyor
```bash
# Logları kontrol et
sudo journalctl -u stok-takip-backend -n 50

# Port kontrolü
sudo netstat -tlnp | grep 8080

# Java process kontrolü
ps aux | grep java
```

### Frontend görünmüyor
```bash
# Nginx config test
sudo nginx -t

# Build klasörü kontrolü
ls -la /opt/stok-takip/Stok-Maliyet-FrontEnd/build/

# Nginx logları
sudo tail -f /var/log/nginx/error.log
```

### Database bağlantı hatası
```bash
# PostgreSQL durumu
sudo systemctl status postgresql

# PostgreSQL'e bağlan
sudo -u postgres psql -d stok-takip

# Connection string kontrolü
# application.properties dosyasını kontrol edin
```

## Önemli Notlar

1. **Environment Variables**: `.env` dosyasındaki şifreleri güvenli tutun
2. **JWT Secret**: Production'da mutlaka güçlü bir secret key kullanın
3. **Database Backup**: Düzenli backup alın
4. **Firewall**: Sadece gerekli portları açın (8080'i açmayın!)
5. **SSL**: Production'da mutlaka HTTPS kullanın
6. **CORS**: Sadece gerekli domain'leri CORS'a ekleyin
7. **Hardcoded URLs**: Frontend'deki `localhost:8080` referanslarını düzeltin

## Hızlı Başlangıç

Otomatik kurulum scripti kullanmak için:
```bash
chmod +x deploy.sh setup-database.sh
sudo ./deploy.sh
sudo ./setup-database.sh
```
