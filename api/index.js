// JSON API Backend - 300+ foydalanuvchi uchun
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'database.json');

// Database yuklab olish
function loadDatabase() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Database yuklash xatosi:', error);
    return getDefaultDatabase();
  }
}

// Database saqlash
function saveDatabase(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Database saqlash xatosi:', error);
    return false;
  }
}

// Default database
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
    passwords: {
      'admin-1': 'admin.sanobarhon.2003'
    }
  };
}

// API handler
export default function handler(req, res) {
  // CORS headers - barcha domenlardan kirish uchun
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const db = loadDatabase();

  // GET - ma'lumotlarni olish
  if (req.method === 'GET') {
    res.status(200).json(db);
    return;
  }

  // POST - ma'lumotlarni yangilash
  if (req.method === 'POST') {
    try {
      const newData = req.body;
      if (saveDatabase(newData)) {
        res.status(200).json({ success: true, message: 'Ma\'lumotlar saqlandi' });
      } else {
        res.status(500).json({ success: false, message: 'Saqlash xatosi' });
      }
    } catch (error) {
      res.status(400).json({ success: false, message: 'Noto\'g\'ri ma\'lumot' });
    }
    return;
  }

  // Boshqa metodlar
  res.status(405).json({ success: false, message: 'Metod qo\'llab-quvvatlanmaydi' });
}