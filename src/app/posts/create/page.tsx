'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

const CreatePost = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
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

  const uploadImage = async () => {
    if (!image) return '';

    const fileName = `${uuidv4()}-${image.name}`;
    const { data, error } = await supabase.storage
      .from('post-images')
      .upload(fileName, image);

    if (error) {
      console.error('Error uploading image:', error.message);
      return '';
    }

    const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/post-images/${fileName}`;
    return imageUrl;
  };

  const createPost = async () => {
    if (!title || !content) {
      alert('Please fill in both title and content');
      return;
    }

    let imageUrl = null;

    if (image) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const { data, error: uploadError } = await supabase
        .storage
        .from('post-images')
        .upload(`images/${fileName}`, image);

      if (uploadError) {
        console.error('Error uploading image:', uploadError.message);
        return;
      }

      imageUrl = supabase.storage.from('post-images').getPublicUrl(`images/${fileName}`).data.publicUrl;
    }

    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

    const { error } = await supabase
      .from('posts')
      .insert([{ title, content, slug, image_url: imageUrl, user_id: session?.user?.id }]);

    if (error) {
      console.error('Error creating post:', error.message);
    } else {
      alert('Post created successfully!');
      router.push('/');
    }
  };

  if (!session) return <p>Loading...</p>;

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-indigo-900 to-purple-900 p-6">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-2xl text-white">
        <h1 className="text-4xl font-bold mb-6 text-center">Create a New Post</h1>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="title">
            Post Title
          </label>
          <input
            id="title"
            type="text"
            className="w-full p-3 border rounded-lg bg-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400"
            placeholder="Enter your post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="image">
            Upload Image
          </label>
          <input
            id="image"
            type="file"
            className="w-full p-3 border rounded-lg bg-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setImage(file);
            }}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1" htmlFor="content">
            Post Content
          </label>
          <textarea
            id="content"
            className="w-full p-3 border rounded-lg bg-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400"
            placeholder="Enter your post content"
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <button
          onClick={createPost}
          className="w-full bg-pink-500 text-white p-3 rounded-lg hover:bg-pink-600 transition duration-200"
        >
          Create Post
        </button>
      </div>
    </div>
  );
};

export default CreatePost;







