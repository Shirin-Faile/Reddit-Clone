'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Post = {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  user_id: string;
  created_at: string;
};

const HomePage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const router = useRouter();

  
  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!data.session) {
        router.push('/auth/login');
      } else {
        setSession(data.session);
      }
    };
    getSession();
  }, [router]);

  
  useEffect(() => {
    const fetchPosts = async () => {
      let query = supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching posts:', error.message);
      } else {
        setPosts(data);
      }
    };

    if (session) {
      fetchPosts();
    }
  }, [searchTerm, session]);

  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  
  const updatePost = async (postId: string) => {
    if (!title || !content) {
      alert('Please fill in both title and content');
      return;
    }

    const { error } = await supabase
      .from('posts')
      .update({ title, content })
      .eq('id', postId);

    if (error) {
      console.error('Error updating post:', error.message);
    } else {
      alert('Post updated successfully!');
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, title, content } : post
        )
      );
      setEditingPostId(null);
    }
  };

  
  const deletePost = async (postId: string) => {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) {
      console.error('Error deleting post:', error.message);
    } else {
      setPosts(posts.filter((post) => post.id !== postId));
    }
  };

  
  if (!session) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-purple-900 p-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-white">Posts</h1>

      
      <div className="flex justify-center mb-8">
        <button
          onClick={() => router.push('/posts/create')}
          className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition-transform transform hover:scale-105"
        >
          Create a New Post
        </button>
      </div>

      
      <div className="max-w-md mx-auto mb-6">
        <input
          type="text"
          placeholder="Search posts by title..."
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-gray-800 text-white"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      
      {posts.length === 0 ? (
        <p className="text-center text-gray-400">No posts found.</p>
      ) : (
        <div className="space-y-6 max-w-3xl mx-auto">
          {posts.map((post) => (
            <div key={post.id} className="bg-gray-800 p-6 rounded-lg shadow-md">
              {editingPostId === post.id ? (
                <>
                  
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Post Title"
                    className="w-full p-2 border rounded mb-4 bg-gray-700 text-white"
                  />
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Post Content"
                    className="w-full p-2 border rounded mb-4 bg-gray-700 text-white"
                    rows={4}
                  />
                  <button
                    onClick={() => updatePost(post.id)}
                    className="bg-green-500 text-white p-2 rounded hover:bg-green-600 mr-2"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditingPostId(null)}
                    className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  
                  <Link
                    href={`/posts/${post.id}`}
                    className="text-2xl font-bold mb-2 text-pink-400 hover:underline"
                  >
                    {post.title}
                  </Link>

                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="mb-4 rounded-lg shadow-md w-full max-h-96 object-cover"
                    />
                  )}

                  <p className="text-gray-300 mb-4">{post.content}</p>
                  <p className="text-gray-400 text-sm">Posted by: {post.user_id}</p>
                  <p className="text-gray-500 text-xs">
                    Posted on: {new Date(post.created_at).toLocaleString()}
                  </p>

                  
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        setEditingPostId(post.id);
                        setTitle(post.title);
                        setContent(post.content);
                      }}
                      className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deletePost(post.id)}
                      className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default HomePage;














