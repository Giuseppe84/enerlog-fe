'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/useAuth';


const backendUrl = process.env.NEXT_PUBLIC_API_URL;




export default function LoginPage() {

    const router = useRouter()
    const { login } = useAuth();
  
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [twoFA, setTwoFA] = useState(false);
    const [tempToken, setTempToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRegister, setIsRegister] = useState(false);

    // Login fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [token2FA, setToken2FA] = useState('');

    // Register fields
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            console.log(`${backendUrl}`)
            const response = await fetch(`${backendUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();


            if (!response.ok) {
                throw new Error(data.message || 'Errore login');
            }

            if (data.methods?.includes("totp")) {
                // L’utente ha 2FA attiva e deve inserire il codice
                setTempToken(data.tempToken);
                setTwoFA(true);
            } else {
                // Nessuna 2FA richiesta → login normale
                login(data.token);

                if (!response.ok) throw new Error('Invalid credentials')
                router.push('/dashboard') // redirect after login
            }

        } catch (err: any) {
            setError(err.message);
        } finally {


            setLoading(false);
        }
    };



    return (
        <div className="min-h-screen flex items-center justify-center">
            <form className="w-96 p-8 border rounded-lg shadow-md" onSubmit={handleLogin}>
                <h1 className="text-2xl font-bold mb-6">Login</h1>

                <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="mb-4"
                />

                <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="mb-4"
                />

                {error && <p className="text-red-500 mb-4">{error}</p>}

                <Button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </Button>
            </form>
        </div>
    )
}