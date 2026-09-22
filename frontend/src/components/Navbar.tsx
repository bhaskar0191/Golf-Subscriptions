import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import Logout from './Logout'

interface NavProps {
    mode?: 'public' | 'member' | 'admin'
}

export default function Navbar({ mode = 'public' }: NavProps) {
    const [scrolled, setScrolled] = useState(false)
    const location = useLocation()

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 40)
        window.addEventListener('scroll', handler)
        return () => window.removeEventListener('scroll', handler)
    }, [])

    const isLanding = location.pathname === '/'

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
            style={{
                background: scrolled || !isLanding ? 'rgba(10,12,9,0.95)' : 'transparent',
                backdropFilter: scrolled || !isLanding ? 'blur(20px)' : 'none',
                borderBottom: scrolled || !isLanding ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}
        >
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <NavLink to="/" className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)' }}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <circle cx="7" cy="4" r="2.5" fill="#4ADE80" />
                            <path d="M7 6.5 L7 13" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </div>
                    <span className="font-display font-bold text-lg" style={{ color: '#F5F5F0', letterSpacing: '-0.02em' }}>Fairway</span>
                </NavLink>

                {/* Member nav */}
                {mode === 'member' && (
                    <div className="hidden md:flex items-center gap-1">
                        {[
                            { to: '/dashboard', label: 'Dashboard' },
                            { to: '/score-entry', label: 'Log Round' },
                            { to: '/draw', label: 'Monthly Draw' },
                        ].map(({ to, label }) => (
                            <NavLink
                                key={to}
                                to={to}
                                className={({ isActive }) =>
                                    `px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive ? 'text-white' : ''}`
                                }
                                style={({ isActive }) => ({
                                    background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                                    color: isActive ? '#F5F5F0' : '#6B7280',
                                })}
                            >
                                {label}
                            </NavLink>
                        ))}
                    </div>
                )}

                {/* Admin nav */}
                {mode === 'admin' && (
                    <div className="hidden md:flex items-center gap-1">
                        {[
                            { to: '/admin', label: 'Overview' },
                            { to: '/admin/members', label: 'Members' },
                            { to: '/admin/draw', label: 'Draw Engine' },
                            { to: '/admin/charity', label: 'Charity' },
                        ].map(({ to, label }) => (
                            <NavLink
                                key={to}
                                to={to}
                                end={to === '/admin'}
                                className={() =>
                                    `px-4 py-2 rounded-full text-sm font-medium transition-all duration-200`
                                }
                                style={({ isActive }) => ({
                                    background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                                    color: isActive ? '#F5F5F0' : '#6B7280',
                                })}
                            >
                                {label}
                            </NavLink>
                        ))}
                    </div>
                )}

                {/* Public nav */}
                {mode === 'public' && (
                    <div className="hidden md:flex items-center gap-8">
                        {['Features', 'Charity', 'Draw', 'Pricing'].map(item => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                className="text-sm transition-colors duration-200"
                                style={{ color: '#6B7280', fontWeight: 500 }}
                                onMouseEnter={e => (e.currentTarget.style.color = '#F5F5F0')}
                                onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}
                            >
                                {item}
                            </a>
                        ))}
                    </div>
                )}

                {/* Right actions */}
                <div className="flex items-center gap-3">
                    {mode === 'public' && (
                        <>
                            <NavLink to="/login" className="hidden md:block text-sm font-medium" style={{ color: '#A3A89E' }}>
                                Sign in
                            </NavLink>
                            <NavLink
                                to="/register"
                                className="text-sm font-semibold px-4 py-2 rounded-full transition-all duration-200"
                                style={{ background: '#4ADE80', color: '#0A0C09' }}
                                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.background = '#22C55E')}
                                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.background = '#4ADE80')}
                            >
                                Join now
                            </NavLink>
                        </>
                    )}

                    {mode === 'member' && (
                        <div className="flex items-center gap-3">
                            <NavLink
                                to="/score-entry"
                                className="text-sm font-semibold px-4 py-2 rounded-full transition-all duration-200"
                                style={{ background: '#4ADE80', color: '#0A0C09' }}
                            >
                                + Log round
                            </NavLink>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono-data" style={{ background: 'rgba(74,222,128,0.1)', color: '#4ADE80', border: '1px solid rgba(74,222,128,0.2)' }}>
                                JW
                            </div>
                            <Logout />
                        </div>
                    )}

                    {mode === 'admin' && (
                        <div className="flex items-center gap-2">
                            <div className="text-xs font-mono-data px-2 py-1 rounded-full" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>
                                ADMIN
                            </div>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(255,255,255,0.08)', color: '#F5F5F0' }}>
                                A
                            </div>
                            <Logout />
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}
