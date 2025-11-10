#!/bin/bash

# PostgreSQL Veritabanı Kurulum Scripti

set -e

echo "========================================="
echo "PostgreSQL Veritabanı Kurulumu"
echo "========================================="

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# PostgreSQL kullanıcı ve şifre bilgileri
read -p "Veritabanı kullanıcı adı (varsayılan: stokuser): " DB_USER
DB_USER=${DB_USER:-stokuser}

read -sp "Veritabanı şifresi: " DB_PASSWORD
echo ""

read -p "Veritabanı adı (varsayılan: stok-takip): " DB_NAME
DB_NAME=${DB_NAME:-stok-takip}

echo -e "${GREEN}Veritabanı oluşturuluyor...${NC}"

# PostgreSQL içinde SQL komutlarını çalıştır
sudo -u postgres psql << EOF
-- Veritabanı oluştur
CREATE DATABASE "$DB_NAME";

-- Kullanıcı oluştur
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';

-- Yetkileri ver
GRANT ALL PRIVILEGES ON DATABASE "$DB_NAME" TO $DB_USER;

-- PostgreSQL 15+ için schema yetkisi
\c "$DB_NAME"
GRANT ALL ON SCHEMA public TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;

\q
EOF

echo -e "${GREEN}Veritabanı başarıyla oluşturuldu!${NC}"
echo -e "${YELLOW}Bağlantı bilgileri:${NC}"
echo "Host: localhost"
echo "Port: 5432"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo ""
echo -e "${YELLOW}.env dosyasına şu bilgileri ekleyin:${NC}"
echo "DB_USERNAME=$DB_USER"
echo "DB_PASSWORD=$DB_PASSWORD"

