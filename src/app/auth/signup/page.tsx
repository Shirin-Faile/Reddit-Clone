import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleSignup = async () => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });
        if (error) {
            console.error('Error signing up:', error.message);
        } else {
            alert('Check your email for the confirmation link!');
            router.push('/login');
        }
    };

    return (
        <div>
            <h1>Sign Up</h1>
            <input type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
            />
            <input type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} />
        </div>
    );
};

export default Signup;