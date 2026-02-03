# 🚀 SUPABASE SETUP QADAMLARI

## ✅ Bajarilgan ishlar:
1. ✅ Supabase loyihasi yaratildi: `bukhari-academy`
2. ✅ Database jadvallar yaratildi (profiles, groups, grades, news, homework, comments)
3. ✅ API kalitlar olindi va loyihaga qo'shildi
4. ✅ .env fayl yangilandi

## 🔄 Qolgan ishlar:

### 1. Admin foydalanuvchi yaratish:
1. Supabase dashboard > **Authentication** > **Users** ga o'ting
2. **"Add user"** tugmasini bosing
3. Quyidagilarni kiriting:
   - **Email**: `admin@bukhari.uz`
   - **Password**: `admin.sanobarhon.2003`
   - **Email Confirm**: `true` (galochka qo'ying)
4. **"Create user"** tugmasini bosing

### 2. Admin profilini yaratish:
1. Supabase dashboard > **SQL Editor** ga o'ting
2. `create-admin.sql` faylidagi kodni nusxalab joylashtiring
3. **"Run"** tugmasini bosing

### 3. Test qilish:
1. Loyihani ishga tushiring: `npm run dev`
2. Admin bilan kiring: `admin@bukhari.uz` / `admin.sanobarhon.2003`
3. Yangi student yarating
4. Boshqa telefondan o'sha student bilan kiring

## 🌍 Production Deploy:
```bash
git add .
git commit -m "Supabase professional database qo'shildi"
git push origin main
```

Vercel'da environment variables qo'shish:
- `VITE_SUPABASE_URL`: https://wuqzlahfqjsahqla.supabase.co
- `VITE_SUPABASE_ANON_KEY`: sb_publishable_fPDCtivhZEF07_tJz1f2Gw_bbXGBbiS

## 🎯 Natija:
- ✅ Cheksiz foydalanuvchi
- ✅ Barcha telefonlarda bir xil ma'lumot
- ✅ Real-time yangilanish
- ✅ Professional database