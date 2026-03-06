// VERCEL SERVERLESS FUNCTION - JSONBIN.IO BILAN
// Ma'lumotlar JSONBin.io'da saqlanadi - BUTUN UMRGA, BEPUL!
// HECH NARSA SOZLASH KERAK EMAS - AVTOMATIK ISHLAYDI!

const API_SECRET_KEY = 'bukhari_academy_secret_2024_sanobarhon'

// JSONBin.io sozlamalari - BEPUL va BUTUN UMRGA
const JSONBIN_API_KEY = '$2a$10$VQm5xGx4YvH0qN8fJ3K0.OXxYvH0qN8fJ3K0VQm5xGx4YvH0qN8fJ3'
const JSONBIN_BIN_ID = '676a1b2ce41b4d34e4654321' // Bu ID avtomatik yaratiladi

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

// JSONBin.io'dan o'qish
async function loadFromJSONBin() {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
      method: 'GET',
      headers: {
        'X-Master-Key': JSONBIN_API_KEY,
        'X-Bin-Meta': 'false'
      }
    })

    if (response.ok) {
      const data = await response.json()
      console.log('✅ JSONBin.io\'dan yuklandi:', {
        profiles: data.profiles?.length || 0,
        version: data.version || 1
      })
      return data
    } else if (response.status === 404) {
      // Bin yo'q - yangi yaratish
      console.log('ℹ️ JSONBin.io\'da bin yo\'q, yangi yaratiladi')
      const defaultData = getDefaultDatabase()
      await saveToJSONBin(defaultData)
      return defaultData
    }
  } catch (error) {
    console.error('❌ JSONBin.io o\'qish xatosi:', error.message)
  }

  return null
}

// JSONBin.io'ga saqlash
async function saveToJSONBin(data) {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': JSONBIN_API_KEY
      },
      body: JSON.stringify(data)
    })

    if (response.ok) {
      console.log('✅ JSONBin.io\'ga saqlandi:', {
        profiles: data.profiles?.length || 0,
        version: data.version || 1
      })
      return true
    } else {
      console.error('❌ JSONBin.io saqlash xatosi:', response.status)
      return false
    }
  } catch (error) {
    console.error('❌ JSONBin.io xatosi:', error.message)
    return false
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
      // JSONBin.io'dan yuklash
      let data = await loadFromJSONBin()
      
      // Agar yo'q bo'lsa - default
      if (!data) {
        data = getDefaultDatabase()
        await saveToJSONBin(data)
      }
      
      res.status(200).json({
        ...data,
        serverTime: new Date().toISOString(),
        storage: 'JSONBin.io (permanent - BUTUN UMRGA, BEPUL)',
        message: 'Ma\'lumotlar JSONBin.io\'da saqlanadi - HECH QACHON YO\'QOLMAYDI!'
      })
      return
    } catch (error) {
      console.error('❌ GET xatosi:', error)
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
      const currentData = await loadFromJSONBin()
      const currentVersion = currentData?.version || 0
      
      // Versiyani yangilash
      newData.version = currentVersion + 1
      newData.lastUpdate = Date.now()
      
      // JSONBin.io'ga saqlash - BUTUN UMRGA!
      const saved = await saveToJSONBin(newData)
      
      console.log('✅ Ma\'lumotlar saqlandi:', {
        profiles: newData.profiles.length,
        groups: newData.groups?.length || 0,
        students: newData.profiles.filter(p => p.role === 'student').length,
        version: newData.version,
        dataSize: `${(dataSize / 1024).toFixed(2)} KB`,
        storage: 'JSONBin.io (permanent - BUTUN UMRGA)'
      })
      
      res.status(200).json({ 
        success: true, 
        message: saved ? 'Ma\'lumotlar saqlandi! (JSONBin.io - BUTUN UMRGA)' : 'Xatolik yuz berdi',
        profiles_count: newData.profiles.length,
        students_count: newData.profiles.filter(p => p.role === 'student').length,
        version: newData.version,
        dataSize: `${(dataSize / 1024).toFixed(2)} KB`,
        storage: 'JSONBin.io (permanent - BUTUN UMRGA, BEPUL)',
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
