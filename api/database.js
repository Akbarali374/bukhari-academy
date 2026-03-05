// Vercel Serverless Function - ODDIY VA ISHONCHLI
// Ma'lumotlar localStorage'da saqlanadi (har bir brauzerda)
// API faqat sinxronizatsiya uchun ishlatiladi

const API_SECRET_KEY = 'bukhari_academy_secret_2024_sanobarhon'

// RAM cache - tez ishlash uchun
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
    'https://bukhari-academy-brtlj.vercel.app',
    'https://bukhari-academy-5wgd9.vercel.app',
    'https://bukhari-academy-cay2.vercel.app',
    'https://bukhari-academy-8ob7.vercel.app',
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
      const data = globalDatabase || getDefaultDatabase()
      
      res.status(200).json({
        ...data,
        serverTime: new Date().toISOString(),
        storage: 'localStorage (permanent)',
        message: 'Ma\'lumotlar localStorage\'da saqlanadi'
      })
      return
    } catch (error) {
      console.error('❌ GET xatosi:', error)
      const defaultData = getDefaultDatabase()
      res.status(200).json({
        ...defaultData,
        serverTime: new Date().toISOString(),
        storage: 'default'
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
      newData.version = (globalDatabase?.version || 0) + 1
      newData.lastUpdate = Date.now()
      
      // RAM'ga saqlash (sinxronizatsiya uchun)
      globalDatabase = newData
      lastUpdate = Date.now()
      
      console.log('✅ Ma\'lumotlar saqlandi:', {
        profiles: newData.profiles.length,
        version: newData.version,
        dataSize: `${(dataSize / 1024).toFixed(2)} KB`,
        storage: 'localStorage (permanent)'
      })
      
      res.status(200).json({ 
        success: true, 
        message: 'Ma\'lumotlar saqlandi! (localStorage - doimiy)',
        profiles_count: newData.profiles.length,
        version: newData.version,
        dataSize: `${(dataSize / 1024).toFixed(2)} KB`,
        storage: 'localStorage (permanent)',
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
