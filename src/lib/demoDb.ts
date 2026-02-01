import type { Profile, Group, Grade, Role, News, Homework, Comment } from '@/types'

const PROFILES_KEY = 'bukhari_profiles'
const GROUPS_KEY = 'bukhari_groups'
const GRADES_KEY = 'bukhari_grades'
const NEWS_KEY = 'bukhari_news'
const HOMEWORK_KEY = 'bukhari_homework'
const COMMENTS_KEY = 'bukhari_comments'
const AUTH_KEY = 'bukhari_auth'

const defaultAdmin: Profile = {
  id: 'admin-1',
  email: 'admin@bukhari.uz',
  first_name: 'Admin',
  last_name: 'Bukhari',
  role: 'admin',
  group_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

function getProfiles(): Profile[] {
  const raw = localStorage.getItem(PROFILES_KEY)
  if (!raw) {
    const initial = [defaultAdmin]
    localStorage.setItem(PROFILES_KEY, JSON.stringify(initial))
    return initial
  }
  return JSON.parse(raw)
}

function setProfiles(profiles: Profile[]) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
}

function getGroups(): Group[] {
  const raw = localStorage.getItem(GROUPS_KEY)
  return raw ? JSON.parse(raw) : []
}

function setGroups(groups: Group[]) {
  localStorage.setItem(GROUPS_KEY, JSON.stringify(groups))
}

function getGrades(): Grade[] {
  const raw = localStorage.getItem(GRADES_KEY)
  return raw ? JSON.parse(raw) : []
}

function setGrades(grades: Grade[]) {
  localStorage.setItem(GRADES_KEY, JSON.stringify(grades))
}

function getNews(): News[] {
  const raw = localStorage.getItem(NEWS_KEY)
  if (!raw) {
    const initial: News[] = [
      {
        id: 'news-1',
        title: 'Yangi guruh ochildi!',
        content: 'Beginner darajasidagi yangi guruh ochildi. Darslar dushanba, chorshanba, juma kunlari soat 18:00 da boshlanadi.',
        author_id: 'admin-1',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'news-2',
        title: 'CEFR sertifikati olish imkoniyati',
        content: 'O\'quv markazimizda endi CEFR standartidagi xalqaro sertifikat olish imkoniyati mavjud. Batafsil ma\'lumot uchun administratsiyaga murojaat qiling.',
        author_id: 'admin-1',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        updated_at: new Date(Date.now() - 172800000).toISOString()
      }
    ]
    localStorage.setItem(NEWS_KEY, JSON.stringify(initial))
    return initial
  }
  return JSON.parse(raw)
}

function setNews(news: News[]) {
  localStorage.setItem(NEWS_KEY, JSON.stringify(news))
}

function getHomework(): Homework[] {
  const raw = localStorage.getItem(HOMEWORK_KEY)
  return raw ? JSON.parse(raw) : []
}

function setHomework(homework: Homework[]) {
  localStorage.setItem(HOMEWORK_KEY, JSON.stringify(homework))
}

function getComments(): Comment[] {
  const raw = localStorage.getItem(COMMENTS_KEY)
  return raw ? JSON.parse(raw) : []
}

function setComments(comments: Comment[]) {
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments))
}

export interface DemoAuthUser {
  id: string
  email: string
  role: Role
  profile: Profile
}

export function demoLogin(email: string, password: string): DemoAuthUser | null {
  if (email === 'admin@bukhari.uz' && password === 'admin.sanobarhon.2003') {
    const profiles = getProfiles()
    let admin = profiles.find((p) => p.role === 'admin' && p.email === email)
    if (!admin) {
      admin = defaultAdmin
      setProfiles([...profiles.filter((p) => p.id !== defaultAdmin.id), admin])
    }
    const user: DemoAuthUser = { id: admin.id, email: admin.email, role: 'admin', profile: admin }
    localStorage.setItem(AUTH_KEY, JSON.stringify(user))
    return user
  }
  const profiles = getProfiles()
  const profile = profiles.find((p) => p.email === email && p.role !== 'admin')
  if (!profile) return null
  const stored = localStorage.getItem(`bukhari_pwd_${profile.id}`)
  const pwd = stored || 'student123'
  if (password !== pwd) return null
  const user: DemoAuthUser = { id: profile.id, email: profile.email, role: profile.role, profile }
  localStorage.setItem(AUTH_KEY, JSON.stringify(user))
  return user
}

export function demoLogout() {
  localStorage.removeItem(AUTH_KEY)
}

export function demoGetSession(): DemoAuthUser | null {
  const raw = localStorage.getItem(AUTH_KEY)
  return raw ? JSON.parse(raw) : null
}

export const demoDb = {
  getProfiles,
  setProfiles,
  getGroups,
  setGroups,
  getGrades,
  setGrades,
  getNews,
  setNews,
  getHomework,
  setHomework,
  getComments,
  setComments,
  saveProfile(profile: Omit<Profile, 'created_at' | 'updated_at'>) {
    const now = new Date().toISOString()
    const profiles = getProfiles()
    const existing = profiles.find((p) => p.id === profile.id)
    const newProfile: Profile = existing
      ? { ...existing, ...profile, updated_at: now }
      : { ...profile, created_at: now, updated_at: now }
    const list = existing ? profiles.map((p) => (p.id === profile.id ? newProfile : p)) : [...profiles, newProfile]
    setProfiles(list)
    return newProfile
  },
  createProfile(data: { email: string; first_name: string; last_name: string; role: Role; group_id?: string | null }) {
    const id = `profile-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    return this.saveProfile({ ...data, id, group_id: data.group_id ?? null })
  },
  setStudentPassword(profileId: string, password: string) {
    localStorage.setItem(`bukhari_pwd_${profileId}`, password)
  },
  getGroup(id: string) {
    return getGroups().find((g) => g.id === id) ?? null
  },
  createGroup(name: string, teacher_id: string) {
    const groups = getGroups()
    const id = `group-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const newGroup: Group = { id, name, teacher_id, created_at: new Date().toISOString() }
    setGroups([...groups, newGroup])
    return newGroup
  },
  addGrade(student_id: string, teacher_id: string, grade_value: number, bonus: number, note: string | null) {
    const grades = getGrades()
    const id = `grade-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const newGrade: Grade = {
      id,
      student_id,
      teacher_id,
      grade_value,
      bonus,
      note,
      created_at: new Date().toISOString(),
    }
    setGrades([...grades, newGrade])
    return newGrade
  },
  getGradesByStudent(student_id: string) {
    return getGrades().filter((g) => g.student_id === student_id)
  },
  getGradesByTeacher(teacher_id: string) {
    return getGrades().filter((g) => g.teacher_id === teacher_id)
  },
  getStudentsByGroup(group_id: string) {
    return getProfiles().filter((p) => p.role === 'student' && p.group_id === group_id)
  },
  getTeachers() {
    return getProfiles().filter((p) => p.role === 'teacher')
  },
  getGroupsByTeacher(teacher_id: string) {
    return getGroups().filter((g) => g.teacher_id === teacher_id)
  },
  createNews(title: string, content: string, author_id: string) {
    const news = getNews()
    const id = `news-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const newNews: News = {
      id,
      title,
      content,
      author_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    setNews([newNews, ...news])
    return newNews
  },
  deleteNews(newsId: string) {
    const news = getNews()
    const filtered = news.filter(n => n.id !== newsId)
    setNews(filtered)
  },
  createHomework(student_id: string, teacher_id: string, title: string, description: string, due_date: string) {
    const homework = getHomework()
    const id = `homework-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const newHomework: Homework = {
      id,
      student_id,
      teacher_id,
      title,
      description,
      due_date,
      is_completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    setHomework([...homework, newHomework])
    return newHomework
  },
  getHomeworkByStudent(student_id: string) {
    return getHomework().filter(h => h.student_id === student_id)
  },
  updateHomeworkStatus(homework_id: string, is_completed: boolean) {
    const homework = getHomework()
    const index = homework.findIndex(h => h.id === homework_id)
    if (index !== -1) {
      homework[index] = { ...homework[index], is_completed, updated_at: new Date().toISOString() }
      setHomework(homework)
      return homework[index]
    }
    throw new Error('Homework not found')
  },
  createComment(student_id: string, teacher_id: string, content: string, type: 'positive' | 'negative' | 'neutral') {
    const comments = getComments()
    const id = `comment-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const newComment: Comment = {
      id,
      student_id,
      teacher_id,
      content,
      type,
      created_at: new Date().toISOString()
    }
    setComments([...comments, newComment])
    return newComment
  },
  getCommentsByStudent(student_id: string) {
    return getComments().filter(c => c.student_id === student_id)
  },
  getPassword(profileId: string): string {
    return localStorage.getItem(`bukhari_pwd_${profileId}`) || 'student123'
  }
}