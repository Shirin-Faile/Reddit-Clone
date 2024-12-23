'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

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
      if (error.message.includes('already registered')) {
        toast.error('This email is already registered. Please log in.');
      } else {
        toast.error('Error signing up. Please try again.');
      }
      console.error('Error signing up:', error.message);
    } else {
      toast.success('Signup successful! Please check your email to confirm your account.');
      router.push('/auth/login');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500">
      {/* Content */}
      <h1 className="text-5xl font-bold text-white mb-6">Sign Up</h1>
  
      <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md">
        <div className="mb-6">
          <label className="block text-lg font-semibold text-gray-700 mb-2" htmlFor="email">
            Email
          </label>
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
          <label className="block text-lg font-semibold text-gray-700 mb-2" htmlFor="password">
            Password
          </label>
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
          onClick={handleSignup}
          className="w-full bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-transform transform hover:scale-105"
        >
          Sign Up
        </button>
        <div className="text-center mt-4 text-white">
          <p>
            Already a member?{' '}
            <Link href="/auth/login" className="text-yellow-300 font-bold underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );  
};

export default Signup;

