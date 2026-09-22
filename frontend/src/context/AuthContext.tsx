import axios from 'axios'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type UserRole = 'subscriber' | 'admin'

export type AuthUser = {
    _id: string
    name: string
    email: string
    phone?: string
    role: UserRole
    status?: string
    subscriptionPlan?: 'monthly' | 'yearly' | 'none'
    billingCycle?: 'monthly' | 'yearly'
    subscriptionStatus?: 'active' | 'inactive' | 'trial'
    subscriptionStartDate?: string | null
    subscriptionEndDate?: string | null
    preferences?: Record<string, unknown>
}

type Credentials = { email: string; password: string }
type RegisterDetails = Credentials & { name: string; phone?: string }
type AuthResponse = { message?: string; token?: string; user?: AuthUser }

type AuthContextValue = {
    user: AuthUser | null
    token: string | null
    isLoading: boolean
    isAuthenticated: boolean
    isAdmin: boolean
    error: string | null
    login: (credentials: Credentials) => Promise<AuthUser>
    register: (details: RegisterDetails) => Promise<AuthUser>
    refreshProfile: () => Promise<AuthUser | null>
    logout: () => void
    clearError: () => void
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'
const LOGIN_URL = import.meta.env.VITE_BACKEND_LOGIN_URL ?? `${API_URL}/auth/login`
const REGISTER_URL = import.meta.env.VITE_BACKEND_REGISTER_URL ?? `${API_URL}/auth/register`
const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const readStoredUser = (): AuthUser | null => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) return null
    try { return JSON.parse(storedUser) as AuthUser } catch { return null }
}

const getStoredToken = () => localStorage.getItem('token') ?? localStorage.getItem('authToken')

const getErrorMessage = (requestError: unknown, fallback: string) => {
    if (axios.isAxiosError(requestError)) {
        return (requestError.response?.data as AuthResponse | undefined)?.message ?? fallback
    }
    return requestError instanceof Error ? requestError.message : fallback
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(getStoredToken)
    const [user, setUser] = useState<AuthUser | null>(readStoredUser)
    const [isLoading, setIsLoading] = useState(Boolean(getStoredToken()))
    const [error, setError] = useState<string | null>(null)

    const persistSession = (nextToken: string, nextUser: AuthUser) => {
        localStorage.setItem('token', nextToken)
        localStorage.setItem('authToken', nextToken)
        localStorage.setItem('user', JSON.stringify(nextUser))
        setToken(nextToken)
        setUser(nextUser)
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
        setToken(null)
        setUser(null)
        setError(null)
    }

    const refreshProfile = async () => {
        const activeToken = token ?? getStoredToken()
        if (!activeToken) {
            setIsLoading(false)
            return null
        }

        try {
            const { data } = await axios.get<AuthResponse>(`${API_URL}/users/profile`, { headers: { Authorization: `Bearer ${activeToken}` } })
            if (!data.user) throw new Error('Profile response did not include a user')
            persistSession(activeToken, data.user)
            setError(null)
            return data.user
        } catch (requestError) {
            logout()
            setError(requestError instanceof Error ? requestError.message : 'Could not restore your session')
            return null
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => { void refreshProfile() }, [])

    const login = async (credentials: Credentials) => {
        setIsLoading(true)
        setError(null)
        try {
            const { data } = await axios.post<AuthResponse>(LOGIN_URL, credentials)
            if (!data.token || !data.user) throw new Error('Login response was incomplete')
            persistSession(data.token, data.user)
            return data.user
        } catch (requestError) {
            const message = getErrorMessage(requestError, 'Login failed')
            setError(message)
            throw new Error(message)
        } finally { setIsLoading(false) }
    }

    const register = async (details: RegisterDetails) => {
        setIsLoading(true)
        setError(null)
        try {
            const { data } = await axios.post<AuthResponse>(REGISTER_URL, details)
            if (!data.token || !data.user) throw new Error('Registration response was incomplete')
            persistSession(data.token, data.user)
            return data.user
        } catch (requestError) {
            const message = getErrorMessage(requestError, 'Registration failed')
            setError(message)
            throw new Error(message)
        } finally { setIsLoading(false) }
    }

    const clearError = () => setError(null)

    return <AuthContext.Provider value={{ user, token, isLoading, isAuthenticated: Boolean(token && user), isAdmin: user?.role === 'admin', error, login, register, refreshProfile, logout, clearError }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used inside an AuthProvider')
    return context
}
