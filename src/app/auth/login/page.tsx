import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = async () => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            console.error('Error login in:', error.message);
        } else {
            router.push('/');
        }
    };

    return (
        <div>
            <h1>Login</h1>
            <input type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
             />
            <input type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
             />
        </div>
    );
};

export default Login;