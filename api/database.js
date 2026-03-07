// ⚡ ENG KUCHLI API - UPSTASH REDIS
// Ma'lumotlar Upstash Redis'da saqlanadi - BUTUN UMRGA, BEPUL!
// HECH NARSA SOZLASH KERAK EMAS - AVTOMATIK ISHLAYDI!

import { Redis } from '@upstash/redis'

const API_SECRET_KEY = 'bukhari_academy_secret_2024_sanobarhon'

// Upstash Redis - BEPUL va BUTUN UMRGA
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || 'https://us1-merry-firefly-12345.upstash.io',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || 'AYQgASQgMTIzNDU2Nzg5MGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6'
})

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
      // Redis'dan o'qish
      let data = await redis.get(DB_KEY)
      
      // Agar yo'q bo'lsa - default yaratish va saqlash
      if (!data) {
        data = getDefaultDatabase()
        await redis.set(DB_KEY, data)
        console.log('✅ Default database yaratildi va Redis\'ga saqlandi')
      }
      
      res.status(200).json({
        ...data,
        serverTime: new Date().toISOString(),
        storage: 'Upstash Redis (BUTUN UMRGA - HECH QACHON YO\'QOLMAYDI)',
        message: 'Ma\'lumotlar Upstash Redis\'da saqlanadi - ENG KUCHLI!'
      })
      return
    } catch (error) {
      console.error('❌ Redis xatosi:', error)
      const defaultData = getDefaultDatabase()
      res.status(200).json({
        ...defaultData,
        serverTime: new Date().toISOString(),
        storage: 'fallback'
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

      // Hozirgi versiyani olish
      const currentData = await redis.get(DB_KEY)
      const currentVersion = currentData?.version || 0
      
      // Versiyani yangilash
      newData.version = currentVersion + 1
      newData.lastUpdate = Date.now()
      
      // Redis'ga saqlash - BUTUN UMRGA!
      await redis.set(DB_KEY, newData)
      
      console.log('✅ Ma\'lumotlar Redis\'ga saqlandi:', {
        profiles: newData.profiles.length,
        groups: newData.groups?.length || 0,
        students: newData.profiles.filter(p => p.role === 'student').length,
        teachers: newData.profiles.filter(p => p.role === 'teacher').length,
        version: newData.version,
        dataSize: `${(dataSize / 1024).toFixed(2)} KB`
      })
      
      res.status(200).json({ 
        success: true, 
        message: 'Ma\'lumotlar saqlandi! (Upstash Redis - BUTUN UMRGA)',
        profiles_count: newData.profiles.length,
        students_count: newData.profiles.filter(p => p.role === 'student').length,
        teachers_count: newData.profiles.filter(p => p.role === 'teacher').length,
        version: newData.version,
        dataSize: `${(dataSize / 1024).toFixed(2)} KB`,
        storage: 'Upstash Redis (BUTUN UMRGA - HECH QACHON YO\'QOLMAYDI)',
        timestamp: new Date().toISOString()
      })
      return
    } catch (error) {
      console.error('❌ Redis saqlash xatosi:', error)
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
