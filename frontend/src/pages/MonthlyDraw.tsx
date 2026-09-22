import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'

type Participant = { _id?: string; name?: string; email?: string }
type Winner = { _id: string; user?: Participant | string; prize?: string; verified: boolean; payoutStatus: string }
type Draw = {
    _id: string
    title: string
    description?: string
    prize?: string
    status: 'draft' | 'running' | 'closed' | 'verified'
    selectionMethod: 'random' | 'algorithmic'
    drawDate: string
    winnerCount: number
    participants: (Participant | string)[]
    winners: Winner[]
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'
const getToken = () => localStorage.getItem('token') ?? localStorage.getItem('authToken')
const getUserId = () => {
    try { return (JSON.parse(localStorage.getItem('user') ?? 'null') as { _id?: string } | null)?._id } catch { return undefined }
}
const formatDate = (value: string) => new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date(value))
const participantId = (participant: Participant | string) => typeof participant === 'string' ? participant : participant._id
const participantName = (participant: Participant | string) => typeof participant === 'string' ? participant : participant.name ?? participant.email ?? 'Member'

export default function MonthlyDraw() {
    const [draws, setDraws] = useState<Draw[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isJoining, setIsJoining] = useState(false)
    const [error, setError] = useState('')

    const loadDraws = async () => {
        const token = getToken()
        if (!token) {
            setError('Sign in to view and join the monthly draw.')
            setIsLoading(false)
            return
        }

        try {
            const response = await fetch(`${API_URL}/draws/results`, { headers: { Authorization: `Bearer ${token}` } })
            const data = await response.json() as { draws?: Draw[]; message?: string }
            if (!response.ok) throw new Error(data.message ?? 'Could not load monthly draws')
            setDraws(data.draws ?? [])
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Could not load monthly draws')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => { void loadDraws() }, [])

    const joinDraw = async (drawId: string) => {
        const token = getToken()
        if (!token) {
            toast.error('Please sign in to join the draw.')
            return
        }

        setIsJoining(true)
        try {
            const response = await fetch(`${API_URL}/draws/join`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ drawId }),
            })
            const data = await response.json() as { message?: string; draw?: Draw }
            if (!response.ok) throw new Error(data.message ?? 'Could not join draw')
            toast.success(data.message ?? 'Joined monthly draw successfully.')
            await loadDraws()
        } catch (requestError) {
            toast.error(requestError instanceof Error ? requestError.message : 'Could not join draw')
        } finally {
            setIsJoining(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0A0C09] text-[#F5F5F0]">
            <Navbar mode="member" />
            <main className="mx-auto max-w-6xl px-6 pb-16 pt-24">
                <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
                    <div><p className="text-xs uppercase tracking-[0.18em] text-[#F59E0B]">Monthly draw</p><h1 className="mt-2 font-display text-4xl font-bold">Play for something bigger.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-[#6B7280]">Join the active draw for a chance to win this month&apos;s golf experience.</p></div>
                    <Link className="text-sm font-semibold text-[#4ADE80]" to="/dashboard">Back to dashboard</Link>
                </div>
                {error && <div className="mb-6 rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200" role="alert">{error}</div>}
                {isLoading && <p className="py-12 text-center text-sm text-[#6B7280]">Loading monthly draws...</p>}
                {!isLoading && !error && draws.length === 0 && <div className="rounded-2xl border border-dashed border-white/15 px-6 py-14 text-center text-sm text-[#6B7280]">No monthly draw is available yet.</div>}
                {!isLoading && draws.length > 0 && <div className="grid gap-6 lg:grid-cols-2">{draws.map((draw) => {
                    const joined = Boolean(getUserId() && draw.participants.some((participant) => participantId(participant) === getUserId()))
                    const canJoin = draw.status === 'running' && !joined
                    return <article className="rounded-2xl border border-white/6 bg-[#111410] p-6" key={draw._id}><div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.12em] text-[#4ADE80]">{draw.selectionMethod} selection</p><h2 className="mt-2 text-2xl font-semibold">{draw.title}</h2></div><span className="rounded-full bg-white/6 px-3 py-1 text-xs capitalize text-[#A3A89E]">{draw.status}</span></div><p className="mt-4 text-sm leading-6 text-[#A3A89E]">{draw.description || 'Enter this month\'s draw for a chance to win.'}</p><dl className="mt-6 grid grid-cols-2 gap-4 border-y border-white/6 py-4 text-sm"><div><dt className="text-[#6B7280]">Draw date</dt><dd className="mt-1 font-semibold">{formatDate(draw.drawDate)}</dd></div><div><dt className="text-[#6B7280]">Prize</dt><dd className="mt-1 font-semibold">{draw.prize || 'Golf experience'}</dd></div><div><dt className="text-[#6B7280]">Entries</dt><dd className="mt-1 font-semibold">{draw.participants.length}</dd></div><div><dt className="text-[#6B7280]">Winners</dt><dd className="mt-1 font-semibold">{draw.winners.length} / {draw.winnerCount}</dd></div></dl><button className="mt-6 w-full rounded-full px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50" disabled={!canJoin || isJoining} onClick={() => void joinDraw(draw._id)} style={{ background: joined ? 'rgba(74,222,128,0.12)' : '#4ADE80', color: joined ? '#4ADE80' : '#0A0C09' }} type="button">{joined ? 'You are entered' : draw.status !== 'running' ? 'Entries closed' : isJoining ? 'Joining...' : 'Join monthly draw'}</button>{draw.winners.length > 0 && <div className="mt-6 border-t border-white/6 pt-5"><p className="text-xs uppercase tracking-[0.12em] text-[#6B7280]">Winners</p><div className="mt-3 space-y-2">{draw.winners.map((winner) => <div className="flex items-center justify-between rounded-lg bg-white/3 p-3 text-sm" key={winner._id}><span>{participantName(winner.user ?? 'Winner')}</span><span className="text-xs capitalize text-[#A3A89E]">{winner.verified ? 'Verified' : winner.payoutStatus}</span></div>)}</div></div>}</article>
                })}</div>}
            </main>
        </div>
    )
}
