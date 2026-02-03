// Firebase - Google'ning eng kuchli database'i
// 300+ foydalanuvchi, real-time, barcha telefonlarda ishlaydi

import type { Profile, Group, Grade, News, Homework, Comment } from '@/types'

interface FirebaseDatabase {
  profiles: Record<string, Profile>
  groups: Record<string, Group>
  grades: Record<string, Grade>
  news: Record<string, News>
  homework: Record<string, Homework>
  comments: Record<string, Comment>
  passwords: Record<string, string>
}

class FirebaseDatabaseService {
  private baseUrl = 'https://bukhari-academy-default-rtdb.firebaseio.com'
  private cache: FirebaseDatabase | null = null
  private cacheTime = 0
  private readonly CACHE_DURATION = 3000 // 3 soniya - juda tez

  async loadDatabase(): Promise<FirebaseDatabase> {
    const now = Date.now()
    if (this.cache && (now - this.cacheTime) < this.CACHE_DURATION) {
      return this.cache
    }

    try {
      const response = await fetch(`${this.baseUrl}/.json?t=${now}`)
      if (response.ok) {
        const data = await response.json() || this.getDefaultDatabase()
        this.cache = data
        this.cacheTime = now
        console.log('🔥 Firebase: Ma\'lumotlar yuklandi')
        return data
      }
    } catch (error) {
      console.error('Firebase xatosi:', error)
    }

    // Fallback
    return this.getFallbackData()
  }

  async saveToFirebase(data: FirebaseDatabase): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        console.log('🔥 Firebase: Ma\'lumotlar saqlandi - BARCHA TELEFONLARDA YANGILANADI!')
        this.cache = data
        this.cacheTime = Date.now()
        return
      }
    } catch (error) {
      console.error('Firebase saqlash xatosi:', error)
    }

    // Fallback
    localStorage.setItem('bukhari_firebase_db', JSON.stringify(data))
    this.cache = data
    this.cacheTime = Date.now()
  }

  private getDefaultDatabase(): FirebaseDatabase {
    return {
      profiles: {
        'admin-1': {
          id: 'admin-1',
          email: 'admin@bukhari.uz',
          first_name: 'Admin',
          last_name: 'Bukhari',
          role: 'admin',
          group_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      },
      groups: {},
      grades: {},
      news: {
        'news-1': {
          id: 'news-1',
          title: 'Bukhari Academy ga xush kelibsiz!',
          content: 'O\'quv markazimizga xush kelibsiz. Bu yerda siz o\'z baholaringizni, uyga vazifalaringizni va yangiliklar bilan tanishishingiz mumkin.',
          author_id: 'admin-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      },
      homework: {},
      comments: {},
      passwords: {
        'admin-1': 'admin123'
      }
    }
  }

  private getFallbackData(): FirebaseDatabase {
    const stored = localStorage.getItem('bukhari_firebase_db')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (error) {
        console.error('localStorage parse error:', error)
      }
    }
    
    const defaultData = this.getDefaultDatabase()
    localStorage.setItem('bukhari_firebase_db', JSON.stringify(defaultData))
    return defaultData
  }

  // Login function
  async login(email: string, password: string): Promise<Profile | null> {
    const db = await this.loadDatabase()
    const profile = Object.values(db.profiles).find(p => p.email === email)
    
    if (!profile) return null
    
    const storedPassword = db.passwords[profile.id] || 'student123'
    if (password !== storedPassword) return null
    
    return profile
  }

  // Get functions
  async getProfiles(): Promise<Profile[]> {
    const db = await this.loadDatabase()
    return Object.values(db.profiles)
  }

  async getGroups(): Promise<Group[]> {
    const db = await this.loadDatabase()
    return Object.values(db.groups)
  }

  async getNews(): Promise<News[]> {
    const db = await this.loadDatabase()
    return Object.values(db.news).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }

  async getGradesByStudent(studentId: string): Promise<Grade[]> {
    const db = await this.loadDatabase()
    return Object.values(db.grades)
      .filter(g => g.student_id === studentId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  async getHomeworkByStudent(studentId: string): Promise<Homework[]> {
    const db = await this.loadDatabase()
    return Object.values(db.homework)
      .filter(h => h.student_id === studentId)
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
    
    db.profiles[id] = newProfile
    db.passwords[id] = password
    
    await this.saveToFirebase(db)
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
    
    db.groups[id] = newGroup
    await this.saveToFirebase(db)
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
    
    db.news[id] = newNews
    await this.saveToFirebase(db)
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
    
    db.grades[id] = newGrade
    await this.saveToFirebase(db)
    return newGrade
  }

  // Delete functions
  async deleteNews(newsId: string): Promise<void> {
    const db = await this.loadDatabase()
    delete db.news[newsId]
    await this.saveToFirebase(db)
  }

  // Get password
  async getPassword(profileId: string): Promise<string> {
    const db = await this.loadDatabase()
    return db.passwords[profileId] || 'student123'
  }
}

export const firebaseDb = new FirebaseDatabaseService()