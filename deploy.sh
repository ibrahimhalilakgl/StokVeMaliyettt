#!/bin/bash

# Ubuntu 22.04 Deployment Script
# Stok Takip Sistemi için otomatik kurulum scripti

set -e

echo "========================================="
echo "Stok Takip Sistemi Deployment Başlıyor"
echo "========================================="

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Root kontrolü
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Bu script root yetkisi ile çalıştırılmalıdır.${NC}"
    echo "Kullanım: sudo ./deploy.sh"
    exit 1
fi

# 1. Sistem güncellemesi
echo -e "${GREEN}[1/10] Sistem güncelleniyor...${NC}"
apt update && apt upgrade -y

# 2. Java 17 kurulumu
echo -e "${GREEN}[2/10] Java 17 kuruluyor...${NC}"
if ! command -v java &> /dev/null; then
    apt install openjdk-17-jdk -y
else
    echo -e "${YELLOW}Java zaten kurulu: $(java -version 2>&1 | head -n 1)${NC}"
fi

# 3. Maven kurulumu
echo -e "${GREEN}[3/10] Maven kuruluyor...${NC}"
if ! command -v mvn &> /dev/null; then
    apt install maven -y
else
    echo -e "${YELLOW}Maven zaten kurulu: $(mvn -version | head -n 1)${NC}"
fi

# 4. PostgreSQL kurulumu
echo -e "${GREEN}[4/10] PostgreSQL kuruluyor...${NC}"
if ! command -v psql &> /dev/null; then
    apt install postgresql postgresql-contrib -y
    systemctl start postgresql
    systemctl enable postgresql
else
    echo -e "${YELLOW}PostgreSQL zaten kurulu${NC}"
fi

# 5. Node.js kurulumu
echo -e "${GREEN}[5/10] Node.js kuruluyor...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
else
    echo -e "${YELLOW}Node.js zaten kurulu: $(node -v)${NC}"
fi

# 6. Nginx kurulumu
echo -e "${GREEN}[6/10] Nginx kuruluyor...${NC}"
if ! command -v nginx &> /dev/null; then
    apt install nginx -y
    systemctl start nginx
    systemctl enable nginx
else
    echo -e "${YELLOW}Nginx zaten kurulu${NC}"
fi

# 7. Proje dizini oluşturma
echo -e "${GREEN}[7/10] Proje dizini hazırlanıyor...${NC}"
PROJECT_DIR="/opt/stok-takip"
mkdir -p $PROJECT_DIR

# 8. Backend build
echo -e "${GREEN}[8/10] Backend build ediliyor...${NC}"
if [ -d "StokMaliyetBackend" ]; then
    cd StokMaliyetBackend
    
    # .env dosyası kontrolü
    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}.env dosyası bulunamadı. env.example'dan kopyalanıyor...${NC}"
        if [ -f "env.example" ]; then
            cp env.example .env
            echo -e "${RED}ÖNEMLİ: .env dosyasını düzenleyin ve gerekli değerleri girin!${NC}"
        fi
    fi
    
    mvn clean package -DskipTests
    cd ..
    echo -e "${GREEN}Backend build tamamlandı${NC}"
else
    echo -e "${RED}StokMaliyetBackend klasörü bulunamadı!${NC}"
    exit 1
fi

# 9. Frontend build
echo -e "${GREEN}[9/10] Frontend build ediliyor...${NC}"
if [ -d "Stok-Maliyet-FrontEnd" ]; then
    cd Stok-Maliyet-FrontEnd
    npm install
    npm run build
    cd ..
    echo -e "${GREEN}Frontend build tamamlandı${NC}"
else
    echo -e "${RED}Stok-Maliyet-FrontEnd klasörü bulunamadı!${NC}"
    exit 1
fi

# 10. Systemd service oluşturma
echo -e "${GREEN}[10/10] Systemd service oluşturuluyor...${NC}"
SERVICE_FILE="/etc/systemd/system/stok-takip-backend.service"

cat > $SERVICE_FILE << EOF
[Unit]
Description=Stok Takip Backend Service
After=postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=$(pwd)/StokMaliyetBackend
EnvironmentFile=$(pwd)/StokMaliyetBackend/.env
ExecStart=/usr/bin/java -jar $(pwd)/StokMaliyetBackend/target/stok-takip-0.0.1-SNAPSHOT.jar
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable stok-takip-backend

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Kurulum tamamlandı!${NC}"
echo -e "${YELLOW}Yapılacaklar:${NC}"
echo "1. .env dosyasını düzenleyin: $(pwd)/StokMaliyetBackend/.env"
echo "2. PostgreSQL veritabanı ve kullanıcı oluşturun"
echo "3. Nginx yapılandırmasını yapın (DEPLOYMENT.md'ye bakın)"
echo "4. Backend'i başlatın: sudo systemctl start stok-takip-backend"
echo "5. Nginx'i yeniden başlatın: sudo systemctl restart nginx"
echo -e "${GREEN}=========================================${NC}"

