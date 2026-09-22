import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

type SummaryItem = { _id: string | boolean; count: number }
type LatestUser = { _id: string; name: string; email: string; role: string; status: string; createdAt: string }
type LatestCharity = { _id: string; name: string; category?: string; isActive: boolean; createdAt: string }
type LatestDraw = { _id: string; title: string; status: string; participants?: { name: string; email: string }[] }

type DashboardData = {
    totals: {
        subscribers: number
        admins: number
        totalDraws: number
        activeCharities: number
        inactiveCharities: number
        activeSubscriptions: number
        trialSubscriptions: number
        cancelledSubscriptions: number
    }
    drawStatusSummary: SummaryItem[]
    userSummary: SummaryItem[]
    charitySummary: SummaryItem[]
    subscriptionSummary: SummaryItem[]
    latestDraws: LatestDraw[]
    latestUsers: LatestUser[]
    latestCharities: LatestCharity[]
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'
const getToken = () => localStorage.getItem('token') ?? localStorage.getItem('authToken')
const formatDate = (value: string) => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(value))

const AdminDashboard = () => {
    const [dashboard, setDashboard] = useState<DashboardData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const loadDashboard = async () => {
            const token = getToken()
            if (!token) {
                setError('Sign in with an admin account to view this dashboard.')
                setIsLoading(false)
                return
            }

            try {
                const response = await fetch(`${API_URL}/admin/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
                const data = await response.json() as DashboardData & { message?: string }
                if (!response.ok) throw new Error(data.message ?? 'Could not load admin dashboard')
                setDashboard(data)
            } catch (requestError) {
                setError(requestError instanceof Error ? requestError.message : 'Could not load admin dashboard')
            } finally {
                setIsLoading(false)
            }
        }

        void loadDashboard()
    }, [])

    const summaryCount = (items: SummaryItem[], key: string | boolean) => items.find((item) => item._id === key)?.count ?? 0

    return (
        <div className="min-h-screen bg-[#0A0C09] text-[#F5F5F0]">
            <Navbar mode="admin" />
            <main className="mx-auto max-w-7xl px-6 pb-16 pt-28 sm:px-10 lg:px-16">
                <div className="flex flex-col justify-between gap-5 border-b border-white/10 pb-8 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-400">Admin control</p>
                        <h1 className="mt-3 text-4xl font-bold tracking-tight">Live platform overview</h1>
                        <p className="mt-3 max-w-xl text-sm leading-6 text-white/50">Operational data from users, subscriptions, charities, and draw activity.</p>
                    </div>
                    <Link className="rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-[#0A0C09] hover:bg-emerald-300" to="/">View public site</Link>
                </div>

                {error && <div className="mt-8 rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200" role="alert">{error}</div>}
                {isLoading && <p className="py-20 text-center text-sm text-white/50">Loading live admin data...</p>}

                {dashboard && <>
                    <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            ['Subscribers', dashboard.totals.subscribers, '#4ADE80'],
                            ['Active subscriptions', dashboard.totals.activeSubscriptions, '#60A5FA'],
                            ['Total draws', dashboard.totals.totalDraws, '#F5F5F0'],
                            ['Active charities', dashboard.totals.activeCharities, '#F59E0B'],
                        ].map(([label, value, color]) => <div className="rounded-2xl border border-white/[0.06] bg-[#111410] p-5" key={String(label)}><p className="text-xs uppercase tracking-[0.12em] text-white/40">{label}</p><p className="mt-3 text-4xl font-bold" style={{ color: String(color) }}>{String(value)}</p></div>)}
                    </section>

                    <section className="mt-6 grid gap-6 lg:grid-cols-3">
                        <div className="rounded-2xl border border-white/[0.06] bg-[#111410] p-6"><h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/50">Subscriptions</h2><div className="mt-5 space-y-3">{['active', 'trial', 'cancelled'].map((status) => <div className="flex items-center justify-between text-sm" key={status}><span className="capitalize text-white/65">{status}</span><span className="font-mono text-white">{summaryCount(dashboard.subscriptionSummary, status)}</span></div>)}</div></div>
                        <div className="rounded-2xl border border-white/[0.06] bg-[#111410] p-6"><h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/50">Draw statuses</h2><div className="mt-5 space-y-3">{dashboard.drawStatusSummary.length ? dashboard.drawStatusSummary.map((item) => <div className="flex items-center justify-between text-sm" key={String(item._id)}><span className="capitalize text-white/65">{String(item._id)}</span><span className="font-mono text-white">{item.count}</span></div>) : <p className="text-sm text-white/40">No draw activity yet.</p>}</div></div>
                        <div className="rounded-2xl border border-white/[0.06] bg-[#111410] p-6"><h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/50">Charity status</h2><div className="mt-5 space-y-3"><div className="flex justify-between text-sm"><span className="text-white/65">Active</span><span className="font-mono text-white">{summaryCount(dashboard.charitySummary, true)}</span></div><div className="flex justify-between text-sm"><span className="text-white/65">Inactive</span><span className="font-mono text-white">{summaryCount(dashboard.charitySummary, false)}</span></div></div></div>
                    </section>

                    <section className="mt-6 grid gap-6 lg:grid-cols-2">
                        <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111410]"><div className="border-b border-white/[0.06] px-6 py-5"><h2 className="font-semibold">Latest users</h2></div><div className="divide-y divide-white/[0.05]">{dashboard.latestUsers.length ? dashboard.latestUsers.map((user) => <div className="flex items-center justify-between gap-4 px-6 py-4" key={user._id}><div><p className="text-sm font-medium">{user.name}</p><p className="mt-1 text-xs text-white/40">{user.email}</p></div><div className="text-right"><p className="text-xs capitalize text-emerald-300">{user.role}</p><p className="mt-1 text-xs text-white/40">{formatDate(user.createdAt)}</p></div></div>) : <p className="px-6 py-8 text-sm text-white/40">No users found.</p>}</div></div>
                        <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111410]"><div className="border-b border-white/[0.06] px-6 py-5"><h2 className="font-semibold">Latest charities</h2></div><div className="divide-y divide-white/[0.05]">{dashboard.latestCharities.length ? dashboard.latestCharities.map((charity) => <div className="flex items-center justify-between gap-4 px-6 py-4" key={charity._id}><div><p className="text-sm font-medium">{charity.name}</p><p className="mt-1 text-xs text-white/40">{charity.category || 'General'}</p></div><span className={`text-xs ${charity.isActive ? 'text-emerald-300' : 'text-white/40'}`}>{charity.isActive ? 'Active' : 'Inactive'}</span></div>) : <p className="px-6 py-8 text-sm text-white/40">No charities found.</p>}</div></div>
                    </section>

                    <section className="mt-6 rounded-2xl border border-white/[0.06] bg-[#111410] p-6"><div className="flex items-center justify-between"><h2 className="font-semibold">Latest draws</h2><Link className="text-sm text-emerald-300 hover:text-emerald-200" to="/draw">Open draw area</Link></div><div className="mt-5 grid gap-3 md:grid-cols-2">{dashboard.latestDraws.length ? dashboard.latestDraws.map((draw) => <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4" key={draw._id}><div className="flex justify-between gap-4"><p className="text-sm font-medium">{draw.title}</p><span className="text-xs capitalize text-emerald-300">{draw.status}</span></div><p className="mt-2 text-xs text-white/40">{draw.participants?.length ?? 0} participants</p></div>) : <p className="text-sm text-white/40">No draws found.</p>}</div></section>
                </>}
            </main>
        </div>
    )
}

export default AdminDashboard
