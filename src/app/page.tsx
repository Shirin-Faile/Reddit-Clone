'use client'
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type Post = {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
}

const HomePage = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false});

      if (error) {
        console.error('Error fetching posts:', error.message);
      } else {
        setPosts(data);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div>
      <h1>Posts</h1>
      {posts.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        posts.map((post) => (
          <div key={post.id}>
            <h2>{post.title}</h2>
            <p>{post.content}</p>
            <p>Posted by: {post.user_id}</p>
          </div>
        ))
      )}
    </div>
  )
}

export default HomePage;
