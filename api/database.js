// Vercel Serverless Function - DOIMIY SAQLASH
// Ma'lumotlar BUTUN UMRGA saqlanadi - Vercel KV (Redis)
// BEPUL: 256MB, 100,000 keys, < 1ms latency

import { kv } from '@vercel/kv'

const API_SECRET_KEY = 'bukhari_academy_secret_2024_sanobarhon'
const DB_KEY = 'bukhari_academy_database'

function getDefaultDatabase() {
  return {
    profiles: [
      {
        id: 'admin-1',
        email: 'admin@bukhari.uz',
        first_name: 'Admin',
        last_name: 'Bukhari',
        role: 'admin',
        group_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    groups: [],
    grades: [],
    news: [
      {
        id: 'news-1',
        title: 'Bukhari Academy ga xush kelibsiz!',
        content: 'O\'quv markazimizga xush kelibsiz. Bu yerda siz o\'z baholaringizni, uyga vazifalaringizni va yangiliklar bilan tanishishingiz mumkin.',
        author_id: 'admin-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    homework: [],
    comments: [],
    attendance: [],
    payments: [],
    testQuestions: [],
    testAttempts: [],
    testResults: [],
    passwords: {
      'admin-1': 'admin.sanobarhon.2003'
    },
    version: 1,
    lastUpdate: Date.now()
  }
}

export default async function handler(req, res) {
  // CORS headers
  const origin = req.headers.origin
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://bukhari-academy.vercel.app',
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
  ].filter(Boolean)

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*')
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key')
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // API kalitini tekshirish
  const apiKey = req.headers['x-api-key']
  if (apiKey !== API_SECRET_KEY) {
    res.status(403).json({ error: 'Ruxsat yo\'q' })
    return
  }

  // GET - Ma'lumotlarni olish
  if (req.method === 'GET') {
    try {
      // Vercel KV'dan o'qish (DOIMIY SAQLASH)
      let data = await kv.get(DB_KEY)
      
      // Agar KV'da yo'q bo'lsa, default ma'lumotlarni saqlash
      if (!data) {
        data = getDefaultDatabase()
        await kv.set(DB_KEY, data)
        console.log('✅ Default ma\'lumotlar KV\'ga saqlandi')
      }
      
      console.log('📥 GET - KV\'dan yuklandi:', {
        profiles: data.profiles?.length || 0,
        version: data.version || 1,
        storage: 'Vercel KV (permanent)'
      })
      
      res.status(200).json({
        ...data,
        serverTime: new Date().toISOString(),
        storage: 'Vercel KV (permanent - butun umr)'
      })
      return
    } catch (error) {
      console.error('❌ GET xatosi:', error)
      
      // Fallback - default ma'lumotlar
      const defaultData = getDefaultDatabase()
      res.status(200).json({
        ...defaultData,
        serverTime: new Date().toISOString(),
        storage: 'fallback (KV unavailable)',
        warning: 'Vercel KV sozlanmagan. Vercel Dashboard\'dan KV yarating.'
      })
      return
    }
  }

  // POST/PUT - Ma'lumotlarni saqlash
  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const newData = req.body
      
      if (!newData || !newData.profiles || !Array.isArray(newData.profiles)) {
        res.status(400).json({ error: 'Noto\'g\'ri ma\'lumot formati' })
        return
      }

      // Ma'lumotlar hajmini tekshirish
      const dataSize = JSON.stringify(newData).length
      const maxSize = 10 * 1024 * 1024 // 10MB
      
      if (dataSize > maxSize) {
        res.status(413).json({ 
          error: 'Ma\'lumot hajmi juda katta',
          size: dataSize,
          maxSize: maxSize
        })
        return
      }

      // Versiyani yangilash
      const currentData = await kv.get(DB_KEY)
      newData.version = (currentData?.version || 0) + 1
      newData.lastUpdate = Date.now()
      
      // Vercel KV'ga saqlash (DOIMIY SAQLASH - BUTUN UMR)
      await kv.set(DB_KEY, newData)
      
      console.log('✅ POST/PUT - KV\'ga saqlandi (DOIMIY):', {
        profiles: newData.profiles.length,
        version: newData.version,
        dataSize: `${(dataSize / 1024).toFixed(2)} KB`,
        storage: 'Vercel KV (permanent)'
      })
      
      res.status(200).json({ 
        success: true, 
        message: 'Ma\'lumotlar BUTUN UMRGA saqlandi! (Vercel KV)',
        profiles_count: newData.profiles.length,
        version: newData.version,
        dataSize: `${(dataSize / 1024).toFixed(2)} KB`,
        storage: 'Vercel KV (permanent - hech qachon yo\'qolmaydi)',
        timestamp: new Date().toISOString()
      })
      return
    } catch (error) {
      console.error('❌ POST/PUT xatosi:', error)
      res.status(500).json({ 
        error: 'Server xatosi',
        message: error.message,
        hint: 'Vercel KV sozlanmagan bo\'lishi mumkin. Vercel Dashboard\'dan KV yarating.'
      })
      return
    }
  }

  res.status(405).json({ 
    error: 'Method not allowed',
    allowedMethods: ['GET', 'POST', 'PUT', 'OPTIONS']
  })
}
