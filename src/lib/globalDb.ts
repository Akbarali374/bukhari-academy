import type { Profile, Group, Grade, News, Homework, Comment, Attendance, Payment, TestQuestion, TestAttempt, TestResult } from '@/types'
import { persistentStorage } from './persistentStorage'

interface GlobalDatabase {
  profiles: Profile[]
  groups: Group[]
  grades: Grade[]
  news: News[]
  homework: Homework[]
  comments: Comment[]
  attendance: Attendance[]
  payments: Payment[]
  testQuestions: TestQuestion[]
  testAttempts: TestAttempt[]
  testResults: TestResult[]
  passwords: Record<string, string>
}

class GlobalDatabaseService {
  private cache: GlobalDatabase | null = null
  private cacheTime = 0
  private readonly CACHE_DURATION = 3000 // 3 soniya - biroz ko'proq
  
  // O'ZINGIZNING API SERVERINGIZ - Vercel Serverless Function
  private readonly API_URL = '/api/database'
  
  // API KALITI - Himoya uchun
  private readonly API_KEY = 'bukhari_academy_secret_2024_sanobarhon'
  
  // Retry mexanizmi
  private retryCount = 0
  private readonly MAX_RETRIES = 3

  async loadDatabase(): Promise<GlobalDatabase> {
    const now = Date.now()
    
    // Cache'dan qaytarish (agar yangi bo'lsa)
    if (this.cache && (now - this.cacheTime) < this.CACHE_DURATION) {
      return this.cache
    }

    // 1. API'dan yuklash
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(`${this.API_URL}?t=${now}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.API_KEY
          },
          cache: 'no-cache'
        })
        
        if (response.ok) {
          const data = await response.json()
          
          if (data && data.profiles && Array.isArray(data.profiles)) {
            this.cache = data
            this.cacheTime = now
            this.retryCount = 0
            
            // localStorage'ga backup saqlash
            try {
              localStorage.setItem('bukhari_global_db', JSON.stringify(data))
              localStorage.setItem('bukhari_last_sync', now.toString())
            } catch (e) {
              // Silent fail
            }
            
            // GitHub Gist'ga ham saqlash (agar sozlangan bo'lsa)
            if (persistentStorage.isConfigured()) {
              persistentStorage.saveToGist(data).catch(() => {})
            }
            
            return data
          }
        } else if (response.status === 403) {
          console.error('❌ API: Ruxsat yo\'q')
          break
        }
      } catch (error) {
        if (attempt === this.MAX_RETRIES) {
          console.error('❌ API xatosi:', error)
        }
      }
      
      // Keyingi urinishdan oldin kutish
      if (attempt < this.MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, attempt - 1), 5000)))
      }
    }

    // 2. GitHub Gist'dan yuklash
    if (persistentStorage.isConfigured()) {
      const gistData = await persistentStorage.loadFromGist()
      if (gistData) {
        this.cache = gistData
        this.cacheTime = now
        
        try {
          localStorage.setItem('bukhari_global_db', JSON.stringify(gistData))
        } catch (e) {}
        
        return gistData
      }
    }

    // 3. Fallback - localStorage
    return this.getFallbackData()
  }

  private getFallbackData(): GlobalDatabase {
    const stored = localStorage.getItem('bukhari_global_db')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (error) {
        console.error('localStorage parse xatosi:', error)
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
      attendance: [],
      passwords: {
        'admin-1': 'admin.sanobarhon.2003'
      }
    }
    
    // localStorage'ga saqlash
    try {
      localStorage.setItem('bukhari_global_db', JSON.stringify(defaultData))
    } catch (error) {
      console.error('localStorage saqlash xatosi:', error)
    }
    
    return defaultData
  }

  async saveToLocal(data: GlobalDatabase): Promise<void> {
    this.cache = data
    this.cacheTime = Date.now()
    
    // Retry mexanizmi bilan saqlash
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(this.API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.API_KEY
          },
          body: JSON.stringify(data)
        })

        if (response.ok) {
          // localStorage'ga ham saqlash
          try {
            localStorage.setItem('bukhari_global_db', JSON.stringify(data))
            localStorage.setItem('bukhari_last_sync', Date.now().toString())
          } catch (e) {}
          
          // GitHub Gist'ga ham saqlash (DOIMIY SAQLASH)
          if (persistentStorage.isConfigured()) {
            persistentStorage.saveToGist(data).catch(() => {})
          }
          
          // Boshqa tab'larga signal
          this.broadcastUpdate()
          return
        } else if (response.status === 403) {
          console.error('❌ API: Ruxsat yo\'q')
          break
        }
      } catch (error) {
        if (attempt === this.MAX_RETRIES) {
          console.error('❌ API saqlash xatosi:', error)
        }
      }
      
      // Keyingi urinishdan oldin kutish
      if (attempt < this.MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, attempt - 1), 5000)))
      }
    }

    // Fallback - localStorage va GitHub Gist
    try {
      localStorage.setItem('bukhari_global_db', JSON.stringify(data))
      localStorage.setItem('bukhari_last_sync', Date.now().toString())
      this.broadcastUpdate()
      
      // GitHub Gist'ga ham saqlash
      if (persistentStorage.isConfigured()) {
        await persistentStorage.saveToGist(data)
      }
    } catch (error) {
      console.error('❌ localStorage saqlash xatosi:', error)
    }
  }

  private broadcastUpdate(): void {
    try {
      const channel = new BroadcastChannel('bukhari_updates')
      channel.postMessage({
        type: 'data_update',
        timestamp: Date.now()
      })
      
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'bukhari_last_sync',
        newValue: Date.now().toString(),
        storageArea: localStorage
      }))
    } catch (error) {
      // Silent fail
    }
  }

  // Login function
  async login(email: string, password: string): Promise<Profile | null> {
    const db = await this.loadDatabase()
    const profile = db.profiles.find(p => p.email === email)
    
    if (!profile) {
      return null
    }
    
    const storedPassword = db.passwords[profile.id] || 'student123'
    if (password !== storedPassword) {
      return null
    }
    
    return profile
  }

  // Get functions
  async getProfiles(): Promise<Profile[]> {
    const db = await this.loadDatabase()
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

  async getAttendanceByStudent(studentId: string): Promise<Attendance[]> {
    const db = await this.loadDatabase()
    return db.attendance.filter(a => a.student_id === studentId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  async getAttendanceByDate(date: string): Promise<Attendance[]> {
    const db = await this.loadDatabase()
    return db.attendance.filter(a => a.date === date)
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

  async markAttendance(studentId: string, teacherId: string, date: string, status: 'keldi' | 'kelmadi'): Promise<Attendance> {
    const db = await this.loadDatabase()
    
    // Shu kunda allaqachon davomat bor-yo'qligini tekshirish
    const existingIndex = db.attendance.findIndex(
      a => a.student_id === studentId && a.date === date
    )
    
    if (existingIndex >= 0) {
      // Mavjud davomatni yangilash
      db.attendance[existingIndex].status = status
      db.attendance[existingIndex].teacher_id = teacherId
      await this.saveToLocal(db)
      return db.attendance[existingIndex]
    } else {
      // Yangi davomat qo'shish
      const id = `attendance-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      const newAttendance: Attendance = {
        id,
        student_id: studentId,
        teacher_id: teacherId,
        date,
        status,
        created_at: new Date().toISOString()
      }
      
      db.attendance.push(newAttendance)
      await this.saveToLocal(db)
      return newAttendance
    }
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
          this.cache = null
          this.cacheTime = 0
        }
      } catch (error) {
        // Silent fail
      }

      // Storage listener
      window.addEventListener('storage', (e) => {
        if (e.key === 'bukhari_last_sync') {
          this.cache = null
          this.cacheTime = 0
        }
      })
    }
  }

  // Auto refresh every 5 seconds
  startAutoRefresh(): void {
    setInterval(async () => {
      const now = Date.now()
      if (this.cache && (now - this.cacheTime) > 5000) {
        try {
          await this.loadDatabase()
        } catch (error) {
          // Silent fail
        }
      }
    }, 5000)
  }
  
  // Ma'lumotlar statistikasi
  async getStats(): Promise<{
    profiles: number
    groups: number
    grades: number
    news: number
    homework: number
    comments: number
    attendance: number
    cacheAge: number
    version: number
  }> {
    const db = await this.loadDatabase()
    return {
      profiles: db.profiles?.length || 0,
      groups: db.groups?.length || 0,
      grades: db.grades?.length || 0,
      news: db.news?.length || 0,
      homework: db.homework?.length || 0,
      comments: db.comments?.length || 0,
      attendance: db.attendance?.length || 0,
      cacheAge: Date.now() - this.cacheTime,
      version: (db as any).version || 1
    }
  }
}

export const globalDb = new GlobalDatabaseService()

// Setup listeners va auto refresh
if (typeof window !== 'undefined') {
  globalDb.setupListeners()
  globalDb.startAutoRefresh()
}