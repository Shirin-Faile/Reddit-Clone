import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
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
        router.push('/login');
      } else {
        setSession(data.session);
      }
    };

    getSession();
  }, []);

  const createPost = async () => {
    if (!title || !content) {
      alert('Please fill in both title and content');
      return;
    }

    const { error } = await supabase
      .from('posts')
      .insert([{ title, content, user_id: session?.user?.id }]);

    if (error) {
      console.error('Error creating post:', error.message);
    } else {
      alert('Post created successfully!');
      router.push('/');
    }
  };

  if (!session) return <p>Loading...</p>;

  return (
    <div>
      <h1>Create a New Post</h1>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button onClick={createPost}>Create Post</button>
    </div>
  );
};

export default CreatePost;

