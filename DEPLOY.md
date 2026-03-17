# Hisobchi - Deploy Qo'llanmasi

Bu qo'llanma Hisobchi loyihasini bepul xizmatlar yordamida deploy qilish uchun step-by-step ko'rsatmalar beradi.

## Arxitektura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│    Backend      │────▶│   Database      │
│   (Vercel)      │     │   (Render)      │     │ (MongoDB Atlas) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │   Cloudinary    │
                        │   (Rasmlar)     │
                        └─────────────────┘
```

## Foydalaniladigan Bepul Xizmatlar

| Xizmat | Maqsad | Bepul Limit |
|--------|--------|-------------|
| [Vercel](https://vercel.com) | Frontend hosting | Cheksiz bandwidth |
| [Render](https://render.com) | Backend hosting | 750 soat/oy |
| [MongoDB Atlas](https://mongodb.com/atlas) | Database | 512MB |
| [Cloudinary](https://cloudinary.com) | Rasm saqlash | 25GB |

---

## 1-Qadam: MongoDB Atlas (Database)

### 1.1 Account yaratish
1. https://www.mongodb.com/cloud/atlas/register ga o'ting
2. Email bilan ro'yxatdan o'ting (yoki Google/GitHub bilan)
3. "Build a Database" tugmasini bosing

### 1.2 Cluster yaratish
1. **Free tier (M0)** ni tanlang
2. Provider: **AWS** tanlang
3. Region: **Frankfurt (eu-central-1)** yoki sizga yaqin region
4. Cluster name: `hisobchi-cluster`
5. "Create" tugmasini bosing

### 1.3 Database User yaratish
1. "Database Access" bo'limiga o'ting
2. "Add New Database User" tugmasini bosing
3. Authentication: **Password**
4. Username: `hisobchi_admin`
5. Password: Kuchli parol yarating (saqlang!)
6. Role: **Atlas Admin**
7. "Add User" tugmasini bosing

### 1.4 Network Access sozlash
1. "Network Access" bo'limiga o'ting
2. "Add IP Address" tugmasini bosing
3. **"Allow Access from Anywhere"** tanlang (0.0.0.0/0)
4. "Confirm" tugmasini bosing

### 1.5 Connection String olish
1. "Database" bo'limiga qaytib, "Connect" tugmasini bosing
2. "Connect your application" tanlang
3. Driver: **Node.js**, Version: **5.5 or later**
4. Connection string'ni nusxalang:
```
mongodb+srv://hisobchi_admin:<password>@hisobchi-cluster.xxxxx.mongodb.net/hisobchi?retryWrites=true&w=majority
```
5. `<password>` ni haqiqiy parol bilan almashtiring

---

## 2-Qadam: Cloudinary (Rasm Saqlash)

### 2.1 Account yaratish
1. https://cloudinary.com/users/register_free ga o'ting
2. Ro'yxatdan o'ting

### 2.2 Credentials olish
1. Dashboard'ga o'ting
2. Quyidagi ma'lumotlarni saqlang:
   - **Cloud Name**: `dxxxxxxxxx`
   - **API Key**: `123456789012345`
   - **API Secret**: `aBcDeFgHiJkLmNoPqRsTuVwXyZ`

---

## 3-Qadam: Backend Deploy (Render)

### 3.1 GitHub'ga Push qilish
Avval loyihangizni GitHub'ga push qiling:

```bash
# Loyiha papkasida
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/hisobchi.git
git push -u origin main
```

### 3.2 Render Account
1. https://render.com ga o'ting
2. GitHub bilan ro'yxatdan o'ting

### 3.3 Web Service yaratish (Usul A - Blueprint)

**Eng oson usul** - render.yaml faylidan foydalanish:

1. Dashboard'da "New +" → "Blueprint" tanlang
2. GitHub repo'ni ulang
3. `render.yaml` fayli avtomatik aniqlanadi
4. "Apply" tugmasini bosing
5. Environment variables'ni to'ldiring

### 3.3 Web Service yaratish (Usul B - Manual)

1. Dashboard'da "New +" → "Web Service" tanlang
2. GitHub repo'ni ulang
3. Quyidagi sozlamalarni kiriting:

| Sozlama | Qiymat |
|---------|--------|
| **Name** | `hisobchi-api` |
| **Region** | Frankfurt (EU Central) |
| **Branch** | `main` |
| **Root Directory** | _(bo'sh qoldiring)_ |
| **Runtime** | Node |
| **Build Command** | `npm install -g pnpm && NODE_ENV=development pnpm install && pnpm --filter @hisobchi/api build` |
| **Start Command** | `node apps/api/dist/server.js` |
| **Instance Type** | Free |

> **Muhim**: Bu monorepo loyiha. Root directory bo'sh qoldiriladi va pnpm workspace'dan foydalaniladi.

### 3.4 Environment Variables
"Environment" bo'limida quyidagi o'zgaruvchilarni qo'shing:

```env
NODE_ENV=production
PORT=10000

# MongoDB Atlas'dan olgan connection string
MONGODB_URI=mongodb+srv://hisobchi_admin:YOUR_PASSWORD@hisobchi-cluster.xxxxx.mongodb.net/hisobchi?retryWrites=true&w=majority

# JWT - kuchli random string yarating
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Super Admin credentials
SUPER_ADMIN_EMAIL=admin@hisobchi.uz
SUPER_ADMIN_PASSWORD=YourSecurePassword123!

# Cloudinary credentials
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# CORS - Frontend URL (keyinroq yangilanadi)
CORS_ORIGIN=https://hisobchi.vercel.app

# API URL
API_URL=https://hisobchi-api.onrender.com
```

### 3.5 Deploy
1. "Create Web Service" tugmasini bosing
2. Deploy tugashini kuting (5-10 daqiqa)
3. URL'ni saqlang: `https://hisobchi-api.onrender.com`

### 3.6 Deploy'ni tekshirish
```bash
curl https://hisobchi-api.onrender.com/api/v1/health
# {"status":"ok"} qaytishi kerak
```

---

## 4-Qadam: Frontend Deploy (Vercel)

### 4.1 Vercel Account
1. https://vercel.com ga o'ting
2. GitHub bilan ro'yxatdan o'ting

### 4.2 Project Import
1. "Add New..." → "Project" tanlang
2. GitHub repo'ni import qiling
3. Framework: **Vite** avtomatik aniqlanadi

### 4.3 Sozlamalar

Loyihada `vercel.json` fayli mavjud, shuning uchun sozlamalar avtomatik o'qiladi.

Faqat quyidagilarni belgilang:

| Sozlama | Qiymat |
|---------|--------|
| **Project Name** | `hisobchi` |
| **Root Directory** | `apps/web` |

Qolgan sozlamalar `vercel.json`dan avtomatik olinadi:
- Build Command: `cd ../.. && pnpm install && pnpm --filter @hisobchi/web build`
- Output Directory: `dist`
- Install Command: `npm install -g pnpm`

> **Eslatma**: `vercel.json` fayli SPA routing uchun rewrites ham o'z ichiga oladi.

### 4.4 Environment Variables
"Environment Variables" bo'limida qo'shing:

```env
VITE_API_URL=https://hisobchi-api.onrender.com/api/v1
VITE_APP_NAME=Hisobchi
VITE_APP_URL=https://hisobchi.vercel.app
```

### 4.5 Deploy
1. "Deploy" tugmasini bosing
2. Deploy tugashini kuting (2-3 daqiqa)
3. URL'ni saqlang: `https://hisobchi.vercel.app`

---

## 5-Qadam: CORS Yangilash

Frontend URL ma'lum bo'lgach, Render'dagi CORS sozlamasini yangilang:

1. Render dashboard → hisobchi-api → Environment
2. `CORS_ORIGIN` ni yangilang:
```
CORS_ORIGIN=https://hisobchi.vercel.app
```
3. "Save Changes" → Service qayta deploy bo'ladi

---

## 6-Qadam: Custom Domain (Ixtiyoriy)

### Vercel uchun Custom Domain
1. Vercel dashboard → Project Settings → Domains
2. Domain qo'shing: `app.hisobchi.uz`
3. DNS sozlamalarini domain provideringizda qo'shing

### Render uchun Custom Domain
1. Render dashboard → Service Settings → Custom Domains
2. Domain qo'shing: `api.hisobchi.uz`
3. DNS sozlamalarini qo'shing

---

## 7-Qadam: Tekshirish

### Backend tekshirish
```bash
# Health check
curl https://hisobchi-api.onrender.com/api/v1/health

# Super admin login
curl -X POST https://hisobchi-api.onrender.com/api/v1/auth/super-admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hisobchi.uz","password":"YourSecurePassword123!"}'
```

### Frontend tekshirish
1. https://hisobchi.vercel.app ga o'ting
2. Login sahifasi ko'rinishi kerak
3. Super admin bilan kiring: `/super-admin/login`

---

## Muhim Eslatmalar

### Render Free Tier Cheklovlari
- **Spin down**: 15 daqiqa faoliyatsizlikdan so'ng server "uxlaydi"
- **Cold start**: Birinchi so'rov 30-60 soniya kutishi mumkin
- **Yechim**: UptimeRobot bilan har 14 daqiqada ping qilish

### UptimeRobot Sozlash (Serverning "uxlamasligi" uchun)

Render free tier'da server 15 daqiqa faoliyatsizlikdan so'ng "uxlab qoladi" va keyingi so'rovda 30-60 soniya "uyg'onish" vaqti ketadi. Buni oldini olish uchun UptimeRobot har 5 daqiqada serverga ping yuboradi.

#### 1-Qadam: Ro'yxatdan o'tish
1. https://uptimerobot.com ga o'ting
2. "Register for FREE" tugmasini bosing
3. Email, parol kiriting va ro'yxatdan o'ting
4. Email'ga kelgan tasdiqlash linkini bosing

#### 2-Qadam: Monitor yaratish
1. Dashboard'ga kiring
2. **"+ Add New Monitor"** tugmasini bosing
3. Quyidagi sozlamalarni kiriting:

| Sozlama | Qiymat |
|---------|--------|
| **Monitor Type** | HTTP(s) |
| **Friendly Name** | `Hisobchi API` |
| **URL (or IP)** | `https://hisobchi-api.onrender.com/api/v1/health` |
| **Monitoring Interval** | 5 minutes |

4. **"Create Monitor"** tugmasini bosing

#### 3-Qadam: Alert Contact (Ixtiyoriy)
Server tushib qolsa xabar olish uchun:
1. "My Settings" → "Alert Contacts" ga o'ting
2. "Add Alert Contact" bosing
3. Email yoki Telegram tanlang
4. Ma'lumotlarni kiriting va saqlang
5. Monitorga qaytib, Alert Contact'ni ulang

#### Natija
- UptimeRobot har 5 daqiqada `/api/v1/health` endpoint'ga so'rov yuboradi
- Server doim "uyg'oq" turadi
- Agar server tushsa, email/Telegram orqali xabar keladi

```
UptimeRobot Dashboard ko'rinishi:

┌─────────────────────────────────────────────────────┐
│  Hisobchi API                              ● UP     │
│  https://hisobchi-api.onrender.com/api/v1/health   │
│  Response: 45ms    Uptime: 99.9%                   │
└─────────────────────────────────────────────────────┘
```

#### Alternativ: Cron-Job.org
UptimeRobot ishlamasa, https://cron-job.org ham bepul:

1. https://cron-job.org ga o'ting
2. Ro'yxatdan o'ting
3. "CREATE CRONJOB" bosing
4. URL: `https://hisobchi-api.onrender.com/api/v1/health`
5. Schedule: "Every 5 minutes"
6. Saqlang

#### Boshqa Alternativlar
- https://betterstack.com/better-uptime (bepul 10 monitor)
- https://healthchecks.io (bepul 20 monitor)

### MongoDB Atlas Free Tier
- 512MB storage limit
- Katta hajmdagi rasmlarni Cloudinary'da saqlang
- Eski ma'lumotlarni vaqti-vaqti bilan arxivlang

---

## Xatoliklarni Tuzatish

### "CORS error" xatosi
```
Access to fetch at 'https://hisobchi-api.onrender.com' from origin 'https://hisobchi.vercel.app' has been blocked by CORS policy
```
**Yechim**: Render'da `CORS_ORIGIN` to'g'ri sozlanganligini tekshiring.

### "MongoDB connection failed" xatosi
**Yechim**:
1. MongoDB Atlas'da Network Access → 0.0.0.0/0 qo'shilganligini tekshiring
2. Connection string'dagi password to'g'riligini tekshiring

### "502 Bad Gateway" xatosi
**Yechim**:
1. Render logs'ni tekshiring
2. Odatda cold start - 30-60 soniya kutib yana urinib ko'ring

### Build xatosi
**Yechim**:
1. Local'da `pnpm build` ishlashini tekshiring
2. `package.json`'da `engines` versiyalarini tekshiring

---

## Deploy Pipeline (CI/CD)

Har safar `main` branch'ga push qilganingizda:
1. **Vercel**: Avtomatik frontend deploy qiladi
2. **Render**: Avtomatik backend deploy qiladi

### Manual Redeploy
- **Vercel**: Dashboard → Deployments → Redeploy
- **Render**: Dashboard → Manual Deploy → Deploy latest commit

---

## Xavfsizlik Checklist

- [ ] JWT_SECRET kamida 32 ta belgidan iborat
- [ ] SUPER_ADMIN_PASSWORD kuchli (katta/kichik harf, raqam, belgi)
- [ ] MongoDB password kuchli
- [ ] Production'da DEBUG=false
- [ ] CORS faqat frontend domain'ga ruxsat beradi
- [ ] Environment variables GitHub'ga push qilinmagan

---

## Foydali Linklar

- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)
- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas/)
- [Cloudinary Docs](https://cloudinary.com/documentation)

---

## Yordam

Muammolar bo'lsa:
1. Render/Vercel logs'ni tekshiring
2. Browser DevTools → Network/Console
3. GitHub Issues yarating

---

**Muvaffaqiyatli deploy!** 🚀
