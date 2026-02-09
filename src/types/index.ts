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

export interface Attendance {
  id: string
  student_id: string
  teacher_id: string
  date: string
  status: 'keldi' | 'kelmadi'
  created_at: string
  student?: Profile
  teacher?: Profile
}

// To'lov tizimi
export interface Payment {
  id: string
  student_id: string
  amount: number
  month: string // "2024-02" formatida
  status: 'to\'landi' | 'to\'lanmadi' | 'qisman'
  paid_amount: number
  payment_date: string | null
  note: string | null
  created_at: string
  student?: Profile
}

// Test tizimi
export type TestLevel = 'beginner' | 'intermediate' | 'advanced'
export type TestQuestionType = 'single' | 'multiple'

export interface TestQuestion {
  id: string
  level: TestLevel
  question: string
  options: string[] // 4 ta variant
  correct_answer: number[] // To'g'ri javob indekslari (0-3)
  type: TestQuestionType
  points: number // Har bir savol uchun ball
  created_at: string
}

export interface TestAttempt {
  id: string
  student_id: string
  level: TestLevel
  questions: TestQuestion[]
  answers: number[][] // O'quvchi javoblari
  score: number // 100 dan
  total_questions: number
  correct_answers: number
  started_at: string
  completed_at: string | null
  duration: number // Soniyalarda
  student?: Profile
}

export interface TestResult {
  id: string
  attempt_id: string
  student_id: string
  level: TestLevel
  score: number
  percentage: number
  grade: string // "A'lo", "Yaxshi", "Qoniqarli", "Qoniqarsiz"
  created_at: string
  student?: Profile
  attempt?: TestAttempt
}
