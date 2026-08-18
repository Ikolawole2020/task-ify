'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import API from '@/lib/api';
import { getCurrentUser, logout } from '@/lib/auth';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        try {
          const res = await API.get('/notifications/');
          const unread = (res.data || []).filter((n) => !n.is_read).length;
          setUnreadCount(unread);
        } catch (error) {
          console.error(error);
        }
      }
    };
    fetchUser();

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    setMobileMenuOpen(false);
    router.push('/login');
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#0b1120]/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" onClick={closeMenu} className="text-xl font-bold text-white">
            Skill<span className="text-blue-400">Link</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            {loading ? (
              <div className="w-20 h-4 bg-white/10 rounded animate-pulse" />
            ) : user ? (
              <>
                <Link
                  href="/bookings"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/10 transition"
                >
                  <span>📅</span> Bookings
                </Link>

                <Link
                  href="/notifications"
                  className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/10 transition"
                >
                  <span>🔔</span> Alerts
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {user.role === 'PROVIDER' && (
                  <>
                    <Link
                      href="/providers/dashboard"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/10 transition"
                    >
                      <span>📊</span> Dashboard
                    </Link>
                    <Link
                      href="/providers/services"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/10 transition"
                    >
                      <span>🛠️</span> Services
                    </Link>
                    <Link
                      href="/providers/services/new"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/10 transition"
                    >
                      <span>➕</span> Add
                    </Link>
                  </>
                )}

                <Link
                  href="/profile"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/10 transition"
                >
                  <span>👤</span> Profile
                </Link>

                <div className="w-px h-5 bg-white/10 mx-2" />

                <span className="text-sm text-slate-400">{user.username}</span>

                <button
                  onClick={handleLogout}
                  className="ml-1 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/10 transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="ml-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="text-white text-xl">{mobileMenuOpen ? '✕' : '☰'}</span>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0b1120]/95 backdrop-blur-xl border-t border-white/10 py-3 space-y-1">
            {user ? (
              <>
                <div className="px-4 py-2 text-xs text-slate-400 border-b border-white/10 mb-1">
                  {user.username}
                </div>

                <Link href="/bookings" onClick={closeMenu} className="flex items-center gap-2 px-4 py-3 text-slate-300 hover:bg-white/5 rounded-lg mx-2">
                  <span>📅</span> Bookings
                </Link>
                <Link href="/notifications" onClick={closeMenu} className="flex items-center justify-between px-4 py-3 text-slate-300 hover:bg-white/5 rounded-lg mx-2">
                  <span className="flex items-center gap-2"><span>🔔</span> Alerts</span>
                  {unreadCount > 0 && (
                    <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                {user.role === 'PROVIDER' && (
                  <>
                    <Link href="/providers/dashboard" onClick={closeMenu} className="flex items-center gap-2 px-4 py-3 text-slate-300 hover:bg-white/5 rounded-lg mx-2">
                      <span>📊</span> Dashboard
                    </Link>
                    <Link href="/providers/services" onClick={closeMenu} className="flex items-center gap-2 px-4 py-3 text-slate-300 hover:bg-white/5 rounded-lg mx-2">
                      <span>🛠️</span> Services
                    </Link>
                    <Link href="/providers/services/new" onClick={closeMenu} className="flex items-center gap-2 px-4 py-3 text-slate-300 hover:bg-white/5 rounded-lg mx-2">
                      <span>➕</span> Add Service
                    </Link>
                  </>
                )}

                <Link href="/profile" onClick={closeMenu} className="flex items-center gap-2 px-4 py-3 text-slate-300 hover:bg-white/5 rounded-lg mx-2">
                  <span>👤</span> Profile
                </Link>

                <button onClick={handleLogout} className="w-full text-left flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg mx-2">
                  <span>🚪</span> Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={closeMenu} className="block px-4 py-3 text-slate-300 hover:bg-white/5 rounded-lg mx-2">
                  Login
                </Link>
                <Link href="/register" onClick={closeMenu} className="block px-4 py-3 bg-blue-600 text-white text-center rounded-xl mx-2 font-medium">
                  Get Started
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}