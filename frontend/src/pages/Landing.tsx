import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

type Charity = { _id: string; name: string; description?: string; category?: string }
type Plan = { name: 'monthly' | 'yearly'; price: number; currency: string; billingCycle: 'monthly' | 'yearly' }
type DrawInfo = { message: string; methods: string[] }

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

export default function Landing() {
    const [annual, setAnnual] = useState(false)
    const [charities, setCharities] = useState<Charity[]>([])
    const [plans, setPlans] = useState<Plan[]>([])
    const [drawInfo, setDrawInfo] = useState<DrawInfo | null>(null)

    useEffect(() => {
        const loadLandingData = async () => {
            const [charitiesResponse, plansResponse, drawResponse] = await Promise.allSettled([
                fetch(`${API_URL}/charities`),
                fetch(`${API_URL}/subscriptions/plans`),
                fetch(`${API_URL}/draws/info`),
            ])

            if (charitiesResponse.status === 'fulfilled' && charitiesResponse.value.ok) {
                const data = await charitiesResponse.value.json() as { charities?: Charity[] }
                setCharities(data.charities ?? [])
            }
            if (plansResponse.status === 'fulfilled' && plansResponse.value.ok) {
                const data = await plansResponse.value.json() as { plans?: Plan[] }
                setPlans(data.plans ?? [])
            }
            if (drawResponse.status === 'fulfilled' && drawResponse.value.ok) {
                const data = await drawResponse.value.json() as DrawInfo
                setDrawInfo(data)
            }
        }

        void loadLandingData()
    }, [])

    return (
        <div style={{ background: '#0A0C09' }}>
            <Navbar mode="public" />

            {/* ── HERO ── */}
            <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: 'linear-gradient(rgba(74,222,128,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(74,222,128,0.3) 1px, transparent 1px)',
                    backgroundSize: '60px 60px'
                }} />
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none" style={{
                    background: 'radial-gradient(circle, rgba(74,222,128,0.06) 0%, transparent 70%)'
                }} />

                <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-24">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 rounded-full text-xs font-medium font-mono-data" style={{
                                background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ADE80', letterSpacing: '0.08em'
                            }}>
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                SEPTEMBER 2026 DRAW — 9 DAYS LEFT
                            </div>
                            <h1 className="font-display font-bold leading-none mb-6" style={{ fontSize: 'clamp(3rem, 7vw, 5.5rem)', letterSpacing: '-0.03em', color: '#F5F5F0' }}>
                                Play better.<br />
                                <span style={{ color: '#4ADE80' }}>Give more.</span><br />
                                <span style={{ fontStyle: 'italic', fontWeight: 300 }}>Win big.</span>
                            </h1>
                            <p className="text-lg mb-10 max-w-md" style={{ color: '#6B7280', lineHeight: 1.7 }}>
                                Track every round, fund causes that matter, and enter a monthly draw for life-changing golf experiences — all in one membership.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link
                                    to="/dashboard"
                                    className="px-7 py-3.5 rounded-full font-semibold text-sm transition-all duration-200 inline-block"
                                    style={{ background: '#4ADE80', color: '#0A0C09' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#22C55E'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                                    onMouseLeave={e => { e.currentTarget.style.background = '#4ADE80'; e.currentTarget.style.transform = 'none' }}
                                >
                                    Start your round
                                </Link>
                                <a
                                    href="#features"
                                    className="px-7 py-3.5 rounded-full font-semibold text-sm transition-all duration-200 inline-block"
                                    style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#A3A89E' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = '#F5F5F0' }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#A3A89E' }}
                                >
                                    How it works
                                </a>
                            </div>
                        </div>

                        {/* Stats card */}
                        <div className="rounded-2xl p-6" style={{ background: '#111410', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-sm font-medium" style={{ color: '#6B7280' }}>Community snapshot</span>
                                <div className="flex items-center gap-1.5 text-xs font-mono-data" style={{ color: '#4ADE80' }}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Live
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mb-5">
                                {[
                                    { label: 'Active charities', value: charities.length ? charities.length.toLocaleString() : '—' },
                                    { label: 'Plans available', value: plans.length ? plans.length.toLocaleString() : '—' },
                                    { label: 'Draw methods', value: drawInfo?.methods.length ? drawInfo.methods.length.toString() : '—' },
                                    { label: 'API status', value: charities.length || plans.length || drawInfo ? 'Live' : 'Loading' },
                                ].map(s => (
                                    <div key={s.label} className="p-4 rounded-xl" style={{ background: '#161A14', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div className="font-display font-bold text-2xl mb-0.5" style={{ color: '#F5F5F0', textShadow: '0 0 30px rgba(74,222,128,0.2)' }}>{s.value}</div>
                                        <div className="text-xs" style={{ color: '#6B7280' }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="rounded-xl p-4" style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.12)' }}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-sm font-medium" style={{ color: '#4ADE80' }}>Draw engine</span>
                                    <span className="font-mono-data text-sm font-medium capitalize" style={{ color: '#F5F5F0' }}>{drawInfo ? 'Available' : 'Loading'}</span>
                                </div>
                                <div className="text-xs" style={{ color: '#6B7280' }}>
                                    {drawInfo?.message || 'Live draw rules are loaded from the backend.'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section id="features" className="py-24" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-xs font-mono-data font-medium mb-3" style={{ color: '#4ADE80', letterSpacing: '0.1em' }}>HOW IT WORKS</div>
                    <h2 className="font-display font-bold mb-16" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.02em', color: '#F5F5F0' }}>
                        Three things.<br />One subscription.
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                number: '01',
                                title: 'Track your game',
                                desc: 'Log every round hole-by-hole. Your handicap updates automatically, your stats deepen with every entry, and you get insights a club pro would charge for.',
                                icon: '📊',
                                color: '#4ADE80',
                                link: '/score-entry',
                                cta: 'Log a round →',
                            },
                            {
                                number: '02',
                                title: 'Fund something real',
                                desc: 'Every subscription automatically contributes to vetted golf charities. Junior access. Mental health. Caddie education. You pick, we direct.',
                                icon: '💛',
                                color: '#F59E0B',
                                link: '#charity',
                                cta: 'See the impact →',
                            },
                            {
                                number: '03',
                                title: 'Enter the draw',
                                desc: 'Each month, a transparent algorithm runs the draw. More entries, better odds. Every winner gets verified and announced to the community.',
                                icon: '🏆',
                                color: '#60A5FA',
                                link: '/draw',
                                cta: 'See prizes →',
                            },
                        ].map(step => (
                            <div key={step.number} className="p-6 rounded-2xl group transition-all duration-300" style={{ background: '#111410', border: '1px solid rgba(255,255,255,0.06)' }}
                                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
                                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <span className="text-3xl">{step.icon}</span>
                                    <span className="font-mono-data text-xs" style={{ color: 'rgba(255,255,255,0.15)', fontSize: '2rem', fontWeight: 700 }}>{step.number}</span>
                                </div>
                                <h3 className="font-display font-bold text-xl mb-3" style={{ color: '#F5F5F0', letterSpacing: '-0.01em' }}>{step.title}</h3>
                                <p className="text-sm leading-relaxed mb-6" style={{ color: '#6B7280' }}>{step.desc}</p>
                                <a href={step.link} className="text-sm font-semibold transition-colors duration-200" style={{ color: step.color }}>{step.cta}</a>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CHARITY ── */}
            <section id="charity" className="py-24" style={{ background: '#0D0F0C', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="text-xs font-mono-data font-medium mb-3" style={{ color: '#F59E0B', letterSpacing: '0.1em' }}>IMPACT</div>
                            <h2 className="font-display font-bold mb-6" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.02em', color: '#F5F5F0' }}>
                                Every swing<br />funds something<br /><span style={{ fontStyle: 'italic', fontWeight: 300, color: '#F59E0B' }}>that matters.</span>
                            </h2>
                            <p className="text-base mb-8" style={{ color: '#6B7280', lineHeight: 1.7 }}>
                                Choose from the active charity partners returned by the Fairway backend. Subscribers can select their cause from the charity page.
                            </p>
                            <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
                                <span className="text-2xl">💛</span>
                                <div>
                                    <div className="text-sm font-semibold" style={{ color: '#F5F5F0' }}>{charities.length} active charity partners</div>
                                    <div className="text-xs mt-0.5" style={{ color: '#6B7280' }}>Live from the public charities endpoint</div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {charities.length === 0 ? <div className="p-5 rounded-2xl" style={{ background: '#111410', border: '1px solid rgba(255,255,255,0.06)', color: '#6B7280' }}>Loading active charity partners...</div> : charities.map(p => (
                                <div key={p._id} className="p-5 rounded-2xl" style={{ background: '#111410', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span style={{ color: '#F59E0B' }}>●</span>
                                        <div className="text-sm font-semibold flex-1" style={{ color: '#F5F5F0' }}>{p.name}</div>
                                        <div className="text-xs font-mono-data" style={{ color: '#6B7280' }}>{p.category || 'General'}</div>
                                    </div>
                                    <p className="text-xs" style={{ color: '#6B7280' }}>{p.description || 'An active community charity supported by members.'}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── DRAW PREVIEW ── */}
            <section id="draw" className="py-24" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-12 items-start">
                        <div>
                            <div className="text-xs font-mono-data font-medium mb-3" style={{ color: '#4ADE80', letterSpacing: '0.1em' }}>MONTHLY DRAW</div>
                            <h2 className="font-display font-bold mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.02em', color: '#F5F5F0' }}>
                                Real prizes.<br />Real odds.<br /><span style={{ fontStyle: 'italic', fontWeight: 300 }}>Real transparency.</span>
                            </h2>
                            <p className="text-base mb-6" style={{ color: '#6B7280', lineHeight: 1.7 }}>
                                {drawInfo?.message || 'Monthly draws run by selecting eligible participants and awarding winners transparently.'}
                            </p>
                            <Link
                                to="/draw"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200"
                                style={{ background: '#4ADE80', color: '#0A0C09' }}
                            >
                                See this month's draw →
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {(drawInfo?.methods ?? ['random', 'algorithmic']).map((method, index) => (
                                <div key={method} className="p-4 rounded-xl flex items-center gap-4 transition-all duration-200" style={{ background: '#111410', border: '1px solid rgba(74,222,128,0.1)' }}
                                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(74,222,128,0.25)')}
                                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(74,222,128,0.1)')}
                                >
                                    <span className="text-xl shrink-0" style={{ color: '#4ADE80' }}>{String(index + 1).padStart(2, '0')}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold mb-0.5 capitalize" style={{ color: '#F5F5F0' }}>{method} selection</div>
                                        <div className="text-xs truncate" style={{ color: '#6B7280' }}>Available through the subscriber draw flow</div>
                                    </div>
                                    <div className="text-sm font-bold font-mono-data shrink-0" style={{ color: '#4ADE80' }}>Live</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── PRICING ── */}
            <section id="pricing" className="py-24" style={{ background: '#0D0F0C', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <div className="text-xs font-mono-data font-medium mb-3" style={{ color: '#4ADE80', letterSpacing: '0.1em' }}>PRICING</div>
                        <h2 className="font-display font-bold mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.02em', color: '#F5F5F0' }}>
                            Simple. Honest.<br />Worth every penny.
                        </h2>
                        <div className="inline-flex items-center gap-2 mt-6 p-1 rounded-full" style={{ background: '#111410', border: '1px solid rgba(255,255,255,0.06)' }}>
                            {['Monthly', 'Annual'].map(opt => (
                                <button key={opt} onClick={() => setAnnual(opt === 'Annual')}
                                    className="px-5 py-2 rounded-full text-sm font-medium transition-all duration-200"
                                    style={{ background: (opt === 'Annual') === annual ? '#4ADE80' : 'transparent', color: (opt === 'Annual') === annual ? '#0A0C09' : '#6B7280' }}
                                >
                                    {opt}{opt === 'Annual' && <span className="ml-1 text-xs opacity-70">−20%</span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                        {plans.length === 0 ? <div className="rounded-2xl p-6 text-sm" style={{ background: '#111410', color: '#6B7280' }}>Loading subscription plans...</div> : plans.map(plan => {
                            const isPopular = plan.name === 'yearly'
                            const isSelected = (annual && plan.name === 'yearly') || (!annual && plan.name === 'monthly')
                            return (
                                <div key={plan.name} className="rounded-2xl p-6 flex flex-col relative" style={{ background: isPopular ? 'linear-gradient(180deg, rgba(74,222,128,0.06) 0%, #111410 40%)' : '#111410', border: isPopular ? '1px solid rgba(74,222,128,0.4)' : '1px solid rgba(255,255,255,0.06)' }}>
                                    {isPopular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold font-mono-data" style={{ background: '#4ADE80', color: '#0A0C09' }}>BEST VALUE</div>}
                                    <div className="mb-6">
                                        <div className="text-sm font-semibold mb-3 capitalize" style={{ color: '#A3A89E' }}>{plan.name} membership</div>
                                        <div className="flex items-end gap-1 mb-2">
                                            <span className="font-display font-bold" style={{ fontSize: '3rem', letterSpacing: '-0.04em', color: '#F5F5F0', lineHeight: 1 }}>{plan.currency} {plan.price}</span>
                                            <span className="text-sm pb-2" style={{ color: '#6B7280' }}>/{plan.billingCycle === 'yearly' ? 'year' : 'month'}</span>
                                        </div>
                                        <div className="text-xs font-mono-data" style={{ color: '#4ADE80' }}>{plan.billingCycle === 'yearly' ? 'One annual payment' : 'Flexible monthly billing'}</div>
                                    </div>
                                    <ul className="space-y-3 flex-1 mb-6">
                                        {['Score tracking', 'Charity contribution', 'Subscriber draw access', plan.name === 'yearly' ? 'Best annual value' : 'Cancel anytime'].map(feature => <li key={feature} className="flex items-start gap-2.5 text-sm" style={{ color: '#A3A89E' }}><span style={{ color: '#4ADE80' }}>✓</span>{feature}</li>)}
                                    </ul>
                                    <Link to="/dashboard" className="w-full py-3 rounded-full text-sm font-semibold text-center transition-all duration-200 block" style={{ background: isSelected ? '#4ADE80' : 'rgba(255,255,255,0.06)', color: isSelected ? '#0A0C09' : '#F5F5F0', border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.08)' }}>Get started</Link>
                                </div>
                            )
                        })}
                    </div>
                    <p className="text-center text-xs mt-8" style={{ color: '#6B7280' }}>
                        All plans include a 14-day free trial. Cancel any time. Draw entries valid for the month of subscription only.
                    </p>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="py-16" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: '#0A0C09' }}>
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-10 mb-12">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)' }}>
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <circle cx="7" cy="4" r="2.5" fill="#4ADE80" />
                                        <path d="M7 6.5 L7 13" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <span className="font-display font-bold text-lg" style={{ color: '#F5F5F0', letterSpacing: '-0.02em' }}>Fairway</span>
                            </div>
                            <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>Golf performance, charitable giving, and monthly draws. All in one membership.</p>
                        </div>
                        {[
                            { heading: 'Product', links: ['Dashboard', 'Log Round', 'Monthly Draw', 'Leaderboards'] },
                            { heading: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
                            { heading: 'Legal', links: ['Privacy', 'Terms', 'Draw Rules', 'Cookies'] },
                        ].map(col => (
                            <div key={col.heading}>
                                <div className="text-xs font-mono-data font-medium mb-4" style={{ color: '#6B7280', letterSpacing: '0.08em' }}>{col.heading}</div>
                                <ul className="space-y-3">
                                    {col.links.map(l => (
                                        <li key={l}><a href="#" className="text-sm" style={{ color: '#6B7280' }}
                                            onMouseEnter={e => (e.currentTarget.style.color = '#F5F5F0')}
                                            onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}
                                        >{l}</a></li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <p className="text-xs" style={{ color: '#6B7280' }}>© 2026 Fairway Ltd. Registered in Scotland. Draw operated under UK Gambling Commission licence #12847.</p>
                        <div className="flex items-center gap-1.5 text-xs font-mono-data" style={{ color: '#4ADE80' }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> All systems operational
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
