import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
type ApiResponse = { message?: string; draws?: Draw[]; draw?: Draw; latestDraws?: Draw[] }
type Notice = { type: 'success' | 'error'; text: string }

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'
const getToken = () => localStorage.getItem('token') ?? localStorage.getItem('authToken')
const formatDate = (value: string) => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(value))
const displayParticipant = (participant: Participant | string) => typeof participant === 'string' ? participant : participant.name ?? participant.email ?? participant._id ?? 'Participant'

const DrawEngine = () => {
    const [draws, setDraws] = useState<Draw[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [notice, setNotice] = useState<Notice | null>(null)
    const [form, setForm] = useState({ title: '', description: '', prize: '', winnerCount: '1', selectionMethod: 'random', drawDate: '', participants: '' })

    const loadDraws = async () => {
        const token = getToken()
        if (!token) {
            setNotice({ type: 'error', text: 'Sign in with an admin account to manage draws.' })
            setIsLoading(false)
            return
        }
        try {
            const response = await fetch(`${API_URL}/admin/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
            const data = await response.json() as ApiResponse
            if (!response.ok) throw new Error(data.message ?? 'Could not load draw results')
            setDraws(data.latestDraws ?? [])
        } catch (error) {
            setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Could not load draw results' })
        } finally { setIsLoading(false) }
    }

    useEffect(() => { void loadDraws() }, [])

    const createDraw = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const token = getToken()
        if (!token) return
        setIsSubmitting(true)
        setNotice(null)
        try {
            const response = await fetch(`${API_URL}/draws`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: form.title,
                    description: form.description,
                    prize: form.prize,
                    winnerCount: Number(form.winnerCount),
                    selectionMethod: form.selectionMethod,
                    drawDate: form.drawDate || undefined,
                    participants: form.participants.split(',').map((id) => id.trim()).filter(Boolean),
                }),
            })
            const data = await response.json() as ApiResponse
            if (!response.ok) throw new Error(data.message ?? 'Could not create draw')
            setNotice({ type: 'success', text: data.message ?? 'Draw configured and run successfully' })
            setForm({ title: '', description: '', prize: '', winnerCount: '1', selectionMethod: 'random', drawDate: '', participants: '' })
            await loadDraws()
        } catch (error) {
            setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Could not create draw' })
        } finally { setIsSubmitting(false) }
    }

    const verifyWinners = async (drawId: string) => {
        const token = getToken()
        if (!token) return
        setIsSubmitting(true)
        setNotice(null)
        try {
            const response = await fetch(`${API_URL}/draws/verify`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ drawId }),
            })
            const data = await response.json() as ApiResponse
            if (!response.ok) throw new Error(data.message ?? 'Could not verify winners')
            setNotice({ type: 'success', text: data.message ?? 'Winners verified successfully' })
            await loadDraws()
        } catch (error) {
            setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Could not verify winners' })
        } finally { setIsSubmitting(false) }
    }

    const totalParticipants = draws.reduce((total, draw) => total + draw.participants.length, 0)
    const totalWinners = draws.reduce((total, draw) => total + draw.winners.length, 0)

    return (
        <div className="min-h-screen bg-[#0A0C09] text-[#F5F5F0]">
            <Navbar mode="member" />
            <main className="mx-auto max-w-6xl px-6 pb-16 pt-24">
                <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
                    <div>
                        <p className="font-mono-data text-xs tracking-[0.1em] text-[#4ADE80]">ADMIN DRAW CONTROL</p>
                        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">Draw engine</h1>
                        <p className="mt-3 max-w-xl text-sm leading-6 text-[#6B7280]">Configure monthly draws and verify winners using the same backend algorithm that records the official result.</p>
                    </div>
                    <Link className="text-sm font-semibold text-[#4ADE80] hover:text-[#86EFAC]" to="/admin">Back to dashboard</Link>
                </div>

                {notice && <div className={`mb-6 rounded-xl border px-4 py-3 text-sm ${notice.type === 'success' ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' : 'border-rose-400/30 bg-rose-400/10 text-rose-200'}`} role="status">{notice.text}</div>}

                <div className="mb-8 grid gap-4 sm:grid-cols-3">
                    {[['Draws', draws.length], ['Participants', totalParticipants], ['Winners', totalWinners]].map(([label, value]) => <div className="rounded-2xl border border-white/[0.06] bg-[#111410] p-5" key={label}><p className="font-mono-data text-xs tracking-[0.06em] text-[#6B7280]">{String(label).toUpperCase()}</p><p className="mt-2 font-display text-4xl font-bold text-[#F5F5F0]">{value}</p></div>)}
                </div>

                <form className="mb-10 grid gap-4 rounded-2xl border border-white/[0.06] bg-[#111410] p-6 md:grid-cols-2" onSubmit={createDraw}>
                    <div className="md:col-span-2"><p className="font-mono-data text-xs tracking-[0.08em] text-[#6B7280]">NEW DRAW</p><h2 className="mt-2 font-display text-2xl font-bold">Configure and run</h2></div>
                    <input className="rounded-lg border border-white/10 bg-[#0A0C09] px-4 py-3 text-sm text-white outline-none focus:border-[#4ADE80]" onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Draw title" required value={form.title} />
                    <input className="rounded-lg border border-white/10 bg-[#0A0C09] px-4 py-3 text-sm text-white outline-none focus:border-[#4ADE80]" onChange={(event) => setForm({ ...form, prize: event.target.value })} placeholder="Prize" value={form.prize} />
                    <textarea className="min-h-24 rounded-lg border border-white/10 bg-[#0A0C09] px-4 py-3 text-sm text-white outline-none focus:border-[#4ADE80] md:col-span-2" onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Description" value={form.description} />
                    <input className="rounded-lg border border-white/10 bg-[#0A0C09] px-4 py-3 text-sm text-white outline-none focus:border-[#4ADE80]" min="1" onChange={(event) => setForm({ ...form, winnerCount: event.target.value })} type="number" value={form.winnerCount} />
                    <select className="rounded-lg border border-white/10 bg-[#0A0C09] px-4 py-3 text-sm text-white outline-none focus:border-[#4ADE80]" onChange={(event) => setForm({ ...form, selectionMethod: event.target.value })} value={form.selectionMethod}><option value="random">Random selection</option><option value="algorithmic">Algorithmic selection</option></select>
                    <input className="rounded-lg border border-white/10 bg-[#0A0C09] px-4 py-3 text-sm text-white outline-none focus:border-[#4ADE80]" onChange={(event) => setForm({ ...form, drawDate: event.target.value })} type="date" value={form.drawDate} />
                    <input className="rounded-lg border border-white/10 bg-[#0A0C09] px-4 py-3 text-sm text-white outline-none focus:border-[#4ADE80]" onChange={(event) => setForm({ ...form, participants: event.target.value })} placeholder="Participant IDs, comma-separated" value={form.participants} />
                    <button className="rounded-full bg-[#4ADE80] px-5 py-3 text-sm font-semibold text-[#0A0C09] hover:bg-[#86EFAC] disabled:cursor-not-allowed disabled:opacity-50 md:col-span-2" disabled={isSubmitting} type="submit">{isSubmitting ? 'Saving...' : 'Configure and run draw'}</button>
                </form>

                <section>
                    <div className="mb-4 flex items-center justify-between"><h2 className="font-display text-2xl font-bold">Recorded draws</h2><button className="text-sm font-semibold text-[#4ADE80] hover:text-[#86EFAC]" onClick={() => void loadDraws()} type="button">Refresh</button></div>
                    {isLoading ? <p className="py-12 text-center text-sm text-[#6B7280]">Loading recorded draws...</p> : draws.length === 0 ? <div className="rounded-2xl border border-dashed border-white/15 px-6 py-14 text-center text-sm text-[#6B7280]">No recorded draws yet.</div> : <div className="grid gap-5 lg:grid-cols-2">{draws.map((draw) => <article className="rounded-2xl border border-white/[0.06] bg-[#111410] p-6" key={draw._id}><div className="flex items-start justify-between gap-4"><div><p className="font-mono-data text-xs uppercase tracking-[0.1em] text-[#4ADE80]">{draw.selectionMethod} draw</p><h3 className="mt-2 text-xl font-semibold">{draw.title}</h3></div><span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs capitalize text-[#A3A89E]">{draw.status}</span></div><p className="mt-3 text-sm text-[#6B7280]">{draw.description || 'No description provided.'}</p><dl className="mt-5 grid grid-cols-2 gap-4 border-y border-white/[0.06] py-4 text-sm"><div><dt className="text-[#6B7280]">Draw date</dt><dd className="mt-1 font-semibold">{formatDate(draw.drawDate)}</dd></div><div><dt className="text-[#6B7280]">Prize</dt><dd className="mt-1 font-semibold">{draw.prize || 'Not specified'}</dd></div><div><dt className="text-[#6B7280]">Participants</dt><dd className="mt-1 font-semibold">{draw.participants.length}</dd></div><div><dt className="text-[#6B7280]">Winners</dt><dd className="mt-1 font-semibold">{draw.winners.length} / {draw.winnerCount}</dd></div></dl>{draw.winners.length > 0 && <div className="mt-5 space-y-2">{draw.winners.map((winner) => <div className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.03] p-3 text-sm" key={winner._id}><span>{displayParticipant(winner.user ?? 'Winner')}</span><span className="text-xs capitalize text-[#A3A89E]">{winner.verified ? 'Verified' : winner.payoutStatus}</span></div>)}</div>}{draw.winners.length > 0 && draw.status !== 'verified' && <button className="mt-5 w-full rounded-full border border-[#4ADE80]/30 px-4 py-2.5 text-sm font-semibold text-[#4ADE80] hover:bg-[#4ADE80]/10 disabled:opacity-50" disabled={isSubmitting} onClick={() => void verifyWinners(draw._id)} type="button">Verify winners</button>}</article>)}</div>}
                </section>
            </main>
        </div>
    )
}

export default DrawEngine
