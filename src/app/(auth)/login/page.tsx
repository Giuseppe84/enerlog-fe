'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/useAuth';
import { verify } from "@/api/2fa";
import { userAPI } from '@/api/user'
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"


const backendUrl = process.env.NEXT_PUBLIC_API_URL;




export default function LoginPage() {

    const router = useRouter()
    const { login } = useAuth();

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState("")
   const [tempToken, setTempToken] = useState("")


    // Login fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [form, setForm] = useState('login')

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);


        try {
           const response = await userAPI.login(email,password);
            
            /*
            const response = await fetch(`${backendUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
*/
       
            if (response.methods?.includes("totp")) {
                console.log(response);
                // L’utente ha 2FA → redirect alla pagina OTP
                // Passa il tempToken nello stato del router
                setTempToken(response.tempToken);
                setForm('otp')
            } else {
                // Nessuna 2FA richiesta → login normale
                login(response.token);

  
                router.push('/dashboard') // redirect after login
            }
        } catch (err: any) {
                 if (err.response?.status === 401) {
                console.log(err);
                setError("Credenziali non valide");
            } else {
                setError("Errore imprevisto");
            }
     
        } finally {
            setLoading(false);
        }
    };

    const handleOTPVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        try {
            const res = await verify(tempToken, otp);
            login(res.token)
            router.push("/dashboard")
        } catch (err: any) {
            if (err.response?.status === 401) {
                console.log(err);
                setError("OTP non valido o scaduto");
            } else {
                setError("Errore imprevisto");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            {form == "login" &&

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
            }
            {form == "otp" &&

                <form className="w-96 p-10 border rounded-lg shadow-md flex flex-col gap-4" onSubmit={handleOTPVerify}>
                    <h1 className="text-2xl font-bold mb-6">Verifica OTP</h1>
                    <div className="flex justify-center">
                        <InputOTP maxLength={6} type="text"
                            className="w-full justify-between p-8"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(value) => setOtp(value)}
                        >
                            <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                            </InputOTPGroup>
                            <InputOTPSeparator />
                            <InputOTPGroup>
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                            </InputOTPGroup>
                        </InputOTP>
                    </div>
                    {error && <p className="text-red-500  mb-4">{error}</p>}
                    <Button type="submit" disabled={loading} className="btn btn-primary w-full">
                        {loading ? "Verifying..." : "Verify OTP"}
                    </Button>

                </form>
            }
        </div>
    )
}




