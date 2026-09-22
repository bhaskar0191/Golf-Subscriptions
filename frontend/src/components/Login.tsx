import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Navbar from './Navbar'
import { useAuth } from '../context/AuthContext'

const Login = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { login, isLoading, error, clearError } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [formError, setFormError] = useState('')

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setFormError('')
        clearError()
        try {
            const user = await login({ email, password })
            toast.success(`Welcome back, ${user.name}!`)
            const destination = (location.state as { from?: string } | null)?.from
            navigate(destination ?? (user.role === 'admin' ? '/admin' : '/dashboard'), { replace: true })
        } catch (requestError) {
            const message = requestError instanceof Error ? requestError.message : 'Login failed'
            setFormError(message)
            toast.error(message)
        }
    }

    return (
        <div className="min-h-screen bg-[#0A0C09] text-[#F5F5F0]">
            <Navbar mode="public" />
            <main className="mx-auto flex min-h-screen max-w-md items-center px-6 py-24">
                <form className="w-full rounded-2xl border border-white/10 bg-[#111410] p-7 shadow-2xl" onSubmit={submit}>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-400">Welcome back</p>
                    <h1 className="mt-3 font-display text-4xl font-bold">Sign in</h1>
                    <p className="mt-3 text-sm leading-6 text-white/50">Access your rounds, draws, charity choices, and membership.</p>
                    {(formError || error) && <div className="mt-6 rounded-lg border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200" role="alert">{formError || error}</div>}
                    <label className="mt-6 block text-xs font-semibold uppercase tracking-wider text-white/50">Email<input className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-green-400" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></label>
                    <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-white/50">Password<input className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-green-400" minLength={6} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} /></label>
                    <button className="mt-6 w-full rounded-full bg-green-400 px-5 py-3 text-sm font-semibold text-[#0A0C09] hover:bg-green-300 disabled:cursor-not-allowed disabled:opacity-60" disabled={isLoading} type="submit">{isLoading ? 'Signing in...' : 'Sign in'}</button>
                    <p className="mt-6 text-center text-sm text-white/50">New to Fairway? <Link className="font-semibold text-green-400 hover:text-green-300" to="/register">Join now</Link></p>
                </form>
            </main>
        </div>
    )
}

export default Login
