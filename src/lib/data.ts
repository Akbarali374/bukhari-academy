/// <reference types="vite/client" />

import type { Profile, Group, Grade, News, Homework, Comment } from '@/types'
import { supabase } from './supabase'
import { globalDb } from './globalDb'

const SUPABASE_ENABLED = !!(typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL)

// Use global database instead of localStorage
export async function getProfiles(): Promise<Profile[]> {
  if (!SUPABASE_ENABLED || !supabase) return globalDb.getProfiles()
  const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
  return (data ?? []) as Profile[]
}

export async function getTeachers(): Promise<Profile[]> {
  if (!SUPABASE_ENABLED || !supabase) {
    const profiles = await globalDb.getProfiles()
    return profiles.filter(p => p.role === 'teacher')
  }
  const { data } = await supabase.from('profiles').select('*').eq('role', 'teacher').order('created_at', { ascending: false })
  return (data ?? []) as Profile[]
}

export async function getGroups(): Promise<Group[]> {
  if (!SUPABASE_ENABLED || !supabase) return globalDb.getGroups()
  const { data } = await supabase.from('groups').select('*').order('created_at', { ascending: false })
  return (data ?? []) as Group[]
}

export async function getGroupsWithTeacher(): Promise<(Group & { teacher?: Profile })[]> {
  const groups = await getGroups()
  const profiles = await getProfiles()
  const teachers = profiles.filter((p) => p.role === 'teacher')
  return groups.map((g) => ({
    ...g,
    teacher: teachers.find((t) => t.id === g.teacher_id),
    students_count: profiles.filter((p) => p.role === 'student' && p.group_id === g.id).length,
  }))
}

export async function getStudentsByGroup(groupId: string): Promise<Profile[]> {
  if (!SUPABASE_ENABLED || !supabase) {
    const profiles = await globalDb.getProfiles()
    return profiles.filter(p => p.role === 'student' && p.group_id === groupId)
  }
  const { data } = await supabase.from('profiles').select('*').eq('role', 'student').eq('group_id', groupId)
  return (data ?? []) as Profile[]
}

export async function getStudents(): Promise<Profile[]> {
  if (!SUPABASE_ENABLED || !supabase) {
    const profiles = await globalDb.getProfiles()
    return profiles.filter(p => p.role === 'student')
  }
  const { data } = await supabase.from('profiles').select('*').eq('role', 'student').order('created_at', { ascending: false })
  return (data ?? []) as Profile[]
}

export async function createTeacher(email: string, first_name: string, last_name: string, password: string): Promise<Profile | { error: string }> {
  if (!SUPABASE_ENABLED || !supabase) {
    try {
      const profiles = await globalDb.getProfiles()
      const existing = profiles.find(p => p.email === email)
      if (existing) return { error: 'Bu email allaqachon mavjud' }
      
      const profile = await globalDb.createProfile({
        email,
        first_name,
        last_name,
        role: 'teacher',
        group_id: null
      }, password)
      
      return profile
    } catch (error) {
      return { error: 'Xatolik yuz berdi' }
    }
  }
  
  const { data: auth, error: authError } = await supabase.auth.signUp({ email, password })
  if (authError) return { error: authError.message }
  if (!auth.user) return { error: 'Foydalanuvchi yaratilmadi' }
  const { data: profile, error } = await supabase
    .from('profiles')
    .insert({ id: auth.user.id, email, first_name, last_name, role: 'teacher', group_id: null })
    .select()
    .single()
  if (error) return { error: error.message }
  return profile as Profile
}

export async function createGroup(name: string, teacher_id: string): Promise<Group> {
  if (!SUPABASE_ENABLED || !supabase) return globalDb.createGroup(name, teacher_id)
  const { data, error } = await supabase.from('groups').insert({ name, teacher_id }).select().single()
  if (error) throw new Error(error.message)
  return data as Group
}

export async function createStudent(
  email: string,
  first_name: string,
  last_name: string,
  group_id: string,
  password: string
): Promise<Profile | { error: string }> {
  if (!SUPABASE_ENABLED || !supabase) {
    try {
      const profiles = await globalDb.getProfiles()
      const existing = profiles.find(p => p.email === email)
      if (existing) return { error: 'Bu email allaqachon mavjud' }
      
      const profile = await globalDb.createProfile({
        email,
        first_name,
        last_name,
        role: 'student',
        group_id
      }, password)
      
      return profile
    } catch (error) {
      return { error: 'Xatolik yuz berdi' }
    }
  }
  
  const { data: auth, error: authError } = await supabase.auth.signUp({ email, password })
  if (authError) return { error: authError.message }
  if (!auth.user) return { error: 'Foydalanuvchi yaratilmadi' }
  const { data: profile, error } = await supabase
    .from('profiles')
    .insert({ id: auth.user.id, email, first_name, last_name, role: 'student', group_id })
    .select()
    .single()
  if (error) return { error: error.message }
  return profile as Profile
}

export async function updateProfile(id: string, data: Partial<Pick<Profile, 'first_name' | 'last_name' | 'email'>>): Promise<Profile | { error: string }> {
  if (!SUPABASE_ENABLED || !supabase) {
    try {
      const profiles = await globalDb.getProfiles()
      const idx = profiles.findIndex((p) => p.id === id)
      if (idx === -1) return { error: 'Profil topilmadi' }
      const updated = { ...profiles[idx], ...data, updated_at: new Date().toISOString() }
      profiles[idx] = updated
      await globalDb.saveToLocal({
        profiles,
        groups: await globalDb.getGroups(),
        grades: [],
        news: await globalDb.getNews(),
        homework: [],
        comments: [],
        passwords: {}
      })
      return updated
    } catch (error) {
      return { error: 'Xatolik yuz berdi' }
    }
  }
  const { data: profile, error } = await supabase.from('profiles').update(data).eq('id', id).select().single()
  if (error) return { error: error.message }
  return profile as Profile
}

export async function addGrade(
  student_id: string,
  teacher_id: string,
  grade_value: number,
  bonus: number,
  note: string | null
): Promise<Grade> {
  if (!SUPABASE_ENABLED || !supabase) return globalDb.addGrade(student_id, teacher_id, grade_value, bonus, note)
  const { data, error } = await supabase
    .from('grades')
    .insert({ student_id, teacher_id, grade_value, bonus, note })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Grade
}

export async function getGradesByStudent(student_id: string): Promise<Grade[]> {
  if (!SUPABASE_ENABLED || !supabase) return globalDb.getGradesByStudent(student_id)
  const { data } = await supabase.from('grades').select('*').eq('student_id', student_id).order('created_at', { ascending: false })
  return (data ?? []) as Grade[]
}

export async function getGradesByTeacher(teacher_id: string): Promise<Grade[]> {
  if (!SUPABASE_ENABLED || !supabase) {
    const db = await globalDb.loadDatabase()
    return db.grades.filter(g => g.teacher_id === teacher_id)
  }
  const { data } = await supabase.from('grades').select('*').eq('teacher_id', teacher_id).order('created_at', { ascending: false })
  return (data ?? []) as Grade[]
}

export async function getGroupsByTeacher(teacher_id: string): Promise<Group[]> {
  if (!SUPABASE_ENABLED || !supabase) {
    const groups = await globalDb.getGroups()
    return groups.filter(g => g.teacher_id === teacher_id)
  }
  const { data } = await supabase.from('groups').select('*').eq('teacher_id', teacher_id)
  return (data ?? []) as Group[]
}

export function subscribeGrades(student_id: string, onInsert: (grade: Grade) => void): () => void {
  if (!SUPABASE_ENABLED || !supabase) {
    return () => {}
  }
  const channel = supabase
    .channel(`grades:${student_id}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'grades', filter: `student_id=eq.${student_id}` },
      (payload) => onInsert(payload.new as Grade)
    )
    .subscribe()
  return () => {
    supabase.removeChannel(channel)
  }
}

// News functions
export async function getNews(): Promise<News[]> {
  if (!SUPABASE_ENABLED || !supabase) return globalDb.getNews()
  const { data } = await supabase.from('news').select(`
    *,
    author:profiles(*)
  `).order('created_at', { ascending: false })
  return (data ?? []) as News[]
}

export async function createNews(title: string, content: string, author_id: string): Promise<News> {
  if (!SUPABASE_ENABLED || !supabase) return globalDb.createNews(title, content, author_id)
  const { data, error } = await supabase.from('news').insert({ title, content, author_id }).select().single()
  if (error) throw new Error(error.message)
  return data as News
}

export async function deleteNews(newsId: string): Promise<void> {
  if (!SUPABASE_ENABLED || !supabase) return globalDb.deleteNews(newsId)
  const { error } = await supabase.from('news').delete().eq('id', newsId)
  if (error) throw new Error(error.message)
}

// Homework functions
export async function getHomeworkByStudent(student_id: string): Promise<Homework[]> {
  if (!SUPABASE_ENABLED || !supabase) return globalDb.getHomeworkByStudent(student_id)
  const { data } = await supabase.from('homework').select(`
    *,
    teacher:profiles!homework_teacher_id_fkey(*)
  `).eq('student_id', student_id).order('created_at', { ascending: false })
  return (data ?? []) as Homework[]
}

export async function createHomework(
  student_id: string,
  teacher_id: string,
  title: string,
  description: string,
  due_date: string
): Promise<Homework> {
  if (!SUPABASE_ENABLED || !supabase) {
    const db = await globalDb.loadDatabase()
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
    db.homework.push(newHomework)
    await globalDb.saveToLocal(db)
    return newHomework
  }
  const { data, error } = await supabase.from('homework').insert({
    student_id,
    teacher_id,
    title,
    description,
    due_date,
    is_completed: false
  }).select().single()
  if (error) throw new Error(error.message)
  return data as Homework
}

export async function updateHomeworkStatus(homework_id: string, is_completed: boolean): Promise<Homework> {
  if (!SUPABASE_ENABLED || !supabase) {
    const db = await globalDb.loadDatabase()
    const index = db.homework.findIndex(h => h.id === homework_id)
    if (index !== -1) {
      db.homework[index] = { ...db.homework[index], is_completed, updated_at: new Date().toISOString() }
      await globalDb.saveToLocal(db)
      return db.homework[index]
    }
    throw new Error('Homework not found')
  }
  const { data, error } = await supabase.from('homework').update({ is_completed }).eq('id', homework_id).select().single()
  if (error) throw new Error(error.message)
  return data as Homework
}

// Comments functions
export async function getCommentsByStudent(student_id: string): Promise<Comment[]> {
  if (!SUPABASE_ENABLED || !supabase) {
    const db = await globalDb.loadDatabase()
    return db.comments.filter(c => c.student_id === student_id)
  }
  const { data } = await supabase.from('comments').select(`
    *,
    teacher:profiles!comments_teacher_id_fkey(*)
  `).eq('student_id', student_id).order('created_at', { ascending: false })
  return (data ?? []) as Comment[]
}

export async function createComment(
  student_id: string,
  teacher_id: string,
  content: string,
  type: 'positive' | 'negative' | 'neutral'
): Promise<Comment> {
  if (!SUPABASE_ENABLED || !supabase) {
    const db = await globalDb.loadDatabase()
    const id = `comment-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const newComment: Comment = {
      id,
      student_id,
      teacher_id,
      content,
      type,
      created_at: new Date().toISOString()
    }
    db.comments.push(newComment)
    await globalDb.saveToLocal(db)
    return newComment
  }
  const { data, error } = await supabase.from('comments').insert({
    student_id,
    teacher_id,
    content,
    type
  }).select().single()
  if (error) throw new Error(error.message)
  return data as Comment
}

// Predefined comment suggestions for teachers
export const commentSuggestions = {
  positive: [
    'Yaxshi o\'qidi',
    'Faol qatnashdi',
    'Uyga vazifani to\'liq bajargan',
    'Darsda diqqatli edi',
    'Savollarni yaxshi javob berdi',
    'Mashqlarni to\'g\'ri bajargan',
    'Yaxshi tayyorgarlik ko\'rgan',
    'Darsda ijodkor edi'
  ],
  negative: [
    'Uyga vazifani bajarmagan',
    'Darsda chalg\'igan',
    'Kech kelgan',
    'Savollarni javob bermagan',
    'Mashqlarni noto\'g\'ri bajargan',
    'Tayyorgarlik ko\'rmagan',
    'Darsda passiv edi'
  ],
  neutral: [
    'Darsda qatnashdi',
    'Vazifani qisman bajargan',
    'O\'rtacha natija ko\'rsatdi',
    'Qo\'shimcha mashq kerak',
    'Takrorlash talab etiladi'
  ]
}

export async function getPassword(profileId: string): Promise<string> {
  if (!SUPABASE_ENABLED || !supabase) return globalDb.getPassword(profileId)
  return 'Parol ko\'rib bo\'lmaydi'
}