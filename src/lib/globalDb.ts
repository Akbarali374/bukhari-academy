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
  private readonly STORAGE_KEY = 'bukhari_global_db'
  private readonly SYNC_KEY = 'bukhari_last_sync'

  async loadDatabase(): Promise<GlobalDatabase> {
    const now = Date.now()
    if (this.cache && (now - this.cacheTime) < this.CACHE_DURATION) {
      return this.cache
    }

    // localStorage'dan yuklash
    const data = this.getStoredData()
    this.cache = data
    this.cacheTime = now
    
    console.log('💾 Ma\'lumotlar yuklandi -', data.profiles.length, 'foydalanuvchi')
    return data
  }

  private getStoredData(): GlobalDatabase {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        // Ma'lumotlar to'g'ri formatda ekanligini tekshirish
        if (data && data.profiles && Array.isArray(data.profiles)) {
          return data
        }
      }
    } catch (error) {
      console.error('localStorage parse error:', error)
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
    
    this.saveStoredData(defaultData)
    console.log('🔄 Default ma\'lumotlar yaratildi')
    return defaultData
  }

  private saveStoredData(data: GlobalDatabase): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
      localStorage.setItem(this.SYNC_KEY, Date.now().toString())
      console.log('💾 Ma\'lumotlar saqlandi -', data.profiles.length, 'foydalanuvchi')
    } catch (error) {
      console.error('localStorage save error:', error)
    }
  }

  async saveToLocal(data: GlobalDatabase): Promise<void> {
    this.cache = data
    this.cacheTime = Date.now()
    this.saveStoredData(data)
    
    // Boshqa tab'larga signal yuborish
    this.broadcastUpdate()
  }

  private broadcastUpdate(): void {
    try {
      // StorageEvent orqali boshqa tab'larga signal yuborish
      window.dispatchEvent(new StorageEvent('storage', {
        key: this.SYNC_KEY,
        newValue: Date.now().toString(),
        storageArea: localStorage
      }))
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

  // Force refresh
  async forceRefresh(): Promise<void> {
    this.cache = null
    this.cacheTime = 0
    console.log('🔄 Cache tozalandi')
  }

  // Setup storage listener
  setupStorageListener(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === this.SYNC_KEY) {
          console.log('📨 Storage yangilanish qabul qilindi')
          this.cache = null
          this.cacheTime = 0
        }
      })
      console.log('📡 Storage listener o\'rnatildi')
    }
  }

  // Export data for sharing
  exportData(): string {
    const data = this.getStoredData()
    return JSON.stringify(data, null, 2)
  }

  // Import data from sharing
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
}

export const globalDb = new GlobalDatabaseService()

// Storage listener'ni o'rnatish
if (typeof window !== 'undefined') {
  globalDb.setupStorageListener()
}