import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'

export default function Logout() {
    const navigate = useNavigate()
    const { logout } = useAuth()

    const handleLogout = () => {
        logout()
        toast.success('You have been logged out.')
        navigate('/login', { replace: true })
    }

    return (
        <button
            className="text-sm font-medium text-white/60 transition-colors hover:text-white"
            onClick={handleLogout}
            type="button"
        >
            Log out
        </button>
    )
}
