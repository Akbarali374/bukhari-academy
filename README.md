# Bukhari Academy — O'quv markazi boshqaruv tizimi

Butun maktab/o'quv markazi uchun React ilovasi: admin, ustozlar va o'quvchilar uchun boshqaruv, baholar, oylik hisobotlar, qorong'u rejim.

## Imkoniyatlar

- **Admin:** Login (admin@bukhari.uz / admin123), ustoz yaratish, guruh yaratish (har bir guruhga bitta ustoz), o'quvchilar bo'limi (guruh bo'yicha), loginlar ro'yxati, o'quvchilarga login yaratish, oylik hisobotlarni barcha o'quvchilarga Gmailga yuborish.
- **Ustoz:** O'z guruhlari va o'quvchilari, baho (1–100) va bonus qo'shish.
- **O'quvchi:** Gmail, familya, ism bilan qo'shiladi; profil va ma'lumotlarni tahrirlash; baholar va qo'shimcha bonuslarni ko'rish (ustoz baho qo'yishi bilan tez yangilanadi).
- **Oylik hisobot:** Har oy o'quvchiga "Hurmatli o'quvchi" deb natija Gmailga yuboriladi, oxirida "Hurmat bilan, Bukhari Academy".
- **Qorong'u rejim:** Barcha sahifalarda tema almashtirish (yorug'/qorong'u).

## Demo rejim (Supabase siz)

`.env` yaratmasangiz yoki `VITE_SUPABASE_URL` bo'sh qoldirsangiz, ilova **demo rejimda** ishlaydi: ma'lumotlar brauzerda (localStorage) saqlanadi.

- **Admin kirish:** admin@bukhari.uz / admin123
- Ustoz va o'quvchilarni admin panel orqali qo'shasiz; ustoz/oquvchi parolini admin o'zi belgilaydi (yoki o'quvchi uchun default: student123).

## Supabase bilan (production)

1. [Supabase](https://supabase.com) da loyiha oching.
2. `.env` yarating va quyidagilarni qo'ying:
   ```
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
3. Supabase SQL Editor da jadval va RLS sozlang (kerak bo'lsa migrations yozing: profiles, groups, grades).
4. Auth da admin foydalanuvchi qo'shing: admin@bukhari.uz, parol admin123; keyin profiles jadvaliga admin uchun role='admin' qator qo'shing.

## Loyihani ishga tushirish

```bash
npm install
npm run dev
```

Brauzerda: http://localhost:5173

## Build

```bash
npm run build
```

## GitHub va Vercel ga yuklash

1. **GitHub:** Yangi repo yarating, loyihani yuklang:
   ```bash
   git init
   git add .
   git commit -m "Bukhari Academy — o'quv markazi tizimi"
   git branch -M main
   git remote add origin https://github.com/USERNAME/bukhari-academy.git
   git push -u origin main
   ```

2. **Vercel:** [vercel.com](https://vercel.com) ga kiring → "Add New Project" → GitHub reponi tanlang → "Deploy". Bepul link olasiz (masalan: `https://bukhari-academy.vercel.app`).

3. **Environment variables:** Vercel da Project → Settings → Environment Variables da `VITE_SUPABASE_URL` va `VITE_SUPABASE_ANON_KEY` qo'shing (Supabase ishlatadigan bo'lsangiz). Demo rejim uchun ularni qo'ymasangiz ham ishlaydi.

## Texnologiyalar

- React 18, TypeScript, Vite
- React Router, Tailwind CSS, Lucide React, React Hot Toast
- Supabase (ixtiyoriy): Auth, DB, Realtime (baholar uchun tez yangilanish)
