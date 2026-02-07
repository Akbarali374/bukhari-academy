import type { Profile, Group, Grade, News, Homework, Comment } from '@/types'

interface GlobalDatabase {
  profiles: Profile[]
  groups: Group[]
  grades: Grade[]
  news: News[]
  homework: Homework[]
  comments: Comment[]
  passwords: Record<string, string>
}

class GlobalDatabaseService {
  private cache: GlobalDatabase | null = null
  private cacheTime = 0
  private readonly CACHE_DURATION = 2000 // 2 soniya
  
  // O'ZINGIZNING API SERVERINGIZ - Vercel Serverless Function
  private readonly API_URL = '/api/database'

  async loadDatabase(): Promise<GlobalDatabase> {
    const now = Date.now()
    if (this.cache && (now - this.cacheTime) < this.CACHE_DURATION) {
      return this.cache
    }

    try {
      // O'z API serverimizdan ma'lumotlarni olish
      const response = await fetch(`${this.API_URL}?t=${now}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data && data.profiles && Array.isArray(data.profiles)) {
          this.cache = data
          this.cacheTime = now
          console.log('🚀 API Server: Ma\'lumotlar yuklandi -', data.profiles.length, 'foydalanuvchi')
          return data
        }
      } else {
        console.error('API Server xatosi:', response.status)
      }
    } catch (error) {
      console.error('API Server xatosi:', error)
    }

    // Fallback - localStorage
    return this.getFallbackData()
  }

  private getFallbackData(): GlobalDatabase {
    const stored = localStorage.getItem('bukhari_global_db')
    if (stored) {
      try {
        const data = JSON.parse(stored)
        console.log('💾 localStorage dan yuklandi')
        return data
      } catch (error) {
        console.error('localStorage parse error:', error)
      }
    }
    
    // Default ma'lumotlar
    const defaultData: GlobalDatabase = {
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
    }
    
    localStorage.setItem('bukhari_global_db', JSON.stringify(defaultData))
    console.log('🔄 Default ma\'lumotlar yaratildi')
    return defaultData
  }

  async saveToLocal(data: GlobalDatabase): Promise<void> {
    this.cache = data
    this.cacheTime = Date.now()
    
    try {
      // O'z API serverimizga saqlash
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        const result = await response.json()
        console.log('🚀 API Server: BARCHA TELEFONLARGA YUBORILDI!', result.profiles_count, 'foydalanuvchi')
        
        // localStorage'ga ham saqlash
        localStorage.setItem('bukhari_global_db', JSON.stringify(data))
        
        // Boshqa tab'larga signal
        this.broadcastUpdate()
        return
      } else {
        console.error('API Server saqlash xatosi:', response.status)
      }
    } catch (error) {
      console.error('API Server saqlash xatosi:', error)
    }

    // Fallback - localStorage
    localStorage.setItem('bukhari_global_db', JSON.stringify(data))
    this.broadcastUpdate()
    console.log('💾 localStorage\'ga saqlandi -', data.profiles.length, 'foydalanuvchi')
  }

  private broadcastUpdate(): void {
    try {
      // BroadcastChannel orqali boshqa tab'larga signal
      const channel = new BroadcastChannel('bukhari_updates')
      channel.postMessage({
        type: 'data_update',
        timestamp: Date.now()
      })
      
      // StorageEvent orqali ham signal
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'bukhari_last_sync',
        newValue: Date.now().toString(),
        storageArea: localStorage
      }))
      
      console.log('📡 Yangilanish signali yuborildi')
    } catch (error) {
      console.error('Broadcast xatosi:', error)
    }
  }

  // Login function
  async login(email: string, password: string): Promise<Profile | null> {
    const db = await this.loadDatabase()
    const profile = db.profiles.find(p => p.email === email)
    
    if (!profile) {
      console.log('❌ Profil topilmadi:', email)
      return null
    }
    
    const storedPassword = db.passwords[profile.id] || 'student123'
    if (password !== storedPassword) {
      console.log('❌ Parol noto\'g\'ri:', email, 'kutilgan:', storedPassword, 'kiritilgan:', password)
      return null
    }
    
    console.log('✅ Login muvaffaqiyatli:', profile.email, profile.role)
    return profile
  }

  // Get functions
  async getProfiles(): Promise<Profile[]> {
    const db = await this.loadDatabase()
    console.log('👥 Profillar soni:', db.profiles.length)
    return db.profiles
  }

  async getGroups(): Promise<Group[]> {
    const db = await this.loadDatabase()
    return db.groups
  }

  async getNews(): Promise<News[]> {
    const db = await this.loadDatabase()
    return db.news.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  async getGradesByStudent(studentId: string): Promise<Grade[]> {
    const db = await this.loadDatabase()
    return db.grades.filter(g => g.student_id === studentId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  async getHomeworkByStudent(studentId: string): Promise<Homework[]> {
    const db = await this.loadDatabase()
    return db.homework.filter(h => h.student_id === studentId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  // Create functions
  async createProfile(data: Omit<Profile, 'id' | 'created_at' | 'updated_at'>, password: string): Promise<Profile> {
    const db = await this.loadDatabase()
    const id = `profile-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const now = new Date().toISOString()
    
    const newProfile: Profile = {
      ...data,
      id,
      created_at: now,
      updated_at: now
    }
    
    db.profiles.push(newProfile)
    db.passwords[id] = password
    
    console.log('➕ Yangi profil yaratildi:', newProfile.email, newProfile.role)
    await this.saveToLocal(db)
    return newProfile
  }

  async createGroup(name: string, teacherId: string): Promise<Group> {
    const db = await this.loadDatabase()
    const id = `group-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    
    const newGroup: Group = {
      id,
      name,
      teacher_id: teacherId,
      created_at: new Date().toISOString()
    }
    
    db.groups.push(newGroup)
    await this.saveToLocal(db)
    return newGroup
  }

  async createNews(title: string, content: string, authorId: string): Promise<News> {
    const db = await this.loadDatabase()
    const id = `news-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const now = new Date().toISOString()
    
    const newNews: News = {
      id,
      title,
      content,
      author_id: authorId,
      created_at: now,
      updated_at: now
    }
    
    db.news.push(newNews)
    await this.saveToLocal(db)
    return newNews
  }

  async addGrade(studentId: string, teacherId: string, gradeValue: number, bonus: number, note: string | null): Promise<Grade> {
    const db = await this.loadDatabase()
    const id = `grade-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    
    const newGrade: Grade = {
      id,
      student_id: studentId,
      teacher_id: teacherId,
      grade_value: gradeValue,
      bonus,
      note,
      created_at: new Date().toISOString()
    }
    
    db.grades.push(newGrade)
    await this.saveToLocal(db)
    return newGrade
  }

  // Delete functions
  async deleteNews(newsId: string): Promise<void> {
    const db = await this.loadDatabase()
    db.news = db.news.filter(n => n.id !== newsId)
    await this.saveToLocal(db)
  }

  // Get password
  async getPassword(profileId: string): Promise<string> {
    const db = await this.loadDatabase()
    return db.passwords[profileId] || 'student123'
  }

  // Force refresh
  async forceRefresh(): Promise<void> {
    this.cache = null
    this.cacheTime = 0
    console.log('🔄 Cache tozalandi')
  }

  // Export/Import functions (Ma'lumot ulashish sahifasi uchun)
  exportData(): string {
    const data = this.cache || this.getFallbackData()
    return JSON.stringify(data, null, 2)
  }

  async importData(jsonData: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonData)
      if (data && data.profiles && Array.isArray(data.profiles)) {
        await this.saveToLocal(data)
        console.log('📥 Ma\'lumotlar import qilindi')
        return true
      }
    } catch (error) {
      console.error('Import xatosi:', error)
    }
    return false
  }

  // Setup listeners
  setupListeners(): void {
    if (typeof window !== 'undefined') {
      // BroadcastChannel listener
      try {
        const channel = new BroadcastChannel('bukhari_updates')
        channel.onmessage = () => {
          console.log('📨 Broadcast yangilanish qabul qilindi')
          this.cache = null
          this.cacheTime = 0
        }
      } catch (error) {
        console.error('BroadcastChannel xatosi:', error)
      }

      // Storage listener
      window.addEventListener('storage', (e) => {
        if (e.key === 'bukhari_last_sync') {
          console.log('📨 Storage yangilanish qabul qilindi')
          this.cache = null
          this.cacheTime = 0
        }
      })

      console.log('📡 Listeners o\'rnatildi')
    }
  }

  // Auto refresh every 5 seconds
  startAutoRefresh(): void {
    setInterval(async () => {
      if (this.cache && (Date.now() - this.cacheTime) > 5000) {
        console.log('🔄 Avtomatik yangilanish...')
        this.cache = null
        this.cacheTime = 0
        await this.loadDatabase()
      }
    }, 5000)
    console.log('⏰ Avtomatik yangilanish boshlandi (har 5 soniyada)')
  }
}

export const globalDb = new GlobalDatabaseService()

// Setup listeners va auto refresh
if (typeof window !== 'undefined') {
  globalDb.setupListeners()
  globalDb.startAutoRefresh()
}