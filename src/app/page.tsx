'use client'
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

type Post = {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
};

const HomePage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);  // Track the post being edited
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error.message);
      } else {
        setPosts(data);
      }
    };

    fetchPosts();
  }, []);

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
      setEditingPostId(null);
      router.refresh();
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
      alert('Post deleted successfully!');
      setPosts(posts.filter((post) => post.id !== postId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Posts</h1>
      {posts.length === 0 ? (
        <p className="text-center text-gray-500">No posts found.</p>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white p-6 rounded-lg shadow-md">
              {editingPostId === post.id ? (
                <>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Post Title"
                    className="w-full p-2 border rounded mb-4"
                  />
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Post Content"
                    className="w-full p-2 border rounded mb-4"
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
                  <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
                  <p className="text-gray-700 mb-4">{post.content}</p>
                  <p className="text-gray-500 text-sm">Posted by: {post.user_id}</p>
                  <p className="text-gray-400 text-xs">Posted on: {new Date(post.created_at).toLocaleString()}</p>

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

