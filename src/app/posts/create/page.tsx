'use client'
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Session } from '@supabase/supabase-js'; 
import { useRouter } from 'next/navigation';

const CreatePost = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push('/auth/login');
      } else {
        setSession(data.session);
      }
    };

    getSession();
  }, [router]);

  const createPost = async () => {
    if (!title || !content) {
      alert('Please fill in both title and content');
      return;
    }

    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

    const { error } = await supabase
      .from('posts')
      .insert([{ title, content, slug, user_id: session?.user?.id }]);

    if (error) {
      console.error('Error creating post:', error.message);
    } else {
      alert('Post created successfully!');
      router.push('/');
    }
  };

  if (!session) return <p>Loading...</p>;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Create a New Post</h1>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">
            Post Title
          </label>
          <input
            id="title"
            type="text"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="content">
            Post Content
          </label>
          <textarea
            id="content"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your post content"
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <button
          onClick={createPost}
          className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition duration-200"
        >
          Create Post
        </button>
      </div>
    </div>
  );
};

export default CreatePost;



