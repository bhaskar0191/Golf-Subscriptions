import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'

type Charity = { _id: string; name: string; description?: string; category?: string; website?: string }
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'
const getToken = () => localStorage.getItem('token') ?? localStorage.getItem('authToken')

export default function AdminCharity() {
    const [charities, setCharities] = useState<Charity[]>([])
    const [form, setForm] = useState({ name: '', description: '', category: '', website: '' })
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState('')

    const loadCharities = async () => {
        try {
            const response = await fetch(`${API_URL}/charities`)
            const data = await response.json() as { charities?: Charity[]; message?: string }
            if (!response.ok) throw new Error(data.message ?? 'Could not load charities')
            setCharities(data.charities ?? [])
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Could not load charities')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => { void loadCharities() }, [])

    const createCharity = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const token = getToken()
        if (!token) {
            toast.error('Sign in with an admin account to add a charity.')
            return
        }

        setIsSaving(true)
        setError('')
        try {
            const response = await fetch(`${API_URL}/charities`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: form.name, description: form.description, category: form.category, website: form.website }),
            })
            const data = await response.json() as { message?: string; charity?: Charity }
            if (!response.ok) throw new Error(data.message ?? 'Could not create charity')
            toast.success(data.message ?? 'Charity created successfully.')
            setForm({ name: '', description: '', category: '', website: '' })
            await loadCharities()
        } catch (requestError) {
            const message = requestError instanceof Error ? requestError.message : 'Could not create charity'
            setError(message)
            toast.error(message)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0A0C09] text-[#F5F5F0]">
            <Navbar mode="admin" />
            <main className="mx-auto max-w-5xl px-6 pb-16 pt-24">
                <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-xs uppercase tracking-[0.18em] text-[#F59E0B]">Admin charity</p><h1 className="mt-2 font-display text-4xl font-bold">Add a charity partner</h1><p className="mt-3 text-sm text-[#6B7280]">Create an active charity that subscribers can choose from their dashboard.</p></div><Link className="text-sm font-semibold text-[#4ADE80]" to="/admin">Back to overview</Link></div>
                {error && <div className="mb-6 rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200" role="alert">{error}</div>}
                <form className="mb-10 grid gap-4 rounded-2xl border border-white/6 bg-[#111410] p-6 md:grid-cols-2" onSubmit={createCharity}><h2 className="text-xl font-semibold md:col-span-2">New charity</h2><label className="text-xs uppercase tracking-wider text-[#6B7280]">Name<input className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[#4ADE80]" onChange={(event) => setForm({ ...form, name: event.target.value })} required value={form.name} /></label><label className="text-xs uppercase tracking-wider text-[#6B7280]">Category<input className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[#4ADE80]" onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Community, youth, environment" value={form.category} /></label><label className="text-xs uppercase tracking-wider text-[#6B7280] md:col-span-2">Website<input className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[#4ADE80]" onChange={(event) => setForm({ ...form, website: event.target.value })} placeholder="https://example.org" type="url" value={form.website} /></label><label className="text-xs uppercase tracking-wider text-[#6B7280] md:col-span-2">Description<textarea className="mt-2 min-h-28 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[#4ADE80]" onChange={(event) => setForm({ ...form, description: event.target.value })} value={form.description} /></label><button className="rounded-full bg-[#4ADE80] px-5 py-3 text-sm font-semibold text-[#0A0C09] disabled:cursor-wait disabled:opacity-60 md:col-span-2" disabled={isSaving} type="submit">{isSaving ? 'Adding charity...' : 'Add charity'}</button></form>
                <section><div className="mb-4 flex items-center justify-between"><h2 className="text-2xl font-semibold">Active charities</h2><button className="text-sm font-semibold text-[#4ADE80]" onClick={() => void loadCharities()} type="button">Refresh</button></div>{isLoading ? <p className="py-10 text-sm text-[#6B7280]">Loading charities...</p> : charities.length === 0 ? <p className="rounded-2xl border border-dashed border-white/15 px-6 py-12 text-center text-sm text-[#6B7280]">No active charities yet.</p> : <div className="grid gap-4 md:grid-cols-2">{charities.map((charity) => <article className="rounded-2xl border border-white/6 bg-[#111410] p-5" key={charity._id}><div className="flex items-start justify-between gap-3"><h3 className="font-semibold">{charity.name}</h3><span className="text-xs text-[#F59E0B]">{charity.category || 'General'}</span></div><p className="mt-3 text-sm text-[#6B7280]">{charity.description || 'No description provided.'}</p>{charity.website && <a className="mt-4 inline-block text-xs text-[#4ADE80]" href={charity.website} rel="noreferrer" target="_blank">Visit website</a>}</article>)}</div>}</section>
            </main>
        </div>
    )
}
