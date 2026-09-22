import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'

type User = {
    _id: string
    name: string
    email: string
    role: string
    subscriptionStatus?: string
    subscriptionPlan?: string
    preferences?: { selectedCharity?: string }
}

type Score = {
    _id: string
    courseName: string
    score: number
    stablefordPoints?: number | null
    format: string
    holes: number
    roundDate: string
}

type Charity = { _id: string; name: string; description?: string; category?: string }
type Draw = { _id: string; title: string; status: string; drawDate: string; participants: unknown[]; winners: unknown[] }
type Tab = 'overview' | 'rounds' | 'stats'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'
const getToken = () => localStorage.getItem('token') ?? localStorage.getItem('authToken')
const formatDate = (value: string) => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(value))

export default function MemberDashboard() {
    const [tab, setTab] = useState<Tab>('overview')
    const [user, setUser] = useState<User | null>(null)
    const [scores, setScores] = useState<Score[]>([])
    const [charities, setCharities] = useState<Charity[]>([])
    const [draws, setDraws] = useState<Draw[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectingCharityId, setSelectingCharityId] = useState<string | null>(null)
    const [error, setError] = useState('')

    useEffect(() => {
        const loadDashboard = async () => {
            const token = getToken()
            if (!token) { setError('Sign in to view your member dashboard.'); setIsLoading(false); return }
            const headers = { Authorization: `Bearer ${token}` }
            try {
                const profileResponse = await fetch(`${API_URL}/users/profile`, { headers })
                const profileData = await profileResponse.json() as { user?: User; message?: string }
                if (!profileResponse.ok || !profileData.user) throw new Error(profileData.message ?? 'Could not load your profile')
                setUser(profileData.user)

                const [scoresResponse, charityResponse, drawsResponse] = await Promise.all([
                    fetch(`${API_URL}/scores/user/${profileData.user._id}`, { headers }),
                    fetch(`${API_URL}/charities`),
                    fetch(`${API_URL}/draws/results`, { headers }),
                ])
                const scoresData = await scoresResponse.json() as { scores?: Score[]; message?: string }
                const charityData = await charityResponse.json() as { charities?: Charity[] }
                const drawsData = await drawsResponse.json() as { draws?: Draw[]; message?: string }
                if (!scoresResponse.ok) throw new Error(scoresData.message ?? 'Could not load scores')
                if (!drawsResponse.ok) throw new Error(drawsData.message ?? 'Could not load draw results')
                setScores(scoresData.scores ?? [])
                setCharities(charityData.charities ?? [])
                setDraws(drawsData.draws ?? [])
                localStorage.setItem('user', JSON.stringify(profileData.user))
            } catch (requestError) {
                setError(requestError instanceof Error ? requestError.message : 'Could not load dashboard')
            } finally { setIsLoading(false) }
        }
        void loadDashboard()
    }, [])

    const selectCharity = async (charityId: string) => {
        const token = getToken()
        if (!token) {
            toast.error('Please sign in to select a charity.')
            return
        }

        setSelectingCharityId(charityId)
        try {
            const response = await fetch(`${API_URL}/charities/select`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ charityId }),
            })
            const data = await response.json() as { message?: string; selectedCharity?: string }
            if (!response.ok) throw new Error(data.message ?? 'Could not select charity')

            const selectedCharityId = data.selectedCharity ?? charityId
            setUser((currentUser) => currentUser ? { ...currentUser, preferences: { ...currentUser.preferences, selectedCharity: selectedCharityId } } : currentUser)
            const storedUser = JSON.parse(localStorage.getItem('user') ?? 'null') as User | null
            if (storedUser) {
                storedUser.preferences = { ...storedUser.preferences, selectedCharity: selectedCharityId }
                localStorage.setItem('user', JSON.stringify(storedUser))
            }
            toast.success(data.message ?? 'Charity selected successfully.')
        } catch (requestError) {
            toast.error(requestError instanceof Error ? requestError.message : 'Could not select charity')
        } finally {
            setSelectingCharityId(null)
        }
    }

    const latestDraw = draws[0]
    const selectedCharity = charities.find((charity) => charity._id === user?.preferences?.selectedCharity)
    const averageScore = scores.length ? (scores.reduce((total, item) => total + item.score, 0) / scores.length).toFixed(1) : '—'
    const recentScores = useMemo(() => scores.slice(0, 8).reverse(), [scores])
    const chartPoints = recentScores.length > 1 ? recentScores.map((score, index) => `${(index / (recentScores.length - 1)) * 400},${Math.min(95, Math.max(10, score.score))}`).join(' L') : '0,60 L400,60'

    return (
        <div className="min-h-screen" style={{ background: '#0A0C09' }}>
            <Navbar mode="member" />
            <div className="mx-auto max-w-7xl px-6 pb-16 pt-24">
                <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                    <div>
                        <div className="mb-1 text-xs font-mono-data" style={{ color: '#6B7280', letterSpacing: '0.08em' }}>WELCOME BACK</div>
                        <h1 className="font-display font-bold" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', color: '#F5F5F0' }}>{user?.name ?? 'Member'}</h1>
                        <div className="mt-1 flex items-center gap-2"><span className="rounded-full px-2 py-0.5 text-xs font-mono-data" style={{ background: 'rgba(74,222,128,0.1)', color: '#4ADE80' }}>{user?.subscriptionStatus ?? user?.role ?? 'Account'}</span><span className="text-xs" style={{ color: '#6B7280' }}>{user?.email ?? ''}</span></div>
                    </div>
                    <Link to="/score-entry" className="inline-flex items-center gap-2 self-start rounded-full px-6 py-3 text-sm font-semibold" style={{ background: '#4ADE80', color: '#0A0C09' }}>+ Log a round</Link>
                </div>

                {error && <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200" role="alert">{error}</div>}
                {isLoading && <div className="mb-6 rounded-xl border border-white/10 bg-[#111410] px-4 py-3 text-sm text-[#A3A89E]">Loading your live dashboard...</div>}

                <section className="mb-8 rounded-2xl border border-white/5 bg-[#111410] p-6">
                    <div className="mb-5 flex flex-col justify-between gap-2 md:flex-row md:items-center">
                        <div><h2 className="font-display text-2xl font-bold text-[#F5F5F0]">Choose your charity</h2><p className="mt-1 text-sm text-[#6B7280]">Select where your membership contribution should make an impact.</p></div>
                        {selectedCharity && <span className="text-sm text-[#4ADE80]">Selected: {selectedCharity.name}</span>}
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                        {charities.map((charity) => {
                            const isSelected = charity._id === user?.preferences?.selectedCharity
                            return <button className="rounded-xl border p-4 text-left transition-colors disabled:cursor-wait disabled:opacity-60" disabled={selectingCharityId !== null} key={charity._id} onClick={() => void selectCharity(charity._id)} style={{ background: isSelected ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.02)', borderColor: isSelected ? 'rgba(74,222,128,0.45)' : 'rgba(255,255,255,0.08)' }} type="button"><div className="flex items-center justify-between gap-3"><span className="font-semibold text-[#F5F5F0]">{charity.name}</span><span className="text-xs text-[#F59E0B]">{isSelected ? 'Selected' : charity.category ?? 'General'}</span></div><p className="mt-2 text-xs text-[#6B7280]">{charity.description || 'An active community charity supported by members.'}</p></button>
                        })}
                    </div>
                    {!charities.length && !isLoading && <p className="text-sm text-[#6B7280]">No active charities are available right now.</p>}
                </section>

                <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[['Rounds recorded', scores.length, '#4ADE80'], ['Scoring average', averageScore, '#F5F5F0'], ['Draw entries', latestDraw?.participants?.length ?? 0, '#60A5FA'], ['Charity choice', selectedCharity?.name ?? 'Not selected', '#F59E0B']].map(([label, value, color]) => <div className="rounded-2xl border border-white/5 bg-[#111410] p-5" key={String(label)}><div className="mb-2 text-xs font-mono-data" style={{ color: '#6B7280', letterSpacing: '0.06em' }}>{String(label).toUpperCase()}</div><div className="truncate font-display text-2xl font-bold" style={{ color: String(color) }}>{String(value)}</div><div className="mt-1 text-xs" style={{ color: '#6B7280' }}>Live from Fairway API</div></div>)}
                </div>

                <div className="mb-8 flex gap-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>{(['overview', 'rounds', 'stats'] as Tab[]).map((item) => <button className="pb-3 text-sm font-medium capitalize" key={item} onClick={() => setTab(item)} style={{ color: tab === item ? '#4ADE80' : '#6B7280', borderBottom: tab === item ? '2px solid #4ADE80' : '2px solid transparent' }} type="button">{item === 'rounds' ? 'Round history' : item === 'stats' ? 'Performance' : 'Overview'}</button>)}</div>

                {tab === 'overview' && <div className="grid gap-6 md:grid-cols-3"><div className="rounded-2xl border border-white/5 bg-[#111410] p-6 md:col-span-2"><div className="mb-6 flex items-start justify-between"><div><div className="mb-1 text-xs font-mono-data" style={{ color: '#6B7280' }}>SCORING TREND</div><div className="font-display text-5xl font-bold" style={{ color: '#F5F5F0' }}>{averageScore}</div><div className="mt-1 text-sm" style={{ color: '#4ADE80' }}>{scores.length ? `${scores.length} rounds recorded` : 'Record your first round'}</div></div><div className="text-right"><div className="mb-1 text-xs font-mono-data" style={{ color: '#6B7280' }}>PLAN</div><div className="font-display text-2xl font-bold capitalize" style={{ color: '#F5F5F0' }}>{user?.subscriptionPlan ?? 'none'}</div></div></div><svg className="h-32 w-full" viewBox="0 0 400 100" preserveAspectRatio="none"><path d={`M${chartPoints} L400,100 L0,100Z`} fill="rgba(74,222,128,0.1)" /><path d={`M${chartPoints}`} stroke="#4ADE80" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></div><div className="space-y-4"><div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/5 p-5"><div className="mb-3 flex items-center justify-between"><div className="text-sm font-semibold" style={{ color: '#4ADE80' }}>{latestDraw?.title ?? 'Monthly draw'}</div><span className="text-xs capitalize" style={{ color: '#4ADE80' }}>{latestDraw?.status ?? 'No draw'}</span></div><div className="mb-3 text-xs" style={{ color: '#6B7280' }}>{latestDraw ? `Draw date: ${formatDate(latestDraw.drawDate)}` : 'Draw results will appear here.'}</div><Link to="/draw" className="text-xs font-semibold" style={{ color: '#4ADE80' }}>View draw details →</Link></div><div className="rounded-2xl border border-white/5 bg-[#111410] p-5"><div className="mb-3 text-xs font-mono-data" style={{ color: '#6B7280' }}>YOUR CHARITY</div><div className="text-sm font-semibold" style={{ color: '#F5F5F0' }}>{selectedCharity?.name ?? 'Choose a charity'}</div><div className="mt-1 text-xs" style={{ color: '#6B7280' }}>{selectedCharity?.description ?? 'Select a cause from the charity page.'}</div><Link to="/#charity" className="mt-3 inline-block text-xs font-semibold" style={{ color: '#F59E0B' }}>Manage charity →</Link></div></div></div>}
                {tab === 'rounds' && <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#111410]"><div className="flex items-center justify-between border-b border-white/5 px-6 py-4"><span className="text-sm font-semibold" style={{ color: '#F5F5F0' }}>Round history</span><Link to="/score-entry" className="text-xs font-semibold" style={{ color: '#4ADE80' }}>+ Log new round</Link></div><div className="overflow-x-auto"><table className="w-full min-w-155"><thead><tr>{['Date', 'Course', 'Score', 'Format', 'Holes', 'Stableford', ''].map((heading) => <th className="px-5 py-3 text-left text-xs font-mono-data font-medium" key={heading} style={{ color: '#6B7280' }}>{heading}</th>)}</tr></thead><tbody>{scores.map((score) => <tr className="border-t border-white/5" key={score._id}><td className="px-5 py-4 text-sm" style={{ color: '#6B7280' }}>{formatDate(score.roundDate)}</td><td className="px-5 py-4 text-sm font-medium" style={{ color: '#F5F5F0' }}>{score.courseName}</td><td className="px-5 py-4 font-mono-data font-bold" style={{ color: '#F5F5F0' }}>{score.score}</td><td className="px-5 py-4 text-sm capitalize" style={{ color: '#A3A89E' }}>{score.format}</td><td className="px-5 py-4 text-sm" style={{ color: '#A3A89E' }}>{score.holes}</td><td className="px-5 py-4 text-sm" style={{ color: '#A3A89E' }}>{score.stablefordPoints ?? '—'}</td><td className="px-5 py-4 text-right"><Link className="text-xs font-semibold text-[#4ADE80]" to={`/score-edit/${score._id}`}>Edit</Link></td></tr>)}</tbody></table>{scores.length === 0 && <p className="px-6 py-12 text-center text-sm" style={{ color: '#6B7280' }}>No scores recorded yet.</p>}</div></div>}

                {tab === 'stats' && <div className="grid gap-6 md:grid-cols-2"><div className="rounded-2xl border border-white/5 bg-[#111410] p-6"><div className="mb-6 text-xs font-mono-data" style={{ color: '#6B7280' }}>LIVE SCORE SUMMARY</div>{[['Rounds recorded', scores.length], ['Average score', averageScore], ['Best score', scores.length ? Math.min(...scores.map((score) => score.score)) : '—'], ['18-hole rounds', scores.filter((score) => score.holes === 18).length], ['9-hole rounds', scores.filter((score) => score.holes === 9).length]].map(([label, value]) => <div className="mb-4 flex justify-between border-b border-white/5 pb-3 text-sm last:mb-0" key={String(label)}><span style={{ color: '#A3A89E' }}>{label}</span><span className="font-mono-data font-bold" style={{ color: '#F5F5F0' }}>{String(value)}</span></div>)}</div><div className="rounded-2xl border border-white/5 bg-[#111410] p-6"><div className="mb-6 text-xs font-mono-data" style={{ color: '#6B7280' }}>ACCOUNT STATUS</div><p className="text-sm" style={{ color: '#A3A89E' }}>Subscription: <strong style={{ color: '#F5F5F0' }}>{user?.subscriptionStatus ?? 'inactive'}</strong></p><p className="mt-3 text-sm" style={{ color: '#A3A89E' }}>Draws available: <strong style={{ color: '#F5F5F0' }}>{draws.length}</strong></p><p className="mt-3 text-sm" style={{ color: '#A3A89E' }}>Active charities: <strong style={{ color: '#F5F5F0' }}>{charities.length}</strong></p></div></div>}
            </div>
        </div>
    )
}
