import { NavLink, useLocation } from 'react-router-dom'
import {
  Activity,
  ClipboardList,
  BarChart2,
  History,
  Brain
} from 'lucide-react'

// Map the routes requested by user
const NAV_ITEMS = [
  { to: '/',            icon: Activity,     label: 'Home' },
  { to: '/predict',     icon: ClipboardList,label: 'Predict' },
  { to: '/results',     icon: BarChart2,    label: 'Results' },
  { to: '/intelligence',icon: Brain,        label: 'Models' },
  { to: '/analysis',    icon: BarChart2,    label: 'Data' },
  { to: '/history',     icon: History,      label: 'History' },
]

export default function BottomNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex sm:hidden items-center justify-around h-[72px] bg-surface border-t border-[#1E2D2D] px-2 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.4)]">
      {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
        const isActive = location.pathname === to
        return (
          <NavLink
            key={to}
            to={to}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors duration-200 ${
              isActive ? 'text-primary' : 'text-textMuted hover:text-text'
            }`}
          >
            <Icon size={20} className={isActive ? 'text-primary' : 'text-textMuted'} />
            <span className="font-grotesk text-[10px] whitespace-nowrap">
              {label}
            </span>
          </NavLink>
        )
      })}
    </nav>
  )
}
