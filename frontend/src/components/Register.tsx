import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Navbar from './Navbar'
import { useAuth } from '../context/AuthContext'

const Register = () => {
    const navigate = useNavigate()
    const { register, isLoading, error, clearError } = useAuth()
    const [details, setDetails] = useState({ name: '', email: '', password: '', phone: '' })
    const [formError, setFormError] = useState('')

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setFormError('')
        clearError()
        try {
            const user = await register(details)
            toast.success(`Welcome to Fairway, ${user.name}!`)
            navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true })
        } catch (requestError) {
            const message = requestError instanceof Error ? requestError.message : 'Registration failed'
            setFormError(message)
            toast.error(message)
        }
    }

    return (
        <div className="min-h-screen bg-[#0A0C09] text-[#F5F5F0]">
            <Navbar mode="public" />
            <main className="mx-auto flex min-h-screen max-w-md items-center px-6 py-24">
                <form className="w-full rounded-2xl border border-white/10 bg-[#111410] p-7 shadow-2xl" onSubmit={submit}>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-400">Fairway membership</p>
                    <h1 className="mt-3 font-display text-4xl font-bold">Join now</h1>
                    <p className="mt-3 text-sm leading-6 text-white/50">Track your game, support a cause, and enter the monthly draw.</p>
                    {(formError || error) && <div className="mt-6 rounded-lg border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200" role="alert">{formError || error}</div>}
                    <label className="mt-6 block text-xs font-semibold uppercase tracking-wider text-white/50">Name<input className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-green-400" onChange={(event) => setDetails({ ...details, name: event.target.value })} required value={details.name} /></label>
                    <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-white/50">Email<input className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-green-400" onChange={(event) => setDetails({ ...details, email: event.target.value })} required type="email" value={details.email} /></label>
                    <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-white/50">Phone <span className="normal-case tracking-normal text-white/30">optional</span><input className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-green-400" onChange={(event) => setDetails({ ...details, phone: event.target.value })} value={details.phone} /></label>
                    <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-white/50">Password<input className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-green-400" minLength={6} onChange={(event) => setDetails({ ...details, password: event.target.value })} required type="password" value={details.password} /></label>
                    <button className="mt-6 w-full rounded-full bg-green-400 px-5 py-3 text-sm font-semibold text-[#0A0C09] hover:bg-green-300 disabled:cursor-not-allowed disabled:opacity-60" disabled={isLoading} type="submit">{isLoading ? 'Creating account...' : 'Create account'}</button>
                    <p className="mt-6 text-center text-sm text-white/50">Already a member? <Link className="font-semibold text-green-400 hover:text-green-300" to="/login">Sign in</Link></p>
                </form>
            </main>
        </div>
    )
}

export default Register
