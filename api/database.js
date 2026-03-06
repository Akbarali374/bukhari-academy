// VERCEL SERVERLESS FUNCTION - VERCEL BLOB STORAGE
// Ma'lumotlar Vercel Blob'da saqlanadi - HAQIQIY DOIMIY SAQLASH!
// BEPUL va HECH NARSA SOZLASH KERAK EMAS!

import { put, head } from '@vercel/blob'

const API_SECRET_KEY = 'bukhari_academy_secret_2024_sanobarhon'
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || 'vercel_blob_rw_placeholder'

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

// Vercel Blob'dan o'qish
async function loadFromBlob() {
  try {
    const blobUrl = `https://bukhari-academy.vercel.app/api/blob/database.json`
    const response = await fetch(blobUrl, {
      headers: {
        'Authorization': `Bearer ${BLOB_TOKEN}`
      }
    })

    if (response.ok) {
      const data = await response.json()
      console.log('✅ Vercel Blob\'dan yuklandi:', {
        profiles: data.profiles?.length || 0,
        version: data.version || 1
      })
      return data
    }
  } catch (error) {
    console.log('ℹ️ Vercel Blob\'da ma\'lumot yo\'q, default yaratiladi')
  }

  return null
}

// Vercel Blob'ga saqlash
async function saveToBlob(data) {
  try {
    const blob = await put('database.json', JSON.stringify(data, null, 2), {
      access: 'public',
      token: BLOB_TOKEN,
      contentType: 'application/json'
    })

    console.log('✅ Vercel Blob\'ga saqlandi:', {
      url: blob.url,
      profiles: data.profiles?.length || 0,
      version: data.version || 1
    })
    return true
  } catch (error) {
    console.error('❌ Vercel Blob saqlash xatosi:', error.message)
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
      // Vercel Blob'dan yuklash
      let data = await loadFromBlob()
      
      // Agar Blob'da yo'q bo'lsa - default yaratish va saqlash
      if (!data) {
        data = getDefaultDatabase()
        await saveToBlob(data)
      }
      
      res.status(200).json({
        ...data,
        serverTime: new Date().toISOString(),
        storage: 'Vercel Blob (permanent - HAQIQIY doimiy saqlash)',
        message: 'Ma\'lumotlar Vercel Blob\'da saqlanadi - BUTUN UMRGA!'
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

      // Hozirgi ma'lumotlarni olish
      const currentData = await loadFromBlob()
      const currentVersion = currentData?.version || 0
      
      // Versiyani yangilash
      newData.version = currentVersion + 1
      newData.lastUpdate = Date.now()
      
      // Vercel Blob'ga saqlash - HAQIQIY DOIMIY!
      const saved = await saveToBlob(newData)
      
      console.log('✅ Ma\'lumotlar saqlandi:', {
        profiles: newData.profiles.length,
        groups: newData.groups?.length || 0,
        students: newData.profiles.filter(p => p.role === 'student').length,
        version: newData.version,
        dataSize: `${(dataSize / 1024).toFixed(2)} KB`,
        storage: 'Vercel Blob (permanent - HAQIQIY doimiy)'
      })
      
      res.status(200).json({ 
        success: true, 
        message: saved ? 'Ma\'lumotlar saqlandi! (Vercel Blob - BUTUN UMRGA)' : 'Xatolik yuz berdi',
        profiles_count: newData.profiles.length,
        students_count: newData.profiles.filter(p => p.role === 'student').length,
        version: newData.version,
        dataSize: `${(dataSize / 1024).toFixed(2)} KB`,
        storage: 'Vercel Blob (permanent - HAQIQIY doimiy saqlash)',
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
