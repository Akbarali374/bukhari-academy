import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/Layout/Sidebar'

export default function TeacherLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="teacher" />
      <main className="flex-1 overflow-auto p-6 lg:ml-0">
        <div className="lg:hidden h-16"></div> {/* Spacer for mobile menu button */}
        <Outlet />
      </main>
    </div>
  )
}
