-- Admin foydalanuvchi yaratish uchun SQL
-- Bu kodni Supabase SQL Editor'da bajaring

-- 1. Admin profilini yaratish (agar auth.users'da admin mavjud bo'lsa)
INSERT INTO profiles (id, email, first_name, last_name, role)
SELECT 
  id,
  'admin@bukhari.uz',
  'Admin',
  'Bukhari',
  'admin'
FROM auth.users 
WHERE email = 'admin@bukhari.uz'
ON CONFLICT (id) DO UPDATE SET
  first_name = 'Admin',
  last_name = 'Bukhari',
  role = 'admin';

-- 2. Agar auth.users'da admin yo'q bo'lsa, avval Authentication > Users'da yarating:
-- Email: admin@bukhari.uz
-- Password: admin.sanobarhon.2003
-- Email Confirm: true

-- 3. Demo yangilik qo'shish
INSERT INTO news (title, content, author_id)
SELECT 
  'Bukhari Academy ga xush kelibsiz!',
  'O''quv markazimizga xush kelibsiz. Bu yerda siz o''z baholaringizni, uyga vazifalaringizni va yangiliklar bilan tanishishingiz mumkin.',
  id
FROM profiles 
WHERE email = 'admin@bukhari.uz' AND role = 'admin'
ON CONFLICT DO NOTHING;