# Web Programlama Final Projesi - Backend API

Akıllı Kampüs Yönetim Platformu için RESTful API backend servisi.

## 🎯 Proje Hakkında

Bu proje, modern bir üniversite kampüsü için geliştirilmiş kapsamlı yönetim sisteminin backend API'sidir. Node.js, Express.js ve PostgreSQL kullanılarak geliştirilmiştir.

## ✨ Özellikler

- ✅ Kullanıcı kayıt ve giriş sistemi
- ✅ E-posta doğrulama
- ✅ JWT tabanlı kimlik doğrulama
- ✅ Token yenileme mekanizması
- ✅ Şifre sıfırlama
- ✅ Profil yönetimi
- ✅ Profil fotoğrafı yükleme
- ✅ Rol tabanlı erişim kontrolü
- ✅ RESTful API tasarımı
- ✅ Kapsamlı test coverage

## 🛠️ Teknolojiler

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL + Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Email**: Nodemailer
- **Testing**: Jest + Supertest
- **Validation**: Express Validator

## 🚀 Hızlı Başlangıç

### Gereksinimler

- Node.js 18+
- PostgreSQL 12+
- npm veya yarn

### 1. Repository'yi Klonlayın

```bash
git clone https://github.com/KULLANICI_ADINIZ/web-programlama-final-proje-backend.git
cd web-programlama-final-proje-backend
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Ortam Değişkenlerini Yapılandırın

`.env` dosyası oluşturun:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=web_programlama_final_proje
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Frontend URL (CORS için)
FRONTEND_URL=http://localhost:3001

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@kampüs.edu.tr

# App
APP_URL=http://localhost:3000
```

### 4. Veritabanını Oluşturun

PostgreSQL'de veritabanını oluşturun:

```sql
CREATE DATABASE web_programlama_final_proje;
```

### 5. Migration'ları Çalıştırın

```bash
npm run db:migrate
```

### 6. Seed Data (İsteğe Bağlı)

```bash
npm run db:seed
```

### 7. Sunucuyu Başlatın

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

API `http://localhost:3000` adresinde çalışacaktır.

## 🐳 Docker ile Çalıştırma

### Docker Compose ile (Veritabanı dahil)

`docker-compose.yml` dosyası oluşturun:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: backend-db
    environment:
      POSTGRES_DB: web_programlama_final_proje
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: .
    container_name: backend-api
    environment:
      NODE_ENV: development
      PORT: 3000
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: web_programlama_final_proje
      DB_USER: postgres
      DB_PASSWORD: postgres
      JWT_SECRET: your-secret-key
      JWT_REFRESH_SECRET: your-refresh-secret-key
      FRONTEND_URL: http://localhost:3001
    ports:
      - "3000:3000"
    volumes:
      - ./uploads:/app/uploads
      - .:/app
      - /app/node_modules
    depends_on:
      - postgres
    command: npm run dev
```

Çalıştırın:
```bash
docker-compose up -d
```

### Sadece Backend için Docker

```bash
docker build -t backend-api .
docker run -p 3000:3000 --env-file .env backend-api
```

## 📁 Proje Yapısı

```
backend/
├── src/
│   ├── models/          # Sequelize modelleri
│   ├── migrations/      # Veritabanı migration'ları
│   ├── seeders/         # Seed dosyaları
│   ├── routes/          # API route'ları
│   ├── services/        # İş mantığı servisleri
│   ├── middleware/      # Express middleware'leri
│   ├── tests/           # Test dosyaları
│   └── server.js        # Ana sunucu dosyası
├── config/              # Konfigürasyon dosyaları
├── uploads/             # Yüklenen dosyalar
├── coverage/            # Test coverage raporları
├── Dockerfile
├── jest.config.js
└── package.json
```

## 🧪 Testler

```bash
# Tüm testleri çalıştır
npm test

# Test coverage ile
npm test -- --coverage

# Watch mode
npm run test:watch
```

## 📚 API Dokümantasyonu

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

- `POST /api/auth/register` - Kullanıcı kaydı
- `GET /api/auth/verify-email` - E-posta doğrulama
- `POST /api/auth/login` - Giriş
- `POST /api/auth/refresh-token` - Token yenileme
- `POST /api/auth/logout` - Çıkış
- `POST /api/auth/forgot-password` - Şifre sıfırlama talebi
- `POST /api/auth/reset-password` - Şifre sıfırlama
- `GET /api/auth/profile` - Profil getir
- `PUT /api/auth/profile` - Profil güncelle
- `POST /api/auth/profile/picture` - Profil fotoğrafı yükle

### Department Endpoints

- `GET /api/departments` - Tüm bölümleri listele
- `GET /api/departments/:id` - Bölüm detayı

Detaylı API dokümantasyonu için [API_DOCUMENTATION.md](../API_DOCUMENTATION.md) dosyasına bakın.

## 🔐 Güvenlik

- JWT tabanlı kimlik doğrulama
- Bcrypt ile şifre hash'leme
- Token yenileme mekanizması
- E-posta doğrulama
- Güvenli şifre sıfırlama
- CORS koruması
- Input validation
- Rate limiting (eklenebilir)

## 📝 Environment Variables

Tüm gerekli environment değişkenleri `.env` dosyasında tanımlanmalıdır. `.env.example` dosyasına bakın (eğer varsa).

## 🐛 Sorun Giderme

### Veritabanı Bağlantı Hatası
- PostgreSQL'in çalıştığından emin olun
- `.env` dosyasındaki veritabanı bilgilerini kontrol edin
- Veritabanının oluşturulduğundan emin olun

### Port Çakışması
- Port 3000 kullanımdaysa, `.env` dosyasında `PORT` değişkenini değiştirin

### Migration Hataları
- Veritabanı bağlantısını kontrol edin
- Migration'ları sırayla çalıştırın: `npm run db:migrate`

## 📞 İletişim

Sorularınız için GitHub Issues kullanabilirsiniz.

## 📄 Lisans

Bu proje eğitim amaçlı geliştirilmiştir.

---

**Not**: Bu backend API, frontend uygulaması ile birlikte çalışmak üzere tasarlanmıştır. Frontend repo'su: [web-programlama-final-proje-frontend](https://github.com/KULLANICI_ADINIZ/web-programlama-final-proje-frontend)

