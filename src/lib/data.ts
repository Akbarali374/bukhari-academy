/// <reference types="vite/client" />

import type { Profile, Group, Grade, News, Homework, Comment } from '@/types'
import { supabase } from './supabase'
import { demoDb } from './demoDb'

const SUPABASE_ENABLED = !!(import.meta.env?.VITE_SUPABASE_URL)

// Demo mode: use demoDb. Supabase mode: use supabase (we'll add later or use from context)
export async function getProfiles(): Promise<Profile[]> {
  if (!SUPABASE_ENABLED) return demoDb.getProfiles()
  const { data } = await supabase!.from('profiles').select('*').order('created_at', { ascending: false })
  return (data ?? []) as Profile[]
}

export async function getTeachers(): Promise<Profile[]> {
  if (!SUPABASE_ENABLED) return demoDb.getTeachers()
  const { data } = await supabase!.from('profiles').select('*').eq('role', 'teacher').order('created_at', { ascending: false })
  return (data ?? []) as Profile[]
}

export async function getGroups(): Promise<Group[]> {
  if (!SUPABASE_ENABLED) return demoDb.getGroups()
  const { data } = await supabase!.from('groups').select('*').order('created_at', { ascending: false })
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
  if (!SUPABASE_ENABLED) return demoDb.getStudentsByGroup(groupId)
  const { data } = await supabase!.from('profiles').select('*').eq('role', 'student').eq('group_id', groupId)
  return (data ?? []) as Profile[]
}

export async function getStudents(): Promise<Profile[]> {
  if (!SUPABASE_ENABLED) return demoDb.getProfiles().filter((p) => p.role === 'student')
  const { data } = await supabase!.from('profiles').select('*').eq('role', 'student').order('created_at', { ascending: false })
  return (data ?? []) as Profile[]
}

export async function createTeacher(email: string, first_name: string, last_name: string, password: string): Promise<Profile | { error: string }> {
  if (!SUPABASE_ENABLED) {
    const existing = demoDb.getProfiles().find((p) => p.email === email)
    if (existing) return { error: 'Bu email allaqachon mavjud' }
    const profile = demoDb.createProfile({ email, first_name, last_name, role: 'teacher', group_id: null })
    demoDb.setStudentPassword(profile.id, password)
    return profile
  }
  const { data: auth, error: authError } = await supabase!.auth.signUp({ email, password })
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
  if (!SUPABASE_ENABLED) return demoDb.createGroup(name, teacher_id)
  const { data, error } = await supabase!.from('groups').insert({ name, teacher_id }).select().single()
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
  if (!SUPABASE_ENABLED) {
    const existing = demoDb.getProfiles().find((p) => p.email === email)
    if (existing) return { error: 'Bu email allaqachon mavjud' }
    const profile = demoDb.createProfile({ email, first_name, last_name, role: 'student', group_id })
    demoDb.setStudentPassword(profile.id, password)
    return profile
  }
  const { data: auth, error: authError } = await supabase!.auth.signUp({ email, password })
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
  if (!SUPABASE_ENABLED) {
    const profiles = demoDb.getProfiles()
    const idx = profiles.findIndex((p) => p.id === id)
    if (idx === -1) return { error: 'Profil topilmadi' }
    const updated = { ...profiles[idx], ...data, updated_at: new Date().toISOString() }
    profiles[idx] = updated
    demoDb.setProfiles([...profiles])
    return updated
  }
  const { data: profile, error } = await supabase!.from('profiles').update(data).eq('id', id).select().single()
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
  if (!SUPABASE_ENABLED) return demoDb.addGrade(student_id, teacher_id, grade_value, bonus, note)
  const { data, error } = await supabase
    .from('grades')
    .insert({ student_id, teacher_id, grade_value, bonus, note })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Grade
}

export async function getGradesByStudent(student_id: string): Promise<Grade[]> {
  if (!SUPABASE_ENABLED) return demoDb.getGradesByStudent(student_id)
  const { data } = await supabase!.from('grades').select('*').eq('student_id', student_id).order('created_at', { ascending: false })
  return (data ?? []) as Grade[]
}

export async function getGradesByTeacher(teacher_id: string): Promise<Grade[]> {
  if (!SUPABASE_ENABLED) return demoDb.getGradesByTeacher(teacher_id)
  const { data } = await supabase!.from('grades').select('*').eq('teacher_id', teacher_id).order('created_at', { ascending: false })
  return (data ?? []) as Grade[]
}

export async function getGroupsByTeacher(teacher_id: string): Promise<Group[]> {
  if (!SUPABASE_ENABLED) return demoDb.getGroupsByTeacher(teacher_id)
  const { data } = await supabase!.from('groups').select('*').eq('teacher_id', teacher_id)
  return (data ?? []) as Group[]
}

export function subscribeGrades(student_id: string, onInsert: (grade: Grade) => void): () => void {
  if (!SUPABASE_ENABLED) {
    // Demo: poll or no real-time
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
    supabase!.removeChannel(channel)
  }
}
// News functions
export async function getNews(): Promise<News[]> {
  if (!SUPABASE_ENABLED) return demoDb.getNews()
  const { data } = await supabase!.from('news').select(`
    *,
    author:profiles(*)
  `).order('created_at', { ascending: false })
  return (data ?? []) as News[]
}

export async function createNews(title: string, content: string, author_id: string): Promise<News> {
  if (!SUPABASE_ENABLED) return demoDb.createNews(title, content, author_id)
  const { data, error } = await supabase!.from('news').insert({ title, content, author_id }).select().single()
  if (error) throw new Error(error.message)
  return data as News
}

// Homework functions
export async function getHomeworkByStudent(student_id: string): Promise<Homework[]> {
  if (!SUPABASE_ENABLED) return demoDb.getHomeworkByStudent(student_id)
  const { data } = await supabase!.from('homework').select(`
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
  if (!SUPABASE_ENABLED) return demoDb.createHomework(student_id, teacher_id, title, description, due_date)
  const { data, error } = await supabase!.from('homework').insert({
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
  if (!SUPABASE_ENABLED) return demoDb.updateHomeworkStatus(homework_id, is_completed)
  const { data, error } = await supabase!.from('homework').update({ is_completed }).eq('id', homework_id).select().single()
  if (error) throw new Error(error.message)
  return data as Homework
}

// Comments functions
export async function getCommentsByStudent(student_id: string): Promise<Comment[]> {
  if (!SUPABASE_ENABLED) return demoDb.getCommentsByStudent(student_id)
  const { data } = await supabase!.from('comments').select(`
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
  if (!SUPABASE_ENABLED) return demoDb.createComment(student_id, teacher_id, content, type)
  const { data, error } = await supabase!.from('comments').insert({
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
export async function deleteNews(newsId: string): Promise<void> {
  if (!SUPABASE_ENABLED) return demoDb.deleteNews(newsId)
  const { error } = await supabase!.from('news').delete().eq('id', newsId)
  if (error) throw new Error(error.message)
}
export function getPassword(profileId: string): string {
  if (!SUPABASE_ENABLED) return demoDb.getPassword(profileId)
  // In real Supabase implementation, passwords are not retrievable for security
  return 'Parol ko\'rib bo\'lmaydi'
}