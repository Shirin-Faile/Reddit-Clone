'use client'
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
      console.error('Error logging in:', error.message);
    } else {
      router.push('/posts/create');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 relative overflow-hidden">
      <div className="absolute -top-16 -left-20 w-96 h-96 bg-purple-300 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute -bottom-20 -right-10 w-80 h-80 bg-yellow-400 rounded-full opacity-20 animate-pulse"></div>

      <h1 className="text-5xl font-bold text-white mb-6">Login</h1>

      <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md">
        <div className="mb-6">
          <label className="block text-lg font-semibold text-gray-700 mb-2" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="w-full p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label className="block text-lg font-semibold text-gray-700 mb-2" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="w-full p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          onClick={handleLogin}
          className="w-full bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-transform transform hover:scale-105"
        >
          Login
        </button>
        <div className="text-center mt-4 text-white">
          <p>Don't have an account? <Link href="/auth/signup" className="text-yellow-300 font-bold underline">Sign up here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;


