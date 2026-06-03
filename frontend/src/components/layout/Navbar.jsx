import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Menu, X, Code2, ChevronDown, LogOut,
  LayoutDashboard, User, MessageSquare, BookMarked, Users, Star, Settings
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../ui/Avatar'
import NotificationBell from '../notifications/NotificationBell'

const navLinks = [
  { to: '/search',        label: 'Search' },
  { to: '/developers',    label: 'Developers' },
  { to: '/companies',     label: 'Companies' },
  { to: '/projects',      label: 'Projects' },
  { to: '/opportunities', label: 'Opportunities' },
  { to: '/forum',         label: 'Forum' },
  { to: '/groups',        label: 'Groups' },
  { to: '/popular',       label: 'Popular' },
  { to: '/insights',      label: 'Insights' },
  { to: '/hall-of-fame',  label: 'Hall of Fame' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-surface-border bg-surface-0/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 text-text-primary hover:text-white transition-colors flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
            <Code2 size={15} strokeWidth={2.5} className="text-white" />
          </div>
          <span className="font-display font-bold text-base tracking-tight">KashDev</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-0.5 overflow-x-auto">
          {navLinks.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `px-3 py-1.5 text-sm rounded-lg transition-all duration-150 whitespace-nowrap ${
                  isActive
                    ? 'text-text-primary bg-surface-3'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">
          {user ? (
            <>
              {/* Messages icon */}
              <Link
                to="/messages"
                className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-2 transition-all"
                title="Messages"
              >
                <MessageSquare size={18} />
              </Link>

              {/* Notifications */}
              <NotificationBell />

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(o => !o)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-2 transition-all text-text-secondary hover:text-text-primary"
                >
                  <Avatar name={user.name} src={user.avatar} size="sm" />
                  <span className="hidden sm:block text-sm font-medium text-text-primary">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} />
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 top-full mt-1 w-48 card border border-surface-border py-1 animate-scale-in z-50"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-all"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <LayoutDashboard size={14} /> Dashboard
                    </Link>
                    <Link
                      to={`/developers/${user.username}`}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-all"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User size={14} /> My Profile
                    </Link>
                    <Link
                      to="/account"
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-all"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings size={14} /> Account Settings
                    </Link>
                    <div className="divider my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-text hover:bg-red-muted transition-all"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm hidden sm:inline-flex">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Join Community
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            className="lg:hidden btn btn-ghost btn-sm p-1.5"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-surface-border bg-surface-0 px-4 py-3 flex flex-col gap-1 animate-slide-up">
          {navLinks.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `px-3 py-2 text-sm rounded-lg transition-all ${
                  isActive
                    ? 'bg-surface-3 text-text-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                }`
              }
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}

          {user ? (
            <div className="flex gap-2 mt-2 pt-2 border-t border-surface-border">
              <Link
                to="/messages"
                className="btn btn-secondary flex-1 justify-center gap-2"
                onClick={() => setMenuOpen(false)}
              >
                <MessageSquare size={14} /> Messages
              </Link>
              <Link
                to="/dashboard"
                className="btn btn-primary flex-1 justify-center gap-2"
                onClick={() => setMenuOpen(false)}
              >
                <LayoutDashboard size={14} /> Dashboard
              </Link>
            </div>
          ) : (
            <div className="flex gap-2 mt-2 pt-2 border-t border-surface-border">
              <Link
                to="/login"
                className="btn btn-secondary flex-1 justify-center"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn btn-primary flex-1 justify-center"
                onClick={() => setMenuOpen(false)}
              >
                Join
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}