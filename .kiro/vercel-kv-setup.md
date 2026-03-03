# Vercel KV (Redis) Sozlash

## 1. Vercel Dashboard'ga kiring
https://vercel.com/dashboard

## 2. Storage → Create Database
- **Database Type**: KV (Redis)
- **Database Name**: bukhari-academy-db
- **Region**: Washington, D.C., USA (eng yaqin)

## 3. Environment Variables
Vercel avtomatik quyidagi environment variable'larni qo'shadi:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

## 4. Deploy
Vercel avtomatik deploy qiladi va API KV bilan ishlaydi.

## Afzalliklari:
- ✅ BEPUL (256MB)
- ✅ Butun umrga saqlanadi
- ✅ Juda tez (Redis)
- ✅ Hech qachon yo'qolmaydi
- ✅ Vercel bilan integratsiya

## Ma'lumotlar:
- Maksimal hajm: 256MB (bepul plan)
- Maksimal key'lar: 100,000
- Tezlik: < 1ms
- Backup: Avtomatik

---

**MUHIM**: Vercel KV sozlangandan keyin, API avtomatik KV'dan ma'lumotlarni o'qiydi va yozadi. Hech narsa qo'shimcha qilish kerak emas!
