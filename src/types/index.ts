export type Role = 'admin' | 'teacher' | 'student'

export interface Profile {
  id: string
  email: string
  first_name: string
  last_name: string
  role: Role
  group_id: string | null
  created_at: string
  updated_at: string
}

export interface Group {
  id: string
  name: string
  teacher_id: string
  created_at: string
  teacher?: Profile
  students_count?: number
}

export interface Grade {
  id: string
  student_id: string
  teacher_id: string
  grade_value: number
  bonus: number
  note: string | null
  created_at: string
  student?: Profile
}

export interface ProfileWithGroup extends Profile {
  group?: Group
}

export interface News {
  id: string
  title: string
  content: string
  author_id: string
  created_at: string
  updated_at: string
  author?: Profile
}

export interface Homework {
  id: string
  student_id: string
  teacher_id: string
  title: string
  description: string
  is_completed: boolean
  due_date: string
  created_at: string
  updated_at: string
  student?: Profile
  teacher?: Profile
}

export interface Comment {
  id: string
  student_id: string
  teacher_id: string
  content: string
  type: 'positive' | 'negative' | 'neutral'
  created_at: string
  student?: Profile
  teacher?: Profile
}
