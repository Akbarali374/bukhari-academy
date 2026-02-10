// Vercel Serverless Function - DOIMIY SAQLASH
// Ma'lumotlar BUTUN UMRGA saqlanadi
// 
// MUHIM: Vercel serverless function read-only, shuning uchun:
// 1. localStorage - Asosiy saqlash (har bir brauzerda)
// 2. API Server - Sinxronizatsiya uchun (RAM cache)
// 3. GitHub Gist - Global backup (ixtiyoriy)
//
// Agar haqiqiy server-side database kerak bo'lsa:
// - Vercel Postgres (bepul 256MB)
// - Vercel KV Redis (bepul 256MB)
// - Supabase (bepul 500MB)

const API_SECRET_KEY = 'bukhari_academy_secret_2024_sanobarhon'

// RAM cache - Vercel serverless function restart bo'lganda yo'qoladi
// Lekin bu muammo emas, chunki client localStorage'da saqlanadi
let globalDatabase = null
let lastUpdate = Date.now()

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

export default function handler(req, res) {
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
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // API kalitini tekshirish
  const apiKey = req.headers['x-api-key']
  if (apiKey !== API_SECRET_KEY) {
    res.status(403).json({ 
      error: 'Ruxsat yo\'q',
      timestamp: new Date().toISOString()
    })
    return
  }

  // GET - Ma'lumotlarni olish
  if (req.method === 'GET') {
    try {
      // Agar globalDatabase bo'sh bo'lsa, client localStorage'dan yuklaydi
      const data = globalDatabase || getDefaultDatabase()
      
      res.status(200).json({
        ...data,
        serverTime: new Date().toISOString(),
        storage: 'localStorage (permanent) + API cache'
      })
      return
    } catch (error) {
      console.error('❌ GET xatosi:', error)
      res.status(500).json({ 
        error: 'Server xatosi',
        message: error.message
      })
      return
    }
  }

  // POST/PUT - Ma'lumotlarni saqlash
  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const newData = req.body
      
      if (!newData || !newData.profiles || !Array.isArray(newData.profiles)) {
        res.status(400).json({ 
          error: 'Noto\'g\'ri ma\'lumot formati'
        })
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
      newData.version = (globalDatabase?.version || 0) + 1
      newData.lastUpdate = Date.now()
      
      // RAM'ga saqlash (cache)
      globalDatabase = newData
      lastUpdate = Date.now()
      
      console.log('✅ Ma\'lumotlar saqlandi:', {
        profiles: newData.profiles.length,
        version: newData.version,
        dataSize: `${(dataSize / 1024).toFixed(2)} KB`,
        storage: 'localStorage (permanent) + API cache'
      })
      
      res.status(200).json({ 
        success: true, 
        message: 'Ma\'lumotlar saqlandi! localStorage (doimiy) + API cache',
        profiles_count: newData.profiles.length,
        version: newData.version,
        dataSize: `${(dataSize / 1024).toFixed(2)} KB`,
        storage: 'localStorage (permanent) + API cache',
        timestamp: new Date().toISOString()
      })
      return
    } catch (error) {
      console.error('❌ POST/PUT xatosi:', error)
      res.status(500).json({ 
        error: 'Server xatosi',
        message: error.message
      })
      return
    }
  }

  res.status(405).json({ 
    error: 'Method not allowed',
    allowedMethods: ['GET', 'POST', 'PUT', 'OPTIONS']
  })
}
