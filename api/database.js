// Vercel Serverless Function - GITHUB GIST BILAN
// Ma'lumotlar GitHub Gist'da saqlanadi - BUTUN UMRGA, BEPUL!
// Barcha qurilmalarda sinxronlanadi

const API_SECRET_KEY = 'bukhari_academy_secret_2024_sanobarhon'

// GitHub Gist sozlamalari - ADMIN SOZLAYDI
let GITHUB_TOKEN = process.env.GITHUB_TOKEN || ''
let GIST_ID = process.env.GIST_ID || ''

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
    lastUpdate: Date.now(),
    gistConfig: {
      configured: false,
      message: 'GitHub Gist sozlanmagan. Admin paneldan sozlang.'
    }
  }
}

// GitHub Gist'dan o'qish
async function loadFromGist() {
  if (!GIST_ID || !GITHUB_TOKEN) {
    return null
  }

  try {
    const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })

    if (!response.ok) {
      console.error('❌ GitHub Gist o\'qish xatosi:', response.status)
      return null
    }

    const gist = await response.json()
    const file = gist.files['bukhari-academy-db.json']
    
    if (file && file.content) {
      const data = JSON.parse(file.content)
      console.log('✅ GitHub Gist\'dan yuklandi:', {
        profiles: data.profiles?.length || 0,
        version: data.version || 1
      })
      return data
    }
  } catch (error) {
    console.error('❌ GitHub Gist xatosi:', error.message)
  }

  return null
}

// GitHub Gist'ga saqlash
async function saveToGist(data) {
  if (!GIST_ID || !GITHUB_TOKEN) {
    console.error('❌ GitHub Gist sozlanmagan')
    return false
  }

  try {
    const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files: {
          'bukhari-academy-db.json': {
            content: JSON.stringify(data, null, 2)
          }
        }
      })
    })

    if (!response.ok) {
      console.error('❌ GitHub Gist saqlash xatosi:', response.status)
      return false
    }

    console.log('✅ GitHub Gist\'ga saqlandi:', {
      profiles: data.profiles?.length || 0,
      version: data.version || 1
    })
    return true
  } catch (error) {
    console.error('❌ GitHub Gist xatosi:', error.message)
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
      // GitHub Gist'dan yuklash
      let data = await loadFromGist()
      
      // Agar Gist'da yo'q bo'lsa - default
      if (!data) {
        data = getDefaultDatabase()
      }
      
      res.status(200).json({
        ...data,
        serverTime: new Date().toISOString(),
        storage: GIST_ID && GITHUB_TOKEN ? 'GitHub Gist (permanent - butun umrga)' : 'Default (GitHub Gist sozlanmagan)',
        gistConfigured: !!(GIST_ID && GITHUB_TOKEN)
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

      // Versiyani yangilash
      newData.version = (newData.version || 0) + 1
      newData.lastUpdate = Date.now()
      
      // GitHub Gist config'ni yangilash (agar body'da bo'lsa)
      if (newData.gistConfig) {
        if (newData.gistConfig.gistId) GIST_ID = newData.gistConfig.gistId
        if (newData.gistConfig.githubToken) GITHUB_TOKEN = newData.gistConfig.githubToken
      }
      
      // GitHub Gist'ga saqlash
      const saved = await saveToGist(newData)
      
      console.log('✅ Ma\'lumotlar saqlandi:', {
        profiles: newData.profiles.length,
        groups: newData.groups?.length || 0,
        students: newData.profiles.filter(p => p.role === 'student').length,
        version: newData.version,
        dataSize: `${(dataSize / 1024).toFixed(2)} KB`,
        storage: saved ? 'GitHub Gist (permanent)' : 'GitHub Gist sozlanmagan'
      })
      
      res.status(200).json({ 
        success: true, 
        message: saved ? 'Ma\'lumotlar saqlandi! (GitHub Gist - butun umrga)' : 'Ma\'lumotlar qabul qilindi (GitHub Gist sozlanmagan)',
        profiles_count: newData.profiles.length,
        students_count: newData.profiles.filter(p => p.role === 'student').length,
        version: newData.version,
        dataSize: `${(dataSize / 1024).toFixed(2)} KB`,
        storage: saved ? 'GitHub Gist (permanent - butun umrga)' : 'GitHub Gist sozlanmagan',
        gistConfigured: saved,
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
