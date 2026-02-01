import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/hooks/useTheme'
import Login from '@/pages/Login'
import AdminLayout from '@/layouts/AdminLayout'
import TeacherLayout from '@/layouts/TeacherLayout'
import StudentLayout from '@/layouts/StudentLayout'
import AdminDashboard from '@/pages/admin/Dashboard'
import AdminTeachers from '@/pages/admin/Teachers'
import AdminGroups from '@/pages/admin/Groups'
import AdminStudents from '@/pages/admin/Students'
import AdminLogins from '@/pages/admin/Logins'
import AdminCreateLogin from '@/pages/admin/CreateLogin'
import AdminMonthlyReports from '@/pages/admin/MonthlyReports'
import TeacherGroups from '@/pages/teacher/Groups'
import TeacherStudents from '@/pages/teacher/Students'
import TeacherAddGrade from '@/pages/teacher/AddGrade'
import StudentProfile from '@/pages/student/Profile'
import StudentGrades from '@/pages/student/Grades'
import AdminNews from '@/pages/admin/News'
import TeacherComments from '@/pages/teacher/Comments'
import TeacherHomework from '@/pages/teacher/Homework'
import StudentNews from '@/pages/student/News'
import StudentHomework from '@/pages/student/Homework'

function PrivateRoute({ children, allowed }: { children: React.ReactNode; allowed: string[] }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  if (!allowed.includes(user.role)) return <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'teacher' ? '/teacher' : '/student'} replace />
  return <>{children}</>
}

export default function App() {
  const { initTheme } = useTheme()
  useEffect(() => {
    initTheme()
  }, [initTheme])

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/admin/*"
        element={
          <PrivateRoute allowed={['admin']}>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="teachers" element={<AdminTeachers />} />
        <Route path="groups" element={<AdminGroups />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="logins" element={<AdminLogins />} />
        <Route path="create-login" element={<AdminCreateLogin />} />
        <Route path="news" element={<AdminNews />} />
        <Route path="monthly-reports" element={<AdminMonthlyReports />} />
      </Route>
      <Route
        path="/teacher/*"
        element={
          <PrivateRoute allowed={['teacher']}>
            <TeacherLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<TeacherGroups />} />
        <Route path="groups" element={<TeacherGroups />} />
        <Route path="students/:groupId" element={<TeacherStudents />} />
        <Route path="add-grade/:studentId" element={<TeacherAddGrade />} />
        <Route path="comments/:studentId" element={<TeacherComments />} />
        <Route path="homework/:groupId" element={<TeacherHomework />} />
      </Route>
      <Route
        path="/student/*"
        element={
          <PrivateRoute allowed={['student']}>
            <StudentLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<StudentGrades />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="grades" element={<StudentGrades />} />
        <Route path="homework" element={<StudentHomework />} />
        <Route path="news" element={<StudentNews />} />
      </Route>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
