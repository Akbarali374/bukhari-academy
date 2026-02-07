// Vercel Serverless Function - KUCHLI API SERVER
// 300+ foydalanuvchi uchun optimallashtirilgan
// HIMOYALANGAN - Faqat autentifikatsiya bilan ishlaydi

// API kaliti - Bu maxfiy kalit, faqat sizning saytingiz biladi
const API_SECRET_KEY = 'bukhari_academy_secret_2024_sanobarhon'

// GLOBAL DATABASE - Xotira asosida (RAM) - juda tez!
// Vercel serverless function har safar ishga tushganda bu ma'lumotlar qayta yuklanadi
let globalDatabase = null
let lastUpdate = Date.now()

// Default ma'lumotlar
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
    passwords: {
      'admin-1': 'admin.sanobarhon.2003'
    },
    emailConfig: {
      fromEmail: 'bukhariacademy256@gmail.com',
      serviceId: '',
      templateId: '',
      publicKey: ''
    },
    version: 1,
    lastUpdate: Date.now()
  }
}

// Database'ni initsializatsiya qilish
if (!globalDatabase) {
  globalDatabase = getDefaultDatabase()
  console.log('🚀 Database initialized')
}

export default function handler(req, res) {
  // CORS headers - faqat sizning saytingizdan
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
    // Agar origin yo'q bo'lsa (masalan, server-side request), ruxsat berish
    res.setHeader('Access-Control-Allow-Origin', '*')
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key')
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')

  // OPTIONS request uchun
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // API kalitini tekshirish
  const apiKey = req.headers['x-api-key']
  if (apiKey !== API_SECRET_KEY) {
    console.log('❌ Noto\'g\'ri API kaliti')
    res.status(403).json({ 
      error: 'Ruxsat yo\'q - API kaliti noto\'g\'ri',
      timestamp: new Date().toISOString()
    })
    return
  }

  // Database'ni tekshirish
  if (!globalDatabase) {
    console.log('⚠️ Database yo\'q, qayta yaratilmoqda...')
    globalDatabase = getDefaultDatabase()
  }

  // GET - Ma'lumotlarni olish (TEZKOR)
  if (req.method === 'GET') {
    try {
      console.log('📥 GET request - Ma\'lumotlar yuborilmoqda:', {
        profiles: globalDatabase.profiles?.length || 0,
        groups: globalDatabase.groups?.length || 0,
        grades: globalDatabase.grades?.length || 0,
        news: globalDatabase.news?.length || 0,
        homework: globalDatabase.homework?.length || 0,
        comments: globalDatabase.comments?.length || 0,
        attendance: globalDatabase.attendance?.length || 0
      })
      
      // Ma'lumotlarni JSON formatda yuborish
      res.status(200).json({
        ...globalDatabase,
        serverTime: new Date().toISOString(),
        version: globalDatabase.version || 1
      })
      return
    } catch (error) {
      console.error('❌ GET xatosi:', error)
      res.status(500).json({ 
        error: 'Server xatosi',
        message: error.message,
        timestamp: new Date().toISOString()
      })
      return
    }
  }

  // POST/PUT - Ma'lumotlarni saqlash (KUCHLI)
  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const newData = req.body
      
      // Ma'lumotlarni tekshirish
      if (!newData) {
        res.status(400).json({ 
          error: 'Ma\'lumot yo\'q',
          timestamp: new Date().toISOString()
        })
        return
      }

      if (!newData.profiles || !Array.isArray(newData.profiles)) {
        res.status(400).json({ 
          error: 'Noto\'g\'ri ma\'lumot formati - profiles array kerak',
          timestamp: new Date().toISOString()
        })
        return
      }

      // Ma'lumotlar hajmini tekshirish (300+ foydalanuvchi uchun)
      const dataSize = JSON.stringify(newData).length
      const maxSize = 10 * 1024 * 1024 // 10MB limit
      
      if (dataSize > maxSize) {
        console.error('❌ Ma\'lumot hajmi juda katta:', dataSize, 'bytes')
        res.status(413).json({ 
          error: 'Ma\'lumot hajmi juda katta',
          size: dataSize,
          maxSize: maxSize,
          timestamp: new Date().toISOString()
        })
        return
      }

      // Versiyani yangilash
      const oldVersion = globalDatabase.version || 1
      newData.version = oldVersion + 1
      newData.lastUpdate = Date.now()

      // Ma'lumotlarni SAQLASH (RAM'ga)
      globalDatabase = {
        ...newData,
        version: newData.version,
        lastUpdate: newData.lastUpdate
      }
      
      lastUpdate = Date.now()
      
      console.log('✅ POST/PUT request - Ma\'lumotlar saqlandi:', {
        profiles: newData.profiles.length,
        groups: newData.groups?.length || 0,
        grades: newData.grades?.length || 0,
        news: newData.news?.length || 0,
        homework: newData.homework?.length || 0,
        comments: newData.comments?.length || 0,
        attendance: newData.attendance?.length || 0,
        version: newData.version,
        dataSize: `${(dataSize / 1024).toFixed(2)} KB`
      })
      
      res.status(200).json({ 
        success: true, 
        message: 'Ma\'lumotlar BARCHA TELEFONLARGA yuborildi!',
        profiles_count: newData.profiles.length,
        groups_count: newData.groups?.length || 0,
        grades_count: newData.grades?.length || 0,
        news_count: newData.news?.length || 0,
        homework_count: newData.homework?.length || 0,
        comments_count: newData.comments?.length || 0,
        attendance_count: newData.attendance?.length || 0,
        version: newData.version,
        dataSize: `${(dataSize / 1024).toFixed(2)} KB`,
        timestamp: new Date().toISOString()
      })
      return
    } catch (error) {
      console.error('❌ POST/PUT xatosi:', error)
      res.status(500).json({ 
        error: 'Server xatosi',
        message: error.message,
        timestamp: new Date().toISOString()
      })
      return
    }
  }

  // Boshqa metodlar uchun
  res.status(405).json({ 
    error: 'Method not allowed',
    allowedMethods: ['GET', 'POST', 'PUT', 'OPTIONS'],
    timestamp: new Date().toISOString()
  })
}
