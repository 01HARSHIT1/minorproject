'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  FileText, 
  GraduationCap, 
  Calendar, 
  TrendingUp, 
  BookOpen, 
  Bell,
  Settings,
  LogOut
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Assignments', href: '/dashboard/assignments', icon: FileText },
  { name: 'Courses', href: '/dashboard/courses', icon: GraduationCap },
  { name: 'Timetable', href: '/dashboard/timetable', icon: Calendar },
  { name: 'Attendance', href: '/dashboard/attendance', icon: TrendingUp },
  { name: 'Exams', href: '/dashboard/exams', icon: BookOpen },
  { name: 'Notices', href: '/dashboard/notices', icon: Bell },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const logout = useAuthStore((state) => state.logout)

  return (
    <div className="w-64 bg-gradient-to-b from-blue-600 to-blue-700 min-h-screen fixed left-0 top-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-blue-500">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <div className="w-6 h-6 bg-blue-600 rounded"></div>
          </div>
          <span className="text-white font-bold text-lg">Gateway</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                ${isActive 
                  ? 'bg-white text-blue-700 shadow-lg' 
                  : 'text-blue-100 hover:bg-blue-500 hover:text-white'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-blue-500">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-blue-100 hover:bg-blue-500 hover:text-white transition-all w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  )
}
