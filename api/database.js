// Vercel Serverless Function - O'zingizning API serveringiz
// HIMOYALANGAN - Faqat autentifikatsiya bilan ishlaydi

// API kaliti - Bu maxfiy kalit, faqat sizning saytingiz biladi
const API_SECRET_KEY = 'bukhari_academy_secret_2024_sanobarhon'

let globalDatabase = {
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
  passwords: {
    'admin-1': 'admin.sanobarhon.2003'
  },
  emailConfig: {
    fromEmail: 'bukhariacademy256@gmail.com',
    serviceId: '',
    templateId: '',
    publicKey: ''
  }
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
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key')

  // OPTIONS request uchun
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // API kalitini tekshirish
  const apiKey = req.headers['x-api-key']
  if (apiKey !== API_SECRET_KEY) {
    console.log('❌ Noto\'g\'ri API kaliti:', apiKey)
    res.status(403).json({ error: 'Ruxsat yo\'q - API kaliti noto\'g\'ri' })
    return
  }

  // GET - Ma'lumotlarni olish
  if (req.method === 'GET') {
    console.log('📥 GET request - Ma\'lumotlar yuborilmoqda')
    res.status(200).json(globalDatabase)
    return
  }

  // POST/PUT - Ma'lumotlarni saqlash
  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const newData = req.body
      
      // Ma'lumotlarni tekshirish
      if (!newData || !newData.profiles || !Array.isArray(newData.profiles)) {
        res.status(400).json({ error: 'Noto\'g\'ri ma\'lumot formati' })
        return
      }

      // Ma'lumotlarni yangilash
      globalDatabase = newData
      
      console.log('📤 POST/PUT request - Ma\'lumotlar saqlandi:', newData.profiles.length, 'foydalanuvchi')
      res.status(200).json({ 
        success: true, 
        message: 'Ma\'lumotlar BARCHA TELEFONLARGA yuborildi!',
        profiles_count: newData.profiles.length,
        timestamp: new Date().toISOString()
      })
      return
    } catch (error) {
      console.error('Saqlashda xato:', error)
      res.status(500).json({ error: 'Server xatosi' })
      return
    }
  }

  // Boshqa metodlar uchun
  res.status(405).json({ error: 'Method not allowed' })
}
