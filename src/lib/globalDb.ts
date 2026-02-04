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
  private readonly CACHE_DURATION = 1000 // 1 soniya
  private readonly SYNC_KEY = 'bukhari_sync_data'
  private readonly LOCAL_KEY = 'bukhari_global_db'

  async loadDatabase(): Promise<GlobalDatabase> {
    const now = Date.now()
    if (this.cache && (now - this.cacheTime) < this.CACHE_DURATION) {
      return this.cache
    }

    // Avval localStorage'dan yuklaymiz
    const localData = this.getLocalData()
    
    // Keyin sync ma'lumotlarini tekshiramiz
    try {
      const syncData = localStorage.getItem(this.SYNC_KEY)
      if (syncData) {
        const parsed = JSON.parse(syncData)
        // Sync ma'lumotlarini local ma'lumotlar bilan birlashtirish
        const merged = this.mergeData(localData, parsed)
        this.cache = merged
        this.cacheTime = now
        console.log('🔄 Ma\'lumotlar birlashtirildi -', merged.profiles.length, 'foydalanuvchi')
        return merged
      }
    } catch (error) {
      console.error('Sync ma\'lumotlarini yuklashda xato:', error)
    }

    this.cache = localData
    this.cacheTime = now
    console.log('💾 Local ma\'lumotlar yuklandi -', localData.profiles.length, 'foydalanuvchi')
    return localData
  }

  private getLocalData(): GlobalDatabase {
    const stored = localStorage.getItem(this.LOCAL_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
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
        'admin-1': 'admin123'
      }
    }
    
    localStorage.setItem(this.LOCAL_KEY, JSON.stringify(defaultData))
    console.log('🔄 Default ma\'lumotlar yaratildi')
    return defaultData
  }

  private mergeData(local: GlobalDatabase, sync: GlobalDatabase): GlobalDatabase {
    // Sync ma'lumotlarini local ma'lumotlar bilan birlashtirish
    const merged: GlobalDatabase = {
      profiles: [...local.profiles],
      groups: [...local.groups],
      grades: [...local.grades],
      news: [...local.news],
      homework: [...local.homework],
      comments: [...local.comments],
      passwords: { ...local.passwords }
    }

    // Sync'dan yangi profillarni qo'shish
    sync.profiles.forEach(syncProfile => {
      if (!merged.profiles.find(p => p.id === syncProfile.id)) {
        merged.profiles.push(syncProfile)
        if (sync.passwords[syncProfile.id]) {
          merged.passwords[syncProfile.id] = sync.passwords[syncProfile.id]
        }
      }
    })

    // Boshqa ma'lumotlarni ham qo'shish
    sync.groups.forEach(item => {
      if (!merged.groups.find(g => g.id === item.id)) {
        merged.groups.push(item)
      }
    })

    sync.news.forEach(item => {
      if (!merged.news.find(n => n.id === item.id)) {
        merged.news.push(item)
      }
    })

    sync.grades.forEach(item => {
      if (!merged.grades.find(g => g.id === item.id)) {
        merged.grades.push(item)
      }
    })

    sync.homework.forEach(item => {
      if (!merged.homework.find(h => h.id === item.id)) {
        merged.homework.push(item)
      }
    })

    sync.comments.forEach(item => {
      if (!merged.comments.find(c => c.id === item.id)) {
        merged.comments.push(item)
      }
    })

    return merged
  }

  async saveToLocal(data: GlobalDatabase): Promise<void> {
    // Local'ga saqlash
    localStorage.setItem(this.LOCAL_KEY, JSON.stringify(data))
    this.cache = data
    this.cacheTime = Date.now()
    
    // Sync uchun ham saqlash (boshqa telefonlar uchun)
    localStorage.setItem(this.SYNC_KEY, JSON.stringify(data))
    
    console.log('💾 Ma\'lumotlar saqlandi -', data.profiles.length, 'foydalanuvchi')
    
    // Boshqa telefonlarga signal yuborish uchun
    this.broadcastUpdate(data)
  }

  private broadcastUpdate(data: GlobalDatabase): void {
    // BroadcastChannel orqali boshqa tab'larga signal yuborish
    try {
      const channel = new BroadcastChannel('bukhari_updates')
      channel.postMessage({
        type: 'data_update',
        data: data,
        timestamp: Date.now()
      })
      console.log('📡 Yangilanish signal yuborildi')
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

  // Broadcast listener setup
  setupBroadcastListener(): void {
    try {
      const channel = new BroadcastChannel('bukhari_updates')
      channel.onmessage = (event) => {
        if (event.data.type === 'data_update') {
          console.log('📨 Yangilanish qabul qilindi')
          localStorage.setItem(this.SYNC_KEY, JSON.stringify(event.data.data))
          // Cache'ni tozalash
          this.cache = null
          this.cacheTime = 0
        }
      }
      console.log('📡 Broadcast listener o\'rnatildi')
    } catch (error) {
      console.error('Broadcast listener xatosi:', error)
    }
  }
}

export const globalDb = new GlobalDatabaseService()

// Broadcast listener'ni o'rnatish
if (typeof window !== 'undefined') {
  globalDb.setupBroadcastListener()
}